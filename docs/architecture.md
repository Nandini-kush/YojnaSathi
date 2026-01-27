# System Architecture - YojnaSathi

## Overview

YojnaSathi is a full-stack government scheme eligibility checker with ML-powered recommendations.

```
┌─────────────────────────────────────────────────────────────┐
│                      YOJNASATHI SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             FRONTEND (React + TypeScript)            │   │
│  │  - User Registration & Login                         │   │
│  │  - Browse Schemes                                    │   │
│  │  - Check Eligibility (Real-time)                     │   │
│  │  - View Recommendations (ML-powered)                 │   │
│  │  - Eligibility History                               │   │
│  │  http://localhost:5173                               │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│                     │ HTTP/REST API (Axios)                 │
│                     ├──────────────────────────────────┐    │
│                     ▼                                  ▼    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          BACKEND (FastAPI on Uvicorn)               │   │
│  │  http://localhost:8000                              │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  API Routes & Controllers                     │  │   │
│  │  │  - /auth/                 (Authentication)   │  │   │
│  │  │  - /schemes/              (Scheme Management)│  │   │
│  │  │  - /eligibility/          (Eligibility)      │  │   │
│  │  │  - /ml/                   (ML API)           │  │   │
│  │  └────────┬───────────────────────────────────┘  │   │
│  │           │                                       │   │
│  │  ┌────────▼───────────────────────────────────┐   │   │
│  │  │  Services & Business Logic                │   │   │
│  │  │  - user_auth.py          (JWT, passwords)│   │   │
│  │  │  - eligibility_service.py (Rules engine) │   │   │
│  │  │  - ml_service.py         (ML predictor)  │   │   │
│  │  └────────┬────────────────────────────────┘   │   │
│  │           │                                     │   │
│  │  ┌────────▼──────────────────────────────────┐  │   │
│  │  │  Data Layer                               │  │   │
│  │  │  - SQLAlchemy ORM                        │  │   │
│  │  │  - Database Models (User, Scheme, etc)  │  │   │
│  │  │  - Database Operations                   │  │   │
│  │  └────────┬─────────────────────────────────┘  │   │
│  │           │                                     │   │
│  │  ┌────────▼──────────────────────────────────┐  │   │
│  │  │  Database (SQLite)                       │  │   │
│  │  │  - Users                                 │  │   │
│  │  │  - Schemes                               │  │   │
│  │  │  - Eligibility Records                   │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │                                                   │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        │                               │
│                        │ Python Import                 │
│                        │ (os.path manipulation)        │
│                        ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ML PIPELINE (scikit-learn)                      │   │
│  │  Location: /ml/ (at project root)                │   │
│  │                                                   │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  predict.py                               │  │   │
│  │  │  - SchemePredictor class                  │  │   │
│  │  │  - rank_schemes()                        │  │   │
│  │  │  - predict_single()                      │  │   │
│  │  │  - explain_prediction()                  │  │   │
│  │  └────────────┬───────────────────────────┘  │   │
│  │               │                               │   │
│  │  ┌────────────▼───────────────────────────┐  │   │
│  │  │  Trained Models                        │  │   │
│  │  │  - scheme_model.pkl (RandomForest)    │  │   │
│  │  │  - preprocessor.pkl (StandardScaler) │  │   │
│  │  └──────────────────────────────────────┘  │   │
│  │                                              │   │
│  │  Data Flow:                                │   │
│  │  User Input → Preprocessor → Model         │   │
│  │             → Probabilities → Ranking      │   │
│  │                                              │   │
│  └──────────────────────────────────────────┘  │   │
│                                                  │   │
└──────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend (React + Vite + TypeScript)

**Technology**: React 18, Vite, TypeScript, Tailwind CSS, Axios

**Responsibilities**:
- User interface and interactions
- Form validation (client-side)
- API communication via centralized service layer
- State management (React Context)
- Error handling and user feedback

**Key Folders**:
- `src/pages/` - Page components (Register, Login, Dashboard, etc.)
- `src/components/` - Reusable UI components
- `src/services/` - API service layer (centralized API calls)
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript types and interfaces
- `src/utils/` - Helper functions

---

### 2. Backend (FastAPI)

**Technology**: FastAPI, SQLAlchemy, Pydantic, Uvicorn, JWT

**Port**: 8000

**Responsibilities**:
- REST API endpoints
- JWT authentication & authorization
- Database operations
- Business logic implementation
- ML service orchestration
- Error handling and logging

**Architecture Layers**:

#### Routes Layer (`app/routes/`)
- HTTP endpoint handlers
- Input validation via Pydantic
- Response formatting

#### Services Layer (`app/services/`)
- Business logic
- Database queries
- ML predictions
- Authentication logic

#### Schemas Layer (`app/schemas/`)
- Pydantic request/response models
- Input validation
- Type safety

#### Models Layer (`app/models/`)
- SQLAlchemy ORM models
- Database table definitions
- Relationships

#### Database Layer (`app/db/`)
- Connection management
- Session handling
- Migrations

---

### 3. ML Pipeline (scikit-learn)

**Location**: `/ml/` (project root)

**Technology**: scikit-learn, pandas, numpy, joblib

**Responsibilities**:
- Feature preprocessing
- Model training (offline)
- Eligibility prediction
- Probability scoring
- Batch predictions

**Key Components**:

#### Model (`ml/models/`)
- `scheme_model.pkl` - Trained RandomForest classifier
- `preprocessor.pkl` - Feature preprocessor (StandardScaler)

#### Prediction Interface (`ml/predict.py`)
```python
class SchemePredictor:
    def rank_schemes(user_data, schemes) -> List
    def predict_single(user_data, scheme) -> float
    def explain_prediction(user_data, scheme) -> Dict
    def predict_batch(users_data, schemes) -> List[List]
