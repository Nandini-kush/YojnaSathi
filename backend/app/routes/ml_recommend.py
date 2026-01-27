"""
ML Recommendation Router - Provides scheme recommendations using trained ML model.

This router integrates the trained ML pipeline with the FastAPI backend.
It:
1. Takes user profile data from request
2. Loads active schemes from database
3. Uses ML model to rank schemes by eligibility
4. Returns top recommendations

Important Design Notes:
- ML model is loaded once at app startup (not per request)
- No model retraining or updates
- Database access for schemes only
- Clean error handling and logging
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
    Fetch active schemes from database and convert to ML format.
    
    The DB scheme model fields are mapped to ML expected field names:
    - id → scheme_id
    - scheme_name → scheme_name
    - min_age → scheme_min_age
    - max_age → scheme_max_age
    - max_income → scheme_income_limit
    - category → scheme_category
    """
    try:
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        
        if not schemes:
            logger.warning("No active schemes found in database")
            return []
        
        # Convert DB models to dicts compatible with ML model
        scheme_dicts = []
        for scheme in schemes:
            scheme_dicts.append({
                'scheme_id': scheme.id,
                'scheme_name': scheme.scheme_name,
                'scheme_min_age': scheme.min_age or 18,  # Default to 18 if null
                'scheme_max_age': scheme.max_age or 65,  # Default to 65 if null
                'scheme_income_limit': scheme.max_income or 500000,  # Default to 500k if null
                'scheme_category': scheme.category or 'General',  # Default to General if null
            })
        
        logger.debug(f"Loaded {len(scheme_dicts)} schemes from database")
        return scheme_dicts
        
    except Exception as e:
        logger.error(f"Failed to fetch schemes from database: {e}")
        raise


