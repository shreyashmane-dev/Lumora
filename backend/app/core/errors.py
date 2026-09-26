from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class LumoraAPIException(HTTPException):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.error_code = error_code
        self.message = message
        self.details = details or {}


class InvalidRequestException(LumoraAPIException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_REQUEST",
            message=message,
            details=details
        )


class TextTooShortException(LumoraAPIException):
    def __init__(self, current_words: int, min_words: int = 15):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="TEXT_TOO_SHORT",
            message=f"Text contains {current_words} words. A minimum of {min_words} words is required for calibrated probabilistic evaluation.",
            details={"current_words": current_words, "min_words": min_words}
        )


class TextTooLargeException(LumoraAPIException):
    def __init__(self, current_chars: int, max_chars: int = 100000):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            error_code="TEXT_TOO_LARGE",
            message=f"Payload size ({current_chars} characters) exceeds the maximum allowed limit of {max_chars} characters.",
            details={"current_chars": current_chars, "max_chars": max_chars}
        )


class InvalidApiKeyException(LumoraAPIException):
    def __init__(self, message: str = "Invalid, expired or missing API key."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="INVALID_API_KEY",
            message=message,
            headers={"WWW-Authenticate": "Bearer"}
        )


class RateLimitedException(LumoraAPIException):
    def __init__(self, retry_after: int = 60, message: str = "Too many requests. Please slow down."):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMITED",
            message=message,
            details={"retry_after_seconds": retry_after},
            headers={"Retry-After": str(retry_after)}
        )


class QuotaExceededException(LumoraAPIException):
    def __init__(self, limit: int, current: int, quota_type: str = "monthly"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="QUOTA_EXCEEDED",
            message=f"You have reached your {quota_type} quota of {limit} requests.",
            details={"limit": limit, "current": current, "quota_type": quota_type}
        )


class ModelUnavailableException(LumoraAPIException):
    def __init__(self, message: str = "Inference service is currently undergoing routine scaling or maintenance."):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_code="MODEL_UNAVAILABLE",
            message=message
        )
