# API Endpoint Reference - Complete Mapping

**Updated:** January 26, 2026

---

## 🎯 Frontend API Module Reference

### 1. authAPI - Authentication Endpoints
```typescript
import { authAPI } from '@/lib/api';

authAPI.register(data)   // POST /auth/register
authAPI.login(data)      // POST /auth/login
authAPI.logout()         // POST /auth/logout
```

### 2. mlAPI - ML Recommendations (NEW/FIXED)
```typescript
import { mlAPI } from '@/lib/api';

mlAPI.recommend(data)    // POST /ml/recommend
```

**Schema:**
```typescript
{
  age: number,              // years (18-120)
  income: number,           // annual income in rupees
  gender: string,           // 'male', 'female', 'other'
  category: string          // 'general', 'obc', 'sc', 'st'
}
```

**Response:**
```typescript
{
  user: {...},
  recommended_schemes: [
    {
      scheme_id: number,
      scheme_name: string,
      eligible: boolean,
      probability: number (0-1)
    },
    ...
  ],
  total_schemes: number,
  total_eligible: number
}
```

### 3. eligibilityAPI - Eligibility Check (Alternative)
```typescript
import { eligibilityAPI } from '@/lib/api';

eligibilityAPI.check(data)     // POST /schemes/check-eligibility
eligibilityAPI.getHistory()    // GET /user/eligibility-history
```

**Schema:**
```typescript
{
  age: number,              // years
  income: number,           // MONTHLY income (float)
  gender: string,           // 'male', 'female', 'other'
  is_student: boolean       // true/false
}
```

### 4. userAPI - User Profile & History
```typescript
import { userAPI } from '@/lib/api';

userAPI.getProfile()           // GET /user/profile
userAPI.getEligibilityHistory()// GET /user/eligibility-history
userAPI.getEligibleSchemes()   // GET /user-schemes/eligible
userAPI.updateProfile(data)    // PUT /user/profile
```

### 5. schemesAPI - Public Schemes
```typescript
import { schemesAPI } from '@/lib/api';

schemesAPI.getAll()           // GET /schemes/
schemesAPI.getById(id)        // GET /schemes/{id}
```

### 6. adminAPI - Admin Operations
```typescript
import { adminAPI } from '@/lib/api';

adminAPI.createScheme(data)   // POST /admin/schemes/
adminAPI.updateScheme(id, data)// PUT /admin/schemes/{id}
adminAPI.deleteScheme(id)     // DELETE /admin/schemes/{id}
adminAPI.getSchemes()         // GET /schemes/
adminAPI.getStats()           // GET /admin/stats
adminAPI.getRecentUsers()     // GET /admin/users
adminAPI.getRecentEligibilityChecks()// GET /admin/eligibility-checks
adminAPI.getAllSchemes()      // GET /admin/schemes
adminAPI.loginAdmin(email, password)// POST /admin/auth/login
```

---

## 🔄 Dashboard Integration (Current Implementation)

### Current Flow
```typescript
// In Dashboard.tsx

import { userAPI, mlAPI, eligibilityAPI } from '@/lib/api';

// User submits form
const handleEligibilityCheck = async (e) => {
  const profileData = {
    age: parseInt(age),
    income: parseInt(income),
    gender,
    category
  };
  
  // Store in state
  setUserProfile(profileData);
  
  // Call ML endpoint
  const mlResponse = await mlAPI.recommend(profileData);
  
  // Store recommendations
  setRecommendedSchemes(mlResponse.data.recommended_schemes);
};
```

---

## ✅ Correct Endpoint Paths (After Fix)

### ❌ Before (Wrong)
```
POST /eligibility ← 404 Not Found
POST /ml/recommend ← was calling authAPI.mlRecommend()
```

### ✅ After (Correct)
```
POST /ml/recommend ← mlAPI.recommend()
POST /schemes/check-eligibility ← eligibilityAPI.check() [alternative]
```

---

## 🔐 Authentication

All protected endpoints require Bearer token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Automatically added** by API client interceptor:
```typescript
// In api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Request Examples

### Example 1: Get ML Recommendations

**Code:**
```typescript
const mlResponse = await mlAPI.recommend({
  age: 35,
  income: 500000,
  gender: 'male',
  category: 'general'
});

