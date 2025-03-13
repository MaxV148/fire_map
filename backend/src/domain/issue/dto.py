from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class IssueBase(BaseModel):
    name: str
    description: Optional[str] = None
    tag_id: Optional[int] = None


class IssueCreate(IssueBase):
    pass


class IssueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tag_id: Optional[int] = None


class IssueResponse(IssueBase):
    id: int
    created_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True) 