from sqlalchemy.orm import Session
from infrastructure.postgresql.db import get_db
from fastapi import Depends
from domain.user.repository import UserRepository
from domain.user.otp_repo import OTPRepo


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_otp_repo(db: Session = Depends(get_db)) -> OTPRepo:
    return OTPRepo(db)
