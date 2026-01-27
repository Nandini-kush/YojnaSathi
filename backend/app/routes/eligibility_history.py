"""Routes for user eligibility history"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..services.eligibility_history import (
    get_user_eligibility_history,
    get_eligibility_history_summary
)
from ..schemas.eligibility_history import EligibilityHistoryResponse, EligibilityHistorySummary
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/user/eligibility-history",
    tags=["User Eligibility History"]
)


@router.get(
    "",
    response_model=EligibilityHistoryResponse,
    summary="Get user's eligibility check history",
    description="Retrieve all eligibility checks performed by the logged-in user (requires authentication)",
    responses={
        200: {"description": "User's eligibility history"},
        401: {"description": "Authentication required"},
    }
)
def get_my_eligibility_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the authenticated user's full eligibility check history.
    
    Returns all past eligibility checks with input data and matched schemes.
    """
    history = get_user_eligibility_history(db, current_user.id)
    
    return EligibilityHistoryResponse(
        user_id=current_user.id,
        total_checks=len(history),
        history=history
    )


@router.get(
    "/summary",
    response_model=EligibilityHistorySummary,
    summary="Get eligibility check summary",
    description="Get a quick summary of user's eligibility checks (requires authentication)",
    responses={
        200: {"description": "Summary of eligibility checks"},
        401: {"description": "Authentication required"},
    }
)
def get_eligibility_summary(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a summary of the user's eligibility checks including:
    - Total number of checks
    - Last check date
    - Average number of eligible schemes per check
    """
    summary = get_eligibility_history_summary(db, current_user.id)
    return EligibilityHistorySummary(**summary)
