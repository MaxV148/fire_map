from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from src.infrastructure.postgresql.db import get_db
from src.domain.user.dependency import get_current_user
from src.domain.user.model import User
from src.domain.role.repository import RoleRepository
from src.domain.role.dto import RoleCreate, RoleUpdate, RoleResponse

# Create router
role_router = APIRouter(prefix="/role")


@role_router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new role"""
    repository = RoleRepository(db)
    return repository.create(role_data)


@role_router.get("", response_model=List[RoleResponse])
def get_all_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all roles"""
    repository = RoleRepository(db)
    return repository.get_all()


@role_router.get("/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a role by ID"""
    repository = RoleRepository(db)
    role = repository.get_by_id(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role with ID {role_id} not found"
        )
    return role


@role_router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a role"""
    repository = RoleRepository(db)
    updated_role = repository.update(role_id, role_data)
    if not updated_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role with ID {role_id} not found"
        )
    return updated_role


@role_router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a role"""
    repository = RoleRepository(db)
    success = repository.delete(role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role with ID {role_id} not found"
        )
    return None 