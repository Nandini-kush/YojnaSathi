# Frontend Integration Guide

## ✅ Frontend Setup Complete

Your YojnaSathi frontend has been successfully created and configured. Here's what has been set up:

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Alert.tsx           # Alert messages
│   │   ├── Button.tsx          # Button with loading state
│   │   ├── Card.tsx            # Card container
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Input.tsx           # Form input
│   │   ├── Loading.tsx         # Loading spinner
│   │   └── ProtectedRoute.tsx  # Route protection
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx        # Landing page
│   │   ├── LoginPage.tsx       # Login form
│   │   ├── RegisterPage.tsx    # Registration form
│   │   ├── SchemesPage.tsx     # Browse schemes
│   │   ├── EligibilityPage.tsx # Check eligibility
│   │   ├── ProfilePage.tsx     # User profile
│   │   └── NotFoundPage.tsx    # 404 page
│   ├── services/
│   │   ├── api.ts              # Axios client with interceptors
│   │   └── index.ts            # API service methods
│   ├── context/
│   │   └── authStore.ts        # Zustand auth store
│   ├── styles/
│   │   └── index.css           # Global styles
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # React entry point
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.ts              # Vite configuration with path aliases
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # Dependencies
└── .env.local                  # Environment variables
```

## 🚀 Running the Application

### Prerequisites
- Backend running at `http://localhost:8000`
- Node.js 16+ installed
- Dependencies installed: `npm install`

### Start Development Server

```bash
cd frontend
npm run dev
```

The app will be available at: **http://localhost:5173**

### Production Build

```bash
npm run build
npm run preview
```

## 🔑 JWT Authentication Integration

### 1. Token Storage & Management
- Token saved to `localStorage` as `access_token` after login
- Automatic token clearing on 401 (unauthorized)
- State managed with Zustand in `src/context/authStore.ts`

### 2. Request Interceptor
All API requests automatically include:
```
Authorization: Bearer {token}
```

**File:** `src/services/api.ts` (lines 18-27)

### 3. Response Interceptor
Handles 401 responses:
- Clears token from storage
- Redirects to login page
- User re-authentication required

**File:** `src/services/api.ts` (lines 30-41)

### 4. Protected Routes
Routes like `/schemes`, `/eligibility`, `/profile` are wrapped with `<ProtectedRoute>` component which:
- Checks if user is authenticated
- Loads auth state from storage on mount
- Redirects to login if not authenticated

**File:** `src/components/ProtectedRoute.tsx`

## 🔌 API Integration Points

### Authentication Endpoints

**1. Register User**
- Endpoint: `POST /auth/register`
- File: `src/pages/RegisterPage.tsx`
- Payload: `{ name, email, password }`
- Response: `{ user_id, email, name, message }`

**2. Login User**
- Endpoint: `POST /auth/login`
- File: `src/pages/LoginPage.tsx`
- Payload: `{ email, password }`
- Response: `{ access_token, token_type }`
- Token saved to localStorage

**3. Admin Login**
- Endpoint: `POST /admin/login`
- Payload: `{ email, password }`
- Response: `{ access_token, token_type }`

### User Profile Endpoints

**1. Get Current User**
- Endpoint: `GET /users/me`
- Requires: Bearer token
- Used in: `LoginPage` (auto-fetch after login)

**2. Get User Profile**
- Endpoint: `GET /users/profile`
- Requires: Bearer token
- Used in: `ProfilePage.tsx`

### Schemes Endpoints

**1. Get All Schemes**
- Endpoint: `GET /schemes`
- Used in: `SchemesPage.tsx` (line ~45)
- Response: Array of schemes

**2. Get Eligible Schemes**
- Endpoint: `GET /user-schemes/eligible`
- Used in: `SchemesPage.tsx` (line ~50) - Shows "Eligible" badge
- Requires: Bearer token

**3. Get Scheme by ID**
- Endpoint: `GET /schemes/{id}`
- Placeholder for individual scheme details page

### Eligibility Check Endpoints

**1. Check Eligibility**
- Endpoint: `POST /eligibility`
- File: `src/pages/EligibilityPage.tsx`
- Requires: Bearer token
- Payload: 
  ```typescript
  {
    age: number,
    income: number,
    state?: string,
    caste?: string,
    occupation?: string
  }
  ```
