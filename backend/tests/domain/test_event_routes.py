import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

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
        "tag_ids": [test_tag.id],  # Changed from tag_id to tag_ids as list
        "vehicle_ids": [
            test_vehicle_type.id
        ],  # Changed from vehicle_id to vehicle_ids as list
    }

    response = client.post("/v1/event", json=event_data)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == event_data["name"]
    assert data["description"] == event_data["description"]
    assert data["tags"][0]["id"] == test_tag.id  # Check first tag in tags list
    assert (
        data["vehicles"][0]["id"] == test_vehicle_type.id
    )  # Check first vehicle in vehicles list
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
    assert len(data[0]["tags"]) > 0  # Should have at least one tag


def test_filter_events_by_tag(client: TestClient, test_event: Event, test_tag: Tag):
    """Test filtering events by tag_ids"""
    response = client.get(f"/v1/event?tag_ids={test_tag.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name
    assert any(tag["id"] == test_tag.id for tag in data[0]["tags"])


def test_filter_events_by_vehicle(
    client: TestClient, test_event: Event, test_vehicle_type: VehicleType
):
    """Test filtering events by vehicle_ids"""
    response = client.get(f"/v1/event?vehicle_ids={test_vehicle_type.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name
    assert any(vehicle["id"] == test_vehicle_type.id for vehicle in data[0]["vehicles"])


def test_filter_events_by_date_range(
    client: TestClient, test_event: Event, db: Session
):
    """Test filtering events by date range"""
    # Set the created_at date to a known value for testing
    now = datetime.now()
    yesterday = now - timedelta(days=1)
    tomorrow = now + timedelta(days=1)

    # Update test_event's created_at to now
    test_event.created_at = now
    db.commit()

    # Test filter with valid date range (should include the event)
    response = client.get(
        f"/v1/event?start_date={yesterday.isoformat()}&end_date={tomorrow.isoformat()}"
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name

    # Test filter with date range before the event (should be empty)
    two_days_ago = yesterday - timedelta(days=1)
    response = client.get(
        f"/v1/event?start_date={two_days_ago.isoformat()}&end_date={yesterday.isoformat()}"
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_filter_events_combined(
    client: TestClient,
    test_event: Event,
    test_tag: Tag,
    test_vehicle_type: VehicleType,
    db: Session,
):
    """Test filtering events with combined filters"""
    # Set the created_at date to a known value for testing
    now = datetime.now()
    yesterday = now - timedelta(days=1)
    tomorrow = now + timedelta(days=1)

    # Update test_event's created_at to now
    test_event.created_at = now
    db.commit()

    # Test with all filters combined
    response = client.get(
        f"/v1/event?tag_ids={test_tag.id}&vehicle_ids={test_vehicle_type.id}&start_date={yesterday.isoformat()}&end_date={tomorrow.isoformat()}"
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name
    assert any(tag["id"] == test_tag.id for tag in data[0]["tags"])
    assert any(vehicle["id"] == test_vehicle_type.id for vehicle in data[0]["vehicles"])


def test_filter_events_no_match(client: TestClient, test_event: Event, db: Session):
    """Test filtering events with no matching results"""
    # Create a non-existent tag ID
    non_existent_tag_id = 9999

    # Test filter with non-existent tag
    response = client.get(f"/v1/event?tag_ids={non_existent_tag_id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_events_by_user(client: TestClient, test_event: Event, test_user: User):
    """Test getting events by user"""
    response = client.get(f"/v1/event/user/{test_user.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name
    assert len(data[0]["tags"]) > 0  # Should have at least one tag


def test_get_events_by_tag(client: TestClient, test_event: Event, test_tag: Tag):
    """Test getting events by tag"""
    response = client.get(f"/v1/event/tag/{test_tag.id}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_event.name
    assert any(tag["id"] == test_tag.id for tag in data[0]["tags"])


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
    assert len(data[0]["tags"]) > 0  # Should have at least one tag
    assert any(
        vehicle["id"] == test_vehicle_type.id for vehicle in data[0]["vehicles"]
    )  # Check vehicle in response


def test_get_event(client: TestClient, test_event: Event):
    """Test getting an event by ID"""
    response = client.get(f"/v1/event/{test_event.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_event.id
    assert data["name"] == test_event.name
    assert data["description"] == test_event.description
    assert len(data["tags"]) > 0  # Should have at least one tag


def test_get_event_not_found(client: TestClient):
    """Test getting a non-existent event"""
    response = client.get("/v1/event/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_event(
    client: TestClient, test_event: Event, test_tag: Tag, test_vehicle_type: VehicleType
):
    """Test updating an event"""
    update_data = {
        "name": "Updated Event",
        "description": "Updated description",
        "tag_ids": [test_tag.id],
        "vehicle_ids": [test_vehicle_type.id],
        "location": [11.123, 21.456],  # [longitude, latitude]
    }

    response = client.put(f"/v1/event/{test_event.id}", json=update_data)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_event.id
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert data["tags"][0]["id"] == test_tag.id
    assert data["vehicles"][0]["id"] == test_vehicle_type.id
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
