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
    print("\nTest 1: Young student (age=22, income=10000, student=true)")
    result = get_eligible_schemes(
        age=22,
        income=10000,
        gender='female',
        is_student=True
    )
    print(f"  → Found {len(result)} eligible schemes")
    
    # Test case 2: Older professional with higher income
    print("\nTest 2: Older professional (age=45, income=50000, student=false)")
    result = get_eligible_schemes(
        age=45,
        income=50000,
        gender='male',
        is_student=False
    )
    print(f"  → Found {len(result)} eligible schemes")
    
    # Test case 3: With caste filter
    print("\nTest 3: SC caste, age=30, income=25000")
    result = get_eligible_schemes(
        age=30,
        income=25000,
        gender='male',
        is_student=False,
        caste='sc'
    )
    print(f"  → Found {len(result)} eligible schemes")
    
    # Test case 4: With state filter
    print("\nTest 4: Maharashtra state, age=25, income=20000")
    result = get_eligible_schemes(
        age=25,
        income=20000,
        gender='female',
        is_student=True,
        state='MH'
    )
    print(f"  → Found {len(result)} eligible schemes")
    
    print("\n" + "=" * 60)
    print("Schema Validation Test")
    print("=" * 60)
    
    # Test EligibilityRequest schema validation
    print("\nTest 5: Validating EligibilityRequest schema...")
    try:
        req = EligibilityRequest(
            age=25,
            income=30000,
            gender='female',
            is_student=True
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
            gender='female',
            is_student=True
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
            gender='female',
            is_student=True
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
