
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# backend/core/config.py -> backend/core -> backend
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediGuard API"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://mediguard_user:mediguard_pass@localhost/mediguard"
    
    # Security
    SECRET_KEY: str = "your_secret_key_change_this_for_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # SMTP
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str 
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str = None # Optional: different "From" address

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )

settings = Settings()
