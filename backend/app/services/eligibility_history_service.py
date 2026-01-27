from fastapi import APIRouter, HTTPException
from ..schemas.eligibility import EligibilityRequest
from ..services.eligibility_service import get_eligible_schemes

router = APIRouter(
    prefix="/schemes",
    tags=["Scheme Eligibility (Public)"]
)


@router.post("/eligible")
def check_eligibility_public(data: EligibilityRequest):
    """
    PUBLIC eligibility check (no login required).
    Does NOT save eligibility history.
    """

    if data.age <= 0:
        raise HTTPException(status_code=400, detail="Age must be greater than 0")

    if data.income < 0:
        raise HTTPException(status_code=400, detail="Income cannot be negative")

    schemes = get_eligible_schemes(
        age=data.age,
        income=data.income,
        gender=data.gender,
        is_student=data.is_student
    )

    return {
        "input": data.model_dump(),
        "eligible_count": len(schemes),
        "schemes": schemes,
        "message": "Public eligibility check completed"
    }
