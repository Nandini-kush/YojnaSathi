# YojnaSathi - Government Scheme Eligibility Checker

A comprehensive full-stack application that helps users discover government schemes they are eligible for based on their personal information. Uses machine learning to rank schemes by eligibility probability.

## 🎯 Project Overview

**YojnaSathi** is a production-ready system with three main components:

1. **Backend API** - FastAPI with JWT authentication, database models, and ML integration
2. **Frontend** - React + Vite + TypeScript with modern UI and state management
3. **ML Pipeline** - scikit-learn based eligibility prediction and scheme ranking

## 📁 Project Structure

```
YojnaSathi/
│
├── backend/                       # FastAPI Application
│   ├── app/
│   │   ├── main.py               # FastAPI app instance
│   │   ├── config.py             # Configuration
│   │   ├── api/                  # API routes
│   │   ├── core/                 # Core logic (auth, security)
│   │   ├── services/             # Business logic
│   │   ├── schemas/              # Pydantic models
│   │   ├── models/               # SQLAlchemy models
│   │   ├── db/                   # Database setup
│   │   └── utils/                # Utility functions
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
│
├── frontend/                      # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── services/             # API calls (centralized)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── types/                # TypeScript types
│   │   ├── utils/                # Helper utilities
│   │   └── styles/               # Tailwind CSS
│   ├── vite.config.ts
│   ├── package.json
│   ├── .env.example
│   └── .env.local
│
├── ml/                            # Machine Learning Pipeline
│   ├── data/                     # Datasets
│   ├── models/                   # Trained models (pkl files)
│   ├── preprocess.py             # Data preprocessing
│   ├── feature_engineering.py    # Feature creation
│   ├── train_model.py            # Model training
│   ├── predict.py                # Prediction interface
│   └── README.md                 # ML documentation
│
├── docs/                          # Documentation
│   ├── api.md                    # API endpoints reference
│   ├── ml_flow.md                # ML pipeline details
│   ├── architecture.md           # System architecture
│   └── archived/                 # Previous documentation versions
│
├── tests/                         # Test files
│   └── (archived test files)
│
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- SQLite3

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt

# Copy .env.example to .env and configure
cp .env.example .env

# Run backend
python -m uvicorn app.main:app --reload
```

**Backend runs at**: http://localhost:8000

### 2. Frontend Setup

```bash
cd frontend
npm install

# Copy .env.example to .env.local
cp .env.example .env.local

# Run frontend development server
npm run dev
```

**Frontend runs at**: http://localhost:5173

### 3. API Documentation

Once backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 Key Features

### Authentication
- JWT-based authentication
- User registration and login
- Role-based access control
- Secure password hashing

### Scheme Management
- Browse available government schemes
- Filter schemes by criteria
- View detailed scheme information
- Check eligibility status

### ML Eligibility Checking
- Predict user eligibility for schemes
- Machine learning based ranking
- Probability scores for each scheme
- Batch prediction support

### User Profiles
- Store user information
- Track eligibility history
- View applied schemes
- Save favorite schemes

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Schemes
- `GET /api/schemes` - List all schemes
- `GET /api/schemes/{id}` - Get scheme details
- `POST /api/schemes/search` - Search schemes

### Eligibility
- `POST /api/eligibility/check` - Check scheme eligibility
- `GET /api/eligibility/history` - Get eligibility history
- `POST /api/eligibility/batch` - Batch eligibility check

### ML Recommendations
- `POST /api/ml/recommend` - Get ML-ranked recommendations
- `POST /api/ml/check-eligibility` - Check eligibility with explanation
- `GET /api/ml/health` - Check ML service status

See [API Reference](docs/api.md) for complete details.

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT (python-jose)
- **Validation**: Pydantic
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context

### ML
- **Language**: Python 3.11
- **Libraries**: scikit-learn, pandas, numpy
- **Algorithm**: RandomForest Classifier
- **Model Format**: Pickle (.pkl)

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 app/
black app/

