import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os

from src.infrastructure.postgresql.db import Base, get_db
from src.domain.user.model import User
from src.domain.role.model import Role
from src.domain.event.model import Event
from src.domain.tag.model import Tag
from src.domain.vehicletype.model import VehicleType
from src.domain.issue.model import Issue
from src.domain.user.dependency import get_current_user
from src.server import app
from src.conf.model import Settings

# Initialize settings with default values
settings = Settings(
    db_user=os.getenv("DB_USER", "root"),
    db_password=os.getenv("DB_PASSWORD", "test123"),
    db_host=os.getenv("DB_HOST", "localhost"),
    db_port=int(os.getenv("DB_PORT", "5432")),
    db_name=os.getenv("DB_NAME", "fire_backend"),
    log_level="INFO",
    secret_key="test_secret_key",
    algorithm="HS256",
    access_token_expire_minutes=30
)

# Use the settings for database configuration
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}_test"

# Create the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test.
    """
    # Drop all tables to ensure a clean state
    Base.metadata.drop_all(bind=engine)
    
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for the test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean up after the test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with a mocked database session.
    """
    # Override the get_db dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Mock the current user for authentication
    test_user = User(id=1, username="testuser", password="hashed_password")
    db.add(test_user)
    db.commit()
    
    def override_get_current_user():
        return test_user
    
    # Override dependencies
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Create a test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Reset the dependency overrides
    app.dependency_overrides = {}


@pytest.fixture(scope="function")
def test_user(db: Session) -> User:
    """
    Create a test user.
    """
    user = db.query(User).filter(User.id == 1).first()
    return user


@pytest.fixture(scope="function")
def test_role(db: Session) -> Role:
    """
    Create a test role.
    """
    role = Role(name="Test Role", description="Test role description")
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@pytest.fixture(scope="function")
def test_tag(db: Session) -> Tag:
    """
    Create a test tag.
    """
    tag = Tag(name="Test Tag")
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@pytest.fixture(scope="function")
def test_vehicle_type(db: Session) -> VehicleType:
    """
    Create a test vehicle type.
    """
    vehicle_type = VehicleType(name="Test Vehicle")
    db.add(vehicle_type)
    db.commit()
    db.refresh(vehicle_type)
    return vehicle_type


@pytest.fixture(scope="function")
def test_event(db: Session, test_user: User, test_tag: Tag, test_vehicle_type: VehicleType) -> Event:
    """
    Create a test event.
    """
    from geoalchemy2.functions import ST_GeomFromText
    
    # Create an event with a proper geometry point
    event = Event(
        name="Test Event",
        description="Test event description",
        location=ST_GeomFromText('POINT(10.123 20.456)'),  # Proper PostGIS point
        created_by=test_user.id,
        tag_id=test_tag.id,
        vehicle_id=test_vehicle_type.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@pytest.fixture(scope="function")
def test_issue(db: Session, test_user: User, test_tag: Tag) -> Issue:
    """
    Create a test issue.
    """
    issue = Issue(
        name="Test Issue",
        description="Test issue description",
        created_by_user_id=test_user.id,
        tag_id=test_tag.id
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue 