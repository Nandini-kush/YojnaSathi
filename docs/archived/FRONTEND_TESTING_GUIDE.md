# Frontend API Integration - Testing Guide

**Quick Start**: How to test the integrated frontend with your backend

---

## 🔧 Prerequisites

### Backend Must Be Running
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Installation
```bash
cd frontend
npm install
npm run dev
```

---

## 📍 Test URLs

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)

---

## 🧪 Test Flows

### 1. Registration Flow ✅

**Steps**:
1. Go to `http://localhost:5173/register`
2. Fill form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Accept Terms: Check box
3. Click "Create Account"

**Expected Results**:
- ✅ "Account Created!" toast appears
- ✅ Auto-redirect to /dashboard
- ✅ User name shown as "John Doe"
- ✅ Page refresh → still logged in

**API Calls Made**:
```
POST /auth/register
├─ Headers: Content-Type: application/json
├─ Body: {name, email, password}
└─ Response: {access_token, user}

GET /user/profile
└─ Headers: Authorization: Bearer {token}

GET /user-schemes/eligible
└─ Headers: Authorization: Bearer {token}
```

---

### 2. Login Flow ✅

**Steps**:
1. Go to `http://localhost:5173/login`
2. Fill form:
   - Email: `john@example.com`
   - Password: `password123`
3. Click "Sign In"

**Expected Results**:
- ✅ "Login Successful!" toast appears
- ✅ Auto-redirect to /dashboard
- ✅ User name shows "John Doe"
- ✅ Page refresh → still logged in

**API Calls Made**:
```
POST /auth/login
├─ Body: {email, password}
└─ Response: {access_token, user}

GET /user/profile
└─ Headers: Authorization: Bearer {token}

GET /user-schemes/eligible
└─ Headers: Authorization: Bearer {token}
```

---

### 3. Dashboard Flow ✅

**Steps**:
1. Login (see above)
2. Dashboard loads automatically

**Expected Results**:
- ✅ User name displays (e.g., "John Doe")
- ✅ Welcome message shows personalized name
- ✅ Eligible schemes list populated
- ✅ Quick action buttons functional
- ✅ Logout button clears session

**API Calls Made**:
```
GET /user/profile
└─ Response: {id, name, email, is_admin, ...}

GET /user-schemes/eligible
└─ Response: [{id, name, category, benefit, ...}, ...]
```

**Expected Data** (if no real data exists):
```json
{
  "eligible_schemes": [
    {
      "name": "PM Kisan Samman Nidhi",
      "category": "Agriculture",
      "benefit": "₹6,000/year"
    },
    ...
  ]
}
```

---

### 4. Eligibility Check Flow ✅

**Steps**:
1. Dashboard → Click "New Eligibility Check"
2. Fill 5-step form:
   - **Step 1**: Age, Gender, State, District
   - **Step 2**: Income Range, Employment Type, Ration Card
   - **Step 3**: Social Category
   - **Step 4**: Education Level, Student Status
   - **Step 5**: Results (automatic)
3. Click "Check Eligibility" on Step 4

**Expected Results**:
- ✅ Loading spinner shows during check
- ✅ Results page displays eligible schemes
- ✅ "Eligibility Check Complete!" toast
- ✅ Options to save to dashboard or view recommendations

**API Calls Made**:
```
POST /eligibility/
├─ Headers: Authorization: Bearer {token}
├─ Body: {age, gender, state, district, annual_income, ...}
└─ Response: {eligible_schemes: [{name, benefit, match}, ...]}
```

**Expected Response Format**:
```json
{
  "eligible_schemes": [
    {
      "id": 1,
      "name": "PM Kisan Samman Nidhi",
      "category": "Agriculture",
      "benefit": "₹6,000/year",
      "match_percentage": 98
    },
    ...
  ],
  "total_eligible": 5
}
```

---

### 5. History Flow ✅

**Steps**:
1. Dashboard → Click "Check History"
2. Page loads with past checks

**Expected Results**:
- ✅ History entries displayed
- ✅ Date, time, schemes shown
- ✅ Loading spinner while fetching
- ✅ Empty state if no history

**API Calls Made**:
```
GET /eligibility/history
├─ Headers: Authorization: Bearer {token}
└─ Response: [{id, date, time, eligible, not_eligible, schemes}, ...]
```

**Expected Response Format**:
```json
{
  "history": [
    {
      "id": 1,
      "date": "2024-01-15",
      "time": "10:30 AM",
      "total_schemes": 5,
      "eligible": 5,
      "not_eligible": 0,
      "eligible_schemes": ["PM Kisan", "Ayushman Bharat", ...]
    },
    ...
  ]
}
```

---

### 6. Admin CRUD Flow ✅

