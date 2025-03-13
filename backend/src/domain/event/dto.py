from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[List[float]] = None  # [longitude, latitude]
    tag_id: Optional[int] = None
    vehicle_id: Optional[int] = None


class EventCreate(EventBase):
    name: str
    description: str
    location: List[float]
    tag_id: int
    vehicle_id: int


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[List[float]] = None
    tag_id: Optional[int] = None
    vehicle_id: Optional[int] = None


class EventResponse(EventBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True) 