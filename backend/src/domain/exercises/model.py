from src.infrastructure.postgresql.db import Base
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy import Integer, String, ForeignKey
from geoalchemy2 import Geometry


class Exercises(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(75), nullable=False)
    description: Mapped[str] = mapped_column(String(400), nullable=True)
    trainer: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
