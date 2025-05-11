import pytest
from fastapi.testclient import TestClient
from conftest import TEST_USER_DATA


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
