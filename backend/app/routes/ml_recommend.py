"""
Recommendation Router - Provides scheme recommendations using rule-based filtering.

This router implements rule-based scheme recommendations (NO ML).
It:
1. Takes user profile data from request
2. Loads active schemes from database
3. Applies rule-based filtering based on age, income, category
4. Returns all matching schemes

Important Design Notes:
- Rule-based filtering only (No ML model)
- Database access for schemes only
- Clean error handling and logging
- No external service dependencies
"""

import logging
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from ..schemas.ml_recommendation import (
    UserProfileForML,
    RecommendationsResponse,
    RecommendationResult,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    MLRecommendResponse,
)
from ..services.ml_service import get_ml_service, MLServiceException
from ..db.database import get_db
from ..db.models import Scheme
from ..utils.auth import get_current_user


logger = logging.getLogger(__name__)

# Create router for ML recommendation endpoints
router = APIRouter(
    prefix="/ml",
    tags=["ML Recommendation"],
    responses={
        500: {"description": "ML service error"},
        400: {"description": "Invalid request"},
    }
)

def _get_active_schemes(db: Session) -> List[dict]:
    """
    Fetch active schemes from database and convert to filtering format.
    
    Do NOT default null values - keep them as None for explicit checking.
    """
    try:
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        
        if not schemes:
            logger.warning("No active schemes found in database")
            return []
        
        # Convert DB models to dicts for filtering (keeping nulls as None)
        scheme_dicts = []
        for scheme in schemes:
            scheme_dicts.append({
                'id': scheme.id,
                'name': scheme.scheme_name,
                'min_age': scheme.min_age,
                'max_age': scheme.max_age,
                'max_income': scheme.max_income,
                'gender': scheme.gender,  # Keep as None if null
                'state': scheme.state,    # Keep as None if null
                'category': scheme.caste, # Map 'caste' to 'category', keep None if null
            })
        
        logger.debug(f"Loaded {len(scheme_dicts)} active schemes from database")
        for s in scheme_dicts[:3]:
            logger.debug(f"   Sample scheme: {s}")
        return scheme_dicts
        
    except Exception as e:
        logger.error(f"Failed to fetch schemes from database: {e}", exc_info=True)
        raise


# ============================================================================
# REFACTORED RULE-BASED ELIGIBILITY FILTERING
#
# Using rule-based filtering only.
# 
# This module provides comprehensive eligibility checking for schemes.
# It evaluates user eligibility against scheme criteria:
# - Gender matching (handles "Male/Female" combinations)
# - Caste/Category matching
# - State eligibility
# - Age range validation
# - Income limit validation
#
# All string comparisons are normalized using strip().lower()
# Null values are treated as "all" (no restriction)
# ============================================================================

def is_user_eligible(user_profile, scheme: dict) -> bool:
    """
    Using rule-based eligibility filtering.
    
    Check if user is eligible for a scheme based on all criteria:
    - Gender must match (or scheme applies to all)
    - Category must match (or scheme applies to all)
    - State must match (or scheme applies nationwide)
    - Income must be within limit
    - Age must be within range
    
    Args:
        user_profile: UserProfileForML with age, income, gender, category, state
        scheme: dict with scheme details
    
    Returns:
        True if user is eligible for all criteria, False otherwise
    """
    # Check gender
    if not _check_gender(user_profile.gender, scheme.get('gender')):
        return False
    
    # Check category
    if not _check_category(user_profile.category, scheme.get('category')):
        return False
    
    # Check state
    if not _check_state(user_profile.state, scheme.get('state')):
        return False
    
    # Check income
    if not _check_income(user_profile.income, scheme.get('min_income'), scheme.get('max_income')):
        return False
    
    # Check age
    if not _check_age(user_profile.age, scheme.get('min_age'), scheme.get('max_age')):
        return False
    
    # All checks passed
    return True


def _check_gender(user_gender: str, scheme_gender: str) -> bool:
    """
    Check if user gender matches scheme's gender requirement.
    
    Logic:
    - If scheme_gender is null/empty: ACCEPT (no restriction)
    - If scheme_gender is "all": ACCEPT (applies to all)
    - If scheme_gender contains "/": split and check if user_gender is in the list
    - Otherwise: exact match (case-insensitive)
    """
    scheme_gender_norm = (scheme_gender or '').strip().lower() if scheme_gender else ''
    user_gender_norm = (user_gender or '').strip().lower() if user_gender else ''
    
    # Null or empty means "all"
    if not scheme_gender_norm:
        return True
    
    # 'all' explicitly means apply to all
    if scheme_gender_norm == 'all':
        return True
    
    # Check if scheme has multiple options (e.g., "Male/Female")
    if '/' in scheme_gender_norm:
        options = [opt.strip() for opt in scheme_gender_norm.split('/')]
        return user_gender_norm in options
    
    # Exact match
    return scheme_gender_norm == user_gender_norm


