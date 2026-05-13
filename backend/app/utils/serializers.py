from ..db.models import Scheme


def scheme_to_dict(scheme):
    """
    Convert Scheme model to dictionary with ALL columns.
    
    Dynamically extracts all attributes from the scheme object without hardcoding fields.
    This ensures new columns added to the database are automatically included.
    
    Returns all non-private attributes (not starting with _).
    """
    if not scheme:
        return None
    
    # Get all columns from the SQLAlchemy model
    result = {}
    
    # Use SQLAlchemy's inspection to get all columns
    if hasattr(scheme, '__table__'):
        for column in scheme.__table__.columns:
            col_name = column.name
            value = getattr(scheme, col_name, None)
            # Convert non-serializable types if needed
            result[col_name] = value
    else:
        # Fallback: get all non-private attributes
        for key, value in vars(scheme).items():
            if not key.startswith('_'):
                result[key] = value
    
    return result