# Frontend linting
cd frontend
npm run lint
npm run format
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Your message"
alembic upgrade head
```

## 📦 Deployment

### Production Checklist
- [ ] Set SECRET_KEY in .env
- [ ] Set DEBUG=False
- [ ] Configure DATABASE_URL for production DB
- [ ] Update CORS_ORIGINS for production domain
- [ ] Build frontend: `npm run build`
- [ ] Run backend with Gunicorn/uWSGI
- [ ] Use nginx as reverse proxy
- [ ] Enable HTTPS

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## 📖 Documentation

- [API Reference](docs/api.md) - Complete API documentation
- [ML Pipeline](docs/ml_flow.md) - ML model training and prediction
- [Architecture](docs/architecture.md) - System design and flow diagrams
- [Development Setup](docs/setup.md) - Detailed setup instructions

## 🐛 Troubleshooting

### Backend Issues
- **Port 8000 in use**: Change port with `--port 8001`
- **Database locked**: Delete `yojnasathi.db` and restart
- **Import errors**: Ensure you're in the backend venv

### Frontend Issues
- **Port 5173 in use**: Vite will auto-increment to next available port
- **Module not found**: Run `npm install` again
- **Build errors**: Clear node_modules and package-lock.json, reinstall

### ML Issues
- **Model load error**: Check ML model paths in .env
- **Memory error**: Model requires ~500MB RAM
- **Prediction timeout**: Ensure ML service is running

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./yojnasathi.db
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:5173"]
DEBUG=True
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests and linting
4. Commit with clear messages
5. Push to branch
6. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Team

- **Backend**: FastAPI + Database
- **Frontend**: React + TypeScript
- **ML**: scikit-learn + pandas

## 📞 Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review troubleshooting section
3. Open an issue on GitHub

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Production Ready ✅

Contains Pydantic models that define:
- What data we expect from users (EligibilityRequest)
- What data we send back (EligibilityResponse)
- Automatic validation and type checking

### `app/data/`
Stores our government schemes data. In Week-1, we use in-memory Python dictionaries instead of a database.

### `app/services/`
Contains business logic - the "eligibility checking engine" that determines which schemes a user qualifies for.

### `app/main.py`
The entry point of our FastAPI application. Defines all API endpoints and routes.

## 🚀 How to Run the Backend

### Step 1: Install Python
Make sure you have Python 3.8 or higher installed.
Check by running:
```bash
python --version
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Server
```bash
uvicorn app.main:app --reload
```

The `--reload` flag automatically restarts the server when you make code changes (useful for development).

### Step 5: Access the API
- **API Base URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

## 📡 API Endpoints

### 1. Root Endpoint (Health Check)
```
GET http://localhost:8000/
```
Returns a welcome message and API status.

### 2. Check Eligibility
```
POST http://localhost:8000/check-eligibility
```

**Request Body:**
```json
{
    "age": 25,
    "income": 25000.0,
    "gender": "male",
    "is_student": false
}
```

**Response:**
```json
{
    "eligible_schemes": [
        {
            "scheme_id": "SCHEME_004",
            "scheme_name": "Low Income Family Support",
            "description": "Monthly financial aid of ₹2,500 for families with low income",
            "eligibility_reason": {
                "reason": "You are eligible because: age is 25 (meets minimum age requirement of 18), income is ₹25000 (below maximum income limit of ₹25000), you are not a student (meets scheme requirement)"
            }
        }
    ],
    "total_count": 1
}
```

## 🧪 Testing the API

### Using the Interactive Docs
1. Start the server
2. Visit http://localhost:8000/docs
3. Click on `/check-eligibility` endpoint
4. Click "Try it out"
5. Enter test data and click "Execute"

### Using cURL
```bash
curl -X POST "http://localhost:8000/check-eligibility" \
     -H "Content-Type: application/json" \
     -d '{
       "age": 25,
       "income": 25000.0,
       "gender": "male",
       "is_student": false
     }'
```

### Using Python requests
```python
import requests

response = requests.post(
    "http://localhost:8000/check-eligibility",
    json={
        "age": 25,
        "income": 25000.0,
        "gender": "male",
        "is_student": False
    }
)

print(response.json())
```

## 📋 Available Government Schemes

The system currently includes 5 government schemes:

1. **Student Scholarship Scheme** - For students under 30 with income < ₹50,000
2. **Women Entrepreneurship Support** - For women under 50 with income < ₹30,000
3. **Senior Citizen Pension** - For seniors 60+ with income < ₹20,000
4. **Low Income Family Support** - For adults 18+ with income < ₹25,000
5. **Youth Skill Development Program** - For ages 18-35 with income < ₹40,000

## 🔍 How Eligibility Checking Works

1. User sends their information (age, income, gender, student status)
2. System validates the input using Pydantic models
3. Eligibility engine checks each scheme's criteria:
   - Age requirements (min/max)
   - Income requirements (min/max)
   - Gender requirements
   - Student status requirements
4. System returns only schemes where ALL criteria are met
5. Each eligible scheme includes an explanation of why the user qualifies

## 🛠️ Development Notes

- **No Database**: Week-1 uses in-memory data storage (Python dictionaries)
- **No Frontend**: This is backend-only
- **No ML**: Simple rule-based eligibility checking
- **Validation**: All inputs are automatically validated by Pydantic
- **Error Handling**: Basic error handling is implemented

## 📝 Next Steps (Future Weeks)

- Add database integration
- Add authentication and user accounts
- Add more schemes
- Add scheme application tracking
- Add notifications
- Add admin panel

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Use a different port
uvicorn app.main:app --reload --port 8001
```

**Module not found errors?**
- Make sure you're in the project root directory
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**Import errors?**
- Make sure all `__init__.py` files exist
- Check that you're running from the correct directory

