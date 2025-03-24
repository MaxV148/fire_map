from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class InviteCreate(BaseModel):
    email: EmailStr
    # Expire date is optional as it will be set in the service
    expire_days: Optional[int] = 7


class InviteResponse(BaseModel):
    id: int
    invite_uuid: UUID
    email: str
    expire_date: datetime
    created_at: datetime
    is_used: bool

    class Config:
        from_attributes = True


class InviteList(BaseModel):
    invites: list[InviteResponse]
    count: int
