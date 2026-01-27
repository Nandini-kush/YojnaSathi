from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .db.base import Base
from .db.database import engine

# Import all models BEFORE create_all
from . import db as _db_init  # noqa: F401
from .db import base_imports as _base_imports  # noqa: F401

from .routes import (
    schemes,
    ml_recommend,
    admin_schemes,
    admin_stats,
    auth,
    admin_auth,
    user_profile,
    eligibility,
    eligibility_history,
    user_schemes
)

# Import ML service for initialization
from .services.ml_service import initialize_ml_service, MLServiceException

logger = logging.getLogger(__name__)

# -------------------------
# App Initialization
# -------------------------
app = FastAPI(
    title="YojnaSathi Backend",
    description="""
YojnaSathi Backend API - Government Scheme Eligibility Checker

### Quick Start:
1. Register: POST /auth/register
2. Login: POST /auth/login
3. Click "Authorize" and paste token
4. Access protected endpoints

### Auth:
- All protected endpoints require Bearer token
- Token valid for 60 minutes

### ML Recommendations:
- POST /ml/recommend - Get ML-ranked scheme recommendations
- POST /ml/check-eligibility - Check single scheme eligibility
- GET /ml/health - Check ML service status

### Testing:
Use Swagger UI to test all APIs
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ====================================
# CORS Middleware - Secure Configuration
# ====================================
# Parse CORS origins from config
cors_origins = settings.cors_origins_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Restrict to specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit methods
    allow_headers=["Authorization", "Content-Type", "Accept"],  # Explicit headers
    max_age=3600  # Cache preflight for 1 hour
)


# -------------------------
# Security Scheme Instance (IMPORTANT)
# -------------------------
bearer_scheme = HTTPBearer()

# -------------------------
# Custom OpenAPI (Bearer Auth FIX)
# -------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Ensure components exists
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}

    # Add Bearer token support
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # DO NOT apply globally
    # Each protected route must declare Depends(HTTPBearer)
    # Otherwise Swagger sends token but FastAPI ignores it

    app.openapi_schema = openapi_schema
    return app.openapi_schema


# CRITICAL
app.openapi = custom_openapi

# -------------------------
# Database Table Creation & ML Service Initialization
# -------------------------
@app.on_event("startup")
def startup():
    """Initialize database and ML service on app startup."""
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}", exc_info=True)
        raise
    
    # Initialize ML service (loads model once)
    try:
        initialize_ml_service()
        logger.info("✓ ML Service initialized successfully at startup")
    except MLServiceException as e:
        logger.warning(f"ML Service not available: {e}")
        logger.warning("Backend will work but ML recommendations won't be available")
    except Exception as e:
        logger.error(f"Unexpected error initializing ML Service: {e}", exc_info=True)

# -------------------------
# Routers
# -------------------------

# Public APIs
app.include_router(auth.router)
app.include_router(schemes.router)

# Protected User APIs
app.include_router(user_profile.router)
app.include_router(eligibility.router)
app.include_router(user_schemes.router)
app.include_router(eligibility_history.router)

# ML APIs (should be protected internally)
app.include_router(ml_recommend.router)

# Admin APIs
app.include_router(admin_auth.router)
app.include_router(admin_schemes.router)
app.include_router(admin_stats.router)

# -------------------------
# Root
# -------------------------
@app.get("/")
def root():
    return {"message": "YojnaSathi backend is running"}
