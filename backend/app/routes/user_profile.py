from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.models import User
from ..db.database import get_db
from ..utils.auth import get_current_user
from ..schemas.user_auth import UserResponse, UpdateUserProfileRequest

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


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    profile_data: UpdateUserProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current authenticated user's profile.
    """
    if profile_data.age < 1 or profile_data.age > 120:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Age must be between 1 and 120")
    if profile_data.income < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Income cannot be negative")
    
    valid_genders = ["male", "female", "other"]
    if profile_data.gender.lower() not in valid_genders:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid gender")
        
    valid_castes = ["general", "obc", "sc", "st", "ews"]
    if profile_data.caste.lower() not in valid_castes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid caste")
        
    if not profile_data.state.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="State cannot be empty")

    current_user.name = profile_data.name
    current_user.age = profile_data.age
    current_user.income = profile_data.income
    current_user.gender = profile_data.gender
    current_user.caste = profile_data.caste
    current_user.state = profile_data.state

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    profile_data: UpdateUserProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Alias for PUT /user/me
    """
    return update_current_user_profile(profile_data, current_user, db)
