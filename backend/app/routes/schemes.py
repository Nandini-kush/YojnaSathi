from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, List
from sqlalchemy.orm import Session
import logging

from ..services.eligibility_service import load_schemes, get_eligible_schemes_for_user
from ..utils.serializers import scheme_to_dict
from ..db.database import get_db
from ..db.models import Scheme, User
from ..utils.auth import get_current_user
from pydantic import BaseModel
from ..schemas.eligibility import EligibilityCheckRequest
from fastapi import Body


logger = logging.getLogger(__name__)

# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class SchemeDetailResponse(BaseModel):
    """Response for /schemes/{id} endpoint"""
    success: bool
    scheme: Optional[dict] = None
    error: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "scheme": {
                    "id": 1,
                    "scheme_name": "PM Kisan",
                    "min_age": 18,
                    "max_age": 65,
                    "max_income": 500000,
                    "category": "All",
                    "state": "All India"
                },
                "error": None
            }
        }


class AllSchemesResponse(BaseModel):
    """Response for GET /schemes"""
    success: bool
    schemes: List[dict] = []
    total_schemes: int = 0
    error: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "schemes": [],
                "total_schemes": 0,
                "error": None
            }
        }


class EligibleSchemesResponse(BaseModel):
    """Response for GET /schemes/eligible"""
    success: bool
    count: int = 0
    schemes: List[dict] = []

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "count": 2,
                "schemes": [
                    {"id": 1, "scheme_name": "PM Kisan", "score": 50},
                    {"id": 2, "scheme_name": "Ayushman Bharat", "score": 40}
                ]
            }
        }


router = APIRouter(
    prefix="/schemes",
    tags=["Schemes"]
)


# ============================================================================
# GET: All Schemes
# ============================================================================
@router.get(
    "/",
    summary="Get all active schemes",
    description="List all active government schemes",
    response_model=AllSchemesResponse,
    responses={
        200: {"description": "Schemes retrieved successfully"},
        500: {"description": "Server error"},
    }
)
def get_all_schemes(db: Session = Depends(get_db)):
    """
    Get all active government schemes.
    
    **Response Format:**
    ```json
    {
        "success": true,
        "schemes": [{...}, {...}],
        "total_schemes": 10,
        "error": null
    }
    ```
    
    Always returns a valid JSON response (never null).
    """
    try:
        logger.info("Fetching all active schemes")
        
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()

        if not schemes:
            logger.warning("No active schemes found in database")
            return AllSchemesResponse(
                success=True,
                schemes=[],
                total_schemes=0,
                error=None
            )

        # Convert all schemes to dictionaries
        schemes_list = [scheme_to_dict(s) for s in schemes]
        logger.info(f"Successfully fetched {len(schemes_list)} active schemes")
        
        return AllSchemesResponse(
            success=True,
            schemes=schemes_list,
            total_schemes=len(schemes_list),
            error=None
        )
    
    except Exception as e:
        logger.error(f"Error fetching all schemes: {e}", exc_info=True)
        return AllSchemesResponse(
            success=False,
            schemes=[],
            total_schemes=0,
            error=f"Failed to fetch schemes: {str(e)}"
        )


