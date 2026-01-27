# Quick Start: Run Backend & Test ML API

## ⚡ FASTEST WAY TO START

### **1. Open PowerShell**
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
```

### **2. Activate Virtual Environment**
```powershell
.\venv\Scripts\Activate.ps1
```

### **3. Run Backend**
```powershell
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### **4. Open Browser**
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## 📍 TEST ML ENDPOINT

### **In Swagger UI (Easiest)**

1. Go to http://127.0.0.1:8000/docs
2. Scroll to `/ml/predict-schemes` (POST)
3. Click **"Try it out"**
4. Copy this JSON into request body:
   ```json
   {
     "age": 28,
     "income": 250000,
     "gender": "Female",
     "category": "General"
   }
   ```
5. Click **"Execute"**
6. See response with ranked schemes

---

## 🧪 SAMPLE REQUESTS

### Test 1: Young Working Woman
```json
{
  "age": 25,
  "income": 300000,
  "gender": "Female",
  "category": "General"
}
```

### Test 2: Senior Citizen
```json
{
  "age": 60,
  "income": 100000,
  "gender": "Male",
  "category": "SC"
}
```

### Test 3: Student
```json
{
  "age": 20,
  "income": 50000,
  "gender": "Female",
  "category": "OBC"
}
```

### Test 4: High Income
```json
{
  "age": 45,
  "income": 1000000,
  "gender": "Male",
  "category": "General"
}
```

---

## ✅ EXPECTED RESPONSE FORMAT

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

---

## 🔍 OTHER ENDPOINTS

### Health Check (No Auth)
```
GET /ml/health
```

### Scheme Recommendations (Requires Auth)
```
POST /ml/recommend
```
Body: UserProfileForML + Bearer JWT token

### Check Single Scheme (Requires Auth)
```
POST /ml/check-eligibility
```
Body: user profile + scheme details + Bearer JWT token

---

## 🛠️ TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | Use different port: `--port 8001` |
| venv not found | Create: `python -m venv venv` |
| ML Service error on startup | Check `ml/model/` directory exists |
| 404 on /ml/predict-schemes | Restart backend with --reload |
| Validation error on request | Check JSON format matches schema |

---

## 📚 FILES MODIFIED

- ✅ `backend/app/routes/ml_recommend.py` - Added `/ml/predict-schemes` endpoint

## ✅ VERIFICATION

Backend startup should show:
```
✓ Database tables created successfully
✓ ML Service initialized successfully at startup
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

**Ready to test?** Run the backend and go to http://127.0.0.1:8000/docs 🚀
