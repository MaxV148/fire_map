import uuid
from io import BytesIO
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, Body, Request
from fastapi.responses import StreamingResponse, Response, JSONResponse
import pyotp
import qrcode
import secrets
from datetime import timedelta, datetime
from jinja2 import Environment, FileSystemLoader, Template
from loguru import logger
from fastapi_mail import FastMail, MessageSchema, MessageType
from infrastructure.mail.client import get_mail_client
from domain.role.repository import RoleRepository
from domain.user.dto import (
    MeResponse,
    OtpVerify,
    ResetPassword,
    SetNewPassword,
    SelfResetPassword,
    OtpDisable,
    ForgotPassword,
    RoleUpdate,
    DeactivateUser,
    ConfirmForgotPassword,
)
from domain.auth.service import hash_password, verify_password
from domain.user.model import User, OtpSettings, PasswordReset, PasswordResetType
from starlette import status
from domain.user.otp_repo import OTPRepo
from dependencies.repository_dependencies import get_otp_repo
from domain.user.dto import UserResponse
from domain.user.repository import UserRepository
from config.config_provider import get_config
from dependencies.repository_dependencies import (
    get_user_repository,
    get_role_repository,
)
from infrastructure.redis.redis_client import session_manager
from domain.user.dependency import is_admin
from misc.sign import (
    create_signed_token,
    verify_signed_signed_token,
    generate_forgot_password_code,
)


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
        current_user.otp_settings.otp_configured = (
            False  # Set to False initially, will be True after verification
        )
        otp_repo.save(current_user.otp_settings)
    else:
        otp_settings = OtpSettings(
            user_id=current_user.id,
            secret=secret,
            otp_configured=False,  # Set to False initially, will be True after verification
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
    otp_repo: OTPRepo = Depends(get_otp_repo),
):
    current_user = user_repo.get_user_by_id(request.state.user_id)
    temp_session_id = request.cookies.get(config.temp_session_cookie_id)

    # Check if 2FA setup is in progress (secret exists but not yet configured)
    if not current_user.otp_settings or not current_user.otp_settings.secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not started for this user",
        )

    totp = pyotp.TOTP(current_user.otp_settings.secret)
    if not totp.verify(otp_data.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code"
        )

    # If verification successful, mark 2FA as configured
    current_user.otp_settings.otp_configured = True
    otp_repo.save(current_user.otp_settings)

    # Handle session management only if there's a temp session (login flow)
    if temp_session_id:
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
    else:
        # This is a setup verification, not a login verification
        return Response(status_code=status.HTTP_200_OK)


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


@user_router.post("/admin_reset_password")
async def admin_reset_password(
    request: Request,
    reset_password: ResetPassword = Body(...),
    user_repo: UserRepository = Depends(get_user_repository),
    mail_client: FastMail = Depends(get_mail_client),
):
    """
    Reset password for a user by sending a password reset email.
    Only admins can trigger password resets for other users.
    """
    try:
        current_user = user_repo.get_user_by_id(request.state.user_id)
        if not is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

        target_user = user_repo.get_user_by_id(reset_password.user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Create password reset entry
        expire_hours = 24
        expire_date = datetime.now() + timedelta(hours=expire_hours)
        pw_reset = PasswordReset(
            reset_token=secrets.token_urlsafe(config.secret_length),
            reset_type=PasswordResetType.ADMIN,
            created_by_id=current_user.id,
            for_user_id=target_user.id,
            expire_date=expire_date,
        )
        pw_reset = user_repo.create_pw_reset(pw_reset)
        # Create signed token
        reset_token_hmac = create_signed_token(
            str(pw_reset.reset_token), config.hmac_secret
        )

        # Generate reset link
        reset_link = f"{config.frontend_url}/reset-password?token={reset_token_hmac}"
        with open("./mail_templates/reset_pw.html.jinja", "r") as f:
            template = Template(f.read())
            html_content = template.render(reset_link=reset_link)
            message = MessageSchema(
                subject="Passwort zurücksetzen",
                recipients=[target_user.email],
                body=html_content,
                subtype=MessageType.html,
            )
            await mail_client.send_message(message)

        return Response(
            status_code=status.HTTP_204_NO_CONTENT,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send password reset email: {str(e)}",
        )


@user_router.post("/confirm_admin_reset_password/{token}")
async def confirm_admin_reset_password(
    token: str,
    body: SetNewPassword = Body(...),
    user_repo: UserRepository = Depends(get_user_repository),
):
    try:
        is_valid, pw_reset_token = verify_signed_signed_token(token, config.hmac_secret)
        if not is_valid or not pw_reset_token:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content="Invalid or malformed invitation token",
            )
        pw_reset = user_repo.get_pw_reset_by_token(pw_reset_token)
        if not pw_reset:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND, content="Invitation not found"
            )

        if pw_reset.is_used:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content="Invitation has already been used",
            )

        from datetime import datetime

        if pw_reset.expire_date < datetime.now():
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content="Invitation has expired",
            )
        user_id = pw_reset.for_user_id
        user_repo.change_password(user_id, hash_password(body.new_password))
        user_repo.set_pw_reset_token_used(pw_reset_token)
        return Response(
            status_code=status.HTTP_204_NO_CONTENT,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send password reset email: {str(e)}",
        )


@user_router.post("/self_reset_password")
def self_reset_password(
    request: Request,
    body: SelfResetPassword = Body(...),
    user_repo: UserRepository = Depends(get_user_repository),
):
    current_user = user_repo.get_user_by_id(request.state.user_id)
    if not verify_password(body.old_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    user_repo.change_password(current_user.id, hash_password(body.new_password))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@user_router.post("/forgot_password")
async def email_reset_password(
    body: ForgotPassword = Body(...),
    user_repo: UserRepository = Depends(get_user_repository),
    mail_client: FastMail = Depends(get_mail_client),
):
    current_user = user_repo.get_user_by_email(body.email)
    if current_user:
        with open("./mail_templates/forgot_password.html.jinja", "r") as f:
            template = Template(f.read())
            reset_code = generate_forgot_password_code()
            expire_mins = 15
            expire_date = datetime.now() + timedelta(minutes=expire_mins)
            pw_reset = PasswordReset(
                reset_type=PasswordResetType.FORGOT,
                reset_code=reset_code,
                expire_date=expire_date,
                for_user_id=current_user.id,
            )
            user_repo.create_pw_reset(pw_reset)
            html_content = template.render(code=reset_code)
            message = MessageSchema(
                subject="Neues Password vergeben",
                recipients=[current_user.email],
                body=html_content,
                subtype=MessageType.html,
            )
            await mail_client.send_message(message)

        return Response(status_code=status.HTTP_204_NO_CONTENT)


@user_router.post("/confirm_forgot_password")
def confirm_forgot_password(
    body: ConfirmForgotPassword = Body(...),
    user_repo: UserRepository = Depends(get_user_repository),
):
    pw_reset = user_repo.get_pw_reset_by_code(body.code)
    if not pw_reset:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND, content="Invitation not found"
        )

    if pw_reset.is_used:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content="Invitation has already been used",
        )

    from datetime import datetime

    if pw_reset.expire_date < datetime.now():
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content="Invitation has expired",
        )

    user_repo.change_password(pw_reset.for_user_id, hash_password(body.new_password))
    user_repo.set_pw_reset_code_used(body.code)