```

#### Training (`ml/train_model.py`)
- Trains model on historical data
- Saves model artifacts
- Evaluates performance

---

## Data Flow

### 1. User Registration & Login

```
Frontend Form
    ↓
API POST /auth/register
    ↓
Backend validates input (Pydantic)
    ↓
Hash password (bcrypt)
    ↓
Create user in database
    ↓
Return user data + success message
    ↓
Frontend stores auth token in localStorage
```

### 2. Check Eligibility

```
Frontend form with user profile
    ↓
API POST /eligibility/check
    ↓
Backend authenticates token (JWT)
    ↓
Validate user profile data
    ↓
Query scheme details from DB
    ↓
Apply eligibility rules
    ↓
Save eligibility record in DB
    ↓
Return eligibility result
    ↓
Frontend displays result
```

### 3. ML Recommendations

```
Frontend sends user profile
    ↓
API POST /ml/recommend
    ↓
Backend loads ML model (cached)
    ↓
Preprocess user data
    ↓
Query all schemes from DB
    ↓
For each scheme:
  ├─ Prepare features
  ├─ Get prediction (probability)
  └─ Store probability
    ↓
Sort schemes by probability
    ↓
Return top N schemes
    ↓
Frontend displays ranked list
```

---

## Key Design Patterns

### 1. Service Layer Pattern
- Routes delegate to services
- Services contain business logic
- Promotes testability and reusability

### 2. Dependency Injection
- FastAPI's `Depends()` for injecting dependencies
- Database sessions injected into routes

### 3. Singleton Pattern for ML Model
- Model loaded once at application startup
- Reused for all predictions
- Improves performance

### 4. Repository Pattern
- Database operations abstracted
- Easy to swap implementations
- Testable without database

---

## Authentication Flow

```
1. User registers/login
   └─ POST /auth/register | /auth/login

2. Backend generates JWT token
   └─ Token contains user ID, role, expiration

3. Frontend stores token in localStorage
   └─ Sent with every authenticated request

4. Backend validates token on protected endpoints
   └─ Verifies signature and expiration
   └─ Extracts user information

5. Authorization checked via user role
   └─ Admin endpoints require admin role
```

---

## Error Handling

### Frontend
- Try-catch blocks around API calls
- User-friendly error messages
- Fallback UI states (loading, error, empty)

### Backend
- Input validation (Pydantic)
- Custom exception handlers
- Consistent error response format
- Logging for debugging

### Database
- Transaction rollback on error
- Constraint validation
- Connection pooling

---

## Performance Considerations

### ML Model
- **Load Time**: ~2 seconds (at startup)
- **Prediction Time**: ~50ms per user
- **Memory**: ~500MB per model instance
- **Optimization**: Model cached, no reload per request

### Database
- **Indexing**: Indexed on common queries
- **Pagination**: Limited result sets
- **Caching**: Consider Redis for frequently accessed data

### API
- **Rate Limiting**: Implement in production
- **Compression**: Gzip enabled
- **Async**: FastAPI uses async where possible

---

## Security

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- CORS configured for frontend origin

### Data Validation
- Pydantic models validate all inputs
- Type checking with TypeScript (frontend)
- SQL injection prevented via ORM

### Secrets
- .env file for sensitive data
- Never commit secrets to repository
- SECRET_KEY unique per deployment

---

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)           │
│         Port: 80, 443                   │
└────────────┬──────────────────────────┘
             │
    ┌────────┴─────────┐
    ▼                  ▼
┌──────────┐      ┌──────────┐
│ Gunicorn │      │ Frontend │
│ Backend  │      │ (S3/CDN) │
│ App      │      │          │
└────┬─────┘      └──────────┘
     │
     ▼
┌──────────────┐
│ PostgreSQL   │
│ (Production) │
└──────────────┘
```

---

## Monitoring & Logging

### Backend
- Structured logging (JSON)
- Application performance monitoring
- Error tracking (Sentry/Rollbar)
- Database query logging

### Frontend
- Client-side error tracking
- User interaction analytics
- Performance metrics

---

## Technologies Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend Framework** | React 18 | UI library |
| **Build Tool** | Vite | Fast development & production build |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **HTTP Client** | Axios | API requests |
| **Backend Framework** | FastAPI | Modern Python web framework |
| **ASGI Server** | Uvicorn | ASGI application server |
| **ORM** | SQLAlchemy | Database abstraction |
| **Database** | SQLite/PostgreSQL | Data persistence |
| **ML Library** | scikit-learn | Machine learning algorithms |
| **ML Algorithm** | RandomForest | Classification model |
| **Authentication** | JWT | Token-based auth |
| **Password Hashing** | bcrypt | Secure password storage |

---

*Last Updated: January 2026*
*Version: 1.0*
