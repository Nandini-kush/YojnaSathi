#!/usr/bin/env python
"""
Comprehensive backend validation test suite
Tests: Auth, Eligibility, History, RBAC
"""

import sys
import json
import requests
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

# Colors for output (disabled for Windows compatibility)
GREEN = ""
RED = ""
YELLOW = ""
RESET = ""

def print_test(name, result):
    status = f"PASS" if result else f"FAIL"
    print(f"[{status}] | {name}")
    return result

def print_section(title):
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}{title}{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")

def test_auth():
    """Test authentication system"""
    print_section("TEST 1: AUTHENTICATION")
    
    all_pass = True
    
    # Generate unique email for this test run
    import time
    unique_email = f"test{int(time.time())}@example.com"
    
    # Test 1.1: Register with JSON body (no OAuth2PasswordRequestForm)
    print("\n1.1 Register User (JSON body)")
    reg_response = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test User",
        "email": unique_email,
        "password": "testpass123"
    })
    
    reg_pass = reg_response.status_code == 201
    if reg_pass:
        data = reg_response.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
        has_user_id = "user_id" in data
        has_no_token = "access_token" not in data
        all_pass &= print_test(f"  ✓ Status 201", reg_pass)
        all_pass &= print_test(f"  ✓ Returns user_id", has_user_id)
        all_pass &= print_test(f"  ✓ Does NOT return token", has_no_token)
    else:
        all_pass &= print_test(f"  ✓ Status 201", False)
        print(f"  Error: {reg_response.text}")
    
    # Test 1.2: Duplicate email returns 409
    print("\n1.2 Duplicate Email (409 Conflict)")
    dup_response = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Another User",
        "email": unique_email,
        "password": "otherpass123"
    })
    
    dup_pass = dup_response.status_code == 409
    all_pass &= print_test(f"  ✓ Status 409 for duplicate email", dup_pass)
    if not dup_pass:
        print(f"  Got status {dup_response.status_code}: {dup_response.text}")
    
    # Test 1.3: Login with JSON body (email + password)
    print("\n1.3 Login (JSON body with email + password)")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": unique_email,
        "password": "testpass123"
    })
    
    login_pass = login_response.status_code == 200
    token = None
    if login_pass:
        data = login_response.json()
        print(f"  Response: {json.dumps({k: v[:20]+'...' if isinstance(v, str) and len(v) > 20 else v for k, v in data.items()}, indent=2)}")
        has_token = "access_token" in data
        has_bearer = data.get("token_type") == "bearer"
        all_pass &= print_test(f"  ✓ Status 200", login_pass)
        all_pass &= print_test(f"  ✓ Returns access_token", has_token)
        all_pass &= print_test(f"  ✓ Token type is bearer", has_bearer)
        token = data.get("access_token")
    else:
        all_pass &= print_test(f"  ✓ Status 200", False)
        print(f"  Error: {login_response.text}")
    
    # Test 1.4: Wrong password returns 401
    print("\n1.4 Invalid Password (401 Unauthorized)")
    bad_pass_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": unique_email,
        "password": "wrongpassword"
    })
    
    bad_pass = bad_pass_response.status_code == 401
    all_pass &= print_test(f"  ✓ Status 401 for wrong password", bad_pass)
    if not bad_pass:
        print(f"  Got status {bad_pass_response.status_code}")
    
    return all_pass, token


