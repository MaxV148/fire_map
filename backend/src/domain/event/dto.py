from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Annotated
from datetime import datetime


class TagResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class VehicleTypeResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[List[float]] = None  # [longitude, latitude]
    tag_ids: Optional[List[int]] = None
    vehicle_ids: Optional[List[int]] = None


class EventCreate(EventBase):
    name: str
    description: str
    location: List[float]
    tag_ids: List[int]
    vehicle_ids: List[int]


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[List[float]] = None
    tag_ids: Optional[List[int]] = None
    vehicle_ids: Optional[List[int]] = None


class EventResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    location: Optional[List[float]] = None
    tags: List[TagResponse]
    vehicles: List[VehicleTypeResponse]
    created_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventFilter(BaseModel):
    """Modell für Event Filter Parameter"""

    vehicle_ids: Optional[List[int]] = Field(
        None, description="Filter events by vehicle type IDs"
    )
    tag_ids: Optional[List[int]] = Field(None, description="Filter events by tag IDs")
    start_date: Optional[datetime] = Field(
        None, description="Filter events starting from this date"
    )
    end_date: Optional[datetime] = Field(
        None, description="Filter events until this date"
    )

    model_config = ConfigDict(populate_by_name=True, extra="ignore")
