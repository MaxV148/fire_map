import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.domain.role.model import Role


def test_create_role(client: TestClient):
    """Test creating a new role"""
    role_data = {"name": "Admin", "description": "Administrator role"}

    response = client.post("/v1/role", json=role_data)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == role_data["name"]
    assert data["description"] == role_data["description"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_all_roles(client: TestClient, test_role: Role):
    """Test getting all roles"""
    response = client.get("/v1/role")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2  # Should have at least admin and test role

    # Find the test role in the list
    test_role_data = next(role for role in data if role["name"] == test_role.name)
    assert test_role_data["name"] == test_role.name
    assert test_role_data["description"] == test_role.description


def test_get_role_by_id(client: TestClient, test_role: Role):
    """Test getting a role by ID"""
    response = client.get(f"/v1/role/{test_role.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_role.id
    assert data["name"] == test_role.name
    assert data["description"] == test_role.description


def test_get_role_not_found(client: TestClient):
    """Test getting a non-existent role"""
    response = client.get("/v1/role/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_role(client: TestClient, test_role: Role):
    """Test updating a role"""
    update_data = {"name": "Updated Role", "description": "Updated description"}

    response = client.put(f"/v1/role/{test_role.id}", json=update_data)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_role.id
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]


def test_update_role_not_found(client: TestClient):
    """Test updating a non-existent role"""
    update_data = {"name": "Updated Role", "description": "Updated description"}

    response = client.put("/v1/role/999", json=update_data)

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_delete_role(client: TestClient, test_role: Role):
    """Test deleting a role"""
    response = client.delete(f"/v1/role/{test_role.id}")

    assert response.status_code == 204

    # Verify the role is deleted
    response = client.get(f"/v1/role/{test_role.id}")
    assert response.status_code == 404


def test_delete_role_not_found(client: TestClient):
    """Test deleting a non-existent role"""
    response = client.delete("/v1/role/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
