import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.domain.vehicletype.model import VehicleType


def test_create_vehicle_type(client: TestClient):
    """Test creating a new vehicle type"""
    vehicle_data = {
        "name": "Fire Truck"
    }
    
    response = client.post("/v1/vehicle", json=vehicle_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == vehicle_data["name"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_all_vehicle_types(client: TestClient, test_vehicle_type: VehicleType):
    """Test getting all vehicle types"""
    response = client.get("/v1/vehicle")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == test_vehicle_type.name


def test_get_vehicle_type_by_id(client: TestClient, test_vehicle_type: VehicleType):
    """Test getting a vehicle type by ID"""
    response = client.get(f"/v1/vehicle/{test_vehicle_type.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_vehicle_type.id
    assert data["name"] == test_vehicle_type.name


def test_get_vehicle_type_by_name(client: TestClient, test_vehicle_type: VehicleType):
    """Test getting a vehicle type by name"""
    response = client.get(f"/v1/vehicle/name/{test_vehicle_type.name}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_vehicle_type.id
    assert data["name"] == test_vehicle_type.name


def test_get_vehicle_type_not_found(client: TestClient):
    """Test getting a non-existent vehicle type"""
    response = client.get("/v1/vehicle/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_get_vehicle_type_by_name_not_found(client: TestClient):
    """Test getting a non-existent vehicle type by name"""
    response = client.get("/v1/vehicle/name/NonExistentVehicle")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_vehicle_type(client: TestClient, test_vehicle_type: VehicleType):
    """Test updating a vehicle type"""
    update_data = {
        "name": "Updated Vehicle"
    }
    
    response = client.put(f"/v1/vehicle/{test_vehicle_type.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_vehicle_type.id
    assert data["name"] == update_data["name"]


def test_update_vehicle_type_not_found(client: TestClient):
    """Test updating a non-existent vehicle type"""
    update_data = {
        "name": "Updated Vehicle"
    }
    
    response = client.put("/v1/vehicle/999", json=update_data)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_delete_vehicle_type(client: TestClient, test_vehicle_type: VehicleType):
    """Test deleting a vehicle type"""
    response = client.delete(f"/v1/vehicle/{test_vehicle_type.id}")
    
    assert response.status_code == 204
    
    # Verify the vehicle type is deleted
    response = client.get(f"/v1/vehicle/{test_vehicle_type.id}")
    assert response.status_code == 404


def test_delete_vehicle_type_not_found(client: TestClient):
    """Test deleting a non-existent vehicle type"""
    response = client.delete("/v1/vehicle/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"] 