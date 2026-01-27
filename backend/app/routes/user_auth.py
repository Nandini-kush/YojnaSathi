from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from ..schemas.user_auth import UserCreate, UserResponse
from ..schemas.admin_auth import TokenResponse
from ..services.user_auth import register_user, authenticate_user

router = APIRouter(
    prefix="/user/auth",
    tags=["User Auth"]
)

# -------------------------
# REGISTER
# -------------------------
@router.post("/register", response_model=UserResponse)
def register_new_user(data: UserCreate):
    user = register_user(data.model_dump())
    return user

# -------------------------
# LOGIN
# -------------------------
@router.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    token = authenticate_user(
        form_data.username,
        form_data.password
    )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
        "access_token": token,
        "token_type": "bearer"
    }
