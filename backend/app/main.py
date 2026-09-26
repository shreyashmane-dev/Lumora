from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.errors import LumoraAPIException
from app.core.middleware import SecurityHeadersMiddleware, RequestIdMiddleware, PayloadLimitMiddleware
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Privacy-conscious platform for probabilistic AI-text detection and natural humanized rewriting.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware with strict allowlist
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time-Ms", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"]
)

# Custom security & observability middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIdMiddleware)
app.add_middleware(PayloadLimitMiddleware)


# Standardized error handlers according to API Specification
@app.exception_handler(LumoraAPIException)
async def lumora_exception_handler(request: Request, exc: LumoraAPIException):
    req_id = getattr(request.state, "request_id", "req_unknown")
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
                "request_id": req_id
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", "req_unknown")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": "INVALID_REQUEST",
                "message": "The request body or query parameters failed validation.",
                "details": {"validation_errors": exc.errors()},
                "request_id": req_id
            }
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "req_unknown")
    # Never leak internal server exceptions or stack traces to client
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected server error occurred. Please contact support with the request ID.",
                "details": {},
                "request_id": req_id
            }
        }
    )


# Health check endpoint for Render deployment
@app.get("/health", summary="Health Check for Render and Uptime Monitors")
async def health_check():
    return {
        "status": "healthy",
        "service": "lumora-backend",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# Attach v1 API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
