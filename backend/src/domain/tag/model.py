from datetime import datetime
from typing import List

from src.infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, relationship, mapped_column


class Tag(Base):
    __tablename__ = "tag"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    events: Mapped[List["Event"]] = relationship("Event", secondary="event_tags", back_populates="tags")
    issues: Mapped[List["Issue"]] = relationship("Issue", secondary="issue_tags", back_populates="tags")
