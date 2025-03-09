from pydantic import BaseModel
from typing import List, Optional


class ExerciseCreate(BaseModel):
    name: str
    description: str
    locations: List[float]


class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    locations: Optional[List[float]] = None
    trainer: Optional[int] = None


class ExerciseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    trainer: int
    locations: Optional[List[float]] = None

    class Config:
        from_attributes = True