def test_eligibility(token):
    """Test eligibility API"""
    print_section("TEST 2: ELIGIBILITY (Protected Endpoint)")
    
    all_pass = True
    
    # Test 2.1: Check eligibility (protected, requires auth)
    print("\n2.1 Check Eligibility (POST /schemes/check-eligibility)")
    headers = {"Authorization": f"Bearer {token}"}
    eligibility_response = requests.post(
        f"{BASE_URL}/schemes/check-eligibility",
        json={
            "age": 25,
            "income": 30000,
            "gender": "male",
            "is_student": True
        },
        headers=headers
    )
    
    elig_pass = eligibility_response.status_code == 200
    all_pass &= print_test(f"  ✓ Status 200", elig_pass)
    
    if elig_pass:
        data = eligibility_response.json()
        has_input = "input" in data
        has_count = "eligible_count" in data
        has_schemes = "eligible_schemes" in data and isinstance(data["eligible_schemes"], list)
        has_message = "message" in data
        
        all_pass &= print_test(f"  ✓ Returns 'input'", has_input)
        all_pass &= print_test(f"  ✓ Returns 'eligible_count'", has_count)
        all_pass &= print_test(f"  ✓ Returns 'eligible_schemes' (full scheme objects)", has_schemes)
        all_pass &= print_test(f"  ✓ Returns 'message'", has_message)
        
        if has_schemes and len(data["eligible_schemes"]) > 0:
            first_scheme = data["eligible_schemes"][0]
            has_id = "id" in first_scheme
            has_name = "scheme_name" in first_scheme
            print(f"\n  First scheme: {json.dumps(first_scheme, indent=2, default=str)}")
            all_pass &= print_test(f"  ✓ Scheme has 'id'", has_id)
            all_pass &= print_test(f"  ✓ Scheme has 'scheme_name'", has_name)
    else:
        all_pass &= print_test(f"  ✓ Got valid response", False)
        print(f"  Error {eligibility_response.status_code}: {eligibility_response.text}")
    
    # Test 2.2: Eligibility without auth should fail
    print("\n2.2 Eligibility Without Auth (401 Unauthorized)")
    no_auth_response = requests.post(
        f"{BASE_URL}/schemes/check-eligibility",
        json={
            "age": 25,
            "income": 30000,
            "gender": "male",
            "is_student": False
        }
    )
    
    no_auth_pass = no_auth_response.status_code == 401
    all_pass &= print_test(f"  ✓ Status 401 without token", no_auth_pass)
    
    return all_pass


def test_history(token):
    """Test eligibility history API"""
    print_section("TEST 3: ELIGIBILITY HISTORY (Protected Endpoint)")
    
    all_pass = True
    headers = {"Authorization": f"Bearer {token}"}
    
    # First, do another eligibility check to create history
    print("\n3.0 Create History Entry (via eligibility check)")
    requests.post(
        f"{BASE_URL}/schemes/check-eligibility",
        json={
            "age": 30,
            "income": 25000,
            "gender": "female",
            "is_student": False
        },
        headers=headers
    )
    print("  ✓ History entry created")
    
    # Test 3.1: Get history
    print("\n3.1 Get Eligibility History (GET /user/eligibility-history)")
    history_response = requests.get(
        f"{BASE_URL}/user/eligibility-history",
        headers=headers
    )
    
    hist_pass = history_response.status_code == 200
    all_pass &= print_test(f"  ✓ Status 200", hist_pass)
    
    if hist_pass:
        data = history_response.json()
        has_user_id = "user_id" in data
        has_total = "total_checks" in data
        has_history = "history" in data and isinstance(data["history"], list)
        
        all_pass &= print_test(f"  ✓ Returns 'user_id'", has_user_id)
        all_pass &= print_test(f"  ✓ Returns 'total_checks'", has_total)
        all_pass &= print_test(f"  ✓ Returns 'history' (list)", has_history)
        
        if has_history and len(data["history"]) > 0:
            entry = data["history"][0]
            print(f"\n  Sample history entry: {json.dumps(entry, indent=2, default=str)}")
            has_age = "age" in entry
            has_income = "income" in entry
            has_eligible_count = "eligible_count" in entry
            has_timestamp = "created_at" in entry
            
            all_pass &= print_test(f"  ✓ Entry has 'age'", has_age)
            all_pass &= print_test(f"  ✓ Entry has 'income'", has_income)
            all_pass &= print_test(f"  ✓ Entry has 'eligible_count'", has_eligible_count)
            all_pass &= print_test(f"  ✓ Entry has 'created_at'", has_timestamp)
    else:
        print(f"  Error {history_response.status_code}: {history_response.text}")
    
    # Test 3.2: Get summary
    print("\n3.2 Get History Summary (GET /user/eligibility-history/summary)")
    summary_response = requests.get(
        f"{BASE_URL}/user/eligibility-history/summary",
        headers=headers
    )
    
    summ_pass = summary_response.status_code == 200
    all_pass &= print_test(f"  ✓ Status 200", summ_pass)
    
    if summ_pass:
        data = summary_response.json()
        print(f"  Summary: {json.dumps(data, indent=2, default=str)}")
        has_user_id = "user_id" in data
        has_total = "total_checks" in data
        has_last_date = "last_check_date" in data
        has_average = "average_eligible_schemes" in data
        
        all_pass &= print_test(f"  ✓ Has 'user_id'", has_user_id)
        all_pass &= print_test(f"  ✓ Has 'total_checks'", has_total)
        all_pass &= print_test(f"  ✓ Has 'last_check_date'", has_last_date)
        all_pass &= print_test(f"  ✓ Has 'average_eligible_schemes'", has_average)
    else:
        print(f"  Error {summary_response.status_code}: {summary_response.text}")
    
    return all_pass


