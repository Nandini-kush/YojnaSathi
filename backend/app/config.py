import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # JWT Configuration
    SECRET_KEY: str = "SUPER_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # ML Configuration
    ML_MODEL_PATH: str = "../ml/model/scheme_model.pkl"
    ML_PREPROCESSOR_PATH: str = "../ml/model/preprocessor.pkl"
    
    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Print configuration on startup (without secrets)
if settings.ENVIRONMENT == "development":
    print(f"📋 YojnaSathi Backend Config:")
    print(f"   Environment: {settings.ENVIRONMENT}")
    print(f"   Database: {settings.DATABASE_URL[:50]}...")
    print(f"   CORS Origins: {settings.cors_origins_list}")
    print(f"   Token Expiry: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
