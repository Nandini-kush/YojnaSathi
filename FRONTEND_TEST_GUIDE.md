# Quick Test Guide: Frontend ML Integration

## 🚀 Start Everything (5 minutes)

### Terminal 1: Start Backend
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
cd backend
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
✓ Database tables created successfully
✓ ML Service initialized successfully at startup
Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2: Start Frontend
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\frontend"
npm run dev
```

**Expected output:**
```
Local:   http://localhost:5174/
```

---

## 🧪 Test the Feature

### Step 1: Open Frontend
- Go to: **http://localhost:5174/eligibility-check**

### Step 2: Open DevTools Console
- Press **F12**
- Click **Console** tab
- Keep it open while testing

### Step 3: Fill the Form
```
Step 1 - Personal Info:
├─ Age: 28
└─ Gender: Female

Step 2 - Financial:
└─ Annual Income: ₹250,000

Step 3 - Category:
└─ Category: General

Step 4 - Education:
└─ (Skip or fill as desired)
```

### Step 4: Click "Check Eligibility"

### Step 5: Watch Console Logs

You should see:

```javascript
📤 Sending ML prediction request: {
  age: 28,
  income: 250000,
  gender: 'female',
  category: 'General'
}

🔗 API Endpoint: POST /ml/predict-schemes

📥 ML API Response: {
  user: {...},
  recommended_schemes: [
    { scheme_id: 3, scheme_name: '...', eligible: true, probability: 0.95 },
    ...
  ],
  total_schemes: 3,
  total_eligible: 3
}

