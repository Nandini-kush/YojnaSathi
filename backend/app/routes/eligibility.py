"""Routes for protected eligibility check (saves history)"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..services.eligibility import get_eligible_schemes
from ..services.eligibility_history import save_eligibility_check
from ..schemas.eligibility import EligibilityRequest, EligibilityResponse
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/schemes",
    tags=["Eligibility"]
)


@router.post(
    "/check-eligibility",
    response_model=EligibilityResponse,
    summary="Check eligibility and save to history",
    description="Check user's eligibility for schemes and save to history (requires authentication)",
    responses={
        200: {"description": "Eligibility check completed"},
        401: {"description": "Authentication required"},
        422: {"description": "Invalid input data"},
    }
)
def check_eligibility_with_history(
    user_data: EligibilityRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check eligibility for government schemes and save to history.
    
    This is a protected endpoint that:
    - Requires user authentication
    - Saves the eligibility check to the user's history
    - Returns eligible schemes with full details
    
    Args:
        user_data: Eligibility request data (age, income, gender, is_student)
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        EligibilityResponse with eligible schemes and metadata
    """
    try:
        # Validate input
        if user_data.age <= 0:
            raise HTTPException(status_code=400, detail="Age must be greater than 0")
        
        if user_data.income < 0:
            raise HTTPException(status_code=400, detail="Income cannot be negative")
        
        # Get eligible schemes
        eligible = get_eligible_schemes(
            age=user_data.age,
            income=user_data.income,
            gender=user_data.gender,
            is_student=user_data.is_student
        )
        
        # Save to eligibility history (pass schemes for storing IDs)
        history_entry = save_eligibility_check(
            db=db,
            user_id=current_user.id,
            eligibility_data=user_data,
            eligible_count=len(eligible),
            eligible_schemes=eligible
        )
        
        return EligibilityResponse(
            input=user_data.model_dump(),
            eligible_count=len(eligible),
            eligible_schemes=eligible,
            message=f"Eligibility checked and saved. {len(eligible)} schemes matched" if eligible else "No schemes matched your eligibility"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Eligibility check error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Eligibility check failed: {str(e)}")
