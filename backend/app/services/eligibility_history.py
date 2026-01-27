"""Service for managing eligibility history"""
from sqlalchemy.orm import Session
from ..db.models import EligibilityHistory, User
from ..schemas.eligibility import EligibilityRequest
from typing import List
from datetime import datetime
import json


def save_eligibility_check(
    db: Session,
    user_id: int,
    eligibility_data: EligibilityRequest,
    eligible_count: int,
    eligible_schemes: List[dict] = None
) -> EligibilityHistory:
    """
    Save an eligibility check result to the history.
    
    Args:
        db: Database session
        user_id: ID of the user performing the check
        eligibility_data: The eligibility request data
        eligible_count: Number of schemes user is eligible for
        eligible_schemes: List of eligible scheme dictionaries (not stored in DB, only used for response)
    
    Returns:
        The saved EligibilityHistory record
    """
    history_entry = EligibilityHistory(
        user_id=user_id,
        age=eligibility_data.age,
        income=eligibility_data.income,
        gender=eligibility_data.gender,
        is_student=eligibility_data.is_student,
        eligible_count=eligible_count
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    return history_entry


def get_user_eligibility_history(
    db: Session,
    user_id: int
) -> List[EligibilityHistory]:
    """
    Retrieve all eligibility checks for a specific user.
    
    Args:
        db: Database session
        user_id: ID of the user
    
    Returns:
        List of EligibilityHistory records for the user, ordered by most recent first
    """
    return db.query(EligibilityHistory).filter(
        EligibilityHistory.user_id == user_id
    ).order_by(EligibilityHistory.created_at.desc()).all()


def get_eligibility_history_summary(db: Session, user_id: int) -> dict:
    """
    Get a summary of user's eligibility checks.
    
    Args:
        db: Database session
        user_id: ID of the user
    
    Returns:
        Dictionary with summary statistics
    """
    history = db.query(EligibilityHistory).filter(
        EligibilityHistory.user_id == user_id
    ).all()
    
    if not history:
        return {
            "user_id": user_id,
            "total_checks": 0,
            "last_check_date": None,
            "average_eligible_schemes": 0.0
        }
    
    total_checks = len(history)
    last_check = max(history, key=lambda h: h.created_at)
    average_eligible = sum(h.eligible_count for h in history) / total_checks
    
    return {
        "user_id": user_id,
        "total_checks": total_checks,
        "last_check_date": last_check.created_at,
        "average_eligible_schemes": round(average_eligible, 2)
    }
