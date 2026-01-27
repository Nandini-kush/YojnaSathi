"""
Authentication Routes
Consistent auth system with:
- JSON login (email + password)
- Separate register/login flows
- Proper error codes (401, 409)
- RBAC in JWT payload (sub + role)
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from ..services.user_auth import register_user, authenticate_user
from ..services.admin_auth import authenticate_admin
from ..db.database import get_db
from ..utils.jwt import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# ==========================================
# SCHEMAS
# ==========================================

class RegisterRequest(BaseModel):
    """User registration"""
    name: str = Field(..., min_length=1, description="User's full name")
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "mypassword123"
            }
        }


class RegisterResponse(BaseModel):
    """Registration response (no token)"""
    user_id: int = Field(..., description="User ID")
    email: str = Field(..., description="Email address")
    name: str = Field(..., description="User name")
    message: str = Field(default="User registered successfully", description="Status message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "email": "john@example.com",
                "name": "John Doe",
                "message": "User registered successfully"
            }
        }


class LoginRequest(BaseModel):
    """Login with email and password"""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "mypassword123"
            }
        }


class TokenResponse(BaseModel):
    """Token response"""
    access_token: str = Field(..., description="JWT token")
    token_type: str = Field(default="bearer", description="Token type")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


# ==========================================
# USER REGISTRATION
# ==========================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account. Returns user info (no token). Use /auth/login to authenticate.",
    responses={
        201: {"description": "User registered successfully"},
        409: {"description": "Email already exists"},
        422: {"description": "Invalid request data"},
    }
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
) -> RegisterResponse:
    """
    Register a new user.
    
    - **name**: User's full name
    - **email**: Unique email address
    - **password**: Password (min 6 characters)
    
    Returns user ID and email. No token is returned.
    Use POST /auth/login to authenticate and get a token.
    """
    try:
        user = register_user(data.dict(), db)
        return RegisterResponse(
            user_id=user.id,
            email=user.email,
            name=user.name,
            message="User registered successfully. Use /auth/login to authenticate."
        )
    except HTTPException as e:
        if e.status_code == 409:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        raise
    except Exception as e:
        print(f"❌ Register: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


# ==========================================
# USER LOGIN
# ==========================================

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login as user",
    description="Authenticate with email and password. Returns JWT token.",
    responses={
        200: {"description": "Login successful, token returned"},
        401: {"description": "Invalid email or password"},
        422: {"description": "Invalid request data"},
    }
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Login with email and password.
    
    Returns JWT token valid for 60 minutes.
    Use token in Authorization header: `Bearer <token>`
    """
    token = authenticate_user(
        email=credentials.email,
        password=credentials.password,
        db=db
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return TokenResponse(
        access_token=token,
        token_type="bearer"
    )


# ==========================================
# ADMIN LOGIN
# ==========================================

@router.post(
    "/admin/login",
    response_model=TokenResponse,
    summary="Login as admin",
    description="Authenticate admin with email and password. Returns JWT token with admin role.",
    responses={
        200: {"description": "Admin login successful"},
        401: {"description": "Invalid admin credentials"},
        422: {"description": "Invalid request data"},
    }
)
def admin_login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Admin login with email and password.
    
    Returns JWT token for admin-protected endpoints.
    """
    token = authenticate_admin(
        email=credentials.email,
        password=credentials.password,
        db=db
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )

    return TokenResponse(
        access_token=token,
        token_type="bearer"
    )
