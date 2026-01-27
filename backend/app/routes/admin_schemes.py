from fastapi import APIRouter, HTTPException, Depends
from ..schemas.admin_scheme import SchemeCreate, SchemeUpdate
from ..utils.serializers import scheme_to_dict
from ..services.admin_schemes import (
    create_scheme,
    update_scheme,
    delete_scheme
)
from ..utils.auth import get_current_admin

router = APIRouter(
    prefix="/admin/schemes",
    tags=["Admin - Schemes"]
)

# CREATE
@router.post("/")
def add_scheme(
    data: SchemeCreate,
    admin=Depends(get_current_admin)
):
    scheme = create_scheme(data.model_dump())
    return scheme_to_dict(scheme)

# UPDATE
@router.put("/{scheme_id}")
def update_scheme_api(
    scheme_id: int,
    data: SchemeUpdate,
    admin=Depends(get_current_admin)
):
    scheme = update_scheme(
        scheme_id,
        data.model_dump(exclude_unset=True)
    )

    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    return scheme_to_dict(scheme)

# DELETE
@router.delete("/{scheme_id}")
def delete_scheme_api(
    scheme_id: int,
    admin=Depends(get_current_admin)
):
    success = delete_scheme(scheme_id)

    if not success:
        raise HTTPException(status_code=404, detail="Scheme not found")

    return {"message": "Scheme deleted successfully"}
