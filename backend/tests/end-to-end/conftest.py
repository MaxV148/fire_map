import pytest
from fastapi.testclient import TestClient
# from backend.tests.conftest import (
#     db,
#     client,
#     admin_role,
#     test_user,
#     test_role,
#     test_tag,
#     test_vehicle_type,
#     test_event,
#     test_issue,
# )

# # Import the auth fixtures
# pytest.fixture(scope="function")(db)
# pytest.fixture(scope="function")(client)
# pytest.fixture(scope="function")(admin_role)
# pytest.fixture(scope="function")(test_user)
# pytest.fixture(scope="function")(test_role)
# pytest.fixture(scope="function")(test_tag)
# pytest.fixture(scope="function")(test_vehicle_type)
# pytest.fixture(scope="function")(test_event)
# pytest.fixture(scope="function")(test_issue)

# Die korrekte App-Instanz importieren
from src.server import app
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from src.infrastructure.postgresql.db import Base, get_db
from sqlalchemy import create_engine
from src.conf.model import Settings
from src.domain.role.model import Role
import os

settings = Settings(
    db_user=os.getenv("DB_USER", "root"),
    db_password=os.getenv("DB_PASSWORD", "test123"),
    db_host=os.getenv("DB_HOST", "localhost"),
    db_port=int(os.getenv("DB_PORT", "5432")),
    db_name=os.getenv("DB_NAME", "fire_backend"),
    log_level="INFO",
    secret_key="test_secret_key",
    algorithm="HS256",
    access_token_expire_minutes=30,
)


# Use the settings for database configuration
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}_test"

# Create the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


TEST_USER_DATA = {
    "email": "testuser@example.com",
    "password": "securePassword123!",
    "first_name": "Test",
    "last_name": "User",
}


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test.
    """
    # Drop all tables to ensure a clean state
    Base.metadata.drop_all(bind=engine)

    # Create the database tables
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def create_roles(db: Session) -> Role:
    """
    Erstellt eine admin-Rolle für Tests mit ID=2.
    """
    default_role = Role(id=1, name="user", description="Standard user role")
    db.add(default_role)
    db.commit()

    admin = Role(id=2, name="admin", description="Administrator role")
    db.add(admin)
    db.commit()


@pytest.fixture
def get_test_client(create_roles, db: Session):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    return client


@pytest.fixture()
def get_auth_token(get_test_client: TestClient):
    register_response = get_test_client.post("/v1/user/register", json=TEST_USER_DATA)
    return register_response.json()["access_token"]


@pytest.fixture
def create_tag(get_test_client: TestClient, get_auth_token):
    get_test_client.post(
        "/v1/tag",
        json={"name": "Test-Tag"},
        headers={"Authorization": f"Bearer {get_auth_token}"},
    )