# ============================================================================
# GET: Eligible Schemes (Database Filtering Only - No ML)
# ============================================================================
@router.get(
    "/eligible",
    summary="Get eligible schemes for logged-in user",
    response_model=EligibleSchemesResponse
)
def get_eligible_schemes_endpoint(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> EligibleSchemesResponse:

    try:
        logger.info(f"Fetching eligible schemes for user {current_user.id}")

        schemes_list = get_eligible_schemes_for_user(
            db=db,
            user=current_user
        )

        # return a consistent structured response for frontend
        return EligibleSchemesResponse(
            success=True,
            count=len(schemes_list),
            schemes=schemes_list,
        )

    except Exception as e:
        logger.error(
            f"Error fetching eligible schemes for user {current_user.id}: {e}",
            exc_info=True
        )

        return EligibleSchemesResponse(
            success=False,
            count=0,
            schemes=[],
        )


# ============================================================================
# POST: Check Eligibility & Get Recommendations
# ============================================================================
@router.post(
    "/check-eligibility",
    summary="Check eligibility, update user profile, and return ranked schemes",
)
def check_eligibility(
    payload: EligibilityCheckRequest = Body(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the authenticated user's profile with the provided eligibility data,
    commit the changes, then return ranked eligible schemes.
    """
    try:
        # Explicit validation to return HTTP 400 on bad input
        if payload.age is None or payload.age <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid age")
        if payload.income is None or payload.income < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid income")

        # Load the user using the current DB session to update
        user_in_db: User = db.query(User).filter(User.id == current_user.id).first()
        if not user_in_db:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authenticated user not found")

        # Update user profile fields
        user_in_db.age = int(payload.age)
        user_in_db.income = float(payload.income)
        user_in_db.gender = payload.gender
        user_in_db.caste = payload.caste
        user_in_db.state = payload.state

        db.add(user_in_db)
        db.commit()
        db.refresh(user_in_db)

        # Fetch eligible schemes using updated profile
        recommended = get_eligible_schemes_for_user(db=db, user=user_in_db)

        response = {
            "success": True,
            "message": "Eligibility checked successfully",
            "user_profile": {
                "age": user_in_db.age,
                "income": user_in_db.income,
                "gender": user_in_db.gender,
                "caste": user_in_db.caste,
                "state": user_in_db.state,
            },
            "recommended_schemes": recommended or []
        }

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in check_eligibility: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to check eligibility")


# ============================================================================
# GET: Scheme by ID  
# ============================================================================
@router.get(
    "/{scheme_id}",
    summary="Get scheme details by ID",
    description="Retrieve full details of a specific scheme dynamically",
    response_model=SchemeDetailResponse,
    responses={
        200: {"description": "Scheme details retrieved successfully"},
        404: {"description": "Scheme not found"},
        500: {"description": "Server error"},
    }
)
def get_scheme_detail(
    scheme_id: int,
    db: Session = Depends(get_db)
) -> SchemeDetailResponse:
    """
    Get full scheme details by ID - returns ALL columns dynamically.
    
    This endpoint returns all scheme fields without hardcoding, so new database
    columns are automatically included in responses.
    
    **Response Format (Always valid JSON):**
    ```json
    {
        "success": true,
        "scheme": {
            "id": 1,
            "scheme_name": "PM Kisan",
            "min_age": 18,
            "max_age": 65,
            "max_income": 500000,
            ...all other columns
        },
        "error": null
    }
    ```
    
    **Error Response (Still valid JSON):**
    ```json
    {
        "success": false,
        "scheme": null,
        "error": "Scheme with ID 999 not found"
    }
    ```
    
    **Important:** This endpoint NEVER returns `None` as the response body.
    Even on error, it returns a valid dictionary with `success: false`.
    """
    try:
        logger.info(f"Fetching scheme details for ID: {scheme_id}")
        
        # Query scheme by primary key
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        
        if not scheme:
            logger.warning(f"Scheme with ID {scheme_id} not found")
            return SchemeDetailResponse(
                success=False,
                scheme=None,
                error=f"Scheme with ID {scheme_id} not found"
            )
        
        # Convert to dictionary - returns ALL columns dynamically
        scheme_dict = scheme_to_dict(scheme)
        logger.info(f"Successfully fetched scheme {scheme_id}: {scheme.scheme_name}")
        
        return SchemeDetailResponse(
            success=True,
            scheme=scheme_dict,
            error=None
        )
    
    except ValueError as e:
        logger.error(f"Invalid scheme ID format: {scheme_id}, error: {e}", exc_info=True)
        return SchemeDetailResponse(
            success=False,
            scheme=None,
            error=f"Invalid scheme ID format: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching scheme {scheme_id}: {e}", exc_info=True)
        return SchemeDetailResponse(
            success=False,
            scheme=None,
            error=f"Failed to fetch scheme: {str(e)}"
        )
