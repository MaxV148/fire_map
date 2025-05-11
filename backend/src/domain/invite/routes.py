from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from starlette import status
from fastapi_mail import FastMail, MessageSchema, MessageType
from pydantic import EmailStr

from src.domain.invite.dto import (
    InviteCreate,
    InviteResponse,
    InviteList,
    TestEmailRequest,
)
from src.domain.invite.repository import InviteRepository
from src.domain.user.model import User
from src.domain.user.dependency import get_current_user
from src.infrastructure.postgresql.db import get_db
from fastapi_mail import ConnectionConfig, FastMail


mail_config = ConnectionConfig(
    MAIL_USERNAME="user",
    MAIL_PASSWORD="test",
    MAIL_FROM="mail@mail.com",
    MAIL_PORT=1025,
    MAIL_SERVER="localhost",
    MAIL_FROM_NAME="Deine App",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=False,
    VALIDATE_CERTS=False,
)

fm = FastMail(mail_config)


invite_router = APIRouter(prefix="/invite")


def get_mail_client() -> FastMail:
    """
    Dependency to inject FastMail client
    """
    return fm


@invite_router.post(
    "", response_model=InviteResponse, status_code=status.HTTP_201_CREATED
)
def create_invite(
    invite_data: InviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mail_client: FastMail = Depends(get_mail_client),
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
    mail_client: FastMail = Depends(get_mail_client),
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
    mail_client: FastMail = Depends(get_mail_client),
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
    mail_client: FastMail = Depends(get_mail_client),
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
    mail_client: FastMail = Depends(get_mail_client),
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


@invite_router.post("/test-email", response_model=dict)
async def send_test_email(
    email_data: TestEmailRequest,
    background_tasks: BackgroundTasks,
    mail_client: FastMail = Depends(get_mail_client),
):
    """
    Sendet eine Test-E-Mail an die angegebene Adresse
    """
    # Message erstellen
    message = MessageSchema(
        subject=email_data.subject,
        recipients=[email_data.email],
        body=email_data.body,
        subtype=MessageType.plain,
    )

    # E-Mail im Hintergrund senden
    background_tasks.add_task(mail_client.send_message, message)

    return {
        "status": "success",
        "message": f"Test-E-Mail wird an {email_data.email} gesendet",
        "details": {"subject": email_data.subject, "body": email_data.body},
    }
