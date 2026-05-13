"""Integration test for eligibility history feature"""
import os
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///./test_eligibility_history.db")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
import app.db.base_imports  # Register all models
from app.db.models import User, EligibilityHistory
from app.schemas.eligibility import EligibilityRequest
from app.services.eligibility_history import (
    save_eligibility_check,
    get_user_eligibility_history,
    get_eligibility_history_summary
)


def test_eligibility_history_flow():
    """Test the complete eligibility history flow"""
    
    # Create test database
    DATABASE_URL = "sqlite:///./test_eligibility_history.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Drop and recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    db = SessionLocal()
    
    try:
        # Create a test user
        test_user = User(
            name="Test User",
            email="test@example.com",
            hashed_password="hashed_pwd_123"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print(f"✅ Created test user: {test_user.name} (ID: {test_user.id})")
        
        # Simulate eligibility checks
        check1 = EligibilityRequest(age=25, income=30000, gender="male")
        check2 = EligibilityRequest(age=30, income=50000, gender="male")
        check3 = EligibilityRequest(age=22, income=20000, gender="female")
        
        # Save first check
        history1 = save_eligibility_check(db, test_user.id, check1, eligible_count=5)
        print(f"✅ Saved eligibility check 1: {history1.id} with {history1.eligible_count} eligible schemes")
        
        # Save second check
        history2 = save_eligibility_check(db, test_user.id, check2, eligible_count=3)
        print(f"✅ Saved eligibility check 2: {history2.id} with {history2.eligible_count} eligible schemes")
        
        # Save third check
        history3 = save_eligibility_check(db, test_user.id, check3, eligible_count=8)
        print(f"✅ Saved eligibility check 3: {history3.id} with {history3.eligible_count} eligible schemes")
        
        # Retrieve user's history
        history = get_user_eligibility_history(db, test_user.id)
        print(f"✅ Retrieved {len(history)} eligibility checks for user {test_user.id}")
        
        for idx, record in enumerate(history, 1):
            print(f"   Check {idx}: Age={record.age}, Income={record.income}, "
                  f"Eligible={record.eligible_count}")
        
        # Get summary
        summary = get_eligibility_history_summary(db, test_user.id)
        print(f"✅ Eligibility History Summary:")
        print(f"   Total checks: {summary['total_checks']}")
        print(f"   Last check date: {summary['last_check_date']}")
        print(f"   Average eligible schemes: {summary['average_eligible_schemes']}")
        
        # Verify data integrity
        assert len(history) == 3, "Should have 3 history records"
        assert summary['total_checks'] == 3, "Summary should show 3 checks"
        assert abs(summary['average_eligible_schemes'] - (5 + 3 + 8) / 3) < 0.01, "Average should be correct"
        
        print("\n✅ All integration tests passed!")
        
    finally:
        db.close()
        # Cleanup test database
        import os
        import time
        time.sleep(0.5)  # Give DB time to close
        if os.path.exists("test_eligibility_history.db"):
            try:
                os.remove("test_eligibility_history.db")
            except:
                pass


if __name__ == "__main__":
    test_eligibility_history_flow()
