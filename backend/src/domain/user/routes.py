from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Request
from fastapi.responses import StreamingResponse, Response, JSONResponse
from sqlalchemy.orm import Session
import pyotp
import qrcode
from sqlalchemy.sql.functions import current_user

from domain.role.repository import RoleRepository
from domain.user.dto import (
    UserCreate,
    Authresponse,
    MeResponse,
    UserLogin,
    OtpVerify,
    OtpDisable,
    LoginStep2,
    RoleUpdate,
    DeactivateUser,
)
from infrastructure.postgresql.db import get_db
from domain.user.model import User, OtpSettings
from starlette import status
from domain.user.otp_repo import OTPRepo
from dependencies.repository_dependencies import get_otp_repo
from domain.user.dto import UserResponse
from loguru import logger
from pydantic import BaseModel
from domain.role.model import Role
from domain.user.repository import UserRepository
from config.config_provider import get_config
from dependencies.repository_dependencies import (
    get_user_repository,
    get_role_repository,
)
from infrastructure.redis.redis_client import session_manager
from domain.user.dependency import is_admin

config = get_config()
user_router = APIRouter(prefix="/user")


@user_router.get("/me", response_model=MeResponse)
def get_user_details(
    request: Request, repo: UserResponse = Depends(get_user_repository)
):
    user_id = request.state.user_id
    current_user = repo.get_user_by_id(user_id)
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        created_at=current_user.created_at,
        otp_configured=current_user.otp_settings.otp_configured
        if current_user.otp_settings
        else False,
        role=current_user.role.name,
    )


@user_router.post("/2fa/setup", response_class=StreamingResponse)
def setup_2fa(
    request: Request,
    user_repo: UserRepository = Depends(get_user_repository),
    otp_repo: OTPRepo = Depends(get_otp_repo),
):
    current_user = user_repo.get_user_by_id(request.state.user_id)

    if current_user.otp_settings and current_user.otp_settings.otp_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already configured for this user",
        )

    # Generate new secret
    secret = pyotp.random_base32()

    # Create or update OTP settings
    if current_user.otp_settings:
        current_user.otp_settings.secret = secret
        current_user.otp_settings.otp_configured = True
    else:
        otp_settings = OtpSettings(
            user_id=current_user.id, secret=secret, otp_configured=True
        )
        otp_repo.save(otp_settings)

    # Generate OTP URI for QR code
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email, issuer_name="Fire Map"
    )

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(provisioning_uri)
    qr.make(fit=True)

    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")

    # Save image to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return StreamingResponse(
        img_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=qr.png"},
    )


@user_router.post("/2fa/verify")
async def verify_2fa(
    otp_data: OtpVerify,
    request: Request,
    user_repo: UserRepository = Depends(get_user_repository),
):
    current_user = user_repo.get_user_by_id(request.state.user_id)
    temp_session_id = request.cookies.get(config.temp_session_cookie_id)

    # Check if 2FA is configured
    if not current_user.otp_settings or not current_user.otp_settings.otp_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not configured for this user",
        )

    totp = pyotp.TOTP(current_user.otp_settings.secret)
    if not totp.verify(otp_data.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code"
        )
    sid = session_manager.create_session(current_user.id)
    response = Response(status_code=status.HTTP_200_OK)
    response.delete_cookie(key=config.temp_session_cookie_id)
    response.set_cookie(
        key=config.session_cookie_id,
        httponly=True,
        secure=True,
        max_age=config.session_expire_seconds,
        value=sid,
    )
    session_manager.delete_temp_session(temp_session_id)

    return response


@user_router.post("/2fa/disable")
async def disable_2fa(
    otp_data: OtpDisable,
    request: Request,
    user_repo: UserRepository = Depends(get_user_repository),
    otp_repo: OTPRepo = Depends(get_otp_repo),
):
    """Disable 2FA for the current user if they are not an admin."""
    current_user = user_repo.get_user_by_id(request.state.user_id)

    # Check if user is admin
    if is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin users cannot disable 2FA",
        )

    # Check if 2FA is configured
    if not current_user.otp_settings or not current_user.otp_settings.otp_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not configured for this user",
        )

    # Verify OTP code
    totp = pyotp.TOTP(current_user.otp_settings.secret)
    if not totp.verify(otp_data.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code"
        )

    # Check confirmation
    if not otp_data.confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please confirm that you want to disable 2FA by setting confirm=true",
        )

    try:
        otp_repo.disable(current_user.id)
        session_manager.delete_session(request.cookies.get(config.session_cookie_id))
        return Response(status_code=status.HTTP_200_OK)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


### User Admin routes
@user_router.get("", response_model=list[UserResponse])
def get_users(
    request: Request, user_repo: UserRepository = Depends(get_user_repository)
):
    user_id = request.state.user_id
    user = user_repo.get_user_by_id(user_id)
    if not is_admin(user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    users = user_repo.get_all_users()
    return [
        UserResponse(
            id=u.id,
            first_name=u.first_name,
            last_name=u.last_name,
            email=u.email,
            created_at=u.created_at.isoformat(),
            role=u.role.name,
            deactivated=u.deactivated,
        )
        for u in users
    ]


@user_router.patch("/edit_role/{user_id}")
def edit_role(
    request: Request,
    user_id: int,
    role_data: RoleUpdate = Body(...),
    user_repo: UserRepository = Depends(get_user_repository),
    role_repo: RoleRepository = Depends(get_role_repository),
):
    current_user = user_repo.get_user_by_id(request.state.user_id)
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    target_user = user_repo.get_user_by_id(user_id)

    role = role_repo.get_by_name(role_data.role_name)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Role not found"
        )
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User not found"
        )
    user_repo.set_role(target_user.id, role.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@user_router.patch("/deactivate/{user_id}", response_model=UserResponse)
def deactivate(
    request: Request,
    user_id: int,
    deactivate_body: DeactivateUser = Body(...),
    user_repo: UserRepository = Depends(get_user_repository),
):
    current_user = user_repo.get_user_by_id(request.state.user_id)
    if not is_admin(current_user):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        user = user_repo.get_user_by_id(user_id)
        user = user_repo.deactivate_user(user, deactivate_body.deactivate)
        return UserResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            created_at=user.created_at.isoformat(),
            role=user.role.name,
            deactivated=user.deactivated,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
