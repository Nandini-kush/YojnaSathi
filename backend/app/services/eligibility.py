# ✅ Compatibility alias
# Real implementation is in eligibility_service.py
# This file provides the same imports for backwards compatibility

from ..services.eligibility_service import (
    get_eligible_schemes,
    load_schemes,
    get_eligible_schemes_for_user
)

__all__ = ["get_eligible_schemes", "load_schemes", "get_eligible_schemes_for_user"]
