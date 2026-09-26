from typing import List, Dict, Optional
from pydantic import BaseModel


class DailyUsageItem(BaseModel):
    date: str
    detect_requests: int
    humanize_requests: int
    analyze_requests: int
    total_requests: int


class UsageSummaryResponse(BaseModel):
    key_id: Optional[str]
    monthly_quota: int
    monthly_used: int
    monthly_remaining: int
    percent_consumed: float
    reset_date: str
    endpoint_breakdown: Dict[str, int]
    daily_history: List[DailyUsageItem]
