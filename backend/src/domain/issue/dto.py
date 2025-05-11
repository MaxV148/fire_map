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


class IssueFilter(BaseModel):
    """Modell für Event Filter Parameter"""

    tag_ids: Optional[List[int]] = Field(None, description="Filter events by tag IDs")
    start_date: Optional[datetime] = Field(
        None, description="Filter events starting from this date"
    )
    end_date: Optional[datetime] = Field(
        None, description="Filter events until this date"
    )

    model_config = ConfigDict(populate_by_name=True, extra="ignore")
