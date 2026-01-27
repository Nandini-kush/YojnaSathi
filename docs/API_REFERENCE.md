# API INTEGRATION REFERENCE

## Environment Setup

### Frontend .env
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=YojnaSathi
```

### Backend Configuration
- **Base URL:** http://127.0.0.1:8000
- **CORS Origin:** http://localhost:5173
- **Auth Type:** JWT Bearer Token
- **Token Location:** Authorization header

---

## 1. AUTHENTICATION ENDPOINTS

### Register User
```typescript
// Location: src/pages/Register.tsx

POST /auth/register

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_admin": false,
    "created_at": "2026-01-23T10:00:00"
  }
}

Error Responses:
- 400: { "detail": "Email already registered" }
- 422: { "detail": [{ "field": "email", "message": "Invalid email" }] }
```

### Login
```typescript
// Location: src/pages/Login.tsx

POST /auth/login

Request:
{
  "email": "john@example.com",
  "password": "secure_password123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_admin": false,
    "created_at": "2026-01-23T10:00:00"
  }
}

Error Responses:
- 401: { "detail": "Invalid credentials" }
- 404: { "detail": "User not found" }
```

### Logout
```typescript
// Location: src/lib/api.ts

POST /auth/logout
Headers: Authorization: Bearer {access_token}

Response (200):
{
  "message": "Logged out successfully"
}
```

---

## 2. USER ENDPOINTS

### Get User Profile
```typescript
// Location: src/pages/Dashboard.tsx

GET /user/profile
Headers: Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 35,
  "gender": "male",
  "state": "Maharashtra",
  "district": "Mumbai",
  "annual_income": 500000,
  "employment_type": "employed",
  "ration_card": "AP/23/123456",
  "social_category": "general",
  "education": "bachelor",
  "is_student": false,
  "is_admin": false,
  "created_at": "2026-01-23T10:00:00",
  "updated_at": "2026-01-23T10:00:00"
}

Error Responses:
- 401: { "detail": "Unauthorized" }
- 404: { "detail": "User not found" }
```

### Get Eligible Schemes
```typescript
// Location: src/pages/Dashboard.tsx

GET /user-schemes/eligible
Headers: Authorization: Bearer {access_token}

Response (200):
[
  {
    "id": 1,
    "name": "Pradhan Mantri Awas Yojana",
    "category": "Housing",
    "benefit": "Home loan assistance",
    "eligibility_criteria": {...},
    "status": "active",
    "description": "Affordable housing for all"
  },
  {
    "id": 2,
    "name": "PMJAY - Ayushman Bharat",
    "category": "Health",
    "benefit": "Free health insurance",
    "eligibility_criteria": {...},
    "status": "active",
    "description": "Health coverage for poor families"
  }
]

Error Responses:
- 401: { "detail": "Unauthorized" }
```

### Update User Profile
```typescript
// Location: src/pages/Dashboard.tsx (future feature)

PUT /user/profile
Headers: Authorization: Bearer {access_token}

Request (partial update):
{
  "age": 36,
  "annual_income": 600000
}

Response (200):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 36,
  "annual_income": 600000,
  ...
}

Error Responses:
- 401: { "detail": "Unauthorized" }
- 422: { "detail": "Validation error" }
```

---

## 3. SCHEME ENDPOINTS

### List All Schemes
```typescript
// Location: Not currently used (data loaded from eligible schemes)

GET /schemes/
Headers: Authorization: Bearer {access_token}

Response (200):
[
  {
    "id": 1,
    "name": "Pradhan Mantri Awas Yojana",
    "category": "Housing",
    "benefit": "Home loan assistance",
    ...
  },
  ...
]
```

### Create Scheme (Admin Only)
```typescript
// Location: src/pages/Admin.tsx

POST /admin/schemes/
Headers: Authorization: Bearer {access_token}

Request:
{
  "name": "New Scheme",
  "category": "Education",
  "benefit": "Scholarship",
  "eligibility_criteria": {
    "min_age": 18,
    "max_age": 65,
    "max_income": 600000
  },
  "description": "Scholarship for deserving students",
  "status": "active"
}

Response (201):
{
  "id": 15,
  "name": "New Scheme",
  "category": "Education",
  ...
}

Error Responses:
- 401: { "detail": "Unauthorized" }
- 403: { "detail": "Admin access required" }
- 422: { "detail": "Validation error" }
```

### Update Scheme (Admin Only)
```typescript
// Location: src/pages/Admin.tsx

