from sqlalchemy.orm import Session

from domain.event.repository import EventRepository
from infrastructure.postgresql.db import get_db
from fastapi import Depends
from domain.user.repository import UserRepository
from domain.role.repository import RoleRepository
from domain.event.repository import EventRepository
from domain.tag.repository import TagRepository
from domain.vehicletype.repository import VehicleTypeRepository
from domain.user.otp_repo import OTPRepo


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_role_repository(db: Session = Depends(get_db)) -> RoleRepository:
    return RoleRepository(db)


def get_otp_repo(db: Session = Depends(get_db)) -> OTPRepo:
    return OTPRepo(db)


def get_event_repository(db: Session = Depends(get_db)) -> EventRepository:
    return EventRepository(db)


def get_tag_repository(db: Session = Depends(get_db)) -> TagRepository:
    return TagRepository(db)


def get_vehicle_type_repository(db: Session = Depends(get_db)) -> VehicleTypeRepository:
    return VehicleTypeRepository(db)
