import time
from typing import Dict, Tuple, Optional
from collections import defaultdict
from app.core.errors import RateLimitedException, QuotaExceededException
from app.core.config import settings


class RateLimiter:
    """
    In-memory sliding-window rate limiter with Redis-compatible semantics.
    Enforces per-minute bursts and per-day / monthly quotas across IP and API keys.
    """
    def __init__(self):
        # Maps bucket_key -> list of timestamp floats
        self._minute_buckets: Dict[str, list] = defaultdict(list)
        # Maps bucket_key -> count
        self._quota_counters: Dict[str, int] = defaultdict(int)
        self._quota_reset_epoch: float = time.time() + 86400

    def check_rate_limit(
        self,
        identifier: str,
        limit_per_minute: int,
        is_api_key: bool = False
    ) -> Tuple[int, int, int]:
        """
        Validates rate limit for a sliding 60-second window.
        Returns:
            limit: total allowed in window
            remaining: remaining calls in current window
            reset_seconds: seconds until window resets
        """
        now = time.time()
        window_start = now - 60.0

        # Purge timestamps older than 60s
        timestamps = [ts for ts in self._minute_buckets[identifier] if ts > window_start]
        self._minute_buckets[identifier] = timestamps

        current_count = len(timestamps)
        remaining = max(0, limit_per_minute - current_count)
        reset_seconds = max(1, int(60 - (now - timestamps[0]))) if timestamps else 60

        if current_count >= limit_per_minute:
            raise RateLimitedException(
                retry_after=reset_seconds,
                message=f"Rate limit of {limit_per_minute} requests/minute exceeded for this {'API key' if is_api_key else 'client'}."
            )

        # Record this request
        self._minute_buckets[identifier].append(now)
        return limit_per_minute, remaining - 1, reset_seconds

    def check_anonymous_daily_quota(self, ip_address: str, max_daily: int = None) -> None:
        """Enforces daily request limits on unauthenticated public users."""
        max_daily = max_daily or settings.RATE_LIMIT_ANONYMOUS_PER_DAY
        now = time.time()
        if now > self._quota_reset_epoch:
            self._quota_counters.clear()
            self._quota_reset_epoch = now + 86400

        key = f"daily_anon_{ip_address}"
        used = self._quota_counters[key]
        if used >= max_daily:
            raise QuotaExceededException(limit=max_daily, current=used, quota_type="daily anonymous")

        self._quota_counters[key] += 1


rate_limiter = RateLimiter()