@router.post(
    "/recommend",
    response_model=RecommendationsResponse,
    summary="Get scheme recommendations (Protected)",
    description="Get top 5 schemes ranked by ML model based on user profile. Requires authentication."
)
def recommend_schemes(
    user_profile: UserProfileForML,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RecommendationsResponse:
    """
    Get ML-based scheme recommendations for a user.
    
    The ML model ranks schemes by eligibility probability.
    Higher probability means better eligibility match.
    
    **Requires**: Bearer token (JWT authentication)

    Args:
        user_profile: User's age, income, gender, category
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        Top 5 schemes ranked by eligibility probability (highest first)
    
    Raises:
        HTTPException: If ML service fails or no schemes available
    """
    try:
        # Get schemes from database
        schemes = _get_active_schemes(db)
        
        if not schemes:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No schemes available in database"
            )
        
        # Get ML service (loads model once at startup)
        ml_service = get_ml_service()
        
        # Get recommendations from ML model
        recommendations = ml_service.recommend_schemes_for_user(
            user_data=user_profile.dict(),
            schemes=schemes,
            top_n=5
        )
        
        # Count eligible schemes
        eligible_count = sum(1 for r in recommendations if r['eligible'])
        
        # Build response
        response = RecommendationsResponse(
            user=user_profile,
            recommended_schemes=[
                RecommendationResult(**rec) for rec in recommendations
            ],
            total_schemes=len(recommendations),
            total_eligible=eligible_count
        )
        
        logger.info(
            f"Generated {len(recommendations)} recommendations for user {current_user.id} "
            f"({user_profile.age}yo, ₹{user_profile.income})"
        )
        
        return response
        
    except MLServiceException as e:
        logger.error(f"ML Service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML recommendation service unavailable: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in recommend_schemes: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )


@router.post(
    "/check-eligibility",
    response_model=EligibilityCheckResponse,
    summary="Check eligibility for a scheme (Protected)",
    description="Check if user is eligible for a specific scheme with ML explanation. Requires authentication."
)
def check_scheme_eligibility(
    request: EligibilityCheckRequest,
    current_user = Depends(get_current_user)
) -> EligibilityCheckResponse:
    """
    Check if a user is eligible for a specific scheme.
    
    Returns eligibility status, probability, and top contributing ML features.
    
    **Requires**: Bearer token (JWT authentication)

    Args:
        request: User profile and scheme information
        current_user: Authenticated user from JWT token
    
    Returns:
        Eligibility status with probability and feature importance
    
    Raises:
        HTTPException: If ML service fails
    """
    try:
        # Get ML service
        ml_service = get_ml_service()
        
        # Check eligibility
        result = ml_service.check_scheme_eligibility(
            user_data=request.user.dict(),
            scheme=request.scheme.dict()
        )
        
        # Build response
        response = EligibilityCheckResponse(
            scheme_id=request.scheme.scheme_id,
            scheme_name=request.scheme.scheme_name,
            eligible=result['eligible'],
            probability=result['probability'],
            top_contributing_features=result.get('top_contributing_features', [])
        )
        
        logger.info(
            f"Eligibility check for user {current_user.id}: {request.scheme.scheme_name} - "
            f"{'Eligible' if result['eligible'] else 'Not Eligible'} "
            f"({result['probability']:.2%})"
        )
        
        return response
        
    except MLServiceException as e:
        logger.error(f"ML Service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in check_scheme_eligibility: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check eligibility"
        )


@router.get(
    "/health",
    summary="ML Service Health Check",
    description="Check if ML service is available and model is loaded"
)
def ml_health_check() -> dict:
    """
    Check if ML service is properly initialized.
    
    Returns:
        Status information about ML service
    
    Raises:
        HTTPException: If ML service is not available
    """
    try:
        ml_service = get_ml_service()
        return {
            "status": "healthy",
            "message": "ML service is available",
            "ml_available": True
        }
    except MLServiceException as e:
        logger.error(f"ML Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML service not available: {str(e)}"
        )


@router.post(
    "/predict-schemes",
    response_model=RecommendationsResponse,
    summary="Predict scheme eligibility (Public API)",
    description="Predict scheme eligibility for a user profile. No authentication required. Returns ranked schemes by eligibility probability."
)
def predict_schemes(
    user_profile: UserProfileForML
) -> RecommendationsResponse:
    """
    Predict scheme eligibility based on user profile and built-in scheme definitions.
    
    This is a simplified public API endpoint that doesn't require authentication.
    It uses hardcoded common Indian government schemes for demonstration.
    
    **Request Body:**
    ```json
    {
        "age": 28,
        "income": 250000,
        "gender": "Female",
        "category": "General"
    }
    ```
    
    **Response Example:**
    ```json
    {
        "user": {
            "age": 28,
            "income": 250000,
            "gender": "Female",
            "category": "General"
        },
        "recommended_schemes": [
            {
                "scheme_id": 1,
                "scheme_name": "Pradhan Mantri Sthaniya Kshetra Aajeevika Yojana",
                "eligible": true,
                "probability": 0.92
            }
        ],
        "total_schemes": 8,
        "total_eligible": 5
    }
    ```
    
    Args:
        user_profile: User's demographic and economic profile
        
    Returns:
        RecommendationsResponse: Ranked list of eligible schemes
        
    Raises:
        HTTPException: If ML service is not available
    """
    try:
        # Get ML service
        ml_service = get_ml_service()
        
        # Hardcoded example schemes for demo (in production, fetch from DB)
        example_schemes = [
            {
                'scheme_id': 1,
                'scheme_name': 'Pradhan Mantri Sthaniya Kshetra Aajeevika Yojana',
                'scheme_min_age': 18,
                'scheme_max_age': 65,
                'scheme_income_limit': 300000,
                'scheme_category': 'General'
            },
            {
                'scheme_id': 2,
                'scheme_name': 'Pradhan Mantri Kaushal Vikas Yojana',
                'scheme_min_age': 15,
                'scheme_max_age': 45,
                'scheme_income_limit': 400000,
                'scheme_category': 'General'
            },
            {
                'scheme_id': 3,
                'scheme_name': 'Pradhan Mantri Jan Dhan Yojana',
                'scheme_min_age': 18,
                'scheme_max_age': 100,
                'scheme_income_limit': 500000,
                'scheme_category': 'General'
            },
        ]
        
        # Get predictions from ML model
        predictions = ml_service.predict_batch(user_profile.dict(), example_schemes)
        
        # Sort by probability (highest first)
        predictions.sort(key=lambda x: x.probability, reverse=True)
        
        # Count eligible schemes
        eligible_count = sum(1 for p in predictions if p.eligible)
        
        return RecommendationsResponse(
            user=user_profile,
            recommended_schemes=predictions,
            total_schemes=len(predictions),
            total_eligible=eligible_count
        )
        
    except MLServiceException as e:
        logger.error(f"ML prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML service not available: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in predict_schemes: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed due to internal error"
        )
