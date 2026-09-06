from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    # JWT Authentication Configuration
    JWT_SECRET_KEY: str = "ayurai-dev-secret-key-change-in-production-f8a92b3c"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Environment & CORS Configuration
    ENVIRONMENT: str = "development"
    FRONTEND_ORIGIN: Optional[str] = "http://localhost:5173"

    # Gemini & AI Configuration
    AI_PROVIDER: str = "mock"  # "mock" or "gemini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Notification & Reminder Configuration
    NOTIFICATION_DEFAULT_CHANNEL: str = "IN_APP"
    FOLLOW_UP_REMINDER_HOURS_BEFORE: int = 24
    NOTIFICATION_MAX_RETRIES: int = 3

    # Optional External Provider Configurations (safe abstractions)
    EMAIL_PROVIDER: Optional[str] = None
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = "notifications@ayurai.com"

    SMS_PROVIDER: Optional[str] = None
    SMS_API_KEY: Optional[str] = None
    SMS_FROM: Optional[str] = None

    WHATSAPP_PROVIDER: Optional[str] = None
    WHATSAPP_API_KEY: Optional[str] = None
    WHATSAPP_FROM: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

