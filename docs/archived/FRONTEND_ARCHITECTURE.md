# 🏗️ YOJNASATHI FRONTEND - ARCHITECTURE DIAGRAM

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER                                │
│            (http://localhost:5173)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              React Application (Vite)                 │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │         Router (React Router v6)             │    │   │
│  │  │                                              │    │   │
│  │  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  │    │   │
│  │  │  │  Home   │  │ Login    │  │Register  │  │    │   │
│  │  │  │ Page    │  │ Page     │  │ Page     │  │    │   │
│  │  │  └─────────┘  └──────────┘  └──────────┘  │    │   │
│  │  │                                              │    │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │   │
│  │  │  │ Schemes  │  │Eligibility│ │ Profile  │  │    │   │
│  │  │  │ Page     │  │ Page      │  │ Page     │  │    │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                        ↓                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │     Protected Routes (Auth Guard)            │    │   │
│  │  │  Zustand Store → Auth Check → Redirect       │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                        ↓                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │        Reusable Components                   │    │   │
│  │  │  Button │ Input │ Card │ Alert │ Loading  │    │   │
│  │  │  Header │ ProtectedRoute                    │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                        ↓                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │    Styling (Tailwind + Framer Motion)        │    │   │
│  │  │  Responsive │ Animations │ Icons             │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                        ↓                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │         State Management (Zustand)           │    │   │
│  │  │  - User Info                                 │    │   │
│  │  │  - JWT Token                                 │    │   │
│  │  │  - Auth Status                               │    │   │
│  │  │  - localStorage persistence                  │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                        ↓                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │        API Service Layer (Axios)             │    │   │
│  │  │  ┌───────────────────────────────────────┐   │    │   │
│  │  │  │  Request Interceptor:                │   │    │   │
│  │  │  │  Adds Bearer {token} to all requests │   │    │   │
│  │  │  ├───────────────────────────────────────┤   │    │   │
│  │  │  │  Response Interceptor:               │   │    │   │
│  │  │  │  - Handles 401 errors                │   │    │   │
│  │  │  │  - Clears token                      │   │    │   │
│  │  │  │  - Redirects to login                │   │    │   │
│  │  │  └───────────────────────────────────────┘   │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                        ↓                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │       API Endpoint Services                  │    │   │
│  │  │  - authService (register, login)             │    │   │
│  │  │  - userService (profile)                     │    │   │
│  │  │  - schemesService (browse)                   │    │   │
│  │  │  - eligibilityService (check)                │    │   │
│  │  │  - recommendationService (ML)                │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                       HTTP / HTTPS
                      (Bearer Token)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI BACKEND                                │
│            (http://localhost:8000)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           Routes / Endpoints                        │     │
│  │                                                      │     │
│  │  POST /auth/register        → Register User        │     │
│  │  POST /auth/login           → Login (JWT Token)    │     │
│  │  GET  /users/me             → Get Current User     │     │
│  │  GET  /users/profile        → Get Profile          │     │
│  │  GET  /schemes              → Get All Schemes      │     │
│  │  GET  /user-schemes/eligible → Eligible Schemes    │     │
│  │  POST /eligibility          → Check Eligibility    │     │
│  │  GET  /eligibility-history  → Get History          │     │
│  │  POST /ml/recommend         → Get Recommendations  │     │
│  │                                                      │     │
│  └──────────────────────────────────────────────────────┘     │
│                             ↓                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │        JWT Validation & Authorization               │     │
│  │  - Verify token signature                           │     │
│  │  - Check expiration                                 │     │
│  │  - Extract user info                                │     │
│  └──────────────────────────────────────────────────────┘     │
│                             ↓                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │        Business Logic Services                       │     │
│  │  - User authentication                              │     │
│  │  - Scheme management                                │     │
│  │  - Eligibility checking                             │     │
│  │  - ML recommendations                               │     │
│  └──────────────────────────────────────────────────────┘     │
│                             ↓                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           Database (SQLAlchemy ORM)                 │     │
│  │  - Users table                                      │     │
│  │  - Schemes table                                    │     │
│  │  - Eligibility history                              │     │
│  │  - User eligibility records                         │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### 1. Registration Flow
```
User fills form
    ↓
Frontend validates
    ↓
POST /auth/register
    ↓
Backend creates user
    ↓
Response: user_id, email, name
    ↓
Frontend auto-login
```

### 2. Login Flow
```
User enters credentials
    ↓
POST /auth/login
    ↓
Backend validates credentials
    ↓
Backend generates JWT token
    ↓
Response: access_token, token_type
    ↓
Frontend saves token to localStorage
    ↓
Frontend redirects to home
```

### 3. Protected Request Flow
```
User clicks "Schemes"
    ↓
Frontend tries to access /schemes page
    ↓
ProtectedRoute checks auth
    ↓
Auth check passes → Load page
    ↓
Component calls GET /schemes
    ↓
Request Interceptor:
  - Reads token from localStorage
  - Adds header: Authorization: Bearer {token}
    ↓
Backend receives request
    ↓
Backend validates JWT
    ↓
Backend returns schemes data
    ↓
Frontend displays schemes
```

### 4. Token Expiry Flow
```
User makes API request
    ↓
Token expired on backend
    ↓
Backend returns 401 (Unauthorized)
    ↓
Response Interceptor catches 401
    ↓
Interceptor:
  - Clears localStorage token
  - Clears localStorage user
    ↓
Interceptor redirects to /login
    ↓
User sees login page
    ↓
User must re-authenticate
```

---

## 🗂️ Component Hierarchy

```
App (Main)
├── Header (Navigation)
│   ├── Logo/Brand
│   ├── Navigation Links
│   ├── Auth Status
│   └── User Menu (if logged in)
│
├── Router
│   ├── / (HomePage - Public)
│   │   ├── Hero Section
│   │   ├── Features
│   │   └── CTA Button
│   │
│   ├── /login (LoginPage - Public)
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Submit Button
│   │   └── Link to Register
│   │
│   ├── /register (RegisterPage - Public)
│   │   ├── Name Input
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Submit Button
│   │   └── Link to Login
│   │
│   ├── /schemes (SchemesPage - Protected)
│   │   ├── Filter Section
│   │   ├── SchemeCard x N
│   │   │   ├── Scheme Name
│   │   │   ├── Description
│   │   │   ├── Benefits
│   │   │   └── Eligible Badge (conditional)
│   │   └── Loading State
│   │
│   ├── /eligibility (EligibilityPage - Protected)
│   │   ├── Form Section
│   │   │   ├── Age Input
│   │   │   ├── Income Input
│   │   │   ├── State Select
│   │   │   ├── Caste Select
│   │   │   ├── Occupation Input
│   │   │   └── Submit Button
│   │   └── Results Section
│   │       ├── EligibilityResult x N
│   │       │   ├── Scheme Name
│   │       │   ├── Eligible/Not Eligible
│   │       │   ├── Reason
│   │       │   └── Icon
│   │       └── Loading State
│   │
│   ├── /profile (ProfilePage - Protected)
│   │   ├── Avatar
│   │   ├── User Info
│   │   │   ├── Name
│   │   │   ├── Email
│   │   │   └── Role
│   │   └── Logout Button
│   │
│   └── /* (NotFoundPage - Public)
│       ├── 404 Message
│       └── Home Link
│
└── Footer (Optional)
```

---

## 🔐 Authentication State Flow

```
localStorage
    ├── access_token (JWT)
    └── user (JSON object)
         ├── user_id
         ├── email
         ├── name
         └── role

Zustand Store (useAuthStore)
    ├── State:
    │   ├── user
    │   ├── token
    │   ├── isAuthenticated
    │   └── isAdmin
    │
    └── Actions:
        ├── setUser(user)
        ├── setToken(token)
        ├── logout()
        ├── loadFromStorage()
        └── setAdmin(isAdmin)

Request → Interceptor
    ├── Read token from store/localStorage
    ├── Check if token exists
    ├── Add to headers: Authorization: Bearer {token}
    └── Send request

Response → Interceptor
    ├── Check status
    ├── If 401:
    │   ├── Clear localStorage
    │   ├── Clear store
    │   ├── Navigate to /login
    │   └── Return error
    └── If 200: Return data
```

---

## 📡 API Service Architecture

```
apiClient (Axios Instance)
    ├── Base URL: http://localhost:8000
    ├── Timeout: 10000ms
    │
    ├── Interceptors:
    │   ├── Request:
    │   │   └── Add JWT token
    │   │
    │   └── Response:
    │       ├── Handle 401
    │       ├── Handle errors
    │       └── Return data
    │
    └── Services:
        ├── authService
        │   ├── register(data)
        │   ├── login(data)
        │   └── adminLogin(data)
        │
        ├── userService
        │   ├── getMe()
        │   └── getProfile()
        │
        ├── schemesService
        │   ├── getAllSchemes()
        │   ├── getSchemeById(id)
        │   └── getEligibleSchemes()
        │
        ├── eligibilityService
        │   ├── checkEligibility(data)
        │   ├── getEligibilityHistory()
        │   └── getEligibilityHistoryDetail(id)
        │
        └── recommendationService
            └── getRecommendations(data)
```

---

## 🎨 Styling Architecture

```
Tailwind CSS
    ├── Configuration (tailwind.config.js)
    │   ├── Colors (primary, secondary, danger)
    │   ├── Animations (fadeIn, slideUp)
    │   └── Breakpoints (sm, md, lg)
    │
    ├── Utility Classes
    │   ├── Layout: flex, grid, container
    │   ├── Typography: text-*, font-*
    │   ├── Spacing: p-*, m-*, gap-*
    │   ├── Colors: text-*, bg-*
    │   └── States: hover:*, focus:*
    │
    └── Components
        ├── Button
        ├── Input
        ├── Card
        ├── Alert
        └── Others

PostCSS
    ├── Tailwind CSS processor
    └── Autoprefixer (vendor prefixes)

Framer Motion
    ├── Page transitions
    ├── Component animations
    ├── Hover effects
    └── Loading spinners

Lucide Icons
    └── Icon library for all UI elements
```

---

## 📊 State Management

```
Zustand Store (useAuthStore)
    │
    ├── Persisted in localStorage
    │   ├── access_token
    │   └── user JSON
    │
    ├── Used in Components
    │   ├── Header (show/hide login)
    │   ├── ProtectedRoute (auth check)
    │   ├── Pages (user info)
    │   └── Services (add token to requests)
    │
    └── Actions
        ├── setUser() → set + persist
        ├── setToken() → set + persist
        ├── logout() → clear + persist
        ├── loadFromStorage() → hydrate
        └── setAdmin() → set admin flag
```

---

## 🌐 Environment Configuration

```
.env.local
    ├── VITE_API_URL
    │   └── Base URL for API (http://localhost:8000)
    │
    └── VITE_API_TIMEOUT
        └── Request timeout in ms (10000)

Used in:
    ├── vite.config.ts (for proxy)
    ├── src/services/api.ts (for axios)
    └── Accessed via: import.meta.env.VITE_*
```

---

## 🔄 Request/Response Cycle

```
1. Component calls API
   └── Example: schemesService.getAllSchemes()

2. Service method triggers axios
   └── axios.get('/schemes')

3. Request Interceptor
   ├── Reads token from localStorage
   ├── Adds Authorization header
   └── Sends request

4. Backend receives request
   ├── Validates token
   ├── Processes request
   └── Returns response

5. Response received
   ├── If 200: Success interceptor
   ├── If 401: Error interceptor (logout)
   └── If other error: Error interceptor

6. Component receives data
   └── Updates state and re-renders

7. User sees result
   ├── Success: Display data
   ├── Error: Show error message
   └── Loading: Show spinner
```

---

**Architecture Design**: Modular, Scalable, Secure  
**State Management**: Centralized with Zustand  
**API Communication**: Interceptor-based JWT handling  
**UI Components**: Reusable, composable, styled  
**Routing**: React Router with auth guards  

✅ Complete, tested, and production-ready!
