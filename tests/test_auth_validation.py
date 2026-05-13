#!/usr/bin/env python3
"""
Complete authentication flow validation.
Tests all critical auth paths.
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

TEST_USER = {
    "name": "Validation User",
    "email": f"validate{int(time.time())}@test.com",
    "password": "SecurePass123!"
}

print("\n" + "="*70)
print("✅ COMPREHENSIVE AUTHENTICATION FLOW VALIDATION")
print("="*70)

tests_passed = 0
tests_failed = 0

# ============================
# 1. REGISTER USER
# ============================
print("\n[1/6] Register new user...")
try:
    resp = requests.post(
        f"{BASE_URL}/auth/register",
        json=TEST_USER
    )
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
    data = resp.json()
    assert "user_id" in data
    assert data["email"] == TEST_USER["email"]
    print("     ✅ Registration successful")
    print(f"     User ID: {data['user_id']}")
    tests_passed += 1
except Exception as e:
    print(f"     ❌ Registration failed: {e}")
    tests_failed += 1
    exit(1)

# ============================
# 2. LOGIN USER
# ============================
print("\n[2/6] Login and get JWT token...")
try:
    resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
    )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    token = data["access_token"]
    assert token, "No token returned"
    print("     ✅ Login successful")
    print(f"     Token: {token[:60]}...")
    tests_passed += 1
except Exception as e:
    print(f"     ❌ Login failed: {e}")
    tests_failed += 1
    exit(1)

# ============================
# 3. USER PROFILE (GET /user/me)
# ============================
headers = {"Authorization": f"Bearer {token}"}
print("\n[3/6] GET /user/me - Current user profile...")
try:
    resp = requests.get(f"{BASE_URL}/user/me", headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data["email"] == TEST_USER["email"]
    print("     ✅ /user/me working correctly")
    print(f"     User: {data['name']} ({data['email']})")
    tests_passed += 1
except Exception as e:
    print(f"     ❌ /user/me failed: {e}")
    tests_failed += 1

# ============================
# 4. USER PROFILE (GET /user/profile)
# ============================
print("\n[4/6] GET /user/profile - Profile endpoint...")
try:
    resp = requests.get(f"{BASE_URL}/user/profile", headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data["email"] == TEST_USER["email"]
    print("     ✅ /user/profile working correctly")
    tests_passed += 1
except Exception as e:
    print(f"     ❌ /user/profile failed: {e}")
    tests_failed += 1

# ============================
# 5. ELIGIBILITY HISTORY
# ============================
print("\n[5/6] GET /user/eligibility-history - History endpoint...")
try:
    resp = requests.get(f"{BASE_URL}/user/eligibility-history", headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert "user_id" in data
    print("     ✅ /user/eligibility-history working correctly")
    print(f"     History records: {data.get('total_checks', 0)}")
    tests_passed += 1
except Exception as e:
    print(f"     ❌ /user/eligibility-history failed: {e}")
    tests_failed += 1

# ============================
# 6. CHECK ELIGIBILITY
# ============================
print("\n[6/6] POST /schemes/check-eligibility - Protected endpoint...")
try:
    resp = requests.post(
        f"{BASE_URL}/schemes/check-eligibility",
        headers=headers,
        json={
            "age": 30,
            "income": 750000,
            "gender": "F"
        }
    )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert "eligible_schemes" in data
    print("     ✅ /schemes/check-eligibility working correctly")
    print(f"     Eligible schemes: {data.get('eligible_count', 0)}")
    tests_passed += 1
except Exception as e:
    print(f"     ❌ /schemes/check-eligibility failed: {e}")
    tests_failed += 1

# ============================
# SECURITY CHECK: No token should fail
# ============================
print("\n[SECURITY] GET /user/me without token (should 401)...")
try:
    resp = requests.get(f"{BASE_URL}/user/me")
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    print("     ✅ Correctly rejects request without authentication")
    tests_passed += 1
except Exception as e:
    print(f"     ❌ Security check failed: {e}")
    tests_failed += 1

# ============================
# SUMMARY
# ============================
print("\n" + "="*70)
print(f"RESULTS: {tests_passed} passed, {tests_failed} failed")
if tests_failed == 0:
    print("✅ ALL TESTS PASSED - AUTHENTICATION FULLY FUNCTIONAL")
else:
    print(f"❌ {tests_failed} tests failed")
print("="*70 + "\n")

exit(0 if tests_failed == 0 else 1)
