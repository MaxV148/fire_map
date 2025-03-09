from fastapi import APIRouter, Depends, HTTPException, status
from src.infrastructure.postgresql.db import get_db
from sqlalchemy.orm import Session
from src.domain.user.model import User
from src.domain.exercises.dto import ExerciseCreate, ExerciseUpdate
from src.domain.user.dependency import get_current_user
from src.domain.exercises.repository import ExerciseRepository
from src.domain.exercises.dto import ExerciseResponse
from typing import List, Optional


exercises_router = APIRouter(prefix="/exercises")


@exercises_router.post(
    "/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED
)
def create_exercise(
    exercise_data: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # if exercise_data.trainer != current_user.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="You can only create exercises for yourself as the trainer"
    #     )

    repository = ExerciseRepository(db)
    exercise = repository.create(exercise_data, current_user)

    response = ExerciseResponse(
        id=exercise.id,
        name=exercise.name,
        description=exercise.description,
        trainer=exercise.trainer,
        locations=repository.get_location_coordinates(exercise),
    )

    return response


@exercises_router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    repository = ExerciseRepository(db)
    exercise = repository.get_by_id(exercise_id)

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with ID {exercise_id} not found",
        )

    response = ExerciseResponse(
        id=exercise.id,
        name=exercise.name,
        description=exercise.description,
        trainer=exercise.trainer,
        locations=repository.get_location_coordinates(exercise),
    )

    return response


@exercises_router.get("/", response_model=List[ExerciseResponse])
def get_exercises(trainer_id: Optional[int] = None, db: Session = Depends(get_db)):
    repository = ExerciseRepository(db)

    if trainer_id:
        exercises = repository.get_by_trainer(trainer_id)
    else:
        exercises = repository.get_all()

    responses = []
    for exercise in exercises:
        responses.append(
            ExerciseResponse(
                id=exercise.id,
                name=exercise.name,
                description=exercise.description,
                trainer=exercise.trainer,
                locations=repository.get_location_coordinates(exercise),
            )
        )

    return responses


@exercises_router.patch("/{exercise_id}", response_model=ExerciseResponse)
def partial_update_exercise(
    exercise_id: int,
    exercise_data: ExerciseUpdate,
    _=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = ExerciseRepository(db)

    existing_exercise = repository.get_by_id(exercise_id)
    if not existing_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with ID {exercise_id} not found",
        )

    updated_exercise = repository.update(exercise_id, exercise_data)

    response = ExerciseResponse(
        id=updated_exercise.id,
        name=updated_exercise.name,
        description=updated_exercise.description,
        trainer=updated_exercise.trainer,
        locations=repository.get_location_coordinates(updated_exercise),
    )

    return response


@exercises_router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    exercise_id: int,
    _=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = ExerciseRepository(db)

    # Check if exercise exists
    existing_exercise = repository.get_by_id(exercise_id)
    if not existing_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with ID {exercise_id} not found",
        )

    success = repository.delete(exercise_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete exercise",
        )

    return None
