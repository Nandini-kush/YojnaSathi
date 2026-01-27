from sqlalchemy.orm import Session
from ..db.database import SessionLocal
from ..db.models import Admin
from ..utils.security import hash_password, verify_password
from ..utils.jwt import create_access_token


def create_admin(email: str, password: str):
    """Create a new admin user."""
    db: Session = SessionLocal()
    try:
        admin = Admin(
            email=email,
            hashed_password=hash_password(password)
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"✅ Admin created: {email} (ID: {admin.id})")
        return admin
    finally:
        db.close()


def authenticate_admin(email: str, password: str, db: Session = None):
    """
    Authenticate an admin using email and password.
    Returns JWT token if successful, None if credentials are invalid.
    """
    if db is None:
        db = SessionLocal()
        close_db = True
    else:
        close_db = False
    
    try:
        admin = db.query(Admin).filter(Admin.email == email).first()

        if not admin:
            print(f"❌ Admin login: Admin not found for email: {email}")
            return None

        if not verify_password(password, admin.hashed_password):
            print(f"❌ Admin login: Password mismatch for admin: {email}")
            return None

        token = create_access_token({
            "sub": str(admin.id),
            "role": "admin"
        })
        
        print(f"✅ Admin login: Admin authenticated (ID: {admin.id}, Email: {email})")
        return token
        
    except Exception as e:
        print(f"❌ Admin login: Error during authentication: {str(e)}")
        return None
        
    finally:
        if close_db:
            db.close()
