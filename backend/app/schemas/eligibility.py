from pydantic import BaseModel, Field
from typing import List, Optional
from ..schemas.scheme import SchemeResponse


class EligibilityRequest(BaseModel):
    """
    This model defines what information we need from the user
    to check their eligibility for government schemes.
    """
    age: int = Field(
        ...,
        ge=0,
        le=120,
        description="User's age in years",
        example=25
    )
    income: float = Field(
        ...,
        ge=0,
        description="Monthly income in Indian Rupees",
        example=25000.0
    )
    gender: str = Field(
        ...,
        description="Gender: 'male', 'female', or 'other'",
        example="male"
    )


class EligibilityCheckRequest(BaseModel):
    age: int = Field(..., description="User's age in years", example=25)
    income: float = Field(..., description="Annual income in Indian Rupees", example=250000.0)
    gender: str = Field(..., description="Gender: 'male', 'female', or 'other'", example='male')
    caste: str = Field(..., description="Caste category: 'sc','st','obc','general'", example='general')
    state: str = Field(..., description="State name or code", example='Maharashtra')


class SchemeEligibilityReason(BaseModel):
    """
    This model explains WHY a user is eligible for a scheme.
    """
    reason: str = Field(
        ...,
        description="Explanation of why the user is eligible",
        example="You are eligible because your age is below 30 and you are a student"
    )


class EligibleScheme(BaseModel):
    """
    This model represents a government scheme that the user is eligible for.
    """
    scheme_id: str = Field(
        ...,
        description="Unique identifier for the scheme",
        example="SCHEME_001"
    )
    scheme_name: str = Field(
        ...,
        description="Name of the government scheme",
        example="Student Scholarship Scheme"
    )
    description: str = Field(
        ...,
        description="Brief description of what the scheme offers",
        example="Financial assistance for students pursuing higher education"
    )
    eligibility_reason: SchemeEligibilityReason = Field(
        ...,
        description="Why the user is eligible for this scheme"
    )


class EligibilityResponse(BaseModel):
    input: dict = Field(..., description="Input data used for eligibility check")
    eligible_count: int = Field(..., description="Number of eligible schemes")
    eligible_schemes: List[dict] = Field(..., description="List of eligible scheme objects")
    message: str = Field(..., description="Status message")
