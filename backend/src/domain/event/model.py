from datetime import datetime

from src.infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from geoalchemy2 import Geometry


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
    tag_id: Mapped[int] = mapped_column(Integer, ForeignKey("tag.id"), nullable=True)
    vehicle_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("vehicletype.id"), nullable=True
    )
    created_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tag = relationship("Tag", back_populates="events")
    vehicle = relationship("VehicleType", back_populates="events")
    user = relationship("User", back_populates="events")
