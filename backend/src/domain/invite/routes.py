from uuid import UUID
from fastapi import Request
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from starlette import status
from fastapi_mail import MessageType

from domain.invite.dto import (
    InviteCreate,
    InviteResponse,
    InviteList,
)
from domain.invite.repository import InviteRepository
from domain.user.repository import UserRepository
from infrastructure.postgresql.db import get_db
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from dependencies.repository_dependencies import get_user_repository, get_invite_repo
from config.config_provider import get_config
from misc.sign import create_signed_invitation_token


mail_config = ConnectionConfig(
    MAIL_USERNAME="user",
    MAIL_PASSWORD="test",
    MAIL_FROM="mail@mail.com",
    MAIL_PORT=1025,
    MAIL_SERVER="localhost",
    MAIL_FROM_NAME="Fire Map",
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
async def create_invite(
    invite_data: InviteCreate,
    request: Request,
    user_repo: UserRepository = Depends(get_user_repository),
    invite_repo: InviteRepository = Depends(get_invite_repo),
    mail_client: FastMail = Depends(get_mail_client),
):
    # Initialize repository
    current_user = user_repo.get_user_by_id(request.state.user_id)

    # Check if there's already a valid invite for this email
    existing_invite = invite_repo.get_by_email(invite_data.email)
    if existing_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active invitation already exists for this email",
        )

    # Create new invite
    invite = invite_repo.create(invite_data, current_user.id)

    # Generate HMAC-secured invite token
    config = get_config()
    invite_token = create_signed_invitation_token(
        str(invite.invite_uuid), config.invite_hmac_secret
    )

    # Generate invite link with secured token
    base_url = str(request.base_url).rstrip("/")
    invite_link = f"{base_url}/register?invitation={invite_token}"

    # Load and customize email template
    with open("./mail_templates/invite.html", "r") as f:
        content = f.read()
        # Replace placeholder with actual invite link
        content = content.replace("{invite_link}", invite_link)

        message = MessageSchema(
            subject="Einladung zur Fire Map Plattform",
            recipients=[invite_data.email],
            body=content,
            subtype=MessageType.html,
        )
        await mail_client.send_message(message)

    return invite


@invite_router.get("", response_model=InviteList)
def list_invites(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
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
