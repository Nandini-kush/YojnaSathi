# ML Integration - Testing & Verification Guide

## ✅ QUICK VERIFICATION

### Step 1: Verify Files Are Created
```bash
# Check ML service exists
ls backend/services/ml_service.py

# Check schemas exist
ls backend/schemas/ml_recommendation.py

# Check router is updated
ls backend/routes/ml_recommend.py
```

### Step 2: Start the Backend
```bash
cd backend
python -m uvicorn main:app --reload
```

**Expected Output**:
```
✓ ML Service initialized successfully at startup
Uvicorn running on http://127.0.0.1:8000
```

### Step 3: Check ML Health
```bash
curl http://localhost:8000/ml/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "message": "ML service is available",
  "ml_available": true
}
```

---

## 🧪 TEST ENDPOINTS VIA CURL

### Test 1: Get Recommendations
```bash
curl -X POST http://localhost:8000/ml/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "income": 250000,
    "gender": "Female",
    "category": "General"
  }'
```

**Expected**: HTTP 200 with recommended schemes array

### Test 2: Check Eligibility
```bash
curl -X POST http://localhost:8000/ml/check-eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "age": 28,
      "income": 250000,
      "gender": "Female",
      "category": "General"
    },
    "scheme": {
      "scheme_id": 1,
      "scheme_name": "Young Achiever",
      "scheme_min_age": 21,
      "scheme_max_age": 40,
      "scheme_income_limit": 300000,
      "scheme_category": "General"
    }
  }'
```

**Expected**: HTTP 200 with eligibility result

### Test 3: Health Check
```bash
curl http://localhost:8000/ml/health
```

**Expected**: HTTP 200 with healthy status

---

## 🎯 TEST VIA SWAGGER UI

### Step 1: Open Swagger
Go to: http://localhost:8000/docs

### Step 2: Find ML Endpoints
Look for "ML Recommendation" section

### Step 3: Test `/ml/recommend`
1. Click "Try it out"
2. Enter user data:
   ```json
   {
     "age": 28,
     "income": 250000,
     "gender": "Female",
     "category": "General"
   }
   ```
3. Click "Execute"
4. Verify response has `recommended_schemes` array

### Step 4: Test `/ml/check-eligibility`
1. Click "Try it out"
2. Enter request body with user and scheme
3. Click "Execute"
4. Verify response has `eligible` and `probability`

### Step 5: Test `/ml/health`
1. Click "Try it out"
2. Click "Execute"
3. Verify status is "healthy"

---

## 🔍 DEBUGGING CHECKLIST

### If ML Health Check Fails (503)
```
Reason: ML model artifacts not found
Solution:
1. Check ml/model/scheme_model.pkl exists
2. Check ml/model/preprocessor.pkl exists
3. Run: python ml/train_model.py
4. Restart backend
```

### If Recommendations Fails (500)
```
Reason: Database connection or no schemes
Solution:
1. Check PostgreSQL is running
2. Check schemes table has data
3. Verify scheme records have required fields:
   - id, scheme_name, min_age, max_age, max_income, category
```

### If Recommendation Returns Empty List
```
Reason: No schemes match filter criteria
Solution:
1. Check database has active schemes (is_active = True)
2. Check scheme fields are not NULL
3. Verify schema compatibility
```

### Check Logs for Errors
```bash
# Look for ML initialization message
grep "ML Service initialized" <logs>

# Look for database errors
grep "Error creating database tables" <logs>

# Look for prediction errors
grep "ML prediction failed" <logs>
```

---

## 📊 PERFORMANCE TESTING

### Single Request
```bash
time curl -X POST http://localhost:8000/ml/recommend \
  -H "Content-Type: application/json" \
  -d '{"age": 28, "income": 250000, "gender": "Female", "category": "General"}'
```

**Expected Time**: <200ms

### Batch Requests (10 requests)
```bash
for i in {1..10}; do
  curl -s -X POST http://localhost:8000/ml/recommend \
    -H "Content-Type: application/json" \
    -d '{"age": 28, "income": 250000, "gender": "Female", "category": "General"}' \
    > /dev/null &
done
wait
```

