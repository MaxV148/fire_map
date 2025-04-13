from pydantic import BaseModel, ConfigDict
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
    updated_at: datetime
    tags: List[TagResponse]
    location: Optional[List[float]] = None

    model_config = ConfigDict(from_attributes=True)
