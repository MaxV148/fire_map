from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping


class TagResponse(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class IssueBase(BaseModel):
    name: str
    description: Optional[str] = None
    tag_ids: Optional[List[int]] = None
    location: Optional[List[float]] = None


class IssueCreate(IssueBase):
    pass


class IssueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tag_ids: Optional[List[int]] = None
    location: Optional[List[float]] = None


class IssueResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_by_user_id: Optional[int] = None
    created_at: datetime
    tags: List[TagResponse]
    location: Optional[List[float]] = None

    @field_validator("location", mode="before")
    def turn_location_into_wkt(cls, value):
        if value is None:
            return None
        point = to_shape(value)
        return [float(point.x), float(point.y)]

    model_config = ConfigDict(from_attributes=True)


class IssueFilter(BaseModel):
    """Modell für Issue Filter Parameter"""

    tag_ids: Optional[List[int]] = Field(None, description="Filter issues by tag IDs")
    start_date: Optional[datetime] = Field(
        None, description="Filter issues starting from this date"
    )
    end_date: Optional[datetime] = Field(
        None, description="Filter issues until this date"
    )
    name: Optional[str] = Field(
        None, description="Filter issues by name (case-insensitive text search)"
    )
    description: Optional[str] = Field(
        None, description="Filter issues by description (case-insensitive text search)"
    )
    
    # Paginierung
    page: int = Field(1, ge=1, description="Seitennummer (beginnend mit 1)")
    limit: int = Field(10, ge=1, le=100, description="Anzahl der Issues pro Seite (max. 100)")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class PaginatedIssueResponse(BaseModel):
    """Paginierte Response für Issues"""
    
    issues: List[IssueResponse]
    total_count: int = Field(description="Gesamtanzahl der Issues")
    page: int = Field(description="Aktuelle Seitennummer")
    limit: int = Field(description="Anzahl der Issues pro Seite")
    total_pages: int = Field(description="Gesamtanzahl der Seiten")
