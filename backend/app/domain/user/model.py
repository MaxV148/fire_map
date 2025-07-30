import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, func, ForeignKey, Boolean, Enum
import enum
from typing import Optional
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column


class OtpSettings(Base):
    __tablename__ = "otp_settings"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), unique=True, nullable=False
    )
    otp_configured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    secret: Mapped[str] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationship
    user = relationship("User", back_populates="otp_settings")


class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False, index=True)
    role_id: Mapped[int] = mapped_column(
        ForeignKey("role.id"),
        nullable=False,
        index=True,
        server_default="1",  # 2 = user role
    )
    deactivated: Mapped[bool] = mapped_column(server_default="False", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    role = relationship("Role", back_populates="users")
    events = relationship("Event", back_populates="user", lazy="dynamic")
    issues = relationship("Issue", back_populates="user", lazy="dynamic")
    otp_settings = relationship(
        "OtpSettings",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
    )


class PasswordResetType(enum.Enum):
    ADMIN = "admin"
    SELF = "self"
    FORGOT = "forgot"


class PasswordReset(Base):
    __tablename__ = "pw_reset"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    reset_type: Mapped[PasswordResetType] = mapped_column(
        Enum(PasswordResetType), nullable=False
    )
    reset_code: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True)
    reset_token: Mapped[Optional[str]] = mapped_column(String, index=True)
    expire_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=True
    )
    for_user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False, index=True
    )

    # Relationship with user who created the invite
    created_by = relationship("User", foreign_keys=[created_by_id])
    for_user = relationship("User", foreign_keys=[for_user_id])
