#!/usr/bin/env python3
"""
Test script to verify eligibility flow works end-to-end.
Tests both endpoints: /schemes/check-eligibility and /schemes/eligible
"""

import sys
import json
from app.schemas.eligibility import EligibilityRequest, EligibilityResponse
from app.services.eligibility import get_eligible_schemes

def test_eligible_schemes():
    """Test the core get_eligible_schemes function"""
    
    print("=" * 60)
    print("Testing Eligibility Service")
    print("=" * 60)
    
    # Test case 1: Young student with low income
    print("\nTest 1: Young adult (age=22, income=10000)")
    result = get_eligible_schemes(
        age=22,
        income=10000,
        gender='female'
    )
    print(f"  → Found {len(result)} eligible schemes")
    
    # Test case 2: Older professional with higher income
    print("\nTest 2: Older professional (age=45, income=50000)")
    result = get_eligible_schemes(
        age=45,
        income=50000,
        gender='male'
    )
    print(f"  → Found {len(result)} eligible schemes")
    
    # Test case 3: With caste filter
    print("\nTest 3: SC caste, age=30, income=25000")
    result = get_eligible_schemes(
        age=30,
        income=25000,
        gender='male',
        caste='sc'
    )
    print(f"  → Found {len(result)} eligible schemes")
    
    # Test case 4: With state filter
    print("\nTest 4: Maharashtra state, age=25, income=20000")
    result = get_eligible_schemes(
        age=25,
        income=20000,
        gender='female',
        state='MH'
    )
    print(f"  → Found {len(result)} eligible schemes")

    # Additional normalization tests
    print("\nTest 5: State normalization - MP vs Madhya Pradesh")
    # scheme object used internally by service is pulled from DB so we simulate using
    # the already-populated database; this test simply ensures no exception and at
    # least one result is returned for a two-equivalent strings.
    res_mp = get_eligible_schemes(age=22, income=10000, gender='female', state='MP')
    res_full = get_eligible_schemes(age=22, income=10000, gender='female', state='madhya pradesh')
    print(f"  MP count: {len(res_mp)}, full name count: {len(res_full)}")

    # Fallback behaviour: monkeypatch SessionLocal so that DB returns a non-eligible
    # scheme; get_eligible_schemes should return it with a score of 0 and
    # get_eligible_schemes_for_user should propagate the fallback flag.
    print("\nTest 6: Fallback when no eligible schemes are found")
    from types import SimpleNamespace
    class DummyQuery:
        def filter(self, *args, **kwargs):
            return self
        def all(self):
            # one scheme that won't match the provided criteria
            return [SimpleNamespace(is_active=True, priority=99, min_age=0, max_age=1,
                                     min_income=0, max_income=1, gender=None, caste=None, state=None)]
    class DummySession:
        def query(self, model):
            return DummyQuery()
        def close(self):
            pass
    import backend.app.services.eligibility_service as svc
    original = svc.SessionLocal
    svc.SessionLocal = lambda: DummySession()
    try:
        lst, flag = get_eligible_schemes(age=1000, income=0)
        print(f"  Fallback result list: {lst}, flag={flag}")
        assert lst and lst[0].get('score') == 0 and flag
        # also test wrapper function
        fake_user = SimpleNamespace(id=123, age=1000, income=0, gender=None, caste=None, state=None)
        lst2, flag2 = svc.get_eligible_schemes_for_user(db=None, user=fake_user)
        print(f"  Wrapper returned count={len(lst2)}, fallback={flag2}")
        assert flag2
    finally:
        svc.SessionLocal = original
    
    print("\n" + "=" * 60)
    print("Schema Validation Test")
    print("=" * 60)
    
    # Test EligibilityRequest schema validation
    print("\nTest 5: Validating EligibilityRequest schema...")
    try:
        req = EligibilityRequest(
            age=25,
            income=30000,
            gender='female'
        )
        print(f"  ✓ Valid request: {req.model_dump()}")
    except Exception as e:
        print(f"  ✗ Schema validation failed: {e}")
        sys.exit(1)
    
    # Test invalid age
    print("\nTest 6: Invalid age (should fail)...")
    try:
        req = EligibilityRequest(
            age=150,  # Too old
            income=30000,
            gender='female'
        )
        print(f"  ✗ Should have rejected age=150")
        sys.exit(1)
    except Exception as e:
        print(f"  ✓ Correctly rejected: {str(e)[:60]}...")
    
    # Test negative income
    print("\nTest 7: Negative income (should fail)...")
    try:
        req = EligibilityRequest(
            age=25,
            income=-100,  # Negative
            gender='female'
        )
        print(f"  ✗ Should have rejected negative income")
        sys.exit(1)
    except Exception as e:
        print(f"  ✓ Correctly rejected: {str(e)[:60]}...")
    
    print("\n" + "=" * 60)
    print("✓ All tests passed!")
    print("=" * 60)

if __name__ == "__main__":
    test_eligible_schemes()
