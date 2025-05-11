from datetime import datetime

from src.infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, func, ForeignKey, Boolean
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
        server_default="2",  # 2 = user role
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    role = relationship("Role", back_populates="users")
    events = relationship("Event", back_populates="user")
    issues = relationship("Issue", back_populates="user")
    otp_settings = relationship(
        "OtpSettings",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
    )
