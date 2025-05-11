from fastapi.testclient import TestClient


class TestTag:
    TEST_TAG_NAME = {"name": "TEST_TAG"}

    def test_create_tag(self, get_test_client: TestClient, get_auth_token):
        res = get_test_client.post(
            "/v1/tag",
            json=self.TEST_TAG_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 201
        assert "id" in response

    def test_all_tags(self, get_test_client: TestClient, get_auth_token):
        for i in range(3):
            get_test_client.post(
                "/v1/tag",
                json={"name": f"TEST_TAG {i}"},
                headers={"Authorization": f"Bearer {get_auth_token}"},
            )
        res = get_test_client.get(
            "/v1/tag", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        response = res.json()
        assert res.status_code == 200
        assert len(response) == 3

    def test_get_tag_by_id(self, get_test_client: TestClient, get_auth_token):
        # Erstelle einen Tag für den Test
        create_res = get_test_client.post(
            "/v1/tag",
            json=self.TEST_TAG_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        create_response = create_res.json()
        tag_id = create_response["id"]

        # Rufe den Tag über seine ID ab
        res = get_test_client.get(
            f"/v1/tag/{tag_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 200
        assert response["id"] == tag_id
        assert response["name"] == self.TEST_TAG_NAME["name"]

    def test_get_tag_by_name(self, get_test_client: TestClient, get_auth_token):
        # Erstelle einen Tag für den Test
        get_test_client.post(
            "/v1/tag",
            json=self.TEST_TAG_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )

        # Rufe den Tag über seinen Namen ab
        res = get_test_client.get(
            f"/v1/tag/name/{self.TEST_TAG_NAME['name']}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 200
        assert response["name"] == self.TEST_TAG_NAME["name"]
        assert "id" in response

    def test_update_tag(self, get_test_client: TestClient, get_auth_token):
        # Erstelle einen Tag für den Test
        create_res = get_test_client.post(
            "/v1/tag",
            json=self.TEST_TAG_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        create_response = create_res.json()
        tag_id = create_response["id"]

        # Aktualisiere den Tag
        updated_name = {"name": "UPDATED_TAG_NAME"}
        res = get_test_client.put(
            f"/v1/tag/{tag_id}",
            json=updated_name,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()

        assert res.status_code == 200
        assert response["id"] == tag_id
        assert response["name"] == updated_name["name"]

        # Überprüfe, ob die Änderung wirklich persistiert wurde
        check_res = get_test_client.get(
            f"/v1/tag/{tag_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        check_response = check_res.json()
        assert check_response["name"] == updated_name["name"]

    def test_delete_tag(self, get_test_client: TestClient, get_auth_token):
        # Erstelle einen Tag für den Test
        create_res = get_test_client.post(
            "/v1/tag",
            json=self.TEST_TAG_NAME,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        create_response = create_res.json()
        tag_id = create_response["id"]

        # Lösche den Tag
        res = get_test_client.delete(
            f"/v1/tag/{tag_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )

        assert res.status_code == 204

        # Überprüfe, ob der Tag wirklich gelöscht wurde
        check_res = get_test_client.get(
            f"/v1/tag/{tag_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert check_res.status_code == 404

    def test_tag_not_found(self, get_test_client: TestClient, get_auth_token):
        # Versuche, einen nicht existierenden Tag abzurufen
        non_existent_id = 9999
        res = get_test_client.get(
            f"/v1/tag/{non_existent_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert res.status_code == 404

    def test_update_non_existent_tag(self, get_test_client: TestClient, get_auth_token):
        # Versuche, einen nicht existierenden Tag zu aktualisieren
        non_existent_id = 9999
        updated_name = {"name": "UPDATED_TAG_NAME"}
        res = get_test_client.put(
            f"/v1/tag/{non_existent_id}",
            json=updated_name,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert res.status_code == 404

    def test_delete_non_existent_tag(self, get_test_client: TestClient, get_auth_token):
        # Versuche, einen nicht existierenden Tag zu löschen
        non_existent_id = 9999
        res = get_test_client.delete(
            f"/v1/tag/{non_existent_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert res.status_code == 404
