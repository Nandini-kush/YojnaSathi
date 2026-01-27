from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from ..schemas.admin_auth import TokenResponse
from ..services.admin_auth import authenticate_admin

router = APIRouter(
    prefix="/admin/auth",
    tags=["Admin - Auth"]
)

@router.post("/login", response_model=TokenResponse)
def login_admin(form_data: OAuth2PasswordRequestForm = Depends()):
    token = authenticate_admin(form_data.username, form_data.password)

    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"access_token": token, "token_type": "bearer"}


