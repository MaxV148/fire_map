import pytest
from datetime import datetime, timedelta
from uuid import UUID
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.domain.invite.model import Invite
from src.domain.user.model import User


@pytest.fixture(scope="function")
def test_invite(db: Session, test_user: User) -> Invite:
    """
    Create a test invite.
    """
    # Set expiration date 7 days from now
    expire_date = datetime.now() + timedelta(days=7)

    invite = Invite(
        email="test@example.com",
        expire_date=expire_date,
        is_used=False,
        created_by_id=test_user.id,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


def test_create_invite(client: TestClient):
    """Test creating a new invite"""
    invite_data = {"email": "newinvite@example.com", "expire_days": 14}

    response = client.post("/v1/invite", json=invite_data)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == invite_data["email"]
    assert "id" in data
    assert "invite_uuid" in data
    assert "expire_date" in data
    assert "created_at" in data
    assert data["is_used"] == False


def test_create_invite_duplicate_email(client: TestClient, test_invite: Invite):
    """Test creating an invite with an email that already has an active invite"""
    invite_data = {"email": test_invite.email, "expire_days": 14}

    response = client.post("/v1/invite", json=invite_data)

    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_list_invites(client: TestClient, test_invite: Invite):
    """Test listing all invites"""
    response = client.get("/v1/invite")

    assert response.status_code == 200
    data = response.json()
    assert "invites" in data
    assert "count" in data
    assert data["count"] >= 1
    assert len(data["invites"]) >= 1
    assert data["invites"][0]["email"] == test_invite.email


def test_get_invite_by_uuid(client: TestClient, test_invite: Invite):
    """Test getting an invite by UUID"""
    response = client.get(f"/v1/invite/{test_invite.invite_uuid}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_invite.id
    assert str(data["invite_uuid"]) == str(test_invite.invite_uuid)
    assert data["email"] == test_invite.email


def test_get_invite_not_found(client: TestClient):
    """Test getting a non-existent invite"""
    # Generate a random UUID that doesn't exist
    random_uuid = "12345678-1234-5678-1234-567812345678"

    response = client.get(f"/v1/invite/{random_uuid}")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_delete_invite(client: TestClient, test_invite: Invite):
    """Test deleting an invite"""
    response = client.delete(f"/v1/invite/{test_invite.invite_uuid}")

    assert response.status_code == 204

    # Verify the invite is deleted
    response = client.get(f"/v1/invite/{test_invite.invite_uuid}")
    assert response.status_code == 404


def test_delete_invite_not_found(client: TestClient):
    """Test deleting a non-existent invite"""
    # Generate a random UUID that doesn't exist
    random_uuid = "12345678-1234-5678-1234-567812345678"

    response = client.delete(f"/v1/invite/{random_uuid}")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_validate_invite_valid(client: TestClient, test_invite: Invite):
    """Test validating a valid invite"""
    response = client.get(f"/v1/invite/validate/{test_invite.invite_uuid}")

    assert response.status_code == 200
    data = response.json()
    assert data["valid"] == True
    assert data["email"] == test_invite.email
    assert "expire_date" in data


def test_validate_invite_expired(client: TestClient, db: Session, test_user: User):
    """Test validating an expired invite"""
    # Create an expired invite
    expire_date = datetime.now() - timedelta(days=1)  # 1 day in the past

    expired_invite = Invite(
        email="expired@example.com",
        expire_date=expire_date,
        is_used=False,
        created_by_id=test_user.id,
    )
    db.add(expired_invite)
    db.commit()
    db.refresh(expired_invite)

    response = client.get(f"/v1/invite/validate/{expired_invite.invite_uuid}")

    assert response.status_code == 400
    assert (
        "invalid" in response.json()["detail"].lower()
        or "expired" in response.json()["detail"].lower()
    )


def test_validate_invite_used(client: TestClient, db: Session, test_user: User):
    """Test validating an invite that has already been used"""
    # Create a used invite
    expire_date = datetime.now() + timedelta(days=7)

    used_invite = Invite(
        email="used@example.com",
        expire_date=expire_date,
        is_used=True,  # This invite has been used
        created_by_id=test_user.id,
    )
    db.add(used_invite)
    db.commit()
    db.refresh(used_invite)

    response = client.get(f"/v1/invite/validate/{used_invite.invite_uuid}")

    assert response.status_code == 400
    assert (
        "invalid" in response.json()["detail"].lower()
        or "used" in response.json()["detail"].lower()
    )


def test_validate_invite_not_found(client: TestClient):
    """Test validating a non-existent invite"""
    # Generate a random UUID that doesn't exist
    random_uuid = "12345678-1234-5678-1234-567812345678"

    response = client.get(f"/v1/invite/validate/{random_uuid}")

    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower()
