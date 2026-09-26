import uuid
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Applies OWASP-recommended HTTP security headers to all responses."""
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        return response


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Assigns and tracks unique X-Request-ID for distributed tracing and logs."""
    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
        request.state.request_id = req_id
        start_time = time.time()
        
        response: Response = await call_next(request)
        
        duration = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time-Ms"] = str(duration)
        return response


class PayloadLimitMiddleware(BaseHTTPMiddleware):
    """Rejects incoming payloads exceeding the safe maximum threshold."""
    MAX_BYTES = 500_000  # 500 KB

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.MAX_BYTES:
            return JSONResponse(
                status_code=413,
                content={
                    "error": {
                        "code": "TEXT_TOO_LARGE",
                        "message": f"Payload size exceeds the limit of {self.MAX_BYTES // 1000} KB.",
                        "details": {"max_bytes": self.MAX_BYTES}
                    }
                }
            )
        return await call_next(request)