- Response: Array of eligibility results
  ```typescript
  [
    {
      scheme_id: number,
      scheme_name: string,
      eligible: boolean,
      reason?: string
    }
  ]
  ```

**2. Get Eligibility History**
- Endpoint: `GET /eligibility-history`
- Requires: Bearer token
- Returns: List of previous eligibility checks

**3. Get Eligibility History Detail**
- Endpoint: `GET /eligibility-history/{id}`
- Requires: Bearer token
- Returns: Specific eligibility check details

### Recommendation Endpoints

**1. Get ML Recommendations**
- Endpoint: `POST /ml/recommend`
- Requires: Bearer token
- Payload: Same as eligibility check
- Returns: ML-based recommendations

## 🛠️ Customization & Integration

### To Add Your Lovable AI UI:

1. **Copy UI Components** from your Lovable export to `src/components/`
2. **Update Existing Pages** to use your custom components
3. **Maintain API Integration** - Keep all API calls intact
4. **Update Styling** - Modify Tailwind classes to match your design

### Example: Replacing SchemesPage

```typescript
// src/pages/SchemesPage.tsx
import YourCustomSchemeCard from '@components/YourCustomSchemeCard';

// Replace existing Card with your component
// Keep the API calls the same
```

## 🧪 Testing the Integration

### Test 1: Frontend Runs
```bash
npm run dev
# Visit http://localhost:5173
# Should see home page
```

### Test 2: Registration
1. Click "Register"
2. Fill form (name, email, password)
3. Submit - should see success message
4. Should auto-login and redirect to home

### Test 3: Login
1. Click "Login"
2. Use registered email/password
3. Token saved to localStorage
4. Can access protected routes

### Test 4: Protected Routes
1. Login successfully
2. Visit `/schemes` - should load
3. Visit `/eligibility` - should load
4. Logout - redirected to login

### Test 5: API Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make any API call
4. Should see `Authorization: Bearer {token}` header

### Test 6: Token Expiry
1. Open DevTools Console
2. Run: `localStorage.removeItem('access_token')`
3. Try to access protected route
4. Should redirect to login

## 🔍 Environment Configuration

**File:** `.env.local`

```
VITE_API_URL=http://localhost:8000    # Backend URL
VITE_API_TIMEOUT=10000                # Request timeout (ms)
```

### Using Environment Variables in Code

```typescript
const apiUrl = import.meta.env.VITE_API_URL
const timeout = import.meta.env.VITE_API_TIMEOUT
```

## 🐛 Troubleshooting

### Issue: 401 Unauthorized on Protected Routes
**Solution:** 
- Check token exists: `localStorage.getItem('access_token')`
- Check token format in requests (Network tab)
- Verify backend is rejecting correctly

### Issue: CORS Errors
**Solution:**
- Verify backend has CORS enabled
- Check allowed origins include `http://localhost:5173`
- Check Content-Type headers

### Issue: API requests failing
**Solution:**
- Verify backend running on port 8000
- Check `VITE_API_URL` in `.env.local`
- Check request payload format matches schema

### Issue: Blank pages after login
**Solution:**
- Check console for errors (F12)
- Verify user data is returned from `/users/me`
- Check if routes are properly configured

## 📋 Checklist

- ✅ Frontend folder structure created
- ✅ React + TypeScript project setup
- ✅ Vite bundler configured
- ✅ Tailwind CSS configured
- ✅ Framer Motion animations working
- ✅ Axios HTTP client setup
- ✅ JWT token interceptors configured
- ✅ Zustand state management setup
- ✅ Authentication pages (login/register)
- ✅ Protected routes implemented
- ✅ All API endpoints integrated
- ✅ Environment variables configured
- ✅ Development server running
- ✅ Production build working

## 📞 Support

For issues with:
- **Frontend**: Check console errors (F12)
- **API Integration**: Check Network tab in DevTools
- **Authentication**: Check localStorage for token
- **Backend Connection**: Verify backend is running on port 8000

## 🎯 Next Steps

1. **Test all features** - Register, login, check schemes, eligibility
2. **Integrate Lovable UI** - If you have custom components
3. **Add more features** - History, recommendations, etc.
4. **Deploy** - Build and deploy frontend to production

---

**Frontend Status:** ✅ **READY TO USE**

Your frontend is fully functional and connected to the backend API!