**Steps**:
1. Login as admin user
2. Go to `http://localhost:5173/admin`
3. Test each operation:

#### Create Scheme
- Click "+ Add New Scheme"
- Fill form and submit
- **API**: `POST /admin/schemes/`
- **Expected**: Scheme added to table

#### Edit Scheme
- Click "..." menu → "Edit"
- Modify and save
- **API**: `PUT /admin/schemes/{id}`
- **Expected**: Scheme updated in table

#### Delete Scheme
- Click "..." menu → "Delete"
- Confirm deletion
- **API**: `DELETE /admin/schemes/{id}`
- **Expected**: Scheme removed from table

**API Calls Made**:
```
POST /admin/schemes/
├─ Headers: Authorization: Bearer {token}
└─ Body: {name, category, benefit, eligibility, status}

PUT /admin/schemes/{id}
├─ Headers: Authorization: Bearer {token}
└─ Body: {name, category, benefit, eligibility, status}

DELETE /admin/schemes/{id}
└─ Headers: Authorization: Bearer {token}
```

---

## 🔍 Debug Mode

### Open Browser DevTools
```
Press F12
```

### Check Network Tab
1. Go to "Network" tab
2. Perform an action (e.g., login)
3. Look for API requests:
   - `POST /auth/login`
   - `GET /user/profile`
   - etc.
4. Click request → "Response" tab to see data

### Check Console
- Look for any red errors
- Check for warnings about missing data
- All API calls should be logged (if debugging enabled)

### Check Local Storage
1. Open DevTools → "Application" tab
2. Expand "Local Storage"
3. Click `http://localhost:5173`
4. Look for:
   - `access_token` (JWT)
   - `user` (JSON string)

---

## ⚠️ Troubleshooting

### Issue: "Cannot fetch from API"
**Solution**:
- Ensure backend is running on port 8000
- Check `.env` file: `VITE_API_URL=http://localhost:8000`
- Check CORS is enabled in backend
- Check browser console for exact error

### Issue: "401 Unauthorized"
**Solution**:
- Token may be expired
- Try logging out and back in
- Check localStorage has `access_token`
- Verify backend is accepting the token format

### Issue: "Login successful but page blank"
**Solution**:
- Check browser console for errors
- Verify backend returns `access_token` in response
- Check `GET /user/profile` endpoint exists

### Issue: "Eligible schemes not showing"
**Solution**:
- Verify `GET /user-schemes/eligible` endpoint exists
- Check backend returns scheme list in correct format
- Try with sample data if no user data exists

### Issue: "Admin page shows no schemes"
**Solution**:
- Verify user is admin (check user object in localStorage)
- Ensure `GET /schemes/` endpoint exists
- Check backend returns scheme array

---

## 📊 Expected Backend Response Formats

### POST /auth/register
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_admin": false
  }
}
```

### POST /auth/login
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_admin": false
  }
}
```

### GET /user/profile
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

### GET /user-schemes/eligible
```json
[
  {
    "id": 1,
    "name": "PM Kisan Samman Nidhi",
    "category": "Agriculture",
    "benefit": "₹6,000/year",
    "eligibility": "Farmers with cultivable land"
  },
  {
    "id": 2,
    "name": "Ayushman Bharat PMJAY",
    "category": "Health",
    "benefit": "₹5L coverage",
    "eligibility": "BPL families"
  }
]
```

### POST /eligibility/
```json
{
  "eligible_schemes": [
    {
      "id": 1,
      "name": "PM Kisan Samman Nidhi",
      "category": "Agriculture",
      "benefit": "₹6,000/year",
      "match_percentage": 98
    }
  ],
  "total_eligible": 1,
  "total_checked": 5
}
```

### GET /eligibility/history
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "time": "10:30 AM",
    "total_schemes": 5,
    "eligible": 5,
    "not_eligible": 0,
    "eligible_schemes": ["PM Kisan", "Ayushman Bharat"]
  }
]
```

### GET /schemes/
```json
[
  {
    "id": 1,
    "name": "PM Kisan Samman Nidhi",
    "category": "Agriculture",
    "benefit": "₹6,000/year",
    "status": "active",
    "applicants": 125000
  }
]
```

---

## ✅ Quick Test Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can register new user
- [ ] Can login with registered credentials
- [ ] Dashboard shows logged-in user name
- [ ] Can run eligibility check
- [ ] Eligible schemes displayed
- [ ] History shows past checks
- [ ] Can logout and session clears
- [ ] Page refresh maintains login

---

## 🚀 Ready to Deploy!

If all tests pass, your frontend is production-ready and fully integrated with the backend API.

**Next Steps**:
1. Update `VITE_API_URL` to production backend URL
2. Run `npm run build`
3. Deploy build artifacts to CDN/web server
4. Test in production environment

---

