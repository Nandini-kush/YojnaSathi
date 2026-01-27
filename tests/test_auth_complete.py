#!/usr/bin/env python3
"""
Complete authentication flow test.
Tests: Register → Login → Swagger Authorize → Protected Endpoints
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

# Test user credentials
TEST_USER = {
    "name": "Test User",
    "email": f"testuser{int(time.time())}@example.com",
    "password": "testpassword123"
}

print("\n" + "="*60)
print("🧪 AUTH FLOW TEST SUITE")
print("="*60)

# =======================
# STEP 1: Register User
# =======================
print("\n1️⃣ REGISTER - Creating test user...")
register_response = requests.post(
    f"{BASE_URL}/auth/register",
    json={
        "name": TEST_USER["name"],
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
)

print(f"Status: {register_response.status_code}")
print(f"Response: {json.dumps(register_response.json(), indent=2)}")

if register_response.status_code not in [200, 201]:
    print("❌ REGISTRATION FAILED")
    exit(1)

print("✅ REGISTRATION SUCCESSFUL")
user_id = register_response.json()["user_id"]

# =======================
# STEP 2: Login
# =======================
print("\n2️⃣ LOGIN - Getting JWT token...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
)

print(f"Status: {login_response.status_code}")
print(f"Response: {json.dumps(login_response.json(), indent=2)}")

if login_response.status_code != 200:
    print("❌ LOGIN FAILED")
    exit(1)

token = login_response.json()["access_token"]
print(f"✅ LOGIN SUCCESSFUL")
print(f"Token (first 50 chars): {token[:50]}...")

# =======================
# STEP 3: Test Protected Endpoints
# =======================
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

protected_endpoints = [
    ("GET", "/user/me", None),
    ("GET", "/user/profile", None),
    ("GET", "/user/eligibility-history", None),
    ("POST", "/schemes/check-eligibility", {
        "age": 25,
        "income": 500000,
        "gender": "M",
        "is_student": False
    })
]

print("\n3️⃣ PROTECTED ENDPOINTS - Testing with token...")
print("-" * 60)

all_passed = True
for method, endpoint, body in protected_endpoints:
    print(f"\n{method} {endpoint}")
    try:
        if method == "GET":
            resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        elif method == "POST":
            resp = requests.post(f"{BASE_URL}{endpoint}", json=body, headers=headers)
        
        status = resp.status_code
        status_symbol = "✅" if status == 200 else "❌"
        
        print(f"  Status: {status_symbol} {status}")
        
        if status == 200:
            print(f"  Response: {json.dumps(resp.json(), indent=4)[:200]}...")
        else:
            print(f"  Error: {resp.json()}")
            all_passed = False
    except Exception as e:
        print(f"  ❌ Exception: {str(e)}")
        all_passed = False

print("\n" + "="*60)
if all_passed:
    print("✅ ALL TESTS PASSED - Authentication working correctly!")
else:
    print("❌ SOME TESTS FAILED")
print("="*60 + "\n")

# =======================
# STEP 4: Test without token (should fail)
# =======================
print("\n4️⃣ SECURITY CHECK - Testing without token (should fail)...")
resp = requests.get(f"{BASE_URL}/user/me")
print(f"GET /user/me without token: {resp.status_code}")
if resp.status_code == 401:
    print("✅ Correctly rejected request without token")
else:
    print("❌ ERROR: Should reject without token")