console.log(mlResponse.data.recommended_schemes);
```

**Network Request:**
```
POST /ml/recommend HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "age": 35,
  "income": 500000,
  "gender": "male",
  "category": "general"
}
```

**Response:**
```json
{
  "user": {
    "age": 35,
    "income": 500000,
    "gender": "male",
    "category": "general"
  },
  "recommended_schemes": [
    {
      "scheme_id": 1,
      "scheme_name": "PM Kisan Samman Nidhi",
      "eligible": true,
      "probability": 0.95
    },
    {
      "scheme_id": 2,
      "scheme_name": "Ayushman Bharat",
      "eligible": true,
      "probability": 0.87
    }
  ],
  "total_schemes": 5,
  "total_eligible": 4
}
```

### Example 2: Check Eligibility (Alternative)

**Code:**
```typescript
const eligResponse = await eligibilityAPI.check({
  age: 35,
  income: 25000,      // MONTHLY income
  gender: 'male',
  is_student: false
});
```

**Network Request:**
```
POST /schemes/check-eligibility HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "age": 35,
  "income": 25000,
  "gender": "male",
  "is_student": false
}
```

### Example 3: Get User History

**Code:**
```typescript
const history = await userAPI.getEligibilityHistory();
console.log(history.data);
```

**Network Request:**
```
GET /user/eligibility-history HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGc...
```

---

## 🚨 Common Mistakes (Avoid These)

### ❌ Wrong: Calling OLD endpoints
```typescript
const response = await authAPI.checkEligibility(data);  // ❌ REMOVED
const response = await authAPI.mlRecommend(data);       // ❌ REMOVED
```

### ✅ Right: Calling NEW endpoints
```typescript
const response = await mlAPI.recommend(data);           // ✅ CORRECT
const response = await eligibilityAPI.check(data);      // ✅ CORRECT
```

### ❌ Wrong: Mixing schemas
```typescript
// Eligibility endpoint expects MONTHLY income
const data = { age: 35, income: 500000, ... };  // ❌ Too high, should be ~25000
```

### ✅ Right: Using correct schema
```typescript
// ML endpoint expects ANNUAL income
const data = { age: 35, income: 500000, gender: 'male', category: 'general' };  // ✅ CORRECT
```

### ❌ Wrong: Forgetting category field
```typescript
const data = { age: 35, income: 500000, gender: 'male' };  // ❌ Missing category
```

### ✅ Right: Including all fields
```typescript
const data = { age: 35, income: 500000, gender: 'male', category: 'general' };  // ✅ CORRECT
```

---

## 🧪 Test Commands (curl)

### Test ML Recommendations
```bash
curl -X POST http://localhost:8000/ml/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "income": 500000,
    "gender": "male",
    "category": "general"
  }'
```

### Test Eligibility Check
```bash
curl -X POST http://localhost:8000/schemes/check-eligibility \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "income": 25000,
    "gender": "male",
    "is_student": false
  }'
```

### Get Eligibility History
```bash
curl -X GET http://localhost:8000/user/eligibility-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 API Status Check

### Health Check
```bash
curl http://localhost:8000/
# Returns: {"message": "YojnaSathi backend is running"}
```

### Swagger UI
```
http://localhost:8000/docs
```

### ReDoc
```
http://localhost:8000/redoc
```

---

## 🔗 Import Statements

### In Dashboard or any component:
```typescript
import { mlAPI } from '@/lib/api';           // ML recommendations
import { eligibilityAPI } from '@/lib/api';  // Eligibility check
import { userAPI } from '@/lib/api';         // User profile
import { schemesAPI } from '@/lib/api';      // Public schemes
import { adminAPI } from '@/lib/api';        // Admin operations
```

---

## 📱 Response Status Codes

### Success
- **200** - OK, request successful
- **201** - Created, new resource created

### Client Errors
- **400** - Bad Request, invalid data
- **401** - Unauthorized, invalid token
- **422** - Validation Error, invalid schema
- **404** - Not Found, endpoint doesn't exist

### Server Errors
- **500** - Internal Server Error
- **502** - Bad Gateway
- **503** - Service Unavailable

---

## 🎯 Error Handling Pattern

```typescript
try {
  const response = await mlAPI.recommend(data);
  setRecommendedSchemes(response.data.recommended_schemes);
} catch (error: any) {
  // Get error message
  const message = error.response?.data?.detail || error.message;
  
  // Handle different status codes
  if (error.response?.status === 401) {
    // Token expired, redirect to login
    navigate('/login');
  } else if (error.response?.status === 422) {
    // Validation error, show form error
    console.error('Invalid data:', error.response.data);
  } else {
    // Other error, show toast
    toast({ title: 'Error', description: message });
  }
}
```

---

## ✅ Checklist: Using Correct Endpoints

Before deploying, verify:

- [ ] Using `mlAPI.recommend()` for scheme recommendations
- [ ] Using `eligibilityAPI.check()` for eligibility check (if needed)
- [ ] Request schema matches endpoint expectations
- [ ] Bearer token in Authorization header (auto-added)
- [ ] Error handling catches API failures
- [ ] Response data stored in React state
- [ ] UI re-renders when state updates
- [ ] Console shows detailed logs
- [ ] No hardcoded mock data
- [ ] No page reloads on submit

---

**Status: ✅ All endpoints correctly mapped and documented**
