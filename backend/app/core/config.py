"""
Application configuration using Pydantic settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # Environment
    ENVIRONMENT: str = "development"
    PORT: int = 5000
    
    # Frontend URL for CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # JWT Configuration
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days
    JWT_REFRESH_SECRET: str = "your-super-secret-refresh-key"
    JWT_REFRESH_EXPIRE_MINUTES: int = 43200  # 30 days
    
    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost/constructio_db"
    
    # Security
    BCRYPT_ROUNDS: int = 12
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()