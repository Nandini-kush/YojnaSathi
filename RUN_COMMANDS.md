# YojnaSathi - Quick Run Commands

## Prerequisites

Ensure you are on Windows PowerShell and in the project directory:
```bash
cd C:\Users\Soft Tech\Desktop\YojnaSathi
```

---

## ✅ Complete Quick Start (All-In-One)

### Terminal 1: Backend
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
$env:PYTHONIOENCODING='utf-8'
uvicorn backend.app.main:app --reload --port 8001 --host 127.0.0.1
```

**Expected Output**:
```
✓ Model loaded from: C:\...\ml\model\scheme_model.pkl
✓ Preprocessor loaded from: C:\...\ml\model\preprocessor.pkl
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8001
```

**Access**: http://127.0.0.1:8001/docs (Swagger UI)

---

### Terminal 2: Frontend
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\frontend"
npm run dev
```

**Expected Output**:
```
VITE v5.4.21  ready in XXX ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

**Access**: http://localhost:5174

---

## 🔄 Individual Component Commands

### ML Training & Testing

**Train Model**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\ml"
python train_model.py
```

**Evaluate Model**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\ml"
python evaluate_model.py
```

**Test Predictions**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\ml"
python predict.py
```

---

### Backend Only

**Start Backend (No Reload)**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --port 8001 --host 127.0.0.1
```

**Start Backend (With Hot Reload)**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --reload --port 8001 --host 127.0.0.1
```

**Test Backend Health**:
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8001/"
```

Expected Response:
```json
{
  "message": "YojnaSathi backend is running"
}
```

---

### Frontend Only

**Build Frontend**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\frontend"
npm run build
```

**Preview Production Build**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\frontend"
npm run preview
```

---

## 🧪 Testing Workflows

### Test 1: Full Registration & Login Flow

**Step 1**: Open frontend
```
http://localhost:5174
```

**Step 2**: Register new account
- Go to Register page
- Fill in name, email, password
- Submit

**Step 3**: Verify you're logged in
- Should see Dashboard
- Token should be saved in localStorage

**Step 4**: Check eligibility
- Go to "Check Eligibility"
- Fill in your details
- Submit

Expected: You see scheme recommendations

---

### Test 2: ML Predictions

**Direct Python Test**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
python -c "
from backend.app.services.ml_service import MLService
service = MLService()
print('✓ ML Service loaded successfully')
"
```

**Via API**:
```powershell
# After backend is running, make a POST request:
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    user_data = @{
        age = 25
        income = 300000
        gender = "Male"
        category = "General"
    }
    schemes = @(
        @{
            scheme_id = 1
            scheme_name = "Young Achiever"
            scheme_min_age = 21
            scheme_max_age = 40
            scheme_income_limit = 300000
            scheme_category = "General"
        }
    )
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:8001/ml/recommend" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

---

### Test 3: Database Connection

**Check if DB is accessible**:
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
python -c "
from backend.app.db.database import engine
with engine.connect() as conn:
    print('✓ Database connection successful')
"
```

---

## 📊 API Endpoints to Test

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /users/me` - Get current user (requires token)

### Schemes
- `GET /schemes/` - Get all schemes
- `GET /schemes/{id}` - Get scheme details

### Eligibility
- `POST /eligibility` - Check eligibility
- `GET /eligibility-history` - Get history (requires token)

### ML Recommendations
- `POST /ml/recommend` - Get ML recommendations
- `GET /ml/health` - Check ML service status

---

## 🔧 Troubleshooting

### Issue: Backend won't start - "Port already in use"
**Solution**: Use a different port
```powershell
uvicorn backend.app.main:app --reload --port 8002 --host 127.0.0.1
```

### Issue: Frontend won't start - "Port 5173 is in use"
**Solution**: Automatically uses 5174, or specify custom port
```powershell
npm run dev -- --port 5175
```

### Issue: "ModuleNotFoundError: No module named 'preprocessing'"
**Solution**: Ensure ml directory is in sys.path (should be automatic)
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\ml"
python train_model.py  # Retrain models
```

### Issue: Frontend can't connect to backend
**Solution**: Check CORS configuration
1. Verify backend is running on 8001
2. Check `.env.local` in frontend folder
3. Ensure CORS_ORIGINS in backend includes frontend URL

### Issue: ML model not loading
**Solution**: Check if pickle files exist
```powershell
ls "C:\Users\Soft Tech\Desktop\YojnaSathi\ml\model\"
# Should show: scheme_model.pkl, preprocessor.pkl
```

---

## 📦 Environment Setup (If Starting Fresh)

### 1. Install Python Dependencies
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\frontend"
npm install
```

### 3. Train ML Models
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\ml"
python train_model.py
```

---

## ✅ Health Checks

### Check Backend Health
```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8001/"
$response.StatusCode  # Should be 200
```

### Check Frontend Health
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5174/"
$response.StatusCode  # Should be 200
```

### Check ML Model Health
```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8001/ml/health"
$response.Content | ConvertFrom-Json  # Should show model status
```

---

## 🚀 Production Deployment

### Build for Production
```powershell
# Backend (no changes needed, same as dev)
# Frontend
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\frontend"
npm run build
# Creates: frontend/dist/
```

### Run Production
```powershell
# Backend (no reload)
cd "C:\Users\Soft Tech\Desktop\YojnaSathi"
.\venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --port 8001 --workers 4

# Frontend (serve dist folder)
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\frontend"
npm run preview
```

---

## 📝 Logs & Debugging

### View Backend Logs
```powershell
# Backend logs are printed to console
# Add --log-level debug for verbose logging:
uvicorn backend.app.main:app --reload --log-level debug
```

### View ML Logs
```powershell
cd "C:\Users\Soft Tech\Desktop\YojnaSathi\ml"
python train_model.py 2>&1 > training.log
# View: type training.log
```

### Clear Database
```powershell
# Delete test.db to reset database
rm "C:\Users\Soft Tech\Desktop\YojnaSathi\test.db"
# Database will be recreated on next startup
```

---

## 📖 Important Files

| File | Purpose |
|------|---------|
| `backend/app/main.py` | Backend entry point |
| `frontend/src/App.tsx` | Frontend entry point |
| `ml/train_model.py` | ML training script |
| `ml/predict.py` | ML inference script |
| `backend/app/services/ml_service.py` | ML integration with backend |
| `.env.local` (frontend) | Frontend config |
| `backend/.env` | Backend config |

---

## 🎯 Expected System Output

### Successful Startup Sequence
1. Backend starts and loads models
2. Frontend starts on dev server
3. Frontend automatically loads backend API
4. User can register, login, and check eligibility
5. ML recommendations appear

### Performance Metrics (Expected)
- **ML Model Load Time**: < 1 second (first time)
- **Prediction Latency**: < 100ms
- **API Response Time**: < 500ms
- **Frontend Build Time**: < 5 seconds

---

## 🆘 Support

If you encounter issues:
1. Check the FULL_STACK_AUDIT_REPORT.md for details on all fixes
2. Verify file paths are correct
3. Ensure all dependencies are installed
4. Check port availability
5. Review CORS configuration
6. Retrain ML models if pickle files are corrupted

---

**Last Updated**: January 26, 2026  
**Status**: ✅ All Systems Operational