✅ Found 3 eligible schemes
```

### Step 6: View Results

Frontend should display:
- ✅ Success message: "We found 3 out of 3 schemes you qualify for"
- ✨ Animated list of 3 schemes
- Each scheme shows:
  - Name (from API)
  - "95% Match" (ML probability score)
  - ✓ Eligible status
  - ML Score display

---

## 🧪 Test Different Scenarios

### Test Case 1: High Income (Should find most schemes)
```
Age: 45
Income: ₹1,000,000
Gender: Male
Category: General
```
**Expected**: 3 eligible schemes with high probabilities

### Test Case 2: Young Student (Limited schemes)
```
Age: 20
Income: ₹50,000
Gender: Female
Category: OBC
```
**Expected**: 1-2 eligible schemes

### Test Case 3: Senior Citizen (Specific schemes)
```
Age: 65
Income: ₹100,000
Gender: Male
Category: SC
```
**Expected**: Different set of schemes than young person

### Test Case 4: Invalid Input (Should show validation error)
```
Age: (leave blank)
Income: 250000
Gender: Female
Category: General
```
**Expected**: Error message "Please fill in all required fields"

---

## 🔍 Debugging Checklist

### ✅ Backend Running?
```powershell
curl http://localhost:8000/ml/health
```
Should return:
```json
{"status": "healthy", "message": "ML service is available", "ml_available": true}
```

### ✅ API Call Happening?
**Network Tab (F12 → Network)**:
1. Refresh page
2. Fill form and click "Check Eligibility"
3. Look for **POST** request to `/ml/predict-schemes`
4. Should show **Status: 200**
5. Check **Response** tab for scheme data

### ✅ Console Logs Visible?
```javascript
// Should see at minimum:
console.log("📤 Sending ML prediction request...");
console.log("📥 ML API Response...");
```

### ✅ Results Displaying?
- Redirect to step 5 (Results)
- See success animation
- See scheme list below

---

## ❌ Troubleshooting

### Issue: "Could not connect to ML service"

**Solution 1**: Check backend is running
```powershell
# Terminal 1 should show:
Uvicorn running on http://127.0.0.1:8000
```

**Solution 2**: Check ML model loaded
```powershell
# Terminal 1 startup logs should show:
✓ ML Service initialized successfully at startup
```

**Solution 3**: Verify endpoint exists
```powershell
curl -X GET http://localhost:8000/ml/health
```

---

### Issue: "Validation error" or blank fields not accepted

**Solution**: 
- All 4 fields required: Age, Income, Gender, Category
- Cannot skip to next step with missing fields
- Age must be number (18-120)
- Income must be number (> 0)
- Gender: "Male", "Female", "Other"
- Category: "General", "OBC", "SC", "ST"

---

### Issue: Console logs not showing

**Solution**:
1. Press F12 to open DevTools
2. Click **Console** tab
3. Make sure you see the white "Console" text (not red/yellow)
4. Refresh page with F5
5. Try the form again
6. Logs should appear immediately when clicking button

---

### Issue: Results not showing

**Check**:
1. Did form submit? (Should see loading spinner for 1-2 seconds)
2. Did step 5 load? (Should see confetti animation)
3. Check console for errors (red text)
4. Check network tab for failed request (red 500 status)

---

## 📊 Expected Data

### Example Response from Backend
```json
{
  "user": {
    "age": 28,
    "income": 250000,
    "gender": "female",
    "category": "General"
  },
  "recommended_schemes": [
    {
      "scheme_id": 3,
      "scheme_name": "Pradhan Mantri Jan Dhan Yojana",
      "eligible": true,
      "probability": 0.95
    },
    {
      "scheme_id": 1,
      "scheme_name": "Pradhan Mantri Sthaniya Kshetra Aajeevika Yojana",
      "eligible": true,
      "probability": 0.92
    },
    {
      "scheme_id": 2,
      "scheme_name": "Pradhan Mantri Kaushal Vikas Yojana",
      "eligible": true,
      "probability": 0.87
    }
  ],
  "total_schemes": 3,
  "total_eligible": 3
}
```

### Frontend Renders
- **Title**: "Great News! 🎉"
- **Subtitle**: "You're eligible for 3 government schemes"
- **Scheme Cards**:
  ```
  💳 Pradhan Mantri Jan Dhan Yojana
     ✓ You qualify for this scheme
     95% Match | ML Score: 95.0%
  
  💳 Pradhan Mantri Sthaniya Kshetra Aajeevika Yojana
     ✓ You qualify for this scheme
     92% Match | ML Score: 92.0%
  
  💳 Pradhan Mantri Kaushal Vikas Yojana
     ✓ You qualify for this scheme
     87% Match | ML Score: 87.0%
  ```

---

## 📝 Verification Checklist

After fixing, verify:

- [ ] Backend starts without errors
- [ ] ML service initializes at startup
- [ ] Frontend loads without console errors
- [ ] Can fill out all 4 required fields
- [ ] "Check Eligibility" button works
- [ ] Console shows request payload
- [ ] Console shows API response
- [ ] Results page displays schemes
- [ ] Schemes come from API (not hardcoded)
- [ ] ML probabilities show correctly (0-100%)
- [ ] Eligibility status shows (✓/✗)
- [ ] No "mock data" visible in results
- [ ] Error handling works (try invalid input)
- [ ] Can run check multiple times
- [ ] Switching between age/income/category changes results

---

## ✅ Success Criteria

**Frontend is working correctly when:**

1. ✅ User fills form with 4 required fields
2. ✅ Clicks "Check Eligibility" button  
3. ✅ Console logs show API request and response
4. ✅ Results page loads with real data from backend
5. ✅ Schemes displayed are from API (not hardcoded)
6. ✅ Each scheme shows ML probability score (0-100%)
7. ✅ Eligibility status comes from API (not always "Eligible")
8. ✅ No hardcoded scheme names visible
9. ✅ Can run multiple checks with different inputs
10. ✅ Error messages display if backend unavailable

---

## 📞 Quick Commands Reference

```powershell
# Start everything
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"

# Terminal 1: Backend
.\venv\Scripts\Activate.ps1
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Test API (another terminal)
curl -X POST http://localhost:8000/ml/predict-schemes `
  -H "Content-Type: application/json" `
  -d '{"age":28,"income":250000,"gender":"female","category":"General"}'
```

---

**Last Updated**: January 26, 2026
**Status**: Ready for Testing ✅
