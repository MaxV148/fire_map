from io import BytesIO
from urllib.request import Request

from fastapi import APIRouter, Depends, HTTPException, Response, Request, Query
from fastapi.responses import StreamingResponse
import pyotp
import qrcode
from sqlalchemy.orm.session import Session
from fastapi.responses import JSONResponse
from misc.sign import verify_signed_signed_token
from domain.user.repository import UserRepository
from domain.user.otp_repo import OTPRepo
from infrastructure.redis.redis_client import session_manager
from domain.auth.service import verify_password, hash_password, gen_auth_cookie
from domain.user.dto import UserCreate, Authresponse, UserLogin, LoginStep2
from domain.user.model import User, OtpSettings
from infrastructure.postgresql.db import get_db
from config.config_provider import get_config
from dependencies.repository_dependencies import (
    get_user_repository,
    get_otp_repo,
    get_invite_repo,
)
from domain.invite.repository import InviteRepository
from starlette import status
from loguru import logger

auth_router = APIRouter(prefix="/auth")

config = get_config()


@auth_router.post("/register", response_model=Authresponse)
def register_user(
    user_data: UserCreate,
    invite: str = Query(),
    user_repo: UserRepository = Depends(get_user_repository),
    invite_repo: InviteRepository = Depends(get_invite_repo),
):
    # Validiere Invitation Token
    is_valid, invite_uuid = verify_signed_signed_token(invite, config.hmac_secret)
    if not is_valid or not invite_uuid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or malformed invitation token",
        )

    # Prüfe, ob die Einladung in der Datenbank existiert und gültig ist
    db_invite = invite_repo.get_by_uuid(invite_uuid)
    if not db_invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found"
        )

    # Prüfe, ob die Einladung bereits verwendet wurde
    if db_invite.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has already been used",
        )

    # Prüfe, ob die Einladung abgelaufen ist
    from datetime import datetime

    if db_invite.expire_date < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation has expired"
        )

    # Prüfe, ob die Email der Einladung mit der Registrierungs-Email übereinstimmt
    if db_invite.email.lower() != user_data.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email does not match the invitation",
        )

    # Prüfe, ob Email bereits existiert
    existing_email = user_repo.get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken"
        )

    # Validiere first_name und last_name
    if not user_data.first_name or not user_data.last_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="First name and last name are required",
        )

    # Erstelle neuen User
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )
    user_repo.create_user(new_user)

    # Markiere die Einladung als verwendet
    invite_repo.mark_as_used(db_invite.invite_uuid)

    # Erstelle Session
    sid = session_manager.create_session(new_user.id)
    res = gen_auth_cookie(sid)
    return res


@auth_router.post("/login", response_model=Authresponse)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if user.otp_settings and user.otp_settings.otp_configured:
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "requires_mfa": True,
            },
        )
        tmp_sid = session_manager.create_temp_session(user.id)
        response.set_cookie(
            key=config.temp_session_cookie_id, httponly=True, secure=True, value=tmp_sid
        )
        return response

    sid = session_manager.create_session(user.id)
    response = JSONResponse(
        status_code=status.HTTP_200_OK, content={"requires_mfa": False}
    )
    response.set_cookie(
        key=config.session_cookie_id,
        httponly=True,
        secure=True,
        max_age=config.session_expire_seconds,
        value=sid,
    )
    return response


@auth_router.post("/logout")
def logout_user(request: Request, response: Response):
    """Logout user by deleting session and clearing cookie."""
    session_id = request.cookies.get("sid")
    if session_id:
        # Delete session from Redis
        session_manager.delete_session(session_id)

    # Clear the session cookie
    response.delete_cookie(key="sid")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@auth_router.get("/status")
def get_status(request: Request, response: JSONResponse):
    session_id = request.cookies.get(config.session_cookie_id)
    if session_manager.get_session(session_id):
        return {"status": "active"}
    return {"status": "inactive"}
