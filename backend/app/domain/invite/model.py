import uuid
from datetime import datetime, timedelta

from sqlalchemy import Integer, String, DateTime, Boolean, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.postgresql.db import Base


class Invite(Base):
    __tablename__ = "invite"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    invite_uuid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), default=uuid.uuid4, unique=True, index=True
    )
    email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    expire_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=True
    )

    # Relationship with user who created the invite
    created_by = relationship("User", foreign_keys=[created_by_id])
