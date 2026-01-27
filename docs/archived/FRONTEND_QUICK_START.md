# 🚀 Quick Start Guide - YojnaSathi Frontend

## Start in 3 Steps

### Step 1: Start Backend
```bash
# Terminal 1 - Backend
cd app
python -m uvicorn main:app --reload
# Wait for: "Uvicorn running on http://127.0.0.1:8000"
```

### Step 2: Start Frontend
```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
# Wait for: "VITE v5.4.21 ready in 314 ms"
```

### Step 3: Open Browser
```
http://localhost:5173
```

---

## 🔄 Test the Flow

1. **Register**: Click "Register" button
   - Fill in name, email, password
   - Click "Create Account"
   - Should auto-login and go to home

2. **Browse Schemes**: Click "Schemes"
   - See all government schemes
   - Check eligible ones (green badge)

3. **Check Eligibility**: Click "Check Eligibility"
   - Fill in age, income, state, caste
   - Click "Check Eligibility"
   - See results (eligible/not eligible)

4. **View Profile**: Click "Profile"
   - See your account info
   - Click "Logout" to sign out

---

## 📋 Key URLs

| URL | Purpose | Auth Required |
|-----|---------|---------------|
| http://localhost:5173 | Home page | No |
| http://localhost:5173/register | Register | No |
| http://localhost:5173/login | Login | No |
| http://localhost:5173/schemes | Browse schemes | Yes |
| http://localhost:5173/eligibility | Check eligibility | Yes |
| http://localhost:5173/profile | User profile | Yes |

---

## 🔧 Important Files

- **Frontend**: `frontend/.env.local` - Backend URL config
- **Backend**: `app/main.py` - API routes
- **Auth**: `src/services/api.ts` - JWT interceptors

---

## ✅ What's Working

- ✅ User Registration & Login (JWT)
- ✅ Protected Routes (automatic redirects)
- ✅ Browse Government Schemes
- ✅ Check Eligibility
- ✅ User Profile Management
- ✅ Automatic Token Management
- ✅ Responsive Design
- ✅ Smooth Animations

---

## 🆘 Troubleshooting

**Frontend won't start?**
```bash
cd frontend
npm install
npm run dev
```

**Backend connection issues?**
- Check: Backend running on port 8000
- Check: `.env.local` has correct `VITE_API_URL`

**Login not working?**
- Check: Backend `/auth/login` endpoint
- Check: DevTools Network tab for requests
- Check: localStorage for `access_token`

**Schemes not loading?**
- Check: Logged in (protected route)
- Check: Backend has schemes in database

---

## 📖 Documentation Files

- **FRONTEND_SETUP_COMPLETE.md** - Full setup details
- **FRONTEND_INTEGRATION_GUIDE.md** - API integration details
- **FRONTEND_API_INTEGRATION.md** - Complete endpoint reference
- **frontend/README.md** - Frontend-specific documentation

---

**Last Updated**: January 22, 2026
**Status**: ✅ Ready to Use
