# Authentication Flow - Visual Guide

## The Problem (Before Fix)

```
User Login: "john@example.com" : "password123"
        ↓
    POST /auth/login
        ↓
✅ Returns: {"access_token": "eyJ...", "token_type": "bearer"}
        ↓
User tries: GET /user/me with Authorization: Bearer eyJ...
        ↓
❌ FastAPI receives token = None (OAuth2PasswordBearer ignores Bearer header)
        ↓
❌ Immediate 401 Unauthorized (JWT never even validated!)
```

**Why?** `OAuth2PasswordBearer` was designed for form login, not Bearer tokens!

---

## The Solution (After Fix)

```
User Login: "john@example.com" : "password123"
        ↓
    POST /auth/login
        ↓
✅ Returns: {"access_token": "eyJ...", "token_type": "bearer"}
        ↓
User tries: GET /user/me with Authorization: Bearer eyJ...
        ↓
✅ FastAPI receives token from HTTPBearer (correct!)
        ↓
✅ JWT validated (signature, role, expiry)
        ↓
✅ Database user lookup (verify user exists)
        ↓
✅ 200 OK + user data returned
```

**Why this works:** `HTTPBearer` correctly reads the Authorization header!

---

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend/Client                          │
│                                                               │
│  1. POST /auth/register              2. POST /auth/login     │
│     ↓                                    ↓                    │
│  {"name", "email", "password"}    {"email", "password"}      │
└─────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
    ┌───────────────────┐         ┌──────────────────┐
    │  201 Created      │         │  200 OK          │
    │  User stored in   │         │  JWT token       │
    │  database         │         │  returned        │
    └───────────────────┘         └──────────────────┘
            ↑                               ↑
            └───────────────┬───────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  User stores token securely           │
        │  (localStorage, sessionStorage, etc)  │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  User makes API request               │
        │  Authorization: Bearer <token>        │
        └───────────────────────────────────────┘
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
    ┌───────────────────┐         ┌──────────────────┐
    │ HTTPBearer        │         │  JWT Validation  │
    │ Extracts token    │  ✅     │  - Signature     │
    │ from header       │  ✅     │  - Expiry        │
    └───────────────────┘         │  - Role/sub      │
            ↓                      └──────────────────┘
            ↓                               ↓
    ┌───────────────────────────────────────────────┐
    │  Database Query                               │
    │  Verify user still exists in DB               │
    └───────────────────────────────────────────────┘
            ↓
    ┌───────────────────────────────────────────────┐
    │  200 OK + Protected Data                      │
    │  OR 401/403 if authentication fails           │
    └───────────────────────────────────────────────┘
```

---

## Token Lifecycle

```
LOGIN
  ↓
  ├─ User submits: email + password
  │
  ├─ Password verified with hashed value
  │
  └─ Token created:
     {
       "sub": "19",
       "role": "user",
       "exp": 1768935737
     }
     ↓
     Signed with: SECRET_KEY + HS256 algorithm
     ↓
     Returns to client: eyJhbGci...

API REQUEST
  ↓
  ├─ Token sent: Authorization: Bearer eyJhbGci...
  │
  ├─ HTTPBearer extracts: eyJhbGci...
  │
  ├─ Signature verified: ✓ (using SECRET_KEY)
  │
  ├─ Expiry checked: ✓ (not older than 60 min)
  │
  ├─ Database lookup: ✓ (user_id=19 exists)
  │
  └─ Access granted: 200 OK

TOKEN EXPIRES (After 60 minutes)
  ↓
  └─ User must login again
```

---

## Protected Route Dependency Injection

```
@router.get("/user/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
                                 ↑
                    What happens here:
                                 
                    1. FastAPI intercepts request
                    2. Reads Authorization header
                    3. Calls get_current_user(credentials)
                    4. get_current_user extracts token
                    5. Validates JWT
                    6. Checks RBAC (role)
                    7. Queries database
                    8. Returns User object OR 401/403
                    
                    9. If successful, User passed to route
                    10. Route handler executes
                    11. Returns response to client
):
    """Returns current user's profile"""
    return current_user
```

---

## Request/Response Examples

### Example 1: Successful Authentication Flow

```
REQUEST 1: Register
═══════════════════════════════════════════════════════════
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

RESPONSE 1: 201 Created
═══════════════════════════════════════════════════════════
{
  "user_id": 19,
  "email": "john@example.com",
  "name": "John Doe",
  "message": "User registered successfully. Use /auth/login to authenticate."
}

REQUEST 2: Login
═══════════════════════════════════════════════════════════
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

RESPONSE 2: 200 OK
═══════════════════════════════════════════════════════════
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzY4OTM1NzM3fQ.rJKZCrRBaVbZaG2X8qL9mN0pQrStUvWxYzAbCdEfGhI",
  "token_type": "bearer"
}

