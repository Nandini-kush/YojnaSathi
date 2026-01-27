"""
Routes package for YojnaSathi API
"""

from . import (
    auth,
    schemes,
    admin_auth,
    admin_schemes,
    user_profile,
    eligibility,
    eligibility_history,
    user_schemes,
    ml_recommend,
)

__all__ = [
    "auth",
    "schemes",
    "admin_auth",
    "admin_schemes",
    "user_profile",
    "eligibility",
    "eligibility_history",
    "user_schemes",
    "ml_recommend",
]