PUT /admin/schemes/{id}
Headers: Authorization: Bearer {access_token}

Request:
{
  "name": "Updated Scheme Name",
  "status": "inactive"
}

Response (200):
{
  "id": 15,
  "name": "Updated Scheme Name",
  "status": "inactive",
  ...
}

Error Responses:
- 401: { "detail": "Unauthorized" }
- 403: { "detail": "Admin access required" }
- 404: { "detail": "Scheme not found" }
- 422: { "detail": "Validation error" }
```

### Delete Scheme (Admin Only)
```typescript
// Location: src/pages/Admin.tsx

DELETE /admin/schemes/{id}
Headers: Authorization: Bearer {access_token}

Response (200):
{
  "message": "Scheme deleted successfully"
}

Error Responses:
- 401: { "detail": "Unauthorized" }
- 403: { "detail": "Admin access required" }
- 404: { "detail": "Scheme not found" }
```

---

## 4. ELIGIBILITY ENDPOINTS

### Check Eligibility
```typescript
// Location: src/pages/EligibilityCheck.tsx

POST /eligibility/
Headers: Authorization: Bearer {access_token}

Request:
{
  "age": 35,
  "gender": "male",
  "state": "Maharashtra",
  "district": "Mumbai",
  "annual_income": 500000,
  "employment_type": "employed",
  "ration_card": "AP/23/123456",
  "social_category": "general",
  "education": "bachelor",
  "is_student": false
}

Response (200):
{
  "eligible_schemes": [
    {
      "id": 1,
      "name": "Pradhan Mantri Awas Yojana",
      "category": "Housing",
      "benefit": "Home loan assistance",
      "eligibility_match": {
        "income_eligible": true,
        "age_eligible": true,
        "status_eligible": true
      }
    },
    ...
  ],
  "total_eligible": 5,
  "check_timestamp": "2026-01-23T10:00:00"
}

Error Responses:
- 401: { "detail": "Unauthorized" }
- 422: { "detail": "Validation error" }
```

### Get Eligibility History
```typescript
// Location: src/pages/History.tsx

GET /eligibility/history
Headers: Authorization: Bearer {access_token}

Response (200):
[
  {
    "id": 1,
    "user_id": 1,
    "eligible_schemes": [
      {
        "id": 1,
        "name": "Scheme 1",
        "category": "Housing"
      },
      ...
    ],
    "total_eligible": 3,
    "created_at": "2026-01-23T10:00:00",
    "updated_at": "2026-01-23T10:00:00"
  },
  {
    "id": 2,
    "user_id": 1,
    "eligible_schemes": [...],
    "total_eligible": 5,
    "created_at": "2026-01-20T14:30:00",
    "updated_at": "2026-01-20T14:30:00"
  }
]

Error Responses:
- 401: { "detail": "Unauthorized" }
```

### Get History Detail
```typescript
// Location: src/pages/History.tsx (future feature)

GET /eligibility/history/{id}
Headers: Authorization: Bearer {access_token}

Response (200):
{
  "id": 1,
  "user_id": 1,
  "eligible_schemes": [...],
  "total_eligible": 3,
  "created_at": "2026-01-23T10:00:00",
  "updated_at": "2026-01-23T10:00:00",
  "user_data": {
    "age": 35,
    "income": 500000,
    "state": "Maharashtra"
  }
}

