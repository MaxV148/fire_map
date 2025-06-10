from datetime import datetime
from typing import List

from infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, ForeignKey, Text, func, Table, Column
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry


issue_tags = Table(
    "issue_tags",
    Base.metadata,
    Column(
        "issue_id",
        Integer,
        ForeignKey("issue.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id", Integer, ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True
    ),
)


class Issue(Base):
    __tablename__ = "issue"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(250), nullable=True)
    created_by_user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=True
    )

    # Relationships
    tags: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary=issue_tags,
        back_populates="issues",
        cascade="all",
        passive_deletes=True,
    )
    user = relationship("User")
