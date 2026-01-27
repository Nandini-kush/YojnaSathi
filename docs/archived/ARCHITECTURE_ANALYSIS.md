# FastAPI Backend Architecture Analysis Report
**Date**: January 18, 2026 | **Project**: YojnaSathi  
**Status**: COMPREHENSIVE AUDIT - Development Stage 2 (Auth + DB)

---

## 📊 DEVELOPMENT PROGRESS

### ✅ **COMPLETED (Week-wise)**

#### **Week 1: Foundation**
- ✅ FastAPI application setup
- ✅ SQLAlchemy ORM integration with SQLite/PostgreSQL
- ✅ Database models (Admin, User, Scheme)
- ✅ Basic routing structure

#### **Week 2: Authentication Layer**
- ✅ OAuth2PasswordBearer implementation
- ✅ JWT token creation and validation (using `python-jose`)
- ✅ Password hashing with bcrypt (`passlib`)
- ✅ Admin and User authentication separation
- ✅ Swagger UI OAuth2 flow configuration

#### **Week 3: Admin Management (Partial)**
- ✅ Admin login endpoint (`/admin/auth/login`)
- ✅ Admin-protected routes for scheme CRUD (`/admin/schemes/*`)
- ✅ Role-based access control dependency injection
- ⚠️ Admin registration endpoint removed (missing)

#### **Week 4: User Authentication (Partial)**
- ✅ User registration endpoint (`/user/auth/register`)
- ✅ User login endpoint (`/user/auth/login`)
- ⚠️ No user-protected routes implemented yet
- ⚠️ Missing user profile/preference management

#### **Week 5: Scheme Eligibility (Complete)**
- ✅ Public scheme listing (`/schemes/`)
- ✅ Eligibility checker (`/schemes/check-eligibility`)
- ✅ Eligibility request/response schemas

#### **Week 6: ML Recommendation (Partial)**
- ✅ ML model integration skeleton (`/ml/recommend`)
- ⚠️ ML model not properly trained/saved
- ⚠️ Model loading mechanism incomplete

---

## 🔐 AUTHENTICATION FLOW ANALYSIS

### **OAuth2PasswordBearer Implementation: CORRECT ✅**

#### **Admin Auth Flow**
1. Client → `POST /admin/auth/login` with credentials
2. Server validates email/password
3. Server creates JWT: `{"sub": str(admin.id), "exp": ...}`
4. Returns: `{"access_token": "...", "token_type": "bearer"}`
5. Swagger stores token and sends: `Authorization: Bearer <token>`
6. Protected route dependency: `Depends(get_current_admin)` extracts & validates token

**Status**: ✅ **CORRECT** - All pieces aligned

#### **User Auth Flow**
1. Client → `POST /user/auth/login` with credentials
2. Server validates email/password
3. Server creates JWT: `{"sub": user.email, "user_id": user.id}`
4. Returns: `{"access_token": "...", "token_type": "bearer"}`
5. Swagger stores token
6. **ISSUE**: No user-protected routes exist yet to test flow

**Status**: ⚠️ **PARTIALLY CORRECT** - Auth works but no protected endpoints

---

## ⚠️ ISSUES FOUND (Severity Levels)

### **CRITICAL 🔴**
1. **[app/dependencies/admin_auth.py](app/dependencies/admin_auth.py)** - Lines 4-10
   - **Issue**: Imports `oauth2_scheme` from non-existent `app.utils.security`
   - **Current Code**: `from app.utils.security import oauth2_scheme`
   - **Problem**: `app.utils.security` only has password hashing, NOT OAuth2
   - **Result**: File is BROKEN, imports will fail
   - **Fix Required**: Remove this file OR fix imports

2. **[app/utils/user_auth.py](app/utils/user_auth.py)** - Line 21
   - **Issue**: JWT payload mismatch
   - **Current**: Creates token with `{"sub": user.email, "user_id": user.id}`
   - **Expects**: Decodes looking for `user_id` from `payload.get("sub")`
   - **Problem**: Will try `int(user.email)` → FAILS
   - **Fix Required**: Change to `{"sub": str(user.id)}` for consistency

