import pytest
import jwt
from fastapi.testclient import TestClient
from conftest import TEST_USER_DATA, settings


class TestUser:
    def test_me(self, get_auth_token, get_test_client: TestClient):
        response = get_test_client.get(
            "/v1/user/me", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == TEST_USER_DATA["email"]

        user_data = response.json()
        assert user_data["first_name"] == TEST_USER_DATA["first_name"]
        assert user_data["last_name"] == TEST_USER_DATA["last_name"]

    def test_jwt_payload(self, get_auth_token):
        # Token dekodieren
        payload = jwt.decode(
            get_auth_token, 
            options={"verify_signature": False}
        )
        
        # Prüfen, ob die benötigten Felder vorhanden sind
        assert "sub" in payload

        # Prüfen der Werte
        assert payload["sub"] == "1"
