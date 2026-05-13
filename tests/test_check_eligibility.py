import json
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.base import Base
from backend.app.db.models import User


@pytest.fixture()
def db_session():
    # In-memory SQLite for tests
    engine = create_engine("sqlite:///./test_check_eligibility.db", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed a test user with id=1
    user = User(name="Test User", email="test@example.com", hashed_password="x")
    session.add(user)
    session.commit()
    session.refresh(user)

    yield session

    session.close()


def test_check_eligibility_endpoint(db_session, monkeypatch):
    # Override get_db dependency to use test session
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Fake current user (will be looked up by id in route)
    fake_user = SimpleNamespace(id=1)

    from backend.app.routes.schemes import get_eligible_schemes_endpoint
    from backend.app.utils.auth import get_current_user
    from backend.app.db.database import get_db as real_get_db

    app.dependency_overrides[real_get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: fake_user

    client = TestClient(app)

    payload = {
        "age": 30,
        "income": 300000.0,
        "gender": "male",
        "caste": "general",
        "state": "Maharashtra"
    }

    response = client.post("/api/v1/schemes/check-eligibility", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True
    assert data.get("user_profile") is not None
    assert data["user_profile"]["age"] == 30
    assert isinstance(data.get("recommended_schemes"), list)

    # Clean up overrides
    app.dependency_overrides.pop(real_get_db, None)
    app.dependency_overrides.pop(get_current_user, None)
