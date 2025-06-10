from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from infrastructure.postgresql.db import get_db
from domain.user.model import User
from domain.vehicletype.repository import VehicleTypeRepository
from domain.vehicletype.dto import (
    VehicleTypeCreate,
    VehicleTypeUpdate,
    VehicleTypeResponse,
)
from dependencies.repository_dependencies import get_vehicle_type_repository

# Create router
vehicle_router = APIRouter(prefix="/vehicle")


@vehicle_router.post(
    "", response_model=VehicleTypeResponse, status_code=status.HTTP_201_CREATED
)
def create_vehicle_type(
    vehicle_data: VehicleTypeCreate,
    vehicle_type_repository: VehicleTypeRepository = Depends(
        get_vehicle_type_repository
    ),
):
    """Create a new vehicle type"""
    return vehicle_type_repository.create(vehicle_data)


@vehicle_router.get("", response_model=List[VehicleTypeResponse])
def get_all_vehicle_types(
    vehicle_type_repository: VehicleTypeRepository = Depends(
        get_vehicle_type_repository
    ),
):
    """Get all vehicle types"""
    return vehicle_type_repository.get_all()


@vehicle_router.get("/{vehicle_id}", response_model=VehicleTypeResponse)
def get_vehicle_type(
    vehicle_id: int,
    vehicle_type_repository: VehicleTypeRepository = Depends(
        get_vehicle_type_repository
    ),
):
    """Get a vehicle type by ID"""
    vehicle = vehicle_type_repository.get_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with ID {vehicle_id} not found",
        )
    return vehicle


@vehicle_router.get("/name/{name}", response_model=VehicleTypeResponse)
def get_vehicle_type_by_name(
    name: str,
    vehicle_type_repository: VehicleTypeRepository = Depends(
        get_vehicle_type_repository
    ),
):
    """Get a vehicle type by name"""
    vehicle = vehicle_type_repository.get_by_name(name)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with name '{name}' not found",
        )
    return vehicle


@vehicle_router.put("/{vehicle_id}", response_model=VehicleTypeResponse)
def update_vehicle_type(
    vehicle_id: int,
    vehicle_data: VehicleTypeUpdate,
    vehicle_type_repository: VehicleTypeRepository = Depends(
        get_vehicle_type_repository
    ),
):
    """Update a vehicle type"""
    updated_vehicle = vehicle_type_repository.update(vehicle_id, vehicle_data)
    if not updated_vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with ID {vehicle_id} not found",
        )
    return updated_vehicle


@vehicle_router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle_type(
    vehicle_id: int,
    vehicle_type_repository: VehicleTypeRepository = Depends(
        get_vehicle_type_repository
    ),
):
    """Delete a vehicle type"""
    success = vehicle_type_repository.delete(vehicle_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle type with ID {vehicle_id} not found",
        )
    return None
