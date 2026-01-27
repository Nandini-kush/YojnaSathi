from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..db.database import SessionLocal
from ..db.models import User
from ..utils.security import hash_password, verify_password
from ..utils.jwt import create_access_token


def register_user(data: dict, db: Session = None):
    """
    Register a new user with name, email, and password.
    Prevents duplicate email registration.
    """
    if db is None:
        db = SessionLocal()

    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == data["email"]).first()
        if existing_user:
            print(f"❌ Register: Email already exists: {data['email']}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        user = User(
            name=data["name"],
            email=data["email"],
            hashed_password=hash_password(data["password"])
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ Register: User created successfully (ID: {user.id}, Email: {user.email})")
        return user

    except IntegrityError:
        db.rollback()
        print(f"❌ Register: Integrity error for email: {data['email']}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    finally:
        db.close()


def authenticate_user(email: str, password: str, db: Session = None):
    """
    Authenticate a user using email and password.
    Returns JWT token if successful, None if credentials are invalid.
    Logs explicit reasons for failure.
    """
    if db is None:
        db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ Login: User not found for email: {email}")
            return None

        if not verify_password(password, user.hashed_password):
            print(f"❌ Login: Password mismatch for user: {email}")
            return None

        token = create_access_token({
            "sub": str(user.id),
            "role": "user"
        })

        print(f"✅ Login: User authenticated successfully (ID: {user.id}, Email: {email})")
        return token

    except Exception as e:
        print(f"❌ Login: Error during authentication: {str(e)}")
        return None
        
    finally:
        db.close()


def create_access_token_for_user(user_id: int):
    """
    Create JWT token for a given user ID.
    """
    return create_access_token({
        "sub": str(user_id),
        "role": "user"
    })
