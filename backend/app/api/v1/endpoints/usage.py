from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Header, Depends
from typing import Optional
from app.models.usage import UsageSummaryResponse, DailyUsageItem
from app.services.key_service import key_service
from app.core.security import get_api_key_from_header

router = APIRouter()


@router.get("/usage", response_model=UsageSummaryResponse, summary="Developer Usage & Quota Metrics")
async def get_usage_metrics(
    authorization: Optional[str] = Header(None),
    api_key: Optional[str] = Depends(get_api_key_from_header)
):
    """
    Returns API usage statistics, current monthly quota consumption, and request breakdown.
    Can be queried using developer session token or API key.
    """
    user_id = "dev_default_user"
    key_id = None

    if api_key:
        record = key_service.validate_key(api_key)
        user_id = record.user_id
        key_id = record.id

    usage_data = key_service.get_user_total_usage(user_id=user_id)
    today = datetime.now(timezone.utc)
    
    # Generate rolling 7-day history for dashboard charting
    history = []
    for i in range(6, -1, -1):
        day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        # Approximate distribution for demonstration
        detect_count = usage_data["endpoint_breakdown"]["/v1/detect"] // (7 if i > 0 else 1)
        humanize_count = usage_data["endpoint_breakdown"]["/v1/humanize"] // (7 if i > 0 else 1)
        analyze_count = usage_data["endpoint_breakdown"]["/v1/analyze"] // (7 if i > 0 else 1)
        history.append(
            DailyUsageItem(
                date=day,
                detect_requests=detect_count,
                humanize_requests=humanize_count,
                analyze_requests=analyze_count,
                total_requests=detect_count + humanize_count + analyze_count
            )
        )

    next_reset = (today.replace(day=1) + timedelta(days=32)).replace(day=1).strftime("%Y-%m-%d")

    return UsageSummaryResponse(
        key_id=key_id,
        monthly_quota=usage_data["monthly_quota"],
        monthly_used=usage_data["monthly_used"],
        monthly_remaining=usage_data["monthly_remaining"],
        percent_consumed=usage_data["percent_consumed"],
        reset_date=next_reset,
        endpoint_breakdown=usage_data["endpoint_breakdown"],
        daily_history=history
    )
