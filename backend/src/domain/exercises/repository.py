from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional, Union
from geoalchemy2.functions import ST_GeomFromText
from geoalchemy2.shape import to_shape

from src.domain.exercises.model import Exercises
from src.domain.exercises.dto import ExerciseCreate, ExerciseUpdate
from src.domain.user.model import User


class ExerciseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, exercise_data: ExerciseCreate, current_user: User) -> Exercises:
        """Create a new exercise record"""
        # Convert location coordinates to WKT point format
        wkt_point = None
        if exercise_data.locations and len(exercise_data.locations) >= 2:
            lon, lat = exercise_data.locations[0], exercise_data.locations[1]
            wkt_point = f"POINT({lon} {lat})"

        db_exercise = Exercises(
            name=exercise_data.name,
            description=exercise_data.description,
            trainer=current_user.id,
            location=ST_GeomFromText(wkt_point) if wkt_point else None,
        )

        # Add to session and commit
        self.db.add(db_exercise)
        self.db.commit()
        self.db.refresh(db_exercise)
        return db_exercise

    def get_by_id(self, exercise_id: int) -> Optional[Exercises]:
        """Get an exercise by its ID"""
        query = select(Exercises).where(Exercises.id == exercise_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_all(self) -> List[Exercises]:
        """Get all exercises"""
        query = select(Exercises)
        result = self.db.execute(query).scalars().all()
        return result

    def get_by_trainer(self, trainer_id: int) -> List[Exercises]:
        """Get all exercises by a specific trainer"""
        query = select(Exercises).where(Exercises.trainer == trainer_id)
        result = self.db.execute(query).scalars().all()
        return result

    def update(
        self, exercise_id: int, exercise_data: ExerciseUpdate
    ) -> Optional[Exercises]:
        exercise = self.get_by_id(exercise_id)
        if not exercise:
            return None

        update_data = {}

        location_value = None
        if (
            hasattr(exercise_data, "locations")
            and exercise_data.locations
            and len(exercise_data.locations) >= 2
        ):
            lon, lat = exercise_data.locations[0], exercise_data.locations[1]
            wkt_point = f"POINT({lon} {lat})"
            location_value = ST_GeomFromText(wkt_point)

        if exercise_data.name is not None:
            update_data["name"] = exercise_data.name

        if exercise_data.description is not None:
            update_data["description"] = exercise_data.description

        if exercise_data.trainer is not None:
            update_data["trainer"] = exercise_data.trainer

        if location_value:
            update_data["location"] = location_value

        if not update_data:
            return exercise

        stmt = (
            update(Exercises).where(Exercises.id == exercise_id).values(**update_data)
        )
        self.db.execute(stmt)
        self.db.commit()

        return self.get_by_id(exercise_id)

    def delete(self, exercise_id: int) -> bool:
        """Delete an exercise by ID"""
        # Check if exercise exists
        exercise = self.get_by_id(exercise_id)
        if not exercise:
            return False

        # Execute delete
        stmt = delete(Exercises).where(Exercises.id == exercise_id)
        self.db.execute(stmt)
        self.db.commit()
        return True

    def get_location_coordinates(self, exercise: Exercises) -> Optional[List[float]]:
        """Extract coordinates from a geometry point"""
        if not exercise.location:
            return None

        # Convert geometry to shape and extract coordinates
        point = to_shape(exercise.location)
        return [point.x, point.y]  # Returns [longitude, latitude]
