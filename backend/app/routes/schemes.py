from fastapi import APIRouter, HTTPException
from typing import Optional, List

from ..services.eligibility import load_schemes
from ..utils.serializers import scheme_to_dict


router = APIRouter(
    prefix="/schemes",
    tags=["Schemes"]
)


# -------------------------
# GET: All Schemes
# -------------------------
@router.get(
    "/",
    summary="Get all active schemes",
    description="List all active government schemes"
)
def get_all_schemes():
    """Get all active government schemes"""
    schemes = load_schemes()

    if not schemes:
        raise HTTPException(status_code=404, detail="No schemes found")

    return {
        "total_schemes": len(schemes),
        "schemes": [scheme_to_dict(s) for s in schemes]
    }