def _check_category(user_category: str, scheme_category: str) -> bool:
    """
    Check if user category matches scheme's category requirement.
    
    Logic:
    - If scheme_category is null/empty: ACCEPT (no restriction)
    - If scheme_category is "all": ACCEPT (applies to all)
    - Otherwise: exact match (case-insensitive)
    """
    scheme_category_norm = (scheme_category or '').strip().lower() if scheme_category else ''
    user_category_norm = (user_category or '').strip().lower() if user_category else ''
    
    # Null or empty means "all"
    if not scheme_category_norm:
        return True
    
    # 'all' explicitly means apply to all
    if scheme_category_norm == 'all':
        return True
    
    # Exact match
    return scheme_category_norm == user_category_norm


def _check_state(user_state: str, scheme_state: str) -> bool:
    """
    Check if user state matches scheme's state requirement.
    
    Logic:
    - If scheme_state is null/empty: ACCEPT (no restriction)
    - If scheme_state is "all" or "all india": ACCEPT (applies everywhere)
    - Otherwise: exact match (case-insensitive)
    """
    scheme_state_norm = (scheme_state or '').strip().lower() if scheme_state else ''
    user_state_norm = (user_state or '').strip().lower() if user_state else ''
    
    # Null or empty means "all"
    if not scheme_state_norm:
        return True
    
    # 'all' or 'all india' explicitly means apply everywhere
    if scheme_state_norm in ['all', 'all india']:
        return True
    
    # Exact match
    return scheme_state_norm == user_state_norm


def _check_income(user_income: float, min_income, max_income) -> bool:
    """
    Check if user income meets scheme's income requirement.
    
    Logic:
    - If both min_income and max_income exist: min <= user_income <= max
    - If only min_income exists: user_income >= min_income
    - If only max_income exists: user_income <= max_income
    - If both are None/null: ACCEPT (no income restriction)
    """
    # No income restriction if both are null
    if min_income is None and max_income is None:
        return True
    
    # Check minimum income
    if min_income is not None and user_income < min_income:
        return False
    
    # Check maximum income
    if max_income is not None and user_income > max_income:
        return False
    
    return True


def _check_age(user_age: int, min_age, max_age) -> bool:
    """
    Check if user age meets scheme's age requirement.
    
    Logic:
    - If both min_age and max_age exist: min <= user_age <= max
    - If only min_age exists: user_age >= min_age
    - If only max_age exists: user_age <= max_age
    - If both are None/null: ACCEPT (no age restriction)
    """
    # No age restriction if both are null
    if min_age is None and max_age is None:
        return True
    
    # Check minimum age
    if min_age is not None and user_age < min_age:
        return False
    
    # Check maximum age
    if max_age is not None and user_age > max_age:
        return False
    
    return True


# ============================================================================
# RULE-BASED ELIGIBILITY FILTERING
# ============================================================================


# ============================================================================
# SCHEME RANKING
#
# Ranking applied after rule-based filtering.
#
# Scores are calculated based on:
# - Gender match level (exact vs combo)
# - Category/Caste match level
# - State match level
# - Income alignment
# - Age alignment
#
# Higher scores indicate better matching schemes.
# ============================================================================

def calculate_scheme_score(user_profile, scheme: dict) -> int:
    """
    Calculate ranking score for an eligible scheme based on how well it matches user profile.
    
    Scoring rules:
    - Exact gender match (not Male/Female combo): +2
    - Scheme gender is Male/Female combo: +1
    - Exact category/caste match: +2
    - Scheme category is "all": +1
    - Exact state match: +3
    - Income closer to scheme min_income: +1
    - Age within 5 years of scheme min_age: +1
    
    Args:
        user_profile: UserProfileForML with age, income, gender, category, state
        scheme: dict with scheme details
    
    Returns:
        Integer score (higher is better match)
    """
    score = 0
    
    # Gender matching score
    scheme_gender = (scheme.get('gender') or '').strip().lower() if scheme.get('gender') else ''
    user_gender = (user_profile.gender or '').strip().lower() if user_profile.gender else ''
    
    if scheme_gender and scheme_gender != 'all':
        if '/' in scheme_gender:
            # Scheme has combo (Male/Female)
            score += 1
        else:
            # Exact gender match (not a combo)
            score += 2
    
    # Category/Caste matching score
    scheme_category = (scheme.get('category') or '').strip().lower() if scheme.get('category') else ''
    user_category = (user_profile.category or '').strip().lower() if user_profile.category else ''
    
    if scheme_category:
        if scheme_category == 'all':
            # Scheme applies to all categories
            score += 1
        else:
            # Exact category match
            score += 2
    
    # State matching score
    scheme_state = (scheme.get('state') or '').strip().lower() if scheme.get('state') else ''
    user_state = (user_profile.state or '').strip().lower() if user_profile.state else ''
    
    if scheme_state and scheme_state not in ['all', 'all india']:
        # Exact state match (not nationwide)
        score += 3
    
    # Income alignment score
    min_income = scheme.get('min_income')
    max_income = scheme.get('max_income')
    
    if min_income is not None and user_profile.income >= min_income:
        # User income is at or above minimum (closer alignment)
        score += 1
    
    # Age alignment score
    min_age = scheme.get('min_age')
    
    if min_age is not None and abs(user_profile.age - min_age) <= 5:
        # User age is within 5 years of minimum age
        score += 1
    
    return score


