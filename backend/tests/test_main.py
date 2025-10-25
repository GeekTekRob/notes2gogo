import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings

# Test database URL
SQLALCHEMY_DATABASE_URL = settings.test_database_url

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="session")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Notes2GoGo API" in response.json()["message"]


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_user():
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"
    assert response.json()["email"] == "test@example.com"


def test_login_user():
    # First register a user
    user_data = {
        "username": "logintest",
        "email": "login@example.com", 
        "password": "testpassword123"
    }
    client.post("/api/auth/register", json=user_data)
    
    # Then login
    login_data = {
        "username": "logintest",
        "password": "testpassword123"
    }
    response = client.post("/api/auth/login-json", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"