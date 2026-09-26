from fastapi import APIRouter, Request, Response, Depends
from typing import Optional
from app.models.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.analyzer import AnalyzerService
from app.services.rate_limiter import rate_limiter
from app.services.key_service import key_service
from app.core.security import get_api_key_from_header
from app.core.config import settings

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse, summary="Comprehensive Stylometric Writing Profile")
async def analyze_writing(
    payload: AnalyzeRequest,
    request: Request,
    response: Response,
    api_key: Optional[str] = Depends(get_api_key_from_header)
):
    """
    Returns a deep writing profile including sentence variation, vocabulary diversity,
    structural repetition and readability, while strictly separating signals from conclusions.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"

    if api_key:
        key_record = key_service.validate_key(api_key, endpoint="/v1/analyze")
        limit, remaining, reset_secs = rate_limiter.check_rate_limit(
            identifier=f"key_{key_record.id}",
            limit_per_minute=settings.RATE_LIMIT_API_KEY_PER_MIN,
            is_api_key=True
        )
    else:
        rate_limiter.check_anonymous_daily_quota(client_ip)
        limit, remaining, reset_secs = rate_limiter.check_rate_limit(
            identifier=f"ip_{client_ip}",
            limit_per_minute=settings.RATE_LIMIT_ANONYMOUS_PER_MIN,
            is_api_key=False
        )

    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_secs)

    return AnalyzerService.analyze(payload.text)
