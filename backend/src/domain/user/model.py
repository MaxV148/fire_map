from datetime import datetime

from src.infrastructure.postgresql.db import Base
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column



class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(Integer,primary_key=True, autoincrement=True,index=True)
    username: Mapped[str] = mapped_column(String,nullable=False, unique=True, index=True)
    password: Mapped[str] = mapped_column(String,nullable=False,index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

