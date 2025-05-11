from fastapi.testclient import TestClient


class TestVehicleType:
    TEST_VEHICLE_TYPE_NAME = {"name": "TEST_VEHICLE_TYPE"}

    def test_create_vehicle_type(self, get_test_client: TestClient, get_auth_token):
        res = get_test_client.post(
            "/v1/vehicle",
            json=self.TEST_VEHICLE_TYPE_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 201
        assert "id" in response

    def test_all_vehicle_types(self, get_test_client: TestClient, get_auth_token):
        for i in range(3):
            get_test_client.post(
                "/v1/vehicle",
                json={"name": f"TEST_VEHICLE_TYPE {i}"},
                headers={"Authorization": f"Bearer {get_auth_token}"},
            )
        res = get_test_client.get(
            "/v1/vehicle", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        response = res.json()
        assert res.status_code == 200
        assert len(response) == 3

    def test_get_vehicle_type_by_id(self, get_test_client: TestClient, get_auth_token):
        create_res = get_test_client.post(
            "/v1/vehicle",
            json=self.TEST_VEHICLE_TYPE_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        create_response = create_res.json()
        vehicle_type_id = create_response["id"]

        res = get_test_client.get(
            f"/v1/vehicle/{vehicle_type_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 200
        assert response["id"] == vehicle_type_id
        assert response["name"] == self.TEST_VEHICLE_TYPE_NAME["name"]

    def test_get_vehicle_type_by_name(
        self, get_test_client: TestClient, get_auth_token
    ):
        # Erstelle einen Fahrzeugtyp für den Test
        get_test_client.post(
            "/v1/vehicle",
            json=self.TEST_VEHICLE_TYPE_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )

        # Rufe den Fahrzeugtyp über seinen Namen ab
        res = get_test_client.get(
            f"/v1/vehicle/name/{self.TEST_VEHICLE_TYPE_NAME['name']}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 200
        assert response["name"] == self.TEST_VEHICLE_TYPE_NAME["name"]
        assert "id" in response

    def test_update_vehicle_type(self, get_test_client: TestClient, get_auth_token):
        create_res = get_test_client.post(
            "/v1/vehicle",
            json=self.TEST_VEHICLE_TYPE_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        create_response = create_res.json()
        vehicle_type_id = create_response["id"]

        updated_name = {"name": "UPDATED_VEHICLE_TYPE_NAME"}
        res = get_test_client.put(
            f"/v1/vehicle/{vehicle_type_id}",
            json=updated_name,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 200
        assert response["id"] == vehicle_type_id
        assert response["name"] == updated_name["name"]

        check_res = get_test_client.get(
            f"/v1/vehicle/{vehicle_type_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        check_response = check_res.json()
        assert check_response["name"] == updated_name["name"]

    def test_delete_vehicle_type(self, get_test_client: TestClient, get_auth_token):
        create_res = get_test_client.post(
            "/v1/vehicle",
            json=self.TEST_VEHICLE_TYPE_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        create_response = create_res.json()
        vehicle_type_id = create_response["id"]

        res = get_test_client.delete(
            f"/v1/vehicle/{vehicle_type_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )

        assert res.status_code == 204

        check_res = get_test_client.get(
            f"/v1/vehicle/{vehicle_type_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert check_res.status_code == 404

    def test_vehicle_type_not_found(self, get_test_client: TestClient, get_auth_token):
        non_existent_id = 9999
        res = get_test_client.get(
            f"/v1/vehicle/{non_existent_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert res.status_code == 404

    def test_update_non_existent_vehicle_type(
        self, get_test_client: TestClient, get_auth_token
    ):
        non_existent_id = 9999
        updated_name = {"name": "UPDATED_VEHICLE_TYPE_NAME"}
        res = get_test_client.put(
            f"/v1/vehicle/{non_existent_id}",
            json=updated_name,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert res.status_code == 404

    def test_delete_non_existent_vehicle_type(
        self, get_test_client: TestClient, get_auth_token
    ):
        non_existent_id = 9999
        res = get_test_client.delete(
            f"/v1/vehicle/{non_existent_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert res.status_code == 404
