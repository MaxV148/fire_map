from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional

from src.domain.vehicletype.model import VehicleType
from src.domain.vehicletype.dto import VehicleTypeCreate, VehicleTypeUpdate


class VehicleTypeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, vehicle_data: VehicleTypeCreate) -> VehicleType:
        """Create a new vehicle type"""
        db_vehicle = VehicleType(
            name=vehicle_data.name,
        )

        self.db.add(db_vehicle)
        self.db.commit()
        self.db.refresh(db_vehicle)
        return db_vehicle

    def get_by_id(self, vehicle_id: int) -> Optional[VehicleType]:
        """Get a vehicle type by its ID"""
        query = select(VehicleType).where(VehicleType.id == vehicle_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_by_name(self, name: str) -> Optional[VehicleType]:
        """Get a vehicle type by its name"""
        query = select(VehicleType).where(VehicleType.name == name)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_all(self) -> List[VehicleType]:
        """Get all vehicle types"""
        query = select(VehicleType)
        result = self.db.execute(query).scalars().all()
        return result

    def update(self, vehicle_id: int, vehicle_data: VehicleTypeUpdate) -> Optional[VehicleType]:
        """Update a vehicle type"""
        # First check if the vehicle type exists
        db_vehicle = self.get_by_id(vehicle_id)
        if not db_vehicle:
            return None

        # Prepare update data
        update_data = {}
        if vehicle_data.name is not None:
            update_data["name"] = vehicle_data.name

        # Execute update if there's data to update
        if update_data:
            stmt = update(VehicleType).where(VehicleType.id == vehicle_id).values(**update_data)
            self.db.execute(stmt)
            self.db.commit()
            
            # Refresh the vehicle type object
            return self.get_by_id(vehicle_id)
        return db_vehicle

    def delete(self, vehicle_id: int) -> bool:
        """Delete a vehicle type"""
        # First check if the vehicle type exists
        db_vehicle = self.get_by_id(vehicle_id)
        if not db_vehicle:
            return False

        # Execute delete
        stmt = delete(VehicleType).where(VehicleType.id == vehicle_id)
        self.db.execute(stmt)
        self.db.commit()
        return True 