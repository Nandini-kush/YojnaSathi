# Quick Test Guide - Eligibility Check Fix

**Objective:** Verify the eligibility check and ML recommendations now work correctly.

---

## 🚀 Quick Start Test

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- User logged in on Dashboard

### Test Steps

#### 1. Open Browser DevTools
Press **F12** and go to **Network** tab

#### 2. Fill Dashboard Form
```
Age:      35
Income:   500000
Gender:   Male
Category: General
```

#### 3. Click "Check Eligibility & Get Recommendations"

#### 4. Check Console (Tab: Console)
You should see:
```
📤 Calling /ml/recommend with: {age: 35, income: 500000, gender: "male", category: "general"}
✅ ML recommend response: {user: {...}, recommended_schemes: [...], ...}
```

#### 5. Check Network (Tab: Network)
Look for `recommend` request:
- **Method:** POST ✅ (not OPTIONS)
- **URL:** `/ml/recommend` ✅
- **Status:** 200 ✅
- **Request:** Contains age, income, gender, category ✅
- **Response:** Contains recommended_schemes array ✅

#### 6. Verify UI Updates
- ✅ Loading spinner appears while waiting
- ✅ Profile box shows submitted data
- ✅ Recommendations list appears below
- ✅ Each scheme shows name and match percentage

---

## 🔍 Debug Checklist

### If Spinner Doesn't Appear
```
Issue: API call not being made
Check:
1. Form validation passes (all fields filled)
2. No JS errors in console
3. Backend is running
```

### If Network Shows OPTIONS but No POST
```
Issue: CORS preflight succeeds but POST fails
Check:
1. Backend still running? (might have crashed)
2. Check backend logs for errors
3. Verify correct endpoint: /ml/recommend
```

### If Error Message Appears
```
Error: "Failed to check eligibility"
Check console for: "Full error response: { response: ... }"
- Status 401: Check JWT token
- Status 422: Check request data format
- Status 500: Backend error (check backend logs)
```

### If Spinner Never Stops
```
Issue: API call hanging
Check:
1. Backend endpoint is responding to POST
2. ML model loaded successfully at backend startup
3. Check backend logs for errors
```

---

## 📊 Expected Console Output

### Successful Request
```
📤 Calling /ml/recommend with: {age: 35, income: 500000, gender: "male", category: "general"}
✅ ML recommend response: {
  user: {age: 35, income: 500000, gender: "male", category: "general"},
  recommended_schemes: [
    {scheme_id: 1, scheme_name: "PM Kisan", eligible: true, probability: 0.95},
    {scheme_id: 2, scheme_name: "Ayushman", eligible: true, probability: 0.87},
    ...
  ],
  total_schemes: 5,
  total_eligible: 4
}
```

### Failed Request
```
❌ Error checking eligibility: Error: Request failed with status code 401
Full error response: {
  response: {
    status: 401,
    data: {detail: "Invalid or expired token"}
  }
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Valid Data → Success
**Input:**
```
Age: 35
Income: 500000
Gender: Male
Category: General
```

**Expected:**
- ✅ Recommendations list appears
- ✅ Profile shows data
- ✅ Success toast shown
- ✅ No errors in console

---

### Scenario 2: Missing Field → Validation Error
**Input:**
```
Age: (empty)
Income: 500000
Gender: Male
Category: General
```

**Expected:**
- ✅ Toast: "Missing Fields"
- ✅ No API call made
- ✅ Form remains filled

---

### Scenario 3: Backend Down → Error State
**Steps:**
1. Stop backend server
2. Submit form with valid data

**Expected:**
- ✅ Loading spinner appears
- ✅ Spinner stops after timeout
- ✅ Error message shows: "Failed to check eligibility"
- ✅ Console shows connection error
- ✅ Toast shows error message

**Recovery:**
1. Start backend
2. Re-submit form
3. Should work normally

---

### Scenario 4: Re-submission → Data Updates
**Steps:**
1. Submit with: Age 35, Income 500000
2. See recommendations
3. Change to: Age 25, Income 300000
4. Re-submit

**Expected:**
- ✅ Profile updates with new data
- ✅ Recommendations update
- ✅ Previous recommendations disappear
- ✅ New schemes based on new data

---

## 🔗 Network Request Details

### Successful Request
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

HTTP/1.1 200 OK
Content-Type: application/json

{
  "user": {...},
  "recommended_schemes": [
    {"scheme_id": 1, "scheme_name": "...", "eligible": true, "probability": 0.95},
    ...
  ],
  "total_schemes": 5,
  "total_eligible": 4
}
```

---

## ✅ Success Indicators

All of these should be true:

- [ ] Network tab shows POST (not OPTIONS only)
- [ ] URL is `/ml/recommend` (not `/eligibility`)
- [ ] Status is 200 (not 404, 401, 500)
- [ ] Response has `recommended_schemes` array
- [ ] Console shows emoji logs (📤 and ✅)
- [ ] Profile box updates with submitted data
- [ ] Recommendations list appears
- [ ] No page reload occurs
- [ ] Toast shows success message

---

## 🎯 Summary

If you see all of these, the fix is working:

✅ Network: `POST /ml/recommend 200 OK`  
✅ Console: `📤 Calling /ml/recommend...`  
✅ Console: `✅ ML recommend response: {...}`  
✅ UI: Profile box shows submitted data  
✅ UI: Recommendations list appears  
✅ UX: No page reload, smooth transitions  

**If all green, you're good to go!** 🎉
