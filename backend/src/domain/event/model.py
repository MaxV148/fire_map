from datetime import datetime

from src.infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, ForeignKey, func, Table, Column
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry, WKBElement
from typing import List


event_tags = Table(
    "event_tags",
    Base.metadata,
    Column(
        "event_id",
        Integer,
        ForeignKey("event.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id", Integer, ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True
    ),
)


event_vehicles = Table(
    "event_vehicles",
    Base.metadata,
    Column(
        "event_id",
        Integer,
        ForeignKey("event.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "vehicle_id",
        Integer,
        ForeignKey("vehicletype.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Event(Base):
    __tablename__ = "event"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(250), nullable=True)
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=True
    )
    created_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tags: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary=event_tags,
        back_populates="events",
        cascade="all",
        passive_deletes=True,
    )
    vehicles: Mapped[List["VehicleType"]] = relationship(
        "VehicleType",
        secondary=event_vehicles,
        back_populates="events",
        cascade="all",
        passive_deletes=True,
    )
    user = relationship("User", back_populates="events")
