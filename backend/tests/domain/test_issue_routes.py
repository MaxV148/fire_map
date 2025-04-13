import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.domain.issue.model import Issue
from src.domain.tag.model import Tag
from src.domain.user.model import User


def test_create_issue(client: TestClient, test_tag: Tag):
    """Test creating a new issue"""
    issue_data = {
        "name": "Equipment Malfunction",
        "description": "Fire truck pump not working properly",
        "tag_ids": [test_tag.id],
        "location": [10.123, 20.456],  # [longitude, latitude]
    }

    response = client.post("/v1/issue", json=issue_data)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == issue_data["name"]
    assert data["description"] == issue_data["description"]
    assert len(data["tags"]) == 1
    assert data["tags"][0]["id"] == test_tag.id
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    assert data["location"] == issue_data["location"]


def test_get_all_issues(client: TestClient, test_issue: Issue):
    """Test getting all issues"""
    response = client.get("/v1/issue")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_issue.name
    assert data[0]["description"] == test_issue.description
    assert len(data[0]["tags"]) >= 1
    if test_issue.location is not None:
        assert isinstance(data[0]["location"], list)
        assert len(data[0]["location"]) == 2


def test_get_issue_by_id(client: TestClient, test_issue: Issue):
    """Test getting an issue by ID"""
    response = client.get(f"/v1/issue/{test_issue.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_issue.id
    assert data["name"] == test_issue.name
    assert data["description"] == test_issue.description
    assert len(data["tags"]) >= 1
    if test_issue.location is not None:
        assert isinstance(data["location"], list)
        assert len(data["location"]) == 2


def test_get_issues_by_user(client: TestClient, test_issue: Issue, test_user: User):
    """Test getting issues by user"""
    response = client.get(f"/v1/issue/user/{test_user.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_issue.name
    assert len(data[0]["tags"]) >= 1
    if test_issue.location is not None:
        assert isinstance(data[0]["location"], list)
        assert len(data[0]["location"]) == 2


def test_get_issues_by_tag(client: TestClient, test_issue: Issue, test_tag: Tag):
    """Test getting issues by tag"""
    response = client.get(f"/v1/issue/tag/{test_tag.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_issue.name
    assert any(tag["id"] == test_tag.id for tag in data[0]["tags"])
    if test_issue.location is not None:
        assert isinstance(data[0]["location"], list)
        assert len(data[0]["location"]) == 2


def test_get_issue_not_found(client: TestClient):
    """Test getting a non-existent issue"""
    response = client.get("/v1/issue/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_issue(client: TestClient, test_issue: Issue, test_tag: Tag):
    """Test updating an issue"""
    update_data = {
        "name": "Updated Issue",
        "description": "Updated description",
        "tag_ids": [test_tag.id],
        "location": [11.123, 21.456],  # [longitude, latitude]
    }

    response = client.put(f"/v1/issue/{test_issue.id}", json=update_data)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_issue.id
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert len(data["tags"]) == 1
    assert data["tags"][0]["id"] == test_tag.id
    assert data["location"] == update_data["location"]


def test_update_issue_not_found(client: TestClient):
    """Test updating a non-existent issue"""
    update_data = {
        "name": "Updated Issue",
        "description": "Updated description",
        "tag_ids": [],
        "location": None,
    }

    response = client.put("/v1/issue/999", json=update_data)

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_delete_issue(client: TestClient, test_issue: Issue):
    """Test deleting an issue"""
    response = client.delete(f"/v1/issue/{test_issue.id}")

    assert response.status_code == 204

    # Verify the issue is deleted
    response = client.get(f"/v1/issue/{test_issue.id}")
    assert response.status_code == 404


def test_delete_issue_not_found(client: TestClient):
    """Test deleting a non-existent issue"""
    response = client.delete("/v1/issue/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