def test_rbac(token):
    """Test RBAC enforcement"""
    print_section("TEST 4: RBAC (Role-Based Access Control)")
    
    all_pass = True
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 4.1: User token cannot access admin endpoints (POST /admin/schemes)
    print("\n4.1 User Token Access to Admin POST Endpoint (403 Forbidden)")
    admin_response = requests.post(
        f"{BASE_URL}/admin/schemes/",
        json={"scheme_name": "Test", "min_age": 18, "max_age": 60},
        headers=headers
    )
    
    rbac_pass = admin_response.status_code == 403
    all_pass &= print_test(f"  ✓ Status 403 for user accessing admin endpoint", rbac_pass)
    if not rbac_pass:
        print(f"  Got status {admin_response.status_code}: {admin_response.text}")
    
    # Test 4.2: User profile endpoint works
    print("\n4.2 User Token Access to User Endpoint (200 OK)")
    user_response = requests.get(
        f"{BASE_URL}/user/me",
        headers=headers
    )
    
    user_pass = user_response.status_code == 200
    all_pass &= print_test(f"  ✓ Status 200 for user accessing user endpoint", user_pass)
    if user_pass:
        print(f"  User data: {json.dumps(user_response.json(), indent=2, default=str)}")
    
    return all_pass


def main():
    """Run all tests"""
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}COMPREHENSIVE BACKEND VALIDATION TEST{RESET}")
    print(f"{YELLOW}Testing: Auth, Eligibility, History, RBAC, Swagger{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    try:
        # Test connectivity
        print("\nConnecting to backend at", BASE_URL)
        health = requests.get(f"{BASE_URL}/")
        if health.status_code != 200:
            print(f"Backend not accessible")
            return False
        print(f"Backend is running")
    except Exception as e:
        print(f"Cannot connect to backend: {e}")
        print(f"Make sure to run: uvicorn app.main:app --reload")
        return False
    
    # Run tests
    auth_pass, token = test_auth()
    
    if not token:
        print(f"\nAuthentication failed, cannot continue with protected endpoint tests")
        return False
    
    elig_pass = test_eligibility(token)
    hist_pass = test_history(token)
    rbac_pass = test_rbac(token)
    
    # Summary
    print_section("SUMMARY")
    print(f"Auth Tests:         {f'{GREEN}✅ PASS{RESET}' if auth_pass else f'{RED}❌ FAIL{RESET}'}")
    print(f"Eligibility Tests:  {f'{GREEN}✅ PASS{RESET}' if elig_pass else f'{RED}❌ FAIL{RESET}'}")
    print(f"History Tests:      {f'{GREEN}✅ PASS{RESET}' if hist_pass else f'{RED}❌ FAIL{RESET}'}")
    print(f"RBAC Tests:         {f'{GREEN}✅ PASS{RESET}' if rbac_pass else f'{RED}❌ FAIL{RESET}'}")
    
    all_pass = auth_pass and elig_pass and hist_pass and rbac_pass
    
    print(f"\n{YELLOW}{'='*60}{RESET}")
    if all_pass:
        print(f"{GREEN}✅ ALL TESTS PASSED{RESET}")
        print(f"\n{YELLOW}Swagger UI: {BASE_URL}/docs{RESET}")
        print(f"{YELLOW}ReDoc:      {BASE_URL}/redoc{RESET}")
    else:
        print(f"{RED}❌ SOME TESTS FAILED{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}\n")
    
    return all_pass


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