Error Responses:
- 401: { "detail": "Unauthorized" }
- 404: { "detail": "History not found" }
```

---

## ERROR CODE MAPPING

### Status Code → User Message

| Code | Error | Frontend Message | Handled By |
|------|-------|------------------|-----------|
| 200 | Success | ✓ Data displayed | Component |
| 201 | Created | ✓ Item added | Component |
| 400 | Bad Request | "Invalid data format" | getErrorMessage |
| 401 | Unauthorized | "Session expired. Please log in again" | Interceptor + Redirect |
| 403 | Forbidden | "You don't have permission" | getErrorMessage |
| 404 | Not Found | "Resource not found" | getErrorMessage |
| 422 | Validation Error | "{field}: {message}" | Component |
| 500 | Server Error | "Server error. Please try again later" | getErrorMessage |
| Network Error | Connection | "Check your internet connection" | catch block |
| Timeout | Timeout | "Request timed out" | catch block |

### Implementation in src/lib/api-utils.ts
```typescript
export function getErrorMessage(error: AxiosError): string {
  if (!error.response) {
    return "Network error. Please check your connection.";
  }

  const status = error.response.status;
  const data: any = error.response.data;

  switch (status) {
    case 400:
      return data?.detail || "Invalid data format";
    case 401:
      return "Session expired. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "Resource not found.";
    case 422:
      return data?.detail?.[0]?.msg || "Validation error";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
}
```

---

## REQUEST/RESPONSE FLOW

### Successful Request
```
1. React Component
   ↓ [axios instance + interceptor adds token]
   ↓
2. HTTP Request with Authorization header
   ↓ POST /auth/login
   ↓ Headers: { Authorization: "Bearer token" }
   ↓
3. FastAPI Backend
   ↓ [validates token, processes request]
   ↓
4. HTTP Response (200)
   ↓ { data: { ...response } }
   ↓ [response interceptor checks status]
   ↓
5. React Component
   ↓ [sets state with response data]
   ↓
6. UI Updates with data
```

### Failed Request (401)
```
1. React Component
   ↓ [makes API request]
   ↓
2. FastAPI Backend
   ↓ [token expired/invalid]
   ↓
3. HTTP Response (401)
   ↓
4. Response Interceptor catches 401
   ↓ [removes token from localStorage]
   ↓ [clears auth state]
   ↓
5. Navigate to /login
   ↓
6. User sees login form
```

---

## TYPESCRIPT TYPES

### All types defined in src/types/api.ts

```typescript
// Authentication
interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface AuthRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// User
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  annual_income?: number;
  employment_type?: string;
  ration_card?: string;
  social_category?: string;
  education?: string;
  is_student?: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Scheme
interface Scheme {
  id: number;
  name: string;
  category: string;
  benefit: string;
  eligibility_criteria: Record<string, any>;
  status: "active" | "inactive";
  description?: string;
}

interface CreateSchemeRequest {
  name: string;
  category: string;
  benefit: string;
  eligibility_criteria: Record<string, any>;
  status: "active" | "inactive";
  description?: string;
}

// Eligibility
interface EligibilityCheckRequest {
  age: number;
  gender: string;
  state: string;
  district: string;
  annual_income: number;
  employment_type: string;
  ration_card?: string;
  social_category: string;
  education: string;
  is_student: boolean;
}

interface EligibilityCheckResponse {
  eligible_schemes: Scheme[];
  total_eligible: number;
  check_timestamp: string;
}

interface EligibilityHistory {
  id: number;
  user_id: number;
  eligible_schemes: Scheme[];
  total_eligible: number;
  created_at: string;
  updated_at: string;
}

// Errors
interface ApiError {
  detail: string | { field: string; message: string }[];
  status: number;
}
```

---

## TESTING WITH CURL

### Test Endpoints Manually

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get Profile (replace TOKEN with actual token)
curl -X GET http://localhost:8000/user/profile \
  -H "Authorization: Bearer TOKEN"

# Check Eligibility
curl -X POST http://localhost:8000/eligibility/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"age":35,"gender":"male","state":"Maharashtra",...}'

# Get History
curl -X GET http://localhost:8000/eligibility/history \
  -H "Authorization: Bearer TOKEN"
```

---

## DEBUGGING

### Check Token in Browser Console
```javascript
// Get token
localStorage.getItem('access_token')

// Get user
JSON.parse(localStorage.getItem('user'))

// Check auth state
import { useAuthStore } from '@/context/authStore'
useAuthStore.getState()
```

### Monitor API Calls
```javascript
// DevTools → Network tab → Filter "Fetch/XHR"
// Check:
// - Request headers include Authorization
// - Response status (200, 401, 422, etc.)
// - Response body matches expected format
```

### Enable Debug Logging
```typescript
// In App.tsx
import { setupApiLogging } from '@/lib/debug'

useEffect(() => {
  setupApiLogging()
}, [])

// Now all API calls are logged with colors in console
```

---

## PRODUCTION DEPLOYMENT

### Environment Variables
```env
# .env.production
VITE_API_URL=https://api.yojnasathi.com
VITE_APP_NAME=YojnaSathi
```

### Build & Deploy
```bash
npm run build       # Creates dist/ folder
npm run preview     # Test production build locally

# Deploy dist/ folder to hosting service
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - etc.
```

### Backend Configuration for Production
```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yojnasathi.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

**Last Updated:** January 23, 2026  
**Status:** ✅ Complete and Tested