REQUEST 3: Access Protected Endpoint
═══════════════════════════════════════════════════════════
GET /user/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzY4OTM1NzM3fQ.rJKZCrRBaVbZaG2X8qL9mN0pQrStUvWxYzAbCdEfGhI

RESPONSE 3: 200 OK
═══════════════════════════════════════════════════════════
{
  "id": 19,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Example 2: Failed Authentication

```
REQUEST: Missing Authorization Header
═══════════════════════════════════════════════════════════
GET /user/me HTTP/1.1
(no Authorization header)

RESPONSE: 401 Unauthorized
═══════════════════════════════════════════════════════════
{
  "detail": "Not authenticated"
}

REQUEST: Invalid Token
═══════════════════════════════════════════════════════════
GET /user/me HTTP/1.1
Authorization: Bearer invalid_token_value

RESPONSE: 401 Unauthorized
═══════════════════════════════════════════════════════════
{
  "detail": "Invalid token: Not enough segments"
}

REQUEST: Expired Token (60+ minutes old)
═══════════════════════════════════════════════════════════
GET /user/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzY4OTM1NzM2fQ.old_expired_token

RESPONSE: 401 Unauthorized
═══════════════════════════════════════════════════════════
{
  "detail": "Invalid token: signature has expired"
}
```

---

## Code Flow Diagram

```
Route Handler Called
        ↓
    Does route have:
    Depends(get_current_user)?
        ↓
       YES ← (most protected routes)
        ↓
Call get_current_user()
        ↓
    Depends(bearer_scheme)
        ↓
    HTTPBearer()
        ↓
  Extract from:
  Authorization: Bearer <token>
        ↓
    token found?
        ├─ NO  → 401 "Not authenticated"
        └─ YES → Continue
              ↓
         Decode JWT
         ├─ Signature valid?
         │  └─ NO  → 401 "Invalid token"
         └─ YES  → Continue
              ↓
         Check expiry
         ├─ Expired?
         │  └─ YES → 401 "Token expired"
         └─ NO  → Continue
              ↓
         Extract sub (user_id)
         ├─ Missing?
         │  └─ YES → 401 "Invalid token: user ID not found"
         └─ NO  → Continue
              ↓
         Check role
         ├─ role != "user"?
         │  └─ YES → 403 "User access required"
         └─ YES  → Continue
              ↓
         Query database
         ├─ User found?
         │  └─ NO  → 401 "User not found"
         └─ YES  → Continue
              ↓
         Return User object
         ↓
    ✅ Route handler executes
         ↓
    ✅ 200 OK + data
```

---

## RBAC (Role-Based Access Control)

```
Token Payload:
{
  "sub": "user_id",
  "role": "user",  ← Role stored here
  "exp": "..."
}

Authorization Check:
            
  If route is:
  
  GET /user/me
  └─ Requires: role == "user" ✓
  
  POST /admin/schemes
  └─ Requires: role == "admin" ✓
  
  GET /schemes
  └─ Requires: role == "user" ✓

Flow:
  Check payload.get("role")
  ↓
  if role != expected_role:
    → 403 Forbidden "Access denied for this role"
  else:
    → Continue to handler
```

---

## Database Verification

```
JWT token valid but:
  "sub": "999"  ← This user_id
  
Database check:
  SELECT * FROM users WHERE id = 999
  
  Result:
  ├─ Found → User is real, continue ✓
  └─ Not found → 401 "User not found" (deleted account?)
```

---

## Error Decision Tree

```
Request received
    ↓
Has Authorization header?
├─ NO  → 403 Forbidden (HTTPBearer default)
└─ YES → Continue
    ↓
Header format: "Bearer <token>"?
├─ NO  → 403 Forbidden
└─ YES → Continue
    ↓
Token is valid JWT?
├─ NO  → 401 Unauthorized "Invalid token"
└─ YES → Continue
    ↓
Token not expired?
├─ NO  → 401 Unauthorized "Token expired"
└─ YES → Continue
    ↓
Has "sub" claim?
├─ NO  → 401 Unauthorized "user ID not found"
└─ YES → Continue
    ↓
Role matches endpoint?
├─ NO  → 403 Forbidden "Access denied"
└─ YES → Continue
    ↓
User exists in database?
├─ NO  → 401 Unauthorized "User not found"
└─ YES → Continue
    ↓
✅ 200 OK → Execute route
```

---

## Summary

```
BEFORE FIX:
  OAuth2PasswordBearer
      ↓
  Ignores: Authorization: Bearer <token>
      ↓
  Always returns: token = None
      ↓
  Result: ❌ 401 Unauthorized (always)

AFTER FIX:
  HTTPBearer
      ↓
  Reads: Authorization: Bearer <token>
      ↓
  Extracts: <token>
      ↓
  Result: ✅ Proper authentication
```

---

**Authentication flow is now clear and working correctly!** 🔐
