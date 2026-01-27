from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db.database import get_db
from ..db.models import User, Scheme, EligibilityHistory
from ..utils.auth import get_current_admin
from ..utils.serializers import scheme_to_dict

router = APIRouter(
    prefix="/admin",
    tags=["Admin - Stats"]
)


@router.get("/stats")
def get_admin_stats(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for admin"""
    try:
        total_users = db.query(User).count()
        total_schemes = db.query(Scheme).count()
        active_schemes = db.query(Scheme).filter(Scheme.is_active == True).count()
        total_eligibility_checks = db.query(EligibilityHistory).count()
        
        # Calculate unique categories
        unique_categories = db.query(Scheme.category).distinct().count()
        
        return {
            "total_users": total_users,
            "total_schemes": total_schemes,
            "active_schemes": active_schemes,
            "total_eligibility_checks": total_eligibility_checks,
            "unique_categories": unique_categories,
            "growth_percentage": 12  # Placeholder - can be enhanced with date-based calculation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")


@router.get("/users")
def get_recent_users(
    limit: int = 10,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get recent users"""
    try:
        users = db.query(User).order_by(desc(User.created_at)).limit(limit).all()
        return [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/eligibility-checks")
def get_recent_eligibility_checks(
    limit: int = 10,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get recent eligibility checks"""
    try:
        checks = db.query(EligibilityHistory).order_by(desc(EligibilityHistory.created_at)).limit(limit).all()
        
        result = []
        for check in checks:
            user = db.query(User).filter(User.id == check.user_id).first()
            result.append({
                "id": check.id,
                "user_id": check.user_id,
                "user_name": user.name if user else "Unknown",
                "age": check.age,
                "income": check.income,
                "gender": check.gender,
                "is_student": check.is_student,
                "eligible_count": check.eligible_count,
                "created_at": check.created_at.isoformat() if check.created_at else None
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching eligibility checks: {str(e)}")


@router.get("/schemes")
def get_all_schemes(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all schemes for admin dashboard"""
    try:
        schemes = db.query(Scheme).order_by(desc(Scheme.created_at)).all()
        return [scheme_to_dict(scheme) for scheme in schemes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching schemes: {str(e)}")
