from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Annotated
from datetime import datetime
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping


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
    created_by: Optional[int] = None
    created_at: datetime

    @field_validator("location", mode="before")
    def turn_location_into_wkt(cls, value):
        if value is None:
            return None
        point = to_shape(value)
        return [float(point.x), float(point.y)]

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
    name: Optional[str] = Field(
        None, description="Filter events by name (case-insensitive text search)"
    )
    description: Optional[str] = Field(
        None, description="Filter events by description (case-insensitive text search)"
    )
    
    # Standort-basierte Filter
    city_name: Optional[str] = Field(
        None, min_length=2, max_length=100, description="Stadtname für Distanzsuche"
    )
    distance_km: Optional[float] = Field(
        None, ge=0.1, le=1000, description="Suchradius in Kilometern (0.1-1000km)"
    )
    
    # Paginierung
    page: int = Field(1, ge=1, description="Seitennummer (beginnend mit 1)")
    limit: int = Field(10, ge=1, le=100, description="Anzahl der Events pro Seite (max. 100)")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class PaginatedEventResponse(BaseModel):
    """Paginierte Response für Events"""
    
    events: List[EventResponse]
    total_count: int = Field(description="Gesamtanzahl der Events")
    page: int = Field(description="Aktuelle Seitennummer")
    limit: int = Field(description="Anzahl der Events pro Seite")
    total_pages: int = Field(description="Gesamtanzahl der Seiten")
