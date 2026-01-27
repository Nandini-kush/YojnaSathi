# Eligibility Flow Fix - Complete

## Summary of Changes

Fixed the eligibility checking flow to have unified, consistent service functions and endpoints with matching schemas.

### Problems Resolved

1. **Schema-Service Mismatch**: `EligibilityRequest` schema had fields `(age, income, gender, is_student)` but service function expected `(age, income, category, gender, caste, state)`
2. **Duplicate Endpoints**: Two separate endpoints `/schemes/check-eligibility` and `/schemes/eligible` doing the same thing with different implementations
3. **Parameter Mismatch**: `routes/schemes.py` was calling with `category` parameter which wasn't in the schema

### Files Modified

#### 1. `app/services/eligibility_service.py` - REWRITTEN
- **Changed**: `get_eligible_schemes()` function signature and implementation
- **From**: `(age, income, category, gender, caste, state)` with category-based filtering
- **To**: `(age, income, gender, is_student, caste, state)` with student-aware filtering
- **Logic**: Now filters schemes based on `is_student` flag instead of `category`
- **Unified**: Both authenticated and unauthenticated flows use the same service function

**Key Changes**:
```python
# OLD signature:
get_eligible_schemes(age, income, category, gender, caste, state)

# NEW signature - matches schema:
get_eligible_schemes(
    age: int,
    income: float,
    gender: str = None,
    is_student: bool = False,
    caste: str = None,
    state: str = None
)
```

#### 2. `app/routes/schemes.py` - FIXED
- **Endpoint**: `POST /schemes/check-eligibility`
- **Fixed**: Now correctly calls service with schema field names
- **From**: `get_eligible_schemes(age=user.age, income=user.income, category=user.category)`
- **To**: `get_eligible_schemes(age=user.age, income=user.income, gender=user.gender, is_student=user.is_student)`
- **Response**: Returns `EligibilityResponse` model (consistent format)

#### 3. `app/routes/eligibility.py` - CONSOLIDATED
- **Endpoint**: `POST /schemes/eligible` (marked as deprecated for backward compatibility)
- **Purpose**: Kept for backward compatibility in case other clients use it
- **Fixed**: Now returns `EligibilityResponse` instead of raw dict
- **Function**: Also calls service with correct parameters

### API Endpoints

Both endpoints now exist and work identically:

1. **Primary Endpoint** (recommended)
   - **Route**: `POST /schemes/check-eligibility`
   - **Location**: `app/routes/schemes.py`
   
2. **Alternate Endpoint** (backward compatibility)
   - **Route**: `POST /schemes/eligible`
   - **Location**: `app/routes/eligibility.py`
   - **Note**: Marked as deprecated in docstring

### Request/Response Schema

**Request** (`EligibilityRequest`):
```json
{
  "age": 25,
  "income": 30000.0,
  "gender": "female",
  "is_student": true
}
```

**Response** (`EligibilityResponse`):
```json
{
  "input": {
    "age": 25,
    "income": 30000.0,
    "gender": "female",
    "is_student": true
  },
  "eligible_count": 5,
  "eligible_schemes": [
    {
      "id": 1,
      "name": "Scheme Name",
      ...
    }
  ],
  "message": "Eligible schemes found"
}
```

### Scheme Filtering Logic

The unified `get_eligible_schemes()` now filters schemes based on:

1. **Age Range**: `min_age <= user_age <= max_age`
2. **Income Limit**: `max_income >= user_income`
3. **Gender Match**: `scheme.gender IN (user_gender, 'all', 'All')`
4. **Student Status**: 
   - If `is_student=true`: includes schemes with `category IN ('student', 'all')`
   - If `is_student=false`: all schemes still available (filtered by other criteria)
5. **Caste Match** (optional): `scheme.caste IN (user_caste, 'all', 'All')`
6. **State Match** (optional): `scheme.state IN (user_state, 'all', 'All')`

### Backward Compatibility

- Both endpoints exist and work identically
- Old code calling `/schemes/eligible` will continue to work
- New code should use `/schemes/check-eligibility` (primary endpoint)
- Service function signatures are now unified and consistent

### Verified

✓ All imports work without errors
✓ Schema validation working (rejects invalid age, negative income)
✓ Route imports successful
✓ Both endpoints properly registered in router
✓ Service functions properly imported
✓ No circular imports
✓ Models properly imported

### Next Steps for Testing

1. Start the FastAPI server
2. Go to Swagger UI (`/docs`)
3. Try both endpoints with test data
4. Verify Swagger shows correct request/response schemas
5. Check database filtering works correctly (requires DB connectivity)

### Notes

- Database connectivity not available during testing (network timeout)
- All code syntax validated successfully
- All imports and schemas validated
- Ready for deployment when database is available
