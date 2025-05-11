from fastapi.testclient import TestClient
import pytest
from loguru import logger
from datetime import datetime


class TestEvent:
    test_event_data = {
        "name": "Test Event",
        "description": "Dies ist ein Test-Event",
        "location": [8.6821, 50.1109],  # Frankfurt Koordinaten
        "tag_ids": [1],  # Annahme: Tag mit ID 1 existiert
        "vehicle_ids": [1],  # Annahme: Fahrzeugtyp mit ID 1 existiert
    }

    @pytest.fixture
    def create_event(self, get_test_client: TestClient, get_auth_token):
        get_test_client.post(
            "/v1/event",
            json=self.test_event_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )

    @pytest.fixture
    def create_vehicle_type(self, get_test_client: TestClient, get_auth_token):
        get_test_client.post(
            "/v1/vehicle",
            json={"name": "Test-Fahrzeug"},
        )

    @pytest.fixture(scope="function")
    def test_event_id(self, get_test_client: TestClient, get_auth_token):
        """Erstellt ein Test-Event und gibt dessen ID zurück."""
        response = get_test_client.post(
            "/v1/event",
            json=self.test_event_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 201
        return response.json()["id"]

    @pytest.fixture(scope="function")
    def user_with_event(self, test_auth_client: TestClient):
        """Erstellt einen Benutzer mit einem eigenen Event und gibt Token und Event-ID zurück."""
        # Benutzer registrieren
        user_data = {
            "first_name": "max",
            "last_name": "last_name",
            "email": f"user_with_event_{pytest.custom_counter if hasattr(pytest, 'custom_counter') else 0}@example.com",
            "password": "Password123!",
        }
        if hasattr(pytest, "custom_counter"):
            pytest.custom_counter += 1
        else:
            pytest.custom_counter = 1

        register_response = test_auth_client.post("/v1/user/register", json=user_data)
        assert register_response.status_code == 200

        # Benutzer anmelden
        login_response = test_auth_client.post(
            "/v1/user/login",
            json={"email": user_data["email"], "password": user_data["password"]},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        event_data = {
            "name": f"Benutzer-Event {user_data['first_name']}",
            "description": "Dies ist ein Event für einen spezifischen Benutzer",
            "location": [-73.9654, 40.7829],
            "tag_ids": [1],
            "vehicle_ids": [1],
        }

        event_response = test_auth_client.post(
            "/v1/event",
            json=event_data,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert event_response.status_code == 201
        event_id = event_response.json()["id"]

        return {"token": token, "event_id": event_id, "event_name": event_data["name"]}

    def test_create_event(self, get_test_client: TestClient, get_auth_token):
        response = get_test_client.post(
            "/v1/event",
            json=self.test_event_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 201

        # Überprüfen, ob die Event-Daten korrekt sind
        event_data = response.json()
        assert event_data["name"] == self.test_event_data["name"]
        assert event_data["description"] == self.test_event_data["description"]

        # Ohne Token sollte die Anfrage fehlschlagen
        response = get_test_client.post("/v1/event", json=self.test_event_data)
        assert response.status_code == 401

    def test_get_all_events(
        self, get_test_client: TestClient, get_auth_token, create_event
    ):
        response = get_test_client.get(
            "/v1/event", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        logger.info(response.json())
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_all_events_filtered(self, get_test_client: TestClient, get_auth_token):
        # Zuerst erstellen wir mehrere Events mit unterschiedlichen Eigenschaften
        # Event 1 (standard aus fixture)

        # Event 2 mit einem anderen Tag
        tag2_response = get_test_client.post(
            "/v1/tag",
            json={"name": "Tag-2"},
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert tag2_response.status_code == 201
        tag2_id = tag2_response.json()["id"]

        # Event 3 mit einem anderen Fahrzeugtyp
        vehicle2_response = get_test_client.post(
            "/v1/vehicle",
            json={"name": "Fahrzeug-2"},
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert vehicle2_response.status_code == 201
        vehicle2_id = vehicle2_response.json()["id"]

        # Zweites Event erstellen
        event2_data = {
            "name": "Event mit Tag 2",
            "description": "Dieses Event hat Tag 2",
            "location": [10.0, 50.0],
            "tag_ids": [tag2_id],
            "vehicle_ids": [vehicle2_id],
        }

        event2_response = get_test_client.post(
            "/v1/event",
            json=event2_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert event2_response.status_code == 201
        event2_created_at = event2_response.json()["created_at"]

        # Drittes Event erstellen
        event3_data = {
            "name": "Event mit Fahrzeug 2",
            "description": "Dieses Event hat Fahrzeug 2",
            "location": [11.0, 51.0],
            "tag_ids": [1],
            "vehicle_ids": [vehicle2_id],
        }

        event3_response = get_test_client.post(
            "/v1/event",
            json=event3_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert event3_response.status_code == 201
        event3_created_at = event3_response.json()["created_at"]

        # Test 1: Alle Events abrufen (keine Filter)
        response = get_test_client.get(
            "/v1/event", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        all_events = response.json()
        assert len(all_events) >= 2

        # Test 2: Nach Tag 1 filtern
        response = get_test_client.get(
            "/v1/event?tag_ids=1", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 200
        filtered_events = response.json()
        assert all(
            1 in [tag["id"] for tag in event["tags"]] for event in filtered_events
        )

        # Test 3: Nach Tag 2 filtern
        response = get_test_client.get(
            f"/v1/event?tag_ids={tag2_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_events = response.json()
        assert all(
            tag2_id in [tag["id"] for tag in event["tags"]] for event in filtered_events
        )

        # Test 4: Nach Fahrzeugtyp 2 filtern
        response = get_test_client.get(
            f"/v1/event?vehicle_ids={vehicle2_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_events = response.json()
        assert all(
            vehicle2_id in [vehicle["id"] for vehicle in event["vehicles"]]
            for event in filtered_events
        )

        # Test 5: Nach mehreren Fahrzeugtypen filtern
        response = get_test_client.get(
            f"/v1/event?vehicle_ids=1&vehicle_ids={vehicle2_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_events = response.json()
        assert len(filtered_events) >= 2  # Sollte alle Events enthalten

        # Test 6: Nach Tag und Fahrzeugtyp gleichzeitig filtern
        response = get_test_client.get(
            f"/v1/event?tag_ids=1&vehicle_ids={vehicle2_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_events = response.json()
        # Überprüfen, dass nur das Event mit Tag 1 und Fahrzeugtyp 2 zurückgegeben wird
        assert all(
            1 in [tag["id"] for tag in event["tags"]]
            and vehicle2_id in [vehicle["id"] for vehicle in event["vehicles"]]
            for event in filtered_events
        )

        # Test 7: Nach Startdatum filtern (Events nach einem bestimmten Datum)
        # Wir verwenden event2_created_at als Referenzpunkt
        start_date = datetime.fromisoformat(event2_created_at.replace("Z", "+00:00"))

        response = get_test_client.get(
            f"/v1/event?start_date={start_date.isoformat()}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_events = response.json()
        # Überprüfen, dass nur Events nach dem start_date enthalten sind
        for event in filtered_events:
            event_date = datetime.fromisoformat(
                event["created_at"].replace("Z", "+00:00")
            )
            assert event_date >= start_date

        # Test 8: Nach Enddatum filtern (Events vor einem bestimmten Datum)
        end_date = datetime.fromisoformat(event3_created_at.replace("Z", "+00:00"))

        response = get_test_client.get(
            f"/v1/event?end_date={end_date.isoformat()}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_events = response.json()
        # Überprüfen, dass nur Events vor dem end_date enthalten sind
        for event in filtered_events:
            event_date = datetime.fromisoformat(
                event["created_at"].replace("Z", "+00:00")
            )
            assert event_date <= end_date

        # Test 9: Nach Zeitraum filtern (Start- und Enddatum)
        response = get_test_client.get(
            f"/v1/event?start_date={start_date.isoformat()}&end_date={end_date.isoformat()}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_events = response.json()
        # Überprüfen, dass nur Events im Zeitraum enthalten sind
        for event in filtered_events:
            event_date = datetime.fromisoformat(
                event["created_at"].replace("Z", "+00:00")
            )
            assert start_date <= event_date <= end_date

    def test_get_event_by_id(
        self, get_test_client: TestClient, get_auth_token, create_event
    ):
        response = get_test_client.get(
            f"/v1/event/{1}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200

        # Überprüfen, ob die Event-Daten korrekt sind
        event_data = response.json()
        assert event_data["name"] == self.test_event_data["name"]
        assert event_data["description"] == self.test_event_data["description"]

        # Nicht existierendes Event
        response = get_test_client.get(
            "/v1/event/99999", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

        response = get_test_client.get(f"/v1/event/{1}")
        assert response.status_code == 401

    def test_update_event(
        self, get_test_client: TestClient, get_auth_token, create_event
    ):
        updated_data = {
            "name": "Aktualisiertes Event",
            "description": "Dies ist ein aktualisiertes Test-Event.",
            "location": [13.4050, 52.5200],  # Berlin Koordinaten
        }

        response = get_test_client.put(
            f"/v1/event/{1}",
            json=updated_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200

        event_data = response.json()
        assert event_data["name"] == updated_data["name"]
        assert event_data["description"] == updated_data["description"]

        response = get_test_client.put(
            "/v1/event/99999",
            json=updated_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 404

        response = get_test_client.put(f"/v1/event/{1}", json=updated_data)
        assert response.status_code == 401

    def test_delete_event(
        self, get_test_client: TestClient, get_auth_token, create_event
    ):
        response = get_test_client.delete(
            f"/v1/event/{1}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 204

        response = get_test_client.get(
            f"/v1/event/{1}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 404

        response = get_test_client.delete(
            "/v1/event/99999", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 404

        create_response = get_test_client.post(
            "/v1/event",
            json=self.test_event_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        new_event_id = create_response.json()["id"]

        response = get_test_client.delete(f"/v1/event/{new_event_id}")
        assert response.status_code == 401
