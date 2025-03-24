from datetime import datetime, timedelta
from typing import Dict, Optional
import jwt
from passlib.context import CryptContext
from src.conf.model import Settings

settings = Settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def create_temp_token(data: Dict) -> str:
    """Create a temporary token for 2FA verification that expires in 5 minutes."""
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=5)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def verify_temp_token(token: str) -> Dict:
    """Verify a temporary token and return its payload."""
    try:
        payload = jwt.decode(
                token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return payload
    except jwt.InvalidTokenError:
        raise ValueError("Invalid temporary token")
