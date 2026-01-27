from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .base import Base
from ..config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    """Dependency for FastAPI to provide database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
