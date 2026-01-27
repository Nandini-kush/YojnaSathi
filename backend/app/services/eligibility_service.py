from typing import List, Dict
import logging
from sqlalchemy.orm import Session

from ..db.models import Scheme, User
from ..db.database import SessionLocal
from ..utils.serializers import scheme_to_dict

logger = logging.getLogger(__name__)


def load_schemes() -> List[Scheme]:
    """Load all active schemes from the database."""
    db = SessionLocal()
    try:
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        return schemes
    finally:
        db.close()


def get_eligible_schemes(
    age: int,
    income: float,
    gender: str = None,
    is_student: bool = False,
    caste: str = None,
    state: str = None
) -> List[Dict]:
    """
    Core eligibility logic - returns schemes matching the given criteria.
    
    Args:
        age: User's age in years (required)
        income: Monthly income in rupees (required)
        gender: 'male', 'female', 'other' (optional)
        is_student: Whether user is a student (optional)
        caste: 'sc', 'st', 'obc', 'general' (optional)
        state: State code/name (optional)
    
    Returns:
        List of eligible schemes as dictionaries
    """
    db = SessionLocal()
    try:
        query = db.query(Scheme).filter(Scheme.is_active == True)

        # Age filtering - check if user's age is within scheme's age range
        if age is not None:
            query = query.filter(
                (Scheme.min_age == None) | (Scheme.min_age <= age),
                (Scheme.max_age == None) | (Scheme.max_age >= age)
            )

        # Income filtering - check if user's income is below scheme's max income
        if income is not None:
            query = query.filter(
                (Scheme.max_income == None) | (Scheme.max_income >= income)
            )

        # Gender filtering
        if gender:
            query = query.filter(
                (Scheme.gender == None) | 
                (Scheme.gender == gender) | 
                (Scheme.gender.in_(["all", "All", "ALL"]))
            )

        # Student-specific schemes (if applicable)
        if is_student:
            # For students, also include schemes with category 'student' or 'all'
            query = query.filter(
                (Scheme.category == None) |
                (Scheme.category.in_(["student", "Student", "all", "All"]))
            )

        # Caste filtering
        if caste:
            query = query.filter(
                (Scheme.caste == None) | 
                (Scheme.caste == caste) | 
                (Scheme.caste.in_(["all", "All", "ALL"]))
            )

        # State filtering
        if state:
            query = query.filter(
                (Scheme.state == None) | 
                (Scheme.state == state) | 
                (Scheme.state.in_(["all", "All", "ALL"]))
            )

        schemes = query.all()
        return [scheme_to_dict(s) for s in schemes]
    finally:
        db.close()


def get_eligible_schemes_for_user(
    db: Session,
    user: User
) -> List[dict]:
    """
    Returns eligible schemes for an authenticated user.
    Uses user's stored preferences (age, income, gender, etc.)
    
    Args:
        db: Database session
        user: User object with eligibility attributes
    
    Returns:
        List of eligible schemes as dictionaries
    """
    # Extract user attributes - use defaults if not set
    age = getattr(user, 'age', None)
    income = getattr(user, 'income', None)
    gender = getattr(user, 'gender', None)
    is_student = getattr(user, 'is_student', False)
    caste = getattr(user, 'caste', None)
    state = getattr(user, 'state', None)

    # Call the core eligibility logic
    # Note: This closes its own DB session, so we don't use the passed session
    return get_eligible_schemes(
        age=age,
        income=income,
        gender=gender,
        is_student=is_student,
        caste=caste,
        state=state
    )
