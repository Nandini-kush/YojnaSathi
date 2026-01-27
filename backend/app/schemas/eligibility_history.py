"""Pydantic schemas for eligibility history"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class EligibilityHistoryEntry(BaseModel):
    """Schema for a single eligibility history record"""
    id: int = Field(..., description="History record ID")
    user_id: int = Field(..., description="User ID")
    age: int = Field(..., description="Age checked during this eligibility check")
    income: float = Field(..., description="Income checked during this eligibility check")
    gender: Optional[str] = Field(None, description="Gender from the check")
    is_student: Optional[bool] = Field(None, description="Student status from the check")
    eligible_count: int = Field(..., description="Number of schemes user was eligible for")
    created_at: datetime = Field(..., description="Timestamp of the eligibility check")

    class Config:
        from_attributes = True


class EligibilityHistoryResponse(BaseModel):
    """Response containing user's eligibility history"""
    user_id: int = Field(..., description="User ID")
    total_checks: int = Field(..., description="Total number of eligibility checks")
    history: List[EligibilityHistoryEntry] = Field(
        default_factory=list,
        description="List of eligibility checks"
    )

    class Config:
        from_attributes = True


class EligibilityHistorySummary(BaseModel):
    """Summary of user's eligibility checks"""
    user_id: int
    total_checks: int
    last_check_date: Optional[datetime]
    average_eligible_schemes: float
