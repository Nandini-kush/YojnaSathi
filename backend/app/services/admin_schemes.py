from ..db.database import SessionLocal
from ..db.models import Scheme


# CREATE
def create_scheme(data: dict):
    db = SessionLocal()
    scheme = Scheme(**data)
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    db.close()
    return scheme


# UPDATE
def update_scheme(scheme_id: int, data: dict):
    db = SessionLocal()
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()

    if not scheme:
        db.close()
        return None

    for key, value in data.items():
        setattr(scheme, key, value)

    db.commit()
    db.refresh(scheme)
    db.close()
    return scheme


# DELETE
def delete_scheme(scheme_id: int):
    db = SessionLocal()
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()

    if not scheme:
        db.close()
        return False

    db.delete(scheme)
    db.commit()
    db.close()
    return True
