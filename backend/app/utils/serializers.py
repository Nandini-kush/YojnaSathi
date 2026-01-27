from ..db.models import Scheme

def scheme_to_dict(scheme):
    return {
        "id": scheme.id,
        "scheme_name": scheme.scheme_name,
        "min_age": scheme.min_age,
        "max_age": scheme.max_age,
        "max_income": scheme.max_income,
        "category": scheme.category,
        "state": scheme.state,
    }


