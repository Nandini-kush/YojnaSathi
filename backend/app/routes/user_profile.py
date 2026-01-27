from fastapi import APIRouter, Depends
from ..db.models import User
from ..utils.auth import get_current_user
from ..schemas.user_auth import UserResponse

router = APIRouter(
    prefix="/user",
    tags=["User - Profile"]
)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current authenticated user's profile.

    Requires: Valid USER JWT token
    """
    return current_user


@router.get("/profile", response_model=UserResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Alias for /user/me
    """
    return current_user
