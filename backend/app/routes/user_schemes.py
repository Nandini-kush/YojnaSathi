from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..db.models import User
from ..utils.auth import get_current_user
from ..services.eligibility_service import get_eligible_schemes_for_user

router = APIRouter(
    prefix="/user/schemes",
    tags=["User - Schemes"]
)


@router.get("/eligible")
def get_my_eligible_schemes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns eligible schemes for the logged-in user.
    """
    schemes = get_eligible_schemes_for_user(db, current_user)

    return {
        "user_id": current_user.id,
        "eligible_count": len(schemes),
        "schemes": schemes
    }
