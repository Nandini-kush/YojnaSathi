# YojnaSathi Frontend - API Endpoints Integration Report

## Frontend Configuration

- **Frontend URL**: http://localhost:5173
- **Backend URL**: http://localhost:8000
- **Frontend Framework**: React 18 + TypeScript + Vite
- **Build Status**: ✅ Successful
- **Dev Server Status**: ✅ Running

---

## 📡 Integrated API Endpoints

### 1. Authentication Endpoints

#### Register User
- **Method**: POST
- **Endpoint**: `/auth/register`
- **Status**: ✅ Integrated
- **Location**: `src/pages/RegisterPage.tsx`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "user_id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "message": "User registered successfully"
  }
  ```

#### Login User
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Status**: ✅ Integrated
- **Location**: `src/pages/LoginPage.tsx`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```
- **Auth**: None (public endpoint)
- **Token Handling**:
  - Token saved to `localStorage` as `access_token`
  - Automatically attached to all subsequent requests
  - Auto-redirect on 401 (token expiry)

#### Admin Login
- **Method**: POST
- **Endpoint**: `/admin/login`
- **Status**: ✅ Integrated (available in services)
- **Location**: `src/services/index.ts`
- **Auth**: None (public endpoint)

---

### 2. User Profile Endpoints

#### Get Current User
- **Method**: GET
- **Endpoint**: `/users/me`
- **Status**: ✅ Integrated
- **Location**: `src/pages/LoginPage.tsx` (auto-fetch after login)
- **Auth**: Required (Bearer token)
- **Response**:
  ```json
  {
    "user_id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
  ```

#### Get User Profile
- **Method**: GET
- **Endpoint**: `/users/profile`
- **Status**: ✅ Integrated
- **Location**: `src/pages/ProfilePage.tsx`
- **Auth**: Required (Bearer token)
- **Response**:
  ```json
  {
    "user_id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
  ```

---

### 3. Schemes Endpoints

#### Get All Schemes
- **Method**: GET
- **Endpoint**: `/schemes`
- **Status**: ✅ Integrated
- **Location**: `src/pages/SchemesPage.tsx` (line ~45)
- **Auth**: Required (Bearer token)
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "Pradhan Mantri Jeevan Bima Yojana",
      "description": "Life insurance scheme...",
      "eligibility_criteria": "Age 18-59...",
      "benefits": "Insurance coverage..."
    }
  ]
  ```
- **Usage**: Display all available schemes

#### Get Eligible Schemes for User
- **Method**: GET
- **Endpoint**: `/user-schemes/eligible`
- **Status**: ✅ Integrated
- **Location**: `src/pages/SchemesPage.tsx` (line ~50)
- **Auth**: Required (Bearer token)
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "Scheme Name",
      "description": "..."
    }
  ]
  ```
- **Usage**: Show "Eligible" badge on scheme cards

#### Get Scheme by ID
- **Method**: GET
- **Endpoint**: `/schemes/{id}`
- **Status**: ✅ Integrated (in services)
- **Location**: `src/services/index.ts`
- **Auth**: Required (Bearer token)

---

### 4. Eligibility Check Endpoints

#### Check Eligibility
- **Method**: POST
- **Endpoint**: `/eligibility`
- **Status**: ✅ Integrated
- **Location**: `src/pages/EligibilityPage.tsx`
- **Auth**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "age": 35,
    "income": 500000,
    "state": "maharashtra",
    "caste": "general",
    "occupation": "farmer"
  }
  ```
- **Response**:
  ```json
  [
    {
      "scheme_id": 1,
      "scheme_name": "Scheme A",
      "eligible": true,
      "reason": "Meets all criteria"
    },
    {
      "scheme_id": 2,
      "scheme_name": "Scheme B",
      "eligible": false,
      "reason": "Income exceeds limit"
    }
  ]
  ```
- **Usage**: Core feature - check eligibility for all schemes

#### Get Eligibility History
- **Method**: GET
- **Endpoint**: `/eligibility-history`
- **Status**: ✅ Integrated (in services)
- **Location**: `src/services/index.ts`
- **Auth**: Required (Bearer token)
- **Response**: Array of previous eligibility checks

#### Get Eligibility History Detail
- **Method**: GET
- **Endpoint**: `/eligibility-history/{id}`
- **Status**: ✅ Integrated (in services)
- **Location**: `src/services/index.ts`
- **Auth**: Required (Bearer token)

---

### 5. Recommendation Endpoints

#### Get ML Recommendations
- **Method**: POST
- **Endpoint**: `/ml/recommend`
- **Status**: ✅ Integrated (in services)
- **Location**: `src/services/index.ts`
- **Auth**: Required (Bearer token)
- **Request Body**: Same as eligibility check
- **Usage**: ML-based scheme recommendations

---

## 🔐 JWT Authentication Implementation

### Token Lifecycle

1. **Registration/Login**
   - User submits credentials
   - Backend returns `access_token`
   - Frontend saves to `localStorage` as `access_token`

2. **Request Interception**
   - All API requests automatically include `Authorization: Bearer {token}` header
   - Handled by Axios interceptor in `src/services/api.ts`

3. **Response Handling**
   - 401 responses trigger token clearing
   - User redirected to login page
   - Must re-authenticate to continue

4. **Token Storage**
   - Location: `localStorage.access_token`
   - Persists across page reloads
   - Cleared on logout or 401 response

### Interceptor Details

**Request Interceptor** (src/services/api.ts, lines 18-27):
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor** (src/services/api.ts, lines 30-41):
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🛡️ CORS Configuration

### Frontend Requirements
- Backend must allow `http://localhost:5173` in CORS origins
- Required headers:
  - `Access-Control-Allow-Origin: http://localhost:5173`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