@router.post(
    "/recommend",
    summary="Rule-based scheme recommendations (Protected)",
    response_model=MLRecommendResponse,
    responses={
        200: {"description": "Recommendations returned successfully"},
        400: {"description": "Invalid request payload - check field names and types"},
        422: {"description": "Validation error - invalid data format or values"},
        500: {"description": "Server error"},
    }
)
def recommend_schemes(
    user_profile: UserProfileForML,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MLRecommendResponse:
    """
    Get schemes that match user's eligibility based on rule-based filtering.
    
    Only returns schemes where ALL eligibility conditions are satisfied:
    - Age must be within scheme's age range (18-120)
    - Income must be within scheme's income limit
    - Gender must match scheme's gender (or scheme applies to all)
    - Category must match scheme's category (or scheme applies to all)
    - State must match scheme's state (or scheme applies nationwide)
    
    **Required Request Format (JSON):**
    ```json
    {
        "age": 28,
        "income": 250000,
        "gender": "Male",
        "category": "General",
        "state": "Maharashtra"
    }
    ```
    
    **Field Details:**
    - `age`: Integer between 18 and 120 (years)
    - `income`: Number, annual income in Indian Rupees
    - `gender`: String - "Male", "Female", or other
    - `category`: String - "General", "OBC", "SC", or "ST"
    - `state`: String (optional) - state name or leave null for all-India schemes
    
    **Authentication:** Required (Bearer token)
    """
    try:
        # ===== INCOMING PAYLOAD VALIDATION & LOGGING =====
        logger.info("\n" + "="*80)
        logger.info("[REQUEST] POST /api/v1/ml/recommend received")
        logger.info("[VALIDATION] Pydantic successfully parsed request")
        logger.info("[PAYLOAD] Received User Profile:")
        logger.info(f"  - age: {user_profile.age} (type: {type(user_profile.age).__name__})")
        logger.info(f"  - income: {user_profile.income} (type: {type(user_profile.income).__name__})")
        logger.info(f"  - gender: {user_profile.gender!r} (type: {type(user_profile.gender).__name__})")
        logger.info(f"  - category: {user_profile.category!r} (type: {type(user_profile.category).__name__})")
        logger.info(f"  - state: {user_profile.state!r} (type: {type(user_profile.state).__name__ if user_profile.state else 'None'})")
        logger.info(f"[AUTH] Current user: {current_user.get('user_id', 'unknown')}")
        logger.info("="*80)
        
        # Fetch active schemes from database
        schemes = _get_active_schemes(db)
        
        if not schemes:
            logger.warning("[WARNING] No active schemes found in database")
            return MLRecommendResponse(
                success=False,
                schemes=[],
                error="No schemes currently available",
                total_schemes=0,
                total_eligible=0
            )
        
        logger.info(f"[DB] Successfully fetched {len(schemes)} active schemes from database")
        
        # Log incoming request for debugging
        logger.info("\n[PROCESSING] Applying rule-based eligibility filtering:")
        logger.info(f"  User Age: {user_profile.age} years")
        logger.info(f"  User Income: {user_profile.income:,.0f} (annual)")
        logger.info(f"  User Gender: {user_profile.gender}")
        logger.info(f"  User Category: {user_profile.category}")
        logger.info(f"  User State: {user_profile.state if user_profile.state else 'All-India'}")
        logger.info(f"  Income: {user_profile.income:.0f}")
        logger.info(f"  Gender: {user_profile.gender}")
        logger.info(f"  Category: {user_profile.category}")
        logger.info(f"  State: {user_profile.state}")
        logger.info("-" * 80)
        logger.info(f"Total schemes to check: {len(schemes)}")
        logger.info("-" * 80)
        
        eligible_schemes = []
        
        # Check each scheme for user eligibility using the helper function
        for scheme in schemes:
            scheme_id = scheme['id']
            scheme_name = scheme['name']
            
            # Use the helper function to check eligibility
            if is_user_eligible(user_profile, scheme):
                logger.info(f"  ✓ ELIGIBLE: {scheme_name}")
                eligible_schemes.append({
                    "id": scheme_id,
                    "name": scheme_name,
                    "eligible": True
                })
            else:
                logger.debug(f"  ✗ REJECTED: {scheme_name}")
        
        # Ranking applied after rule-based filtering.
        # Calculate scores for all eligible schemes and sort by score
        ranked_schemes = []
        for scheme_item in eligible_schemes:
            # Find the full scheme data to calculate score
            full_scheme = next((s for s in schemes if s['id'] == scheme_item['id']), None)
            if full_scheme:
                score = calculate_scheme_score(user_profile, full_scheme)
                ranked_schemes.append({
                    "id": scheme_item["id"],
                    "name": scheme_item["name"],
                    "eligible": True,
                    "score": score
                })
        
        # Sort schemes by score in descending order (highest score first)
        ranked_schemes.sort(key=lambda x: x['score'], reverse=True)
        
        # Log results summary
        logger.info("=" * 80)
        logger.info(f"ELIGIBILITY CHECK COMPLETE:")
        logger.info(f"  Total schemes checked: {len(schemes)}")
        logger.info(f"  Eligible schemes: {len(ranked_schemes)}")
        if ranked_schemes:
            logger.info(f"RANKING APPLIED (sorted by score):")
            for i, scheme in enumerate(ranked_schemes[:5], 1):
                logger.info(f"  {i}. {scheme['name']} (score: {scheme['score']})") 
        logger.info("=" * 80)
        
        return MLRecommendResponse(
            success=True,
            schemes=[
                {
                    "id": s["id"],
                    "name": s["name"],
                    "eligible": s.get("eligible", True),
                    "score": s.get("score")
                }
                for s in ranked_schemes
            ],
            error=None,
            total_schemes=len(schemes),
            total_eligible=len(ranked_schemes)
        )

    except ValueError as ve:
        logger.error(f"Validation error in recommendation: {ve}", exc_info=True)
        # Return valid error response (never None)
        return MLRecommendResponse(
            success=False,
            schemes=[],
            error=f"Invalid input data: {str(ve)}",
            total_schemes=0,
            total_eligible=0
        )
    except Exception as e:
        logger.error(f"Unexpected error in rule-based recommendation: {e}", exc_info=True)
        # Always return a valid JSON response with success=False (NEVER None)
        return MLRecommendResponse(
            success=False,
            schemes=[],
            error=f"Failed to generate recommendations: {str(e)}",
            total_schemes=0,
            total_eligible=0
        )


@router.post(
    "/predict-schemes",
    summary="ML-based scheme recommendations (Protected)",
    response_model=RecommendationsResponse,
    responses={
        200: {"description": "Recommendations returned successfully"},
        500: {"description": "Server error"},
    }
)
def predict_schemes(
    user_profile: UserProfileForML,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RecommendationsResponse:
    """
    Get ML-scored schemes that match user's eligibility.
    Runs rule-based filtering first, then ranks eligible schemes using Random Forest.
    """
    try:
        schemes = _get_active_schemes(db)
        
        if not schemes:
            return RecommendationsResponse(
                user=user_profile,
                recommended_schemes=[],
                total_schemes=0,
                total_eligible=0
            )
            
        eligible_schemes = []
        for scheme in schemes:
            if is_user_eligible(user_profile, scheme):
                eligible_schemes.append(scheme)
                
        ml_service = get_ml_service()
        user_data_dict = {
            "age": user_profile.age,
            "income": user_profile.income,
            "gender": user_profile.gender,
            "caste": user_profile.category,
            "state": user_profile.state
        }
        
        ranked_schemes = ml_service.recommend_schemes_for_user(user_data_dict, eligible_schemes, top_n=10)
        
        # Parse the ranked_schemes dictionaries into RecommendationResult models
        results = [
            RecommendationResult(
                scheme_id=s['scheme_id'],
                scheme_name=s['scheme_name'],
                eligible=s['eligible'],
                probability=s['probability']
            )
            for s in ranked_schemes
        ]
        
        return RecommendationsResponse(
            user=user_profile,
            recommended_schemes=results,
            total_schemes=len(schemes),
            total_eligible=len(ranked_schemes)
        )
    except Exception as e:
        logger.error(f"Unexpected error in ML recommendation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate ML recommendations: {str(e)}"
        )