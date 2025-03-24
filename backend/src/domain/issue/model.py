from datetime import datetime

from src.infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column


class Issue(Base):
    __tablename__ = "issue"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(250), nullable=True)
    tag_id: Mapped[int] = mapped_column(Integer, ForeignKey("tag.id"), nullable=True)
    created_by_user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tag = relationship("Tag")
    user = relationship("User")
