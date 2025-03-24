import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.domain.event.model import Event
from src.domain.tag.model import Tag
from src.domain.vehicletype.model import VehicleType
from src.domain.user.model import User


def test_create_event(
    client: TestClient, test_tag: Tag, test_vehicle_type: VehicleType
):
    """Test creating a new event"""
    event_data = {
        "name": "Fire Incident",
        "description": "Building fire on Main Street",
        "location": [10.123, 20.456],  # [longitude, latitude]
        "tag_id": test_tag.id,
        "vehicle_id": test_vehicle_type.id,
    }

    response = client.post("/v1/event", json=event_data)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == event_data["name"]
    assert data["description"] == event_data["description"]
    assert data["tag_id"] == event_data["tag_id"]
    assert data["vehicle_id"] == event_data["vehicle_id"]
    # Location should be returned as [lon, lat]
    if "location" in data and data["location"]:
        assert len(data["location"]) == 2
        assert isinstance(data["location"][0], float)
        assert isinstance(data["location"][1], float)
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_all_events(client: TestClient, test_event: Event):
    """Test getting all events"""
    response = client.get("/v1/event")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name
    assert data[0]["description"] == test_event.description


def test_get_event_by_id(client: TestClient, test_event: Event):
    """Test getting an event by ID"""
    response = client.get(f"/v1/event/{test_event.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_event.id
    assert data["name"] == test_event.name
    assert data["description"] == test_event.description


def test_get_events_by_user(client: TestClient, test_event: Event, test_user: User):
    """Test getting events by user"""
    response = client.get(f"/v1/event/user/{test_user.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name


def test_get_events_by_tag(client: TestClient, test_event: Event, test_tag: Tag):
    """Test getting events by tag"""
    response = client.get(f"/v1/event/tag/{test_tag.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name


def test_get_events_by_vehicle(
    client: TestClient, test_event: Event, test_vehicle_type: VehicleType
):
    """Test getting events by vehicle type"""
    response = client.get(f"/v1/event/vehicle/{test_vehicle_type.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name


def test_get_event_not_found(client: TestClient):
    """Test getting a non-existent event"""
    response = client.get("/v1/event/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_event(client: TestClient, test_event: Event, test_tag: Tag):
    """Test updating an event"""
    update_data = {
        "name": "Updated Event",
        "description": "Updated description",
        "tag_id": test_tag.id,
        "location": [11.123, 21.456],  # [longitude, latitude]
    }

    response = client.put(f"/v1/event/{test_event.id}", json=update_data)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_event.id
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert data["tag_id"] == update_data["tag_id"]
    # Location should be updated
    if "location" in data and data["location"]:
        assert len(data["location"]) == 2
        assert abs(data["location"][0] - update_data["location"][0]) < 0.001
        assert abs(data["location"][1] - update_data["location"][1]) < 0.001


def test_update_event_not_found(client: TestClient):
    """Test updating a non-existent event"""
    update_data = {"name": "Updated Event", "description": "Updated description"}

    response = client.put("/v1/event/999", json=update_data)

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_delete_event(client: TestClient, test_event: Event):
    """Test deleting an event"""
    response = client.delete(f"/v1/event/{test_event.id}")

    assert response.status_code == 204

    # Verify the event is deleted
    response = client.get(f"/v1/event/{test_event.id}")
    assert response.status_code == 404


def test_delete_event_not_found(client: TestClient):
    """Test deleting a non-existent event"""
    response = client.delete("/v1/event/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
