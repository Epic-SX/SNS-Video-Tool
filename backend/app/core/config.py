"""
Configuration settings for CREAFT backend - YouTube Edition
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List, Optional
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application settings"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Ignore extra fields from environment
    )
    
    # Basic App Settings
    PROJECT_NAME: str = "SNS Video Tool"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development")
    SECRET_KEY: str = Field(...)
    
    # Database
    DATABASE_URL: str = Field(...)
    DATABASE_POOL_SIZE: int = Field(default=10)
    DATABASE_MAX_OVERFLOW: int = Field(default=20)
    
    # Redis
    REDIS_URL: str = Field(...)
    
    # Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)
    ALGORITHM: str = "HS256"
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"]
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1"]
    )
    
    # YouTube API
    YOUTUBE_API_KEY: str = Field(...)
    
    # OpenAI
    OPENAI_API_KEY: str = Field(...)
    OPENAI_MODEL: str = Field(default="gpt-4o")
    
    # Celery
    CELERY_BROKER_URL: str = Field(...)
    CELERY_RESULT_BACKEND: str = Field(...)
    
    # API Rate Limits
    YOUTUBE_RATE_LIMIT: int = Field(default=10000)  # per day
    
    # Collection Settings
    COLLECTION_INTERVAL_MINUTES: int = Field(default=15)
    MAX_VIDEOS_PER_CHANNEL: int = Field(default=50)
    
    # AI Settings
    AI_LABELING_BATCH_SIZE: int = Field(default=10)
    IMAGE_RESIZE_WIDTH: int = Field(default=256)
    
    # Monitoring
    PROMETHEUS_PORT: int = Field(default=8080)

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings() 