**Expected**: All complete without errors

---

## 🔧 MANUAL CODE VERIFICATION

### 1. Check ML Service File
```bash
grep -n "class MLService" backend/services/ml_service.py
grep -n "def get_ml_service" backend/services/ml_service.py
grep -n "def recommend_schemes_for_user" backend/services/ml_service.py
```

**Expected**: All methods present

### 2. Check Router File
```bash
grep -n "POST /ml/recommend" backend/routes/ml_recommend.py
grep -n "POST /ml/check-eligibility" backend/routes/ml_recommend.py
grep -n "GET /ml/health" backend/routes/ml_recommend.py
```

**Expected**: All endpoints present

### 3. Check Main App
```bash
grep -n "from backend.services.ml_service import" backend/main.py
grep -n "initialize_ml_service" backend/main.py
```

**Expected**: ML service imported and initialized

### 4. Check Schemas
```bash
grep -n "class UserProfileForML" backend/schemas/ml_recommendation.py
grep -n "class RecommendationsResponse" backend/schemas/ml_recommendation.py
```

**Expected**: All schema classes present

---

## ✅ VERIFICATION CHECKLIST

- [ ] Backend starts without errors
- [ ] ML Service initializes at startup (check logs)
- [ ] `/ml/health` returns status 200
- [ ] `/ml/recommend` returns 200 with schemes
- [ ] `/ml/check-eligibility` returns 200 with result
- [ ] Swagger UI shows all three endpoints
- [ ] Database queries work (schemes loaded)
- [ ] Response time < 200ms
- [ ] Error cases handled gracefully
- [ ] Logs show ML operations

---

## 📝 EXPECTED RESPONSES

### Health Check Success
```json
{
  "status": "healthy",
  "message": "ML service is available",
  "ml_available": true
}
```

### Recommendations Success
```json
{
  "user": {
    "age": 28,
    "income": 250000,
    "gender": "Female",
    "category": "General"
  },
  "recommended_schemes": [
    {
      "scheme_id": 1,
      "scheme_name": "Scheme A",
      "eligible": true,
      "probability": 0.95
    }
  ],
  "total_schemes": 1,
  "total_eligible": 1
}
```

### Eligibility Check Success
```json
{
  "scheme_id": 1,
  "scheme_name": "Young Achiever",
  "eligible": true,
  "probability": 0.95,
  "top_contributing_features": [
    {"feature": "age", "importance": 0.29},
    {"feature": "age_scheme_gap", "importance": 0.27}
  ]
}
```

### Error: No Schemes (503)
```json
{
  "detail": "ML recommendation service unavailable: No schemes available in database"
}
```

### Error: ML Service Down (503)
```json
{
  "detail": "ML service unavailable: ML model artifacts not found: Model not found at model/scheme_model.pkl"
}
```

### Error: Invalid Request (422)
```json
{
  "detail": [
    {
      "loc": ["body", "age"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 🎯 SUCCESS CRITERIA

✅ All endpoints respond without errors  
✅ ML model loads at startup  
✅ Recommendations are ranked by probability  
✅ Response time < 200ms  
✅ Database integration works  
✅ Error handling graceful  
✅ Swagger UI shows all endpoints  
✅ Logs show operations clearly  

**If all criteria met**: Integration is successful! ✨

---

## 📞 TROUBLESHOOTING SUMMARY

| Issue | Cause | Solution |
|-------|-------|----------|
| 503 on /ml/health | ML model missing | Run `python ml/train_model.py` |
| 500 on /ml/recommend | DB connection | Check PostgreSQL running |
| Empty recommendations | No schemes | Add schemes to database |
| 422 Validation error | Invalid JSON | Check request format |
| Slow response | Many schemes | Add DB index on is_active |
| Model error on startup | File permissions | Check file ownership |

---

**Next Step**: Run backend and test endpoints! 🚀