3. **[app/routes/user_auth.py](app/routes/user_auth.py)** - Line 20
   - **Issue**: User login doesn't use `OAuth2PasswordRequestForm`
   - **Current**: Uses Pydantic `UserLogin` model (email/password)
   - **Problem**: Swagger can't auto-fill credentials, manual testing required
   - **Fix Required**: Change to `OAuth2PasswordRequestForm = Depends()` like admin

---

### **HIGH 🟠**

4. **[app/dependencies/admin_auth.py](app/dependencies/admin_auth.py)** - Architecture Error
   - **Issue**: Function name is `get_current_admin()` but body just checks token existence
   - **Current Code**: Returns raw token string, not Admin object
   - **Expected**: Should return Admin database object like `app/utils/auth.py`
   - **Impact**: If used, routes would get string token instead of admin object
   - **Status**: File is deprecated but still in codebase

---

### **MEDIUM 🟡**

5. **[app/routes/admin_auth.py](app/routes/admin_auth.py)** - Missing token_type default
   - **Issue**: Response model requires `token_type` field
   - **Status**: Actually CORRECT now (returns `token_type: "bearer"`)
   - **Verdict**: ✅ No issue

6. **User Registration Endpoint** - REMOVED
   - **Issue**: `/admin/auth/register` endpoint was removed
   - **Impact**: No way to create admin accounts programmatically
   - **Required**: Add back admin registration or provide manual DB seeding

7. **[app/db/database.py](app/db/database.py)** - Duplicate database setup
   - **Issue**: File still uses `load_dotenv()` and direct env reading
   - **Expected**: Should use `app.config.settings` like `session.py`
   - **Status**: Works but inconsistent with config approach
   - **Fix**: Remove dotenv loading, use settings

---

### **LOW 🟢**

8. **[app/services/user_auth.py](app/services/user_auth.py)** - Line 46
   - **Issue**: `authenticate_user()` uses `sub: user.email` but should be `sub: user.id`
   - **Status**: Causes critical bug #2 above
   - **Fix Required**: Change `{"sub": user.email, ...}` → `{"sub": str(user.id)}`

9. **User model inconsistency** - `app/models/user.py` vs `app/db/models.py`
   - **Issue**: Two different User models imported in different places
   - **Location 1**: `app/utils/user_auth.py` imports from `app.models.user`
   - **Location 2**: `app/db/models.py` defines User model
   - **Status**: Needs clarification - check if `app/models/user.py` exists
   - **Fix**: Consolidate to single User model definition

