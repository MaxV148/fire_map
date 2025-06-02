from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Request
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
import pyotp
import qrcode
from domain.user.dto import (
    UserCreate,
    Authresponse,
    MeResponse,
    UserLogin,
    OtpVerify,
    OtpDisable,
    LoginStep2,
    RoleUpdate,
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
from dependencies.repository_dependencies import get_user_repository
from infrastructure.redis.redis_client import session_manager

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

    # Verify OTP code
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


# @user_router.post("/2fa/disable")
# async def disable_2fa(
#     otp_data: OtpDisable,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     """Disable 2FA for the current user if they are not an admin."""
#
#     # Check if user is admin
#     if current_user.role.name == "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Admin users cannot disable 2FA",
#         )
#
#     # Check if 2FA is configured
#     if not current_user.otp_settings or not current_user.otp_settings.otp_configured:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="2FA is not configured for this user",
#         )
#
#     # Verify OTP code
#     totp = pyotp.TOTP(current_user.otp_settings.secret)
#     if not totp.verify(otp_data.code):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code"
#         )
#
#     # Check confirmation
#     if not otp_data.confirm:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Please confirm that you want to disable 2FA by setting confirm=true",
#         )
#
#     # Disable 2FA
#     current_user.otp_settings.otp_configured = False
#     current_user.otp_settings.secret = None
#     db.commit()
#
#     return {"message": "2FA has been disabled successfully"}


### User Admin routes

# @user_router.get('/', response_model=list[UserResponse])
# def get_users(db: Session = Depends(get_db),user: User = Depends(get_current_user)):
#     if user.role.name != "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#         )
#     users = db.query(User).all()
#     return [UserResponse(
#         id=u.id,
#         first_name=u.first_name,
#         last_name=u.last_name,
#         email=u.email,
#         created_at=u.created_at.isoformat(),
#         role=u.role.name
#     ) for u in users]
#
#
# @user_router.patch("/edit_role")
# def edit_role(
#     user_id: int = Query(..., description="ID of the user to update"),
#     role_data: RoleUpdate = Body(...),
#     db: Session = Depends(get_db),
#     user: User = Depends(get_current_user)
# ):
#     if user.role.name != "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#         )
#     role = db.query(Role).filter(Role.id == role_data.role_id).first()
#     if not role:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
#         )
#     target_user = db.query(User).filter(User.id == user_id).first()
#     if not target_user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
#         )
#     target_user.role_id = role_data.role_id
#     db.commit()
#     return Response(status_code=status.HTTP_204_NO_CONTENT)
#
# @user_router.delete("/{user_id}")
# def delete_user(
#     user_id: int,
#     db: Session = Depends(get_db),
#     user: User = Depends(get_current_user)
# ):
#     if user.role.name != "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#         )
#     target_user = db.query(User).filter(User.id == user_id).first()
#     if not target_user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
#         )
#     db.delete(target_user)
#     db.commit()
#     return  Response(status_code=status.HTTP_204_NO_CONTENT)
