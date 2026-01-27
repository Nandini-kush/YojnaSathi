"""Quick integration test for auth flow"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./test_auth_debug.db"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
import app.db.base_imports  # Register all models
from app.db.models import User, Admin
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.services.user_auth import register_user, authenticate_user
from app.services.admin_auth import create_admin, authenticate_admin

def test_auth_flow():
    """Test the complete auth flow"""
    
    # Create test database
    DATABASE_URL = "sqlite:///./test_auth_debug.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Drop and recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    db = SessionLocal()
    
    try:
        # Test 1: Plain text password hashing (TEMPORARY)
        password = "testpassword123"
        hashed = hash_password(password)
        print(f"✅ Password hashing: '{password}' → '{hashed}'")
        assert verify_password(password, hashed), "Password verification failed"
        assert verify_password("wrongpassword", hashed) is False, "Should reject wrong password"
        print("✅ Password verification works (plain text for debugging)")
        
        # Test 2: User Registration
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "mypassword123"
        }
        user = register_user(user_data, db)
        print(f"✅ User registered: ID={user.id}, Email={user.email}, Name={user.name}")
        
        # Test 3: User Login Success
        token = authenticate_user(
            email=user_data["email"],
            password=user_data["password"],
            db=db
        )
        assert token is not None, "Token should be generated"
        print(f"✅ User login successful: Token={token[:50]}...")
        
        # Test 4: User Login Failure (wrong password)
        bad_token = authenticate_user(
            email=user_data["email"],
            password="wrongpassword",
            db=db
        )
        assert bad_token is None, "Should return None for wrong password"
        print("✅ User login correctly rejects wrong password")
        
        # Test 5: User Login Failure (non-existent user)
        no_user_token = authenticate_user(
            email="nonexistent@example.com",
            password="anypassword",
            db=db
        )
        assert no_user_token is None, "Should return None for non-existent user"
        print("✅ User login correctly rejects non-existent user")
        
        # Test 6: Admin Registration
        admin = create_admin("admin@example.com", "adminpass123")
        print(f"✅ Admin created: ID={admin.id}, Email={admin.email}")
        
        # Test 7: Admin Login Success
        admin_token = authenticate_admin(
            email=admin.email,
            password="adminpass123",
            db=db
        )
        assert admin_token is not None, "Admin token should be generated"
        print(f"✅ Admin login successful: Token={admin_token[:50]}...")
        
        # Test 8: Admin Login Failure
        bad_admin_token = authenticate_admin(
            email=admin.email,
            password="wrongpassword",
            db=db
        )
        assert bad_admin_token is None, "Should return None for wrong admin password"
        print("✅ Admin login correctly rejects wrong password")
        
        # Test 9: JWT Token Structure
        from jose import jwt
        from app.config import settings
        
        decoded_user_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"✅ User token payload: {decoded_user_token}")
        assert decoded_user_token.get("sub") == str(user.id), "Token should contain user ID"
        assert decoded_user_token.get("role") == "user", "Token should have 'user' role"
        
        decoded_admin_token = jwt.decode(admin_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"✅ Admin token payload: {decoded_admin_token}")
        assert decoded_admin_token.get("sub") == str(admin.id), "Token should contain admin ID"
        assert decoded_admin_token.get("role") == "admin", "Token should have 'admin' role"
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\nAuth Flow is Working Correctly:")
        print("  1. ✅ Passwords stored as plain text (TEMPORARY FOR DEBUGGING)")
        print("  2. ✅ User registration working")
        print("  3. ✅ User login working with correct credentials")
        print("  4. ✅ Login rejects wrong password")
        print("  5. ✅ Login rejects non-existent users")
        print("  6. ✅ Admin registration working")
        print("  7. ✅ Admin login working")
        print("  8. ✅ JWT tokens generated correctly")
        print("  9. ✅ Token payloads contain correct role and ID")
        
    finally:
        db.close()
        # Cleanup
        import os
        import time
        time.sleep(0.5)
        if os.path.exists("test_auth_debug.db"):
            try:
                os.remove("test_auth_debug.db")
            except:
                pass


if __name__ == "__main__":
    test_auth_flow()