10. **Missing ML Features** - `app/ml/` modules
    - **Issue**: Model training/loading not properly implemented
    - **Status**: Skeleton exists, not functional
    - **Priority**: Low (feature incomplete but doesn't break auth)

---

## ✅ WHAT'S CORRECT

### **OAuth2PasswordBearer Configuration**
- ✅ Admin: `tokenUrl="/admin/auth/login"` matches actual endpoint
- ✅ User: `tokenUrl="/user/auth/login"` matches actual endpoint
- ✅ Both use `OAuth2PasswordBearer` class correctly (not HTTPBearer)
- ✅ Swagger UI automatically sends `Authorization: Bearer <token>` header

### **JWT Token Creation**
- ✅ Uses `python-jose` library (correct choice)
- ✅ Token includes expiration time
- ✅ Uses settings.SECRET_KEY and settings.ALGORITHM
- ✅ Payload includes required `"sub"` claim (user identifier)

### **Token Validation**
- ✅ `get_current_admin()` properly decodes JWT
- ✅ Extracts admin_id from `payload.get("sub")`
- ✅ Queries database to verify admin exists
- ✅ Returns Admin object (not just string)
- ✅ Proper error handling with 401 responses

### **Admin-Protected Routes**
- ✅ `/admin/schemes/*` routes use `dependencies=[Depends(get_current_admin)]`
- ✅ All admin routes require valid token
- ✅ Proper 401 response when unauthorized

### **Config Management**
- ✅ Settings class in `config.py` with defaults
- ✅ Supports `.env` file for sensitive keys
- ✅ All auth utilities import from settings
- ✅ Single source of truth for SECRET_KEY, ALGORITHM

### **Password Security**
- ✅ Uses bcrypt (industry standard)
- ✅ Passwords truncated to 72 chars (bcrypt limitation)
- ✅ Passwords never stored in plaintext
- ✅ Proper verification flow

### **Database Setup**
- ✅ SQLAlchemy ORM properly configured
- ✅ Database session management with `get_db()` dependency
- ✅ Models properly defined with relationships
- ✅ Migration-ready structure

### **Swagger/OpenAPI**
- ✅ FastAPI auto-generates Swagger UI
- ✅ OAuth2 security scheme automatically configured
- ✅ "Authorize" button visible in `/docs`
- ✅ Token endpoint recognized by Swagger

---

## ❌ WHAT'S WRONG

| File | Issue | Severity | Status |
|------|-------|----------|--------|
| `app/dependencies/admin_auth.py` | Broken imports, deprecated code | 🔴 CRITICAL | Remove or fix |
| `app/utils/user_auth.py` | JWT payload mismatch (email vs id) | 🔴 CRITICAL | Fix line 21 |
| `app/routes/user_auth.py` | Not using OAuth2PasswordRequestForm | 🟠 HIGH | Change to OAuth2Form |
| `app/services/user_auth.py` | Token creation uses email not id | 🔴 CRITICAL | Fix line 46 |
| `app/db/database.py` | Inconsistent config approach | 🟡 MEDIUM | Consolidate |
| Admin registration | Endpoint removed, no way to create admins | 🟡 MEDIUM | Add back or seed |

---

## 🔧 ARCHITECTURAL ISSUES

### **1. OAuth2 Instance Proliferation**
- ✅ **Current State**: 2 OAuth2PasswordBearer instances (admin and user) - CORRECT
  - `oauth2_scheme` in `app/utils/auth.py` for admin
  - `oauth2_scheme_user` in `app/utils/user_auth.py` for user
- ✅ No conflicts or duplication
- ❌ **Old Issue**: `app/dependencies/admin_auth.py` had a 3rd one (deprecated)

### **2. Dependency Injection Pattern**
- ✅ **Router Level**: `dependencies=[Depends(get_current_admin)]` on admin routes
- ✅ **Function Level**: Some functions use individual dependencies
- ✅ **Database**: Proper dependency via `get_db()`

### **3. Token Payload Strategy**
- ⚠️ **Admin**: Stores `{"sub": admin.id}` ✅
- ❌ **User**: Stores `{"sub": user.email, "user_id": id}` but decodes `payload.get("sub")` → tries `int(email)` ❌

### **4. Error Handling**
- ✅ Admin routes return proper 401 with Bearer challenge
- ✅ JWT validation catches `JWTError`
- ✅ Database lookups check for None
- ⚠️ Some routes don't validate user exists (missing `get_current_user` usage)

### **5. Request/Response Models**
- ✅ Pydantic schemas properly defined
- ✅ Type hints used correctly
- ✅ Response models include `token_type`
- ⚠️ Admin response model missing (no admin GET endpoint)

---

## 🧪 SWAGGER TESTING ANALYSIS

### **Why `/admin/schemes/` Returns 401 After Authorize (If Broken)**

1. **Scenario**: User clicks Authorize in Swagger
2. **Swagger**: Sends POST request to `/admin/auth/login`
3. **If admin login works**: Returns `{"access_token": "xyz...", "token_type": "bearer"}`
4. **Swagger stores**: Token in memory
5. **Swagger sends**: `Authorization: Bearer xyz...` header to protected routes
6. **FastAPI routes**: Extract token via `Depends(oauth2_scheme)`
7. **`oauth2_scheme`**: Uses `tokenUrl` to tell Swagger where to authenticate

### **If Still Getting 401**

- ❌ Token not being sent: Check `tokenUrl` matches actual endpoint
- ❌ Token invalid: Check JWT payload matches decoder expectations
- ❌ Wrong dependency: Check route uses correct `get_current_*` function
- ❌ User model issue: Check `app/models/user.py` exists and is used correctly

---

## 📋 NEXT STEPS (PRIORITY ORDER)

### **Phase 1: Critical Fixes (DO FIRST)**

1. **[CRITICAL]** Fix `app/dependencies/admin_auth.py`
   - Option A: Delete the file (recommended)
   - Option B: Fix the imports to use `app.utils.auth.get_current_admin`
   - Status: Currently broken imports

2. **[CRITICAL]** Fix user JWT payload mismatch
   - File: `app/utils/user_auth.py` line 21
   - Change: `user_id = payload.get("sub")` → `user_id = int(payload.get("sub"))`
   - File: `app/services/user_auth.py` line 46
   - Change: `{"sub": user.email, ...}` → `{"sub": str(user.id)}`

3. **[CRITICAL]** Fix user login to use OAuth2PasswordRequestForm
   - File: `app/routes/user_auth.py`
   - Change: Accept `OAuth2PasswordRequestForm` instead of `UserLogin` model
   - Reason: Swagger will auto-populate form fields

4. **[CRITICAL]** Resolve user model import conflicts
   - Check if `app/models/user.py` exists
   - If yes: Consolidate with `app/db/models.py`
   - If no: Fix imports to use `app.db.models.User`

### **Phase 2: Configuration Cleanup**

5. **[HIGH]** Consolidate database config
   - Remove `load_dotenv()` from `app/db/database.py`
   - Use `settings.DATABASE_URL` everywhere
   - Reason: Single source of truth

6. **[HIGH]** Add back admin registration
   - Create `POST /admin/auth/register` endpoint
   - Or: Add database seeding script for initial admin
   - Reason: No way to create first admin currently

### **Phase 3: Testing & Validation**

7. **[MEDIUM]** Create integration tests
   - Test admin login → get token
   - Test using token on protected route
   - Test user login → get token
   - Test expired token rejection

8. **[MEDIUM]** Test Swagger OAuth2 flow
   - Click Authorize button
   - Login with test credentials
   - Call protected endpoint
   - Verify Authorization header is sent

9. **[MEDIUM]** Add user-protected endpoints
   - Create `GET /user/me` endpoint
   - Protect with `Depends(get_current_user)`
   - Return current user profile

### **Phase 4: Feature Completion**

10. **[LOW]** Implement ML training pipeline
    - Load training data
    - Train model properly
    - Save model to disk
    - Load model at startup

11. **[LOW]** Add user preference management
    - User profile endpoints
    - Save preferences to database
    - Use preferences in recommendations

---

## 🎯 SUMMARY

| Category | Status | Details |
|----------|--------|---------|
| **OAuth2 Flow** | ✅ MOSTLY CORRECT | Admin auth works, user auth has JWT payload bug |
| **Role-Based Access** | ⚠️ PARTIALLY IMPLEMENTED | Admin protected, user routes missing |
| **JWT Implementation** | ⚠️ PARTIALLY CORRECT | Admin correct, user payload mismatch |
| **Swagger Integration** | ✅ CORRECT | OAuth2 properly configured |
| **Code Quality** | 🟡 MEDIUM | Good structure, some inconsistencies |
| **Production Ready** | ❌ NOT YET | Critical bugs must be fixed first |

---

## 📌 HONEST ASSESSMENT

**If this was code review for production**:
- ✅ Architecture is sound
- ✅ Security practices are correct
- ✅ Authentication flow is properly designed
- ❌ Implementation has bugs that break functionality
- ❌ User auth is broken (JWT payload mismatch)
- ❌ Broken imports in dependencies
- ⚠️ Not all features implemented yet

**Stage Estimate**: ~60% complete (foundation solid, middle layer has bugs, top features incomplete)

**Time to Production**: 3-5 days if all critical fixes applied and tested properly.

---

**Generated**: January 18, 2026  
**Analysis Level**: DEEP ARCHITECTURE REVIEW
