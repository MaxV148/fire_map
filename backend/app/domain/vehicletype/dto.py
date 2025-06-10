from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class VehicleTypeBase(BaseModel):
    name: str


class VehicleTypeCreate(VehicleTypeBase):
    pass


class VehicleTypeUpdate(BaseModel):
    name: Optional[str] = None


class VehicleTypeResponse(VehicleTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
