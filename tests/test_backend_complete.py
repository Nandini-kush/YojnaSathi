#!/usr/bin/env python
"""
Comprehensive Backend API Test Suite
Tests all endpoints, auth flows, and error scenarios
"""
import requests
import json
import sys
from typing import Dict, Any, Tuple

BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 5

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.user_email = None
        self.test_results = []
        
    def log(self, test_name: str, status: str, details: str = ""):
        """Log test results"""
        result = f"[{status:8}] {test_name}"
        if details:
            result += f" - {details}"
        print(result)
        self.test_results.append((test_name, status, details))
        
    def report(self):
        """Print test report"""
        passed = sum(1 for _, s, _ in self.test_results if s == "PASS")
        failed = sum(1 for _, s, _ in self.test_results if s == "FAIL")
        total = len(self.test_results)
        
        print("\n" + "="*80)
        print(f"TEST REPORT: {passed}/{total} passed")
        print("="*80)
        
        for name, status, details in self.test_results:
            symbol = "[OK]" if status == "PASS" else "[FAIL]"
            print(f"{symbol} {name:50} {status:8}")
            if details:
                print(f"  -> {details}")
        
        return failed == 0
    
    # ==========================================
    # PUBLIC ENDPOINTS
    # ==========================================
    
    def test_root(self) -> bool:
        """Test GET /"""
        try:
            resp = requests.get(f"{self.base_url}/", timeout=TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                if "message" in data:
                    self.log("GET /", "PASS", "Root endpoint responds")
                    return True
            self.log("GET /", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("GET /", "FAIL", str(e))
            return False
    
    def test_get_schemes(self) -> bool:
        """Test GET /schemes (no auth required)"""
        try:
            resp = requests.get(f"{self.base_url}/schemes/", timeout=TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                if "total_schemes" in data and "schemes" in data:
                    self.log("GET /schemes", "PASS", f"Returns {data['total_schemes']} schemes")
                    return True
            self.log("GET /schemes", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("GET /schemes", "FAIL", str(e))
            return False
    
    # ==========================================
    # AUTHENTICATION TESTS
    # ==========================================
    
    def test_register_user(self) -> bool:
        """Test POST /auth/register"""
        try:
            self.user_email = f"test_user_{id(self)}@example.com"
            payload = {
                "name": "Test User",
                "email": self.user_email,
                "password": "TestPassword123"
            }
            resp = requests.post(
                f"{self.base_url}/auth/register",
                json=payload,
                timeout=TIMEOUT
            )
            if resp.status_code == 201:
                data = resp.json()
                if data.get("email") == self.user_email:
                    self.log("POST /auth/register", "PASS", f"User {self.user_email} created")
                    return True
            self.log("POST /auth/register", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("POST /auth/register", "FAIL", str(e))
            return False
    
    def test_register_duplicate(self) -> bool:
        """Test POST /auth/register (duplicate email - should fail with 409)"""
        try:
            payload = {
                "name": "Another User",
                "email": self.user_email,
                "password": "AnotherPassword123"
            }
            resp = requests.post(
                f"{self.base_url}/auth/register",
                json=payload,
                timeout=TIMEOUT
            )
            if resp.status_code == 409:
                self.log("POST /auth/register (duplicate)", "PASS", "Correctly rejects duplicate email")
                return True
            self.log("POST /auth/register (duplicate)", "FAIL", f"Expected 409, got {resp.status_code}")
            return False
        except Exception as e:
            self.log("POST /auth/register (duplicate)", "FAIL", str(e))
            return False
    
    def test_login_user(self) -> bool:
        """Test POST /auth/login"""
        try:
            payload = {
                "email": self.user_email,
                "password": "TestPassword123"
            }
            resp = requests.post(
                f"{self.base_url}/auth/login",
                json=payload,
                timeout=TIMEOUT
            )
            if resp.status_code == 200:
                data = resp.json()
                if "access_token" in data and data.get("token_type") == "bearer":
                    self.user_token = data["access_token"]
                    self.log("POST /auth/login", "PASS", "User authenticated successfully")
                    return True
            self.log("POST /auth/login", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("POST /auth/login", "FAIL", str(e))
            return False
    
    def test_login_wrong_password(self) -> bool:
        """Test POST /auth/login (wrong password - should fail with 401)"""
        try:
            payload = {
                "email": self.user_email,
                "password": "WrongPassword123"
            }
            resp = requests.post(
                f"{self.base_url}/auth/login",
                json=payload,
                timeout=TIMEOUT
            )
            if resp.status_code == 401:
                self.log("POST /auth/login (wrong password)", "PASS", "Correctly rejects invalid credentials")
                return True
            self.log("POST /auth/login (wrong password)", "FAIL", f"Expected 401, got {resp.status_code}")
            return False
        except Exception as e:
            self.log("POST /auth/login (wrong password)", "FAIL", str(e))
            return False
    
    # ==========================================
    # PROTECTED ENDPOINTS
    # ==========================================
    
    def test_get_current_user(self) -> bool:
        """Test GET /user/profile (protected)"""
        if not self.user_token:
            self.log("GET /user/profile", "SKIP", "No token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            resp = requests.get(
                f"{self.base_url}/user/profile",
                headers=headers,
                timeout=TIMEOUT
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("email") == self.user_email:
                    self.log("GET /user/profile", "PASS", "Protected endpoint works")
                    return True
            self.log("GET /user/profile", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("GET /user/profile", "FAIL", str(e))
            return False
    
    def test_get_profile_no_auth(self) -> bool:
        """Test GET /user/profile (no auth - should fail with 403)"""
        try:
            resp = requests.get(
                f"{self.base_url}/user/profile",
                timeout=TIMEOUT
            )
            if resp.status_code in [401, 403]:
                self.log("GET /user/profile (no auth)", "PASS", "Correctly requires authentication")
                return True
            self.log("GET /user/profile (no auth)", "FAIL", f"Expected 401/403, got {resp.status_code}")
            return False
        except Exception as e:
            self.log("GET /user/profile (no auth)", "FAIL", str(e))
            return False
    
    def test_check_eligibility(self) -> bool:
        """Test POST /schemes/check-eligibility (protected)"""
        if not self.user_token:
            self.log("POST /schemes/check-eligibility", "SKIP", "No token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            payload = {
                "age": 25,
                "income": 50000,
                "gender": "male",
                "is_student": False
            }
            resp = requests.post(
                f"{self.base_url}/schemes/check-eligibility",
                json=payload,
                headers=headers,
                timeout=TIMEOUT
            )
            if resp.status_code == 200:
                data = resp.json()
                if "eligible_count" in data and "eligible_schemes" in data:
                    self.log("POST /schemes/check-eligibility", "PASS", f"Found {data['eligible_count']} schemes")
                    return True
            self.log("POST /schemes/check-eligibility", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("POST /schemes/check-eligibility", "FAIL", str(e))
            return False
    
    def test_get_eligibility_history(self) -> bool:
        """Test GET /user/eligibility-history (protected)"""
        if not self.user_token:
            self.log("GET /user/eligibility-history", "SKIP", "No token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            resp = requests.get(
                f"{self.base_url}/user/eligibility-history",
                headers=headers,
                timeout=TIMEOUT
            )
            if resp.status_code == 200:
                self.log("GET /user/eligibility-history", "PASS", "History endpoint works")
                return True
            self.log("GET /user/eligibility-history", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("GET /user/eligibility-history", "FAIL", str(e))
            return False
    
    def test_swagger_available(self) -> bool:
        """Test that Swagger UI is accessible"""
        try:
            resp = requests.get(f"{self.base_url}/docs", timeout=TIMEOUT)
            if resp.status_code == 200:
                self.log("GET /docs", "PASS", "Swagger UI is accessible")
                return True
            self.log("GET /docs", "FAIL", f"Status {resp.status_code}")
            return False
        except Exception as e:
            self.log("GET /docs", "FAIL", str(e))
            return False
    
    def test_openapi_schema(self) -> bool:
        """Test that OpenAPI schema is accessible"""
        try:
            resp = requests.get(f"{self.base_url}/openapi.json", timeout=TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                # Check for key components
                has_paths = "paths" in data
                has_components = "components" in data
                has_security = "securitySchemes" in data.get("components", {})
                
                if has_paths and has_security:
                    self.log("GET /openapi.json", "PASS", "OpenAPI schema complete")
                    return True
            self.log("GET /openapi.json", "FAIL", f"Status {resp.status_code} or incomplete schema")
            return False
        except Exception as e:
            self.log("GET /openapi.json", "FAIL", str(e))
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("Starting Backend API Tests...")
        print(f"Base URL: {self.base_url}\n")
        
        # Public endpoints
        print("\n=== PUBLIC ENDPOINTS ===")
        self.test_root()
        self.test_get_schemes()
        self.test_swagger_available()
        self.test_openapi_schema()
        
        # Authentication
        print("\n=== AUTHENTICATION ===")
        self.test_register_user()
        self.test_register_duplicate()
        self.test_login_user()
        self.test_login_wrong_password()
        
        # Protected endpoints
        print("\n=== PROTECTED ENDPOINTS ===")
        self.test_get_profile_no_auth()
        self.test_get_current_user()
        self.test_check_eligibility()
        self.test_get_eligibility_history()
        
        # Generate report
        success = self.report()
        return success


if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
