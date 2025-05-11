import pytest
from starlette.testclient import TestClient
from datetime import datetime


class TestIssues:
    test_issue = {
        "name": "Test Issue",
        "description": "Test Issue description",
        "tag_ids": [1],
        "location": [10.123, 20.456],
    }

    @pytest.fixture
    def create_issue(self, get_test_client: TestClient, get_auth_token):
        get_test_client.post(
            "/v1/issue",
            json=self.test_issue,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )

    @pytest.fixture(scope="function")
    def test_issue_id(self, get_test_client: TestClient, get_auth_token):
        response = get_test_client.post(
            "/v1/issue",
            json=self.test_issue,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 201
        return response.json()["id"]

    def test_create_issue(self, get_test_client: TestClient, get_auth_token):
        res = get_test_client.post(
            "/v1/issue",
            json=self.test_issue,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        response = res.json()
        assert res.status_code == 201
        assert "id" in response
        assert response["name"] == self.test_issue["name"]
        assert response["description"] == self.test_issue["description"]

        # Ohne Token sollte die Anfrage fehlschlagen
        response = get_test_client.get(
            "/v1/issue",
        )
        assert response.status_code == 401

    def test_get_all_issues(
        self, get_test_client: TestClient, get_auth_token, create_issue
    ):
        response = get_test_client.get(
            "/v1/issue", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_all_issues_filtered(self, get_test_client: TestClient, get_auth_token):
        # Zuerst erstellen wir ein Issue mit dem Standard-Tag
        issue1_response = get_test_client.post(
            "/v1/issue",
            json=self.test_issue,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert issue1_response.status_code == 201
        issue1_created_at = issue1_response.json()["created_at"]

        # Erstellen eines zweiten Tags
        tag2_response = get_test_client.post(
            "/v1/tag",
            json={"name": "Tag-2"},
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert tag2_response.status_code == 201
        tag2_id = tag2_response.json()["id"]

        # Issue mit anderem Tag erstellen
        issue2_data = {
            "name": "Issue mit Tag 2",
            "description": "Dieses Issue hat Tag 2",
            "location": [11.123, 21.456],
            "tag_ids": [tag2_id],
        }

        issue2_response = get_test_client.post(
            "/v1/issue",
            json=issue2_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert issue2_response.status_code == 201
        issue2_created_at = issue2_response.json()["created_at"]

        # Issue mit beiden Tags erstellen
        issue3_data = {
            "name": "Issue mit beiden Tags",
            "description": "Dieses Issue hat beide Tags",
            "location": [12.123, 22.456],
            "tag_ids": [1, tag2_id],
        }

        issue3_response = get_test_client.post(
            "/v1/issue",
            json=issue3_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert issue3_response.status_code == 201
        issue3_created_at = issue3_response.json()["created_at"]

        # Test 1: Alle Issues abrufen (keine Filter)
        response = get_test_client.get(
            "/v1/issue", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 200
        all_issues = response.json()
        assert len(all_issues) >= 3

        # Test 2: Nach Tag 1 filtern
        response = get_test_client.get(
            "/v1/issue?tag_ids=1", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 200
        filtered_issues = response.json()
        for issue in filtered_issues:
            tag_ids = [tag["id"] for tag in issue["tags"]]
            assert 1 in tag_ids

        # Test 3: Nach Tag 2 filtern
        response = get_test_client.get(
            f"/v1/issue?tag_ids={tag2_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_issues = response.json()
        for issue in filtered_issues:
            tag_ids = [tag["id"] for tag in issue["tags"]]
            assert tag2_id in tag_ids

        # Test 4: Nach Start-Datum filtern
        start_date = datetime.fromisoformat(issue2_created_at.replace("Z", "+00:00"))
        response = get_test_client.get(
            f"/v1/issue?start_date={start_date.isoformat()}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_issues = response.json()
        for issue in filtered_issues:
            issue_date = datetime.fromisoformat(
                issue["created_at"].replace("Z", "+00:00")
            )
            assert issue_date >= start_date

        # Test 5: Nach End-Datum filtern
        end_date = datetime.fromisoformat(issue2_created_at.replace("Z", "+00:00"))
        response = get_test_client.get(
            f"/v1/issue?end_date={end_date.isoformat()}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200
        filtered_issues = response.json()
        for issue in filtered_issues:
            issue_date = datetime.fromisoformat(
                issue["created_at"].replace("Z", "+00:00")
            )
            assert issue_date <= end_date

    def test_get_issue_by_id(
        self, get_test_client: TestClient, get_auth_token, test_issue_id
    ):
        response = get_test_client.get(
            f"/v1/issue/{test_issue_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200

        # Überprüfen, ob die Issue-Daten korrekt sind
        issue_data = response.json()
        assert issue_data["name"] == self.test_issue["name"]
        assert issue_data["description"] == self.test_issue["description"]

        # Nicht existierendes Issue
        response = get_test_client.get(
            "/v1/issue/99999", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

        # Ohne Token sollte die Anfrage fehlschlagen
        response = get_test_client.get(f"/v1/issue/{test_issue_id}")
        assert response.status_code == 401

    def test_update_issue(
        self, get_test_client: TestClient, get_auth_token, test_issue_id
    ):
        updated_data = {
            "name": "Aktualisiertes Issue",
            "description": "Dies ist ein aktualisiertes Test-Issue.",
            "location": [13.4050, 52.5200],  # Berlin Koordinaten
        }

        response = get_test_client.put(
            f"/v1/issue/{test_issue_id}",
            json=updated_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 200

        issue_data = response.json()
        assert issue_data["name"] == updated_data["name"]
        assert issue_data["description"] == updated_data["description"]

        # Nicht existierendes Issue
        response = get_test_client.put(
            "/v1/issue/99999",
            json=updated_data,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 404

        # Ohne Token sollte die Anfrage fehlschlagen
        response = get_test_client.put(f"/v1/issue/{test_issue_id}", json=updated_data)
        assert response.status_code == 401

    def test_delete_issue(
        self, get_test_client: TestClient, get_auth_token, test_issue_id
    ):
        response = get_test_client.delete(
            f"/v1/issue/{test_issue_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 204

        # Überprüfen, dass das Issue wirklich gelöscht wurde
        response = get_test_client.get(
            f"/v1/issue/{test_issue_id}",
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        assert response.status_code == 404

        # Nicht existierendes Issue
        response = get_test_client.delete(
            "/v1/issue/99999", headers={"Authorization": f"Bearer {get_auth_token}"}
        )
        assert response.status_code == 404

        # Neues Issue zum Testen erstellen
        create_response = get_test_client.post(
            "/v1/issue",
            json=self.test_issue,
            headers={"Authorization": f"Bearer {get_auth_token}"},
        )
        new_issue_id = create_response.json()["id"]

        # Ohne Token sollte die Anfrage fehlschlagen
        response = get_test_client.delete(f"/v1/issue/{new_issue_id}")
        assert response.status_code == 401