### Proxy Configuration
Vite proxy configured to forward API calls:
```javascript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

---

## 📊 API Service Layer Structure

All API calls go through the service layer (`src/services/index.ts`):

```typescript
// Example usage
import { authService, schemesService } from '@services/index';

// Register
const response = await authService.register(data);

// Login
const response = await authService.login(data);

// Get schemes
const schemes = await schemesService.getAllSchemes();

// Check eligibility
const results = await eligibilityService.checkEligibility(data);
```

### Benefits
- Centralized API configuration
- Easy to modify endpoints
- Consistent error handling
- Automatic token attachment

---

## 🧩 Component Integration Points

### Authentication Components
- **LoginPage** (`src/pages/LoginPage.tsx`): Calls `/auth/login`
- **RegisterPage** (`src/pages/RegisterPage.tsx`): Calls `/auth/register`
- **Header** (`src/components/Header.tsx`): Uses `useAuthStore` for state

### Protected Components
- **SchemesPage** (`src/pages/SchemesPage.tsx`): 
  - Calls `/schemes`
  - Calls `/user-schemes/eligible`
  - Protected route

- **EligibilityPage** (`src/pages/EligibilityPage.tsx`):
  - Calls `/eligibility`
  - Protected route

- **ProfilePage** (`src/pages/ProfilePage.tsx`):
  - Displays user info
  - Protected route

---

## 🔄 State Management

### Zustand Store (src/context/authStore.ts)

```typescript
// Store structure
{
  user: null | UserObject,
  token: null | string,
  isAuthenticated: boolean,
  isAdmin: boolean,
  
  // Actions
  setUser(user),
  setToken(token),
  logout(),
  loadFromStorage(),
  setAdmin(isAdmin)
}
```

### Usage in Components

```typescript
import { useAuthStore } from '@context/authStore';

const { user, token, isAuthenticated, logout } = useAuthStore();
```

---

## 📝 Environment Variables

**File**: `.env.local`

```
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

**Access in Code**:
```typescript
const baseUrl = import.meta.env.VITE_API_URL;
const timeout = import.meta.env.VITE_API_TIMEOUT;
```

---

## ✅ Integration Checklist

- ✅ Frontend running on port 5173
- ✅ Backend API reachable at localhost:8000
- ✅ JWT token automatically attached to requests
- ✅ Authentication endpoints integrated
- ✅ User profile endpoints integrated
- ✅ Schemes endpoints integrated
- ✅ Eligibility check endpoint integrated
- ✅ Protected routes working
- ✅ Token persistence across page reloads
- ✅ Auto-logout on 401
- ✅ Environment variables configured
- ✅ CORS handling implemented

---

## 🚀 Testing API Integration

### Test Registration & Login
```bash
# 1. Frontend at http://localhost:5173
# 2. Click "Register"
# 3. Fill form and submit
# 4. Should see success message
# 5. Auto-login and redirect to home
```

### Test Token Persistence
```bash
# 1. Login successfully
# 2. Open DevTools Console
# 3. Run: localStorage.getItem('access_token')
# 4. Reload page
# 5. Should still be logged in
```

### Test Protected Routes
```bash
# 1. Without login, try to visit /schemes
# 2. Should redirect to login
# 3. Login, then visit /schemes
# 4. Should display schemes
```

### Test API Requests
```bash
# 1. Open DevTools Network tab
# 2. Make any API call
# 3. Check "Authorization" header
# 4. Should show: "Authorization: Bearer {token}"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error - CORS"
**Solution**: Ensure backend CORS middleware includes `http://localhost:5173`

### Issue 2: "401 Unauthorized on login"
**Solution**: Check backend login endpoint returns correct token format

### Issue 3: "Token not sent in requests"
**Solution**: Verify interceptor (check localStorage has token), check request headers

### Issue 4: "Blank page after login"
**Solution**: Check console for errors, verify `/users/me` endpoint returns data

### Issue 5: "API calls go to wrong URL"
**Solution**: Check `.env.local` VITE_API_URL matches your backend URL

---

## 📋 Files Reference

### Core API Files
- `src/services/api.ts` - Axios client with interceptors
- `src/services/index.ts` - All API endpoint definitions
- `src/context/authStore.ts` - Zustand authentication store

### Page Components
- `src/pages/HomePage.tsx` - Landing page
- `src/pages/LoginPage.tsx` - Login (POST /auth/login)
- `src/pages/RegisterPage.tsx` - Register (POST /auth/register)
- `src/pages/SchemesPage.tsx` - Schemes (GET /schemes, GET /user-schemes/eligible)
- `src/pages/EligibilityPage.tsx` - Eligibility (POST /eligibility)
- `src/pages/ProfilePage.tsx` - Profile (GET /users/profile)

### Configuration Files
- `vite.config.ts` - Vite config with API base URL
- `tsconfig.json` - TypeScript config with path aliases
- `.env.local` - Environment variables
- `tailwind.config.js` - Tailwind CSS config

---

**Generated**: January 22, 2026
**Frontend Status**: ✅ Production Ready
**API Integration**: ✅ Complete
**JWT Authentication**: ✅ Implemented
**Development Server**: ✅ Running at http://localhost:5173
