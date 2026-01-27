from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..db.models import Admin, User
from ..config import settings

# HTTP Bearer scheme for JWT Bearer token authentication
bearer_scheme = HTTPBearer()


# =======================
# USER AUTH - WITH RBAC
# =======================
def get_current_user(
    credentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Validate JWT token from HTTP Bearer header and return current user.
    
    How it works:
    1. HTTPBearer reads Authorization: Bearer <token> header
    2. Extracts token from HTTP credentials
    3. Decodes JWT using SECRET_KEY and ALGORITHM
    4. Checks role="user" for RBAC
    5. Queries DB to verify user exists
    
    Returns: User object if token is valid and role is 'user'
    Raises: HTTPException with detailed error messages
    """
    token = credentials.credentials
    
    if not token:
        print("❌ Auth: Missing token from Authorization header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )
    
    try:
        print(f"🔐 Auth: Decoding token (first 20 chars: {token[:20]}...)")
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        print(f"✅ Auth: Token decoded successfully. Payload: {payload}")

        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None:
            print(f"❌ Auth: Token missing 'sub' claim. Payload: {payload}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user ID not found"
            )

        # Enforce RBAC: user endpoints must have role="user"
        if role != "user":
            print(f"❌ Auth: Token role mismatch. Expected 'user', got '{role}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User access required. Token role is not 'user'"
            )

        user_id = int(user_id)
        print(f"✅ Auth: Role check passed. User ID: {user_id}")

    except JWTError as e:
        print(f"❌ Auth: JWT Decode Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except ValueError as e:
        print(f"❌ Auth: Invalid user_id format: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: malformed user ID"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        print(f"❌ Auth: User not found in DB. ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User not found (ID: {user_id})"
        )

    print(f"✅ Auth: User authenticated successfully. ID: {user_id}, Email: {user.email}")
    return user


# =======================
# ADMIN AUTH - WITH RBAC
# =======================
def get_current_admin(
    credentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> Admin:
    """
    Validate JWT token from HTTP Bearer header and return current admin.
    Enforces RBAC: token must have role="admin"
    Raises HTTPException with detailed error messages.
    """
    token = credentials.credentials
    
    if not token:
        print("❌ Admin Auth: Missing token from Authorization header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )
    
    try:
        print(f"🔐 Admin Auth: Decoding token (first 20 chars: {token[:20]}...)")
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        print(f"✅ Admin Auth: Token decoded successfully. Payload: {payload}")

        admin_id = payload.get("sub")
        role = payload.get("role")

        if admin_id is None:
            print(f"❌ Admin Auth: Token missing 'sub' claim. Payload: {payload}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: admin ID not found"
            )

        # Enforce RBAC: admin endpoints must have role="admin"
        if role != "admin":
            print(f"❌ Admin Auth: Token role mismatch. Expected 'admin', got '{role}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required. Token role is not 'admin'"
            )

        admin_id = int(admin_id)
        print(f"✅ Admin Auth: Role check passed. Admin ID: {admin_id}")

    except JWTError as e:
        print(f"❌ Admin Auth: JWT Decode Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except ValueError as e:
        print(f"❌ Admin Auth: Invalid admin_id format: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: malformed admin ID"
        )

    admin = db.query(Admin).filter(Admin.id == admin_id).first()

    if not admin:
        print(f"❌ Admin Auth: Admin not found in DB. ID: {admin_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Admin not found (ID: {admin_id})"
        )

    print(f"✅ Admin Auth: Admin authenticated successfully. ID: {admin_id}, Email: {admin.email}")
    return admin
