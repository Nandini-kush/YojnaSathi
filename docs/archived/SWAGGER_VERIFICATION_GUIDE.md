# QUICK START - VERIFY BACKEND VIA SWAGGER

This guide walks through a complete test cycle using Swagger UI without needing any external tools.

## Step 0: Start the Backend Server

```bash
# From the YojnaSathi directory
cd c:\Users\Soft Tech\Desktop\YojnaSathi

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Output should show:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

## Step 1: Open Swagger UI

Navigate to: **http://127.0.0.1:8000/docs**

You should see the Swagger interface with all endpoints listed.

---

## Step 2: Register a New User

### In Swagger:
1. Find the section **Authentication**
2. Click on **POST /auth/register**
3. Click **"Try it out"**
4. Fill in the request body:
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "TestPassword123"
}
```
5. Click **"Execute"**

### Expected Response (201):
```json
{
  "user_id": 1,
  "email": "testuser@example.com",
  "name": "Test User",
  "message": "User registered successfully. Use /auth/login to authenticate."
}
```

✓ **PASS**: User registered successfully

---

## Step 3: Login and Get Token

### In Swagger:
1. Click on **POST /auth/login**
2. Click **"Try it out"**
3. Fill in the request body:
```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123"
}
```
4. Click **"Execute"**

### Expected Response (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE2MzI2NTMyODB9.r7tFEY_..." ,
  "token_type": "bearer"
}
```

### Copy the Token:
- Copy the full string from `"access_token"` (everything between quotes)
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

✓ **PASS**: User authenticated successfully

---

## Step 4: Authorize Swagger with Token

### In Swagger Top-Right:
1. Click the **"Authorize"** button (green, near top right)
2. A dialog appears with a text field
3. **PASTE the access_token** you copied (without the word "Bearer")
4. Click **"Authorize"**
5. Click **"Close"**

✓ **PASS**: Swagger is now authorized to call protected endpoints

---

## Step 5: Get User Profile (Protected Endpoint)

### In Swagger:
1. Find the section **User - Profile**
2. Click on **GET /user/profile**
3. Click **"Try it out"**
4. Click **"Execute"** (no parameters needed)

### Expected Response (200):
```json
{
  "id": 1,
  "name": "Test User",
  "email": "testuser@example.com"
}
```

✓ **PASS**: Protected endpoint works with token

---

## Step 6: Check Eligibility for Schemes

### In Swagger:
1. Find the section **Eligibility**
2. Click on **POST /schemes/check-eligibility**
3. Click **"Try it out"**
4. Fill in the request body:
```json
{
  "age": 25,
  "income": 50000,
  "gender": "male",
  "is_student": false
}
```
5. Click **"Execute"**

### Expected Response (200):
```json
{
  "input": {
    "age": 25,
    "income": 50000,
    "gender": "male",
    "is_student": false
  },
  "eligible_count": 5,
  "eligible_schemes": [
    {
      "id": 1,
      "scheme_name": "Youth Employment Scheme",
      "benefits": "Job training and placement",
      ...
    }
  ],
  "message": "Eligibility checked and saved. 5 schemes matched"
}
```

✓ **PASS**: Eligibility check works and returns matching schemes

---

## Step 7: Get Eligibility History

### In Swagger:
1. Find the section **User Eligibility History**
2. Click on **GET /user/eligibility-history**
3. Click **"Try it out"**
4. Click **"Execute"**

### Expected Response (200):
```json
{
  "user_id": 1,
  "total_checks": 1,
  "history": [
    {
      "id": 1,
      "age": 25,
      "income": 50000,
      "gender": "male",
      "is_student": false,
      "eligible_count": 5,
      "created_at": "2026-01-23T10:30:45"
    }
  ]
}
```

✓ **PASS**: History is saved and retrievable

---

## Step 8: Test Error Handling

### Test 401 Unauthorized (Remove Token)

1. Click **"Authorize"** button again
2. Click **"Logout"** button
3. Try to call **GET /user/profile**
4. Click **"Try it out"**
5. Click **"Execute"**

### Expected Response (403):
```json
{
  "detail": "Not authenticated"
}
```

✓ **PASS**: Protected endpoint correctly rejects requests without token

### Test 409 Conflict (Duplicate Email)

1. Click **"Authorize"** and logout to clear token
2. Click on **POST /auth/register**
3. Click **"Try it out"**
4. Fill in:
```json
{
  "name": "Another User",
  "email": "testuser@example.com",
  "password": "DifferentPassword123"
}
```
5. Click **"Execute"**

### Expected Response (409):
```json
{
  "detail": "Email already registered"
}
```

✓ **PASS**: Duplicate email correctly rejected

### Test 401 Unauthorized (Wrong Password)

1. Click on **POST /auth/login**
2. Click **"Try it out"**
3. Fill in:
```json
{
  "email": "testuser@example.com",
  "password": "WrongPassword123"
}
```
4. Click **"Execute"**

### Expected Response (401):
```json
{
  "detail": "Invalid email or password"
}
```

✓ **PASS**: Wrong credentials correctly rejected

---

## Step 9: Verify Swagger Schema

### Check OpenAPI Documentation:

1. Visit: **http://127.0.0.1:8000/openapi.json**
2. The JSON should contain:
   - All endpoint paths
   - All request/response schemas
   - Security scheme (BearerAuth)
   - Status codes and error descriptions

### Sample section should look like:
```json
{
  "components": {
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  },
  "paths": {
    "/auth/login": {
      "post": {...}
    },
    "/user/profile": {
      "get": {
        "security": [{"BearerAuth": []}],
        ...
      }
    }
  }
}
```

✓ **PASS**: OpenAPI schema is complete and correct

---

## Complete Test Summary

If you've completed all steps 1-9, your backend is **PRODUCTION READY**:

| Step | Endpoint | Status |
|------|----------|--------|
| 2 | POST /auth/register | ✓ 201 Created |
| 3 | POST /auth/login | ✓ 200 OK + Token |
| 4 | Swagger Authorization | ✓ Token Accepted |
| 5 | GET /user/profile | ✓ 200 OK |
| 6 | POST /schemes/check-eligibility | ✓ 200 OK |
| 7 | GET /user/eligibility-history | ✓ 200 OK |
| 8a | Unauthorized (no token) | ✓ 403 Forbidden |
| 8b | Duplicate email | ✓ 409 Conflict |
| 8c | Wrong password | ✓ 401 Unauthorized |
| 9 | OpenAPI Schema | ✓ Complete |

---

## Troubleshooting

### Server won't start
```bash
# Check port 8000 is available
netstat -an | findstr "8000"

# Kill any existing process on port 8000
Get-Process | Where-Object {$_.Port -eq 8000} | Stop-Process -Force
```

### Token issues
- Make sure you **copied the full token** (not including quotes or "Bearer")
- Paste it in Authorize dialog **without the word "Bearer"**
- Swagger will add "Bearer " prefix automatically

### 422 Validation Error
- Check email format (must be valid email: user@domain.com)
- Check password length (minimum 6 characters)
- Check age is a number between 0-120
- Check income is a non-negative number

### 500 Server Error
- Check database exists (should be auto-created)
- Check app/config.py settings
- Look at server console output for error details

---

## Next Steps

Once backend verification is complete:

1. **Frontend Integration**: Use the documented API endpoints
2. **Mobile App**: Same API endpoints work for mobile
3. **ML Model**: Use check-eligibility endpoint for training data
4. **Deployment**: Follow deployment checklist in BACKEND_READY.md

**Backend is FROZEN and STABLE - No breaking changes without version bump**
