import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.domain.tag.model import Tag


def test_create_tag(client: TestClient):
    """Test creating a new tag"""
    tag_data = {
        "name": "Emergency"
    }
    
    response = client.post("/v1/tag", json=tag_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == tag_data["name"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_all_tags(client: TestClient, test_tag: Tag):
    """Test getting all tags"""
    response = client.get("/v1/tag")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_tag.name


def test_get_tag_by_id(client: TestClient, test_tag: Tag):
    """Test getting a tag by ID"""
    response = client.get(f"/v1/tag/{test_tag.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_tag.id
    assert data["name"] == test_tag.name


def test_get_tag_by_name(client: TestClient, test_tag: Tag):
    """Test getting a tag by name"""
    response = client.get(f"/v1/tag/name/{test_tag.name}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_tag.id
    assert data["name"] == test_tag.name


def test_get_tag_not_found(client: TestClient):
    """Test getting a non-existent tag"""
    response = client.get("/v1/tag/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_get_tag_by_name_not_found(client: TestClient):
    """Test getting a non-existent tag by name"""
    response = client.get("/v1/tag/name/NonExistentTag")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_tag(client: TestClient, test_tag: Tag):
    """Test updating a tag"""
    update_data = {
        "name": "Updated Tag"
    }
    
    response = client.put(f"/v1/tag/{test_tag.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_tag.id
    assert data["name"] == update_data["name"]


def test_update_tag_not_found(client: TestClient):
    """Test updating a non-existent tag"""
    update_data = {
        "name": "Updated Tag"
    }
    
    response = client.put("/v1/tag/999", json=update_data)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_delete_tag(client: TestClient, test_tag: Tag):
    """Test deleting a tag"""
    response = client.delete(f"/v1/tag/{test_tag.id}")
    
    assert response.status_code == 204
    
    # Verify the tag is deleted
    response = client.get(f"/v1/tag/{test_tag.id}")
    assert response.status_code == 404


def test_delete_tag_not_found(client: TestClient):
    """Test deleting a non-existent tag"""
    response = client.delete("/v1/tag/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"] 