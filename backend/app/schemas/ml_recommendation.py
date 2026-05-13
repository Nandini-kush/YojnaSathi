"""
Pydantic schemas for ML recommendation endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class UserProfileForML(BaseModel):
    """User profile data for rule-based scheme filtering."""
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
        description="Gender: 'Male', 'Female', etc.",
        example="Male"
    )
    category: str = Field(
        ...,
        description="Category: 'General', 'OBC', 'SC', or 'ST'",
        example="General"
    )
    state: Optional[str] = Field(
        default=None,
        description="State (optional)",
        example="Maharashtra"
    )


class SchemeForML(BaseModel):
    """Scheme data for ML prediction."""
    scheme_id: int
    scheme_name: str
    scheme_min_age: int
    scheme_max_age: int
    scheme_income_limit: float
    scheme_caste: str


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


class SchemeRecommendation(BaseModel):
    """Individual scheme recommendation in the response."""
    id: int
    name: str
    eligible: bool
    score: Optional[int] = Field(default=None, description="Ranking score")


class MLRecommendResponse(BaseModel):
    """ML recommendation endpoint response - always returns valid JSON."""
    success: bool = Field(..., description="Whether recommendation was successful")
    schemes: List[SchemeRecommendation] = Field(
        default_factory=list,
        description="List of eligible schemes, ranked by score (highest first)"
    )
    error: Optional[str] = Field(default=None, description="Error message if success=false")
    total_schemes: Optional[int] = Field(default=None, description="Total schemes checked")
    total_eligible: Optional[int] = Field(default=None, description="Total eligible schemes")
    message: Optional[str] = Field(default=None, description="Additional message or status")
