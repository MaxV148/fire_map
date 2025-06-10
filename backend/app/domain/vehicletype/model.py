from datetime import datetime

from infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from typing import List


class VehicleType(Base):
    __tablename__ = "vehicletype"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    events: Mapped[List["Event"]] = relationship(
        "Event",
        secondary="event_vehicles",
        back_populates="vehicles",
        cascade="all",
        passive_deletes=True,
    )
