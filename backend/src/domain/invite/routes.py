from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from starlette import status

from src.domain.invite.dto import InviteCreate, InviteResponse, InviteList
from src.domain.invite.repository import InviteRepository
from src.domain.user.model import User
from src.domain.user.dependency import get_current_user
from src.infrastructure.postgresql.db import get_db


invite_router = APIRouter(prefix="/invite")


@invite_router.post(
    "", response_model=InviteResponse, status_code=status.HTTP_201_CREATED
)
def create_invite(
    invite_data: InviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new invitation link for a user
    """
    # Initialize repository
    repository = InviteRepository(db)

    # Check if there's already a valid invite for this email
    existing_invite = repository.get_by_email(invite_data.email)
    if existing_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active invitation already exists for this email",
        )

    # Create new invite
    invite = repository.create(invite_data, current_user.id)

    return invite


@invite_router.get("", response_model=InviteList)
def list_invites(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),  # Ensure user is authenticated
):
    """
    List all invitations with pagination
    """
    repository = InviteRepository(db)
    invites = repository.get_all(skip=skip, limit=limit)
    count = repository.count()

    return InviteList(invites=invites, count=count)


@invite_router.get("/{invite_uuid}", response_model=InviteResponse)
def get_invite(
    invite_uuid: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),  # Ensure user is authenticated
):
    """
    Get a specific invitation by UUID
    """
    repository = InviteRepository(db)
    invite = repository.get_by_uuid(invite_uuid)
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found"
        )

    return invite


@invite_router.delete("/{invite_uuid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invite(
    invite_uuid: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),  # Ensure user is authenticated
):
    """
    Delete an invitation
    """
    repository = InviteRepository(db)
    deleted = repository.delete(invite_uuid)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found"
        )


@invite_router.get("/validate/{invite_uuid}", response_model=dict)
def validate_invite(
    invite_uuid: UUID,
    db: Session = Depends(get_db),
):
    """
    Check if an invitation is valid (exists, not used, not expired)
    """
    repository = InviteRepository(db)
    is_valid = repository.is_valid(invite_uuid)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The invitation is invalid, has expired, or has already been used",
        )

    invite = repository.get_by_uuid(invite_uuid)
    return {"valid": True, "email": invite.email, "expire_date": invite.expire_date}
