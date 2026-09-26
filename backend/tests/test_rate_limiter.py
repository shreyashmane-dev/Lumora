import pytest
from app.services.rate_limiter import RateLimiter
from app.core.errors import RateLimitedException, QuotaExceededException


def test_rate_limiter_burst_enforcement():
    limiter = RateLimiter()
    ident = "test_user_ip_1"
    limit = 3

    # First 3 should pass
    limiter.check_rate_limit(ident, limit_per_minute=limit)
    limiter.check_rate_limit(ident, limit_per_minute=limit)
    limiter.check_rate_limit(ident, limit_per_minute=limit)

    # 4th should raise RateLimitedException (429)
    with pytest.raises(RateLimitedException) as exc_info:
        limiter.check_rate_limit(ident, limit_per_minute=limit)

    assert exc_info.value.status_code == 429
    assert exc_info.value.error_code == "RATE_LIMITED"


def test_rate_limiter_daily_quota():
    limiter = RateLimiter()
    ip = "192.168.1.10"
    max_daily = 2

    limiter.check_anonymous_daily_quota(ip, max_daily=max_daily)
    limiter.check_anonymous_daily_quota(ip, max_daily=max_daily)

    with pytest.raises(QuotaExceededException) as exc_info:
        limiter.check_anonymous_daily_quota(ip, max_daily=max_daily)

    assert exc_info.value.status_code == 429
    assert exc_info.value.error_code == "QUOTA_EXCEEDED"
