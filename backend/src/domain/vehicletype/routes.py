from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from src.infrastructure.postgresql.db import get_db
from src.domain.user.dependency import get_current_user
from src.domain.user.model import User
from src.domain.vehicletype.repository import VehicleTypeRepository
from src.domain.vehicletype.dto import VehicleTypeCreate, VehicleTypeUpdate, VehicleTypeResponse

# Create router
vehicle_router = APIRouter(prefix="/vehicle")


@vehicle_router.post("", response_model=VehicleTypeResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle_type(
    vehicle_data: VehicleTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new vehicle type"""
    repository = VehicleTypeRepository(db)
    return repository.create(vehicle_data)


@vehicle_router.get("", response_model=List[VehicleTypeResponse])
def get_all_vehicle_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all vehicle types"""
    repository = VehicleTypeRepository(db)
    return repository.get_all()


@vehicle_router.get("/{vehicle_id}", response_model=VehicleTypeResponse)
def get_vehicle_type(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a vehicle type by ID"""
    repository = VehicleTypeRepository(db)
    vehicle = repository.get_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with ID {vehicle_id} not found"
        )
    return vehicle


@vehicle_router.get("/name/{name}", response_model=VehicleTypeResponse)
def get_vehicle_type_by_name(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a vehicle type by name"""
    repository = VehicleTypeRepository(db)
    vehicle = repository.get_by_name(name)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with name '{name}' not found"
        )
    return vehicle


@vehicle_router.put("/{vehicle_id}", response_model=VehicleTypeResponse)
def update_vehicle_type(
    vehicle_id: int,
    vehicle_data: VehicleTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a vehicle type"""
    repository = VehicleTypeRepository(db)
    updated_vehicle = repository.update(vehicle_id, vehicle_data)
    if not updated_vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with ID {vehicle_id} not found"
        )
    return updated_vehicle


@vehicle_router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle_type(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a vehicle type"""
    repository = VehicleTypeRepository(db)
    success = repository.delete(vehicle_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with ID {vehicle_id} not found"
        )
    return None 