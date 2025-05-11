import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError
from sqlalchemy.orm import Session
from starlette import status
from src.infrastructure.postgresql.db import get_db
from src.conf.model import Settings
from src.domain.user.model import User
from loguru import logger

settings = Settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        logger.info(f"Payload: {payload}")
        id: int = int(payload.get("sub"))
        if id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )
        user = db.query(User).filter(User.id == id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )
        return user
    except PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}"
        )


def is_admin(user: User) -> bool:
    """
    Überprüft, ob ein Benutzer die Admin-Rolle hat.
    """
    return user.role.name == "admin"
