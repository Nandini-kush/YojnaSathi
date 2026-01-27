"""
Pydantic schemas for ML recommendation endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class UserProfileForML(BaseModel):
    """User profile data for ML prediction."""
    age: int = Field(
        ...,
        ge=18,
        le=120,
        description="User's age in years",
        example=28
    )
    income: float = Field(
        ...,
        ge=0,
        description="Annual income in Indian Rupees",
        example=250000
    )
    gender: str = Field(
        ...,
        description="Gender: 'Male' or 'Female'",
        example="Female"
    )
    category: str = Field(
        ...,
        description="Category: 'General', 'OBC', 'SC', or 'ST'",
        example="General"
    )


class SchemeForML(BaseModel):
    """Scheme data for ML prediction."""
    scheme_id: int
    scheme_name: str
    scheme_min_age: int
    scheme_max_age: int
    scheme_income_limit: float
    scheme_category: str


class RecommendationResult(BaseModel):
    """Single scheme recommendation result."""
    scheme_id: int
    scheme_name: str
    eligible: bool = Field(..., description="Whether user is eligible")
    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Eligibility probability (0-1)"
    )


class RecommendationsResponse(BaseModel):
    """Complete recommendations response."""
    user: UserProfileForML
    recommended_schemes: List[RecommendationResult] = Field(
        ...,
        description="Schemes ranked by eligibility probability (highest first)"
    )
    total_schemes: int = Field(
        ...,
        description="Total number of schemes returned"
    )
    total_eligible: int = Field(
        ...,
        description="Number of eligible schemes"
    )


class EligibilityCheckRequest(BaseModel):
    """Request to check eligibility for a single scheme."""
    user: UserProfileForML
    scheme: SchemeForML


class EligibilityCheckResponse(BaseModel):
    """Response for single scheme eligibility check."""
    scheme_id: int
    scheme_name: str
    eligible: bool
    probability: float
    top_contributing_features: List[dict] = Field(
        default_factory=list,
        description="Top 5 ML features contributing to prediction"
    )
