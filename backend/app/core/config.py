from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "LUMORA API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "lumora-development-insecure-secret-key-change-in-production-1234567890"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://lumora-ai-s.web.app",
        "https://lumora-ai-s.firebaseapp.com",
        "https://one-for-all-5e842.web.app",
        "https://one-for-all-5e842.firebaseapp.com",
        "https://lumora.ai",
        "https://*.render.com",
        "https://*.vercel.app",
        "https://*.web.app",
        "https://*.firebaseapp.com"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        return []

    # Rate Limiting & Quotas
    RATE_LIMIT_ANONYMOUS_PER_MIN: int = 15
    RATE_LIMIT_ANONYMOUS_PER_DAY: int = 100
    RATE_LIMIT_API_KEY_PER_MIN: int = 60
    RATE_LIMIT_API_KEY_MONTHLY: int = 10000

    # Payload & Text Limits
    MAX_TEXT_LENGTH_CHARS: int = 100000
    MIN_TEXT_WORDS: int = 15
    RECOMMENDED_MIN_WORDS: int = 50

    # Optional Redis connection string for distributed caching & rate limiting
    REDIS_URL: str = ""

    # Firebase Admin SDK (optional in dev, used in prod if supplied)
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""

    # Model metadata
    DETECTOR_MODEL_VERSION: str = "lumora-ensemble-v1.0.4"
    HUMANIZER_MODEL_VERSION: str = "lumora-humanizer-v1.2.0"
    ANALYZER_MODEL_VERSION: str = "lumora-stylometrics-v1.0.1"


settings = Settings()
