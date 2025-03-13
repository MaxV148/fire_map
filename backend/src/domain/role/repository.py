from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional

from src.domain.role.model import Role
from src.domain.role.dto import RoleCreate, RoleUpdate


class RoleRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, role_data: RoleCreate) -> Role:
        """Create a new role"""
        db_role = Role(
            name=role_data.name,
            description=role_data.description,
        )

        self.db.add(db_role)
        self.db.commit()
        self.db.refresh(db_role)
        return db_role

    def get_by_id(self, role_id: int) -> Optional[Role]:
        """Get a role by its ID"""
        query = select(Role).where(Role.id == role_id)
        result = self.db.execute(query).scalar_one_or_none()
        return result

    def get_all(self) -> List[Role]:
        """Get all roles"""
        query = select(Role)
        result = self.db.execute(query).scalars().all()
        return result

    def update(self, role_id: int, role_data: RoleUpdate) -> Optional[Role]:
        """Update a role"""
        # First check if the role exists
        db_role = self.get_by_id(role_id)
        if not db_role:
            return None

        # Prepare update data
        update_data = {}
        if role_data.name is not None:
            update_data["name"] = role_data.name
        if role_data.description is not None:
            update_data["description"] = role_data.description

        # Execute update if there's data to update
        if update_data:
            stmt = update(Role).where(Role.id == role_id).values(**update_data)
            self.db.execute(stmt)
            self.db.commit()
            
            # Refresh the role object
            return self.get_by_id(role_id)
        return db_role

    def delete(self, role_id: int) -> bool:
        """Delete a role"""
        # First check if the role exists
        db_role = self.get_by_id(role_id)
        if not db_role:
            return False

        # Execute delete
        stmt = delete(Role).where(Role.id == role_id)
        self.db.execute(stmt)
        self.db.commit()
        return True 