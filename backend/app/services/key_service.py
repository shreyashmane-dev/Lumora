import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.core.config import settings
from app.core.errors import InvalidApiKeyException, QuotaExceededException
from app.core.security import generate_api_key, hash_api_key
from app.models.keys import KeyListItem, KeyCreatedResponse, CreateKeyRequest


class KeyRecord:
    def __init__(
        self,
        key_id: str,
        name: str,
        hashed_key: str,
        prefix: str,
        environment: str = "live",
        monthly_quota: int = 10000,
        user_id: str = "dev_default_user"
    ):
        self.id = key_id
        self.name = name
        self.hashed_key = hashed_key
        self.prefix = prefix
        self.environment = environment
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.last_used_at: Optional[str] = None
        self.is_active = True
        self.monthly_quota = monthly_quota
        self.monthly_used = 0
        self.user_id = user_id
        self.endpoint_usage = {
            "/v1/detect": 0,
            "/v1/humanize": 0,
            "/v1/analyze": 0
        }


class KeyService:
    def __init__(self):
        # Maps hashed_key -> KeyRecord
        self._keys_by_hash: Dict[str, KeyRecord] = {}
        # Maps key_id -> KeyRecord
        self._keys_by_id: Dict[str, KeyRecord] = {}
        self._seed_default_demo_key()

    def _seed_default_demo_key(self):
        """Seeds a convenient pre-configured key for testing and immediate developer playground use."""
        demo_raw = "lum_live_dev_test_suite_key_2026_demo"
        h = hash_api_key(demo_raw)
        record = KeyRecord(
            key_id="key_demo_default_1",
            name="Default Development Key",
            hashed_key=h,
            prefix=f"{demo_raw[:12]}...{demo_raw[-4:]}",
            environment="live",
            monthly_quota=10000,
            user_id="dev_default_user"
        )
        self._keys_by_hash[h] = record
        self._keys_by_id[record.id] = record

    def create_key(self, request: CreateKeyRequest, user_id: str = "dev_default_user") -> KeyCreatedResponse:
        prefix_tag = "lum_test" if request.environment == "test" else "lum_live"
        raw_key, key_hash, display_prefix = generate_api_key(prefix=prefix_tag)

        key_id = f"key_{uuid.uuid4().hex[:12]}"
        record = KeyRecord(
            key_id=key_id,
            name=request.name,
            hashed_key=key_hash,
            prefix=display_prefix,
            environment=request.environment,
            monthly_quota=settings.RATE_LIMIT_API_KEY_MONTHLY,
            user_id=user_id
        )

        self._keys_by_hash[key_hash] = record
        self._keys_by_id[key_id] = record

        return KeyCreatedResponse(
            id=key_id,
            name=record.name,
            raw_key=raw_key,
            prefix=display_prefix,
            environment=record.environment,
            created_at=record.created_at,
            monthly_quota=record.monthly_quota
        )

    def list_keys_for_user(self, user_id: str = "dev_default_user") -> List[KeyListItem]:
        user_keys = [
            KeyListItem(
                id=k.id,
                name=k.name,
                prefix=k.prefix,
                environment=k.environment,
                created_at=k.created_at,
                last_used_at=k.last_used_at,
                is_active=k.is_active,
                monthly_quota=k.monthly_quota,
                monthly_used=k.monthly_used
            )
            for k in self._keys_by_id.values()
            if k.user_id == user_id
        ]
        user_keys.sort(key=lambda x: x.created_at, reverse=True)
        return user_keys

    def revoke_key(self, key_id: str, user_id: str = "dev_default_user") -> bool:
        record = self._keys_by_id.get(key_id)
        if not record or record.user_id != user_id:
            return False
        record.is_active = False
        return True

    def validate_key(self, raw_key: str, endpoint: str = "/v1/detect") -> KeyRecord:
        key_hash = hash_api_key(raw_key)
        record = self._keys_by_hash.get(key_hash)
        if not record or not record.is_active:
            raise InvalidApiKeyException("Provided API key is invalid or has been revoked.")

        if record.monthly_used >= record.monthly_quota:
            raise QuotaExceededException(
                limit=record.monthly_quota,
                current=record.monthly_used,
                quota_type="monthly"
            )

        # Update metrics
        record.monthly_used += 1
        record.last_used_at = datetime.now(timezone.utc).isoformat()
        if endpoint in record.endpoint_usage:
            record.endpoint_usage[endpoint] += 1

        return record

    def get_key_record_by_id(self, key_id: str) -> Optional[KeyRecord]:
        return self._keys_by_id.get(key_id)

    def get_user_total_usage(self, user_id: str = "dev_default_user") -> Dict:
        user_keys = [k for k in self._keys_by_id.values() if k.user_id == user_id]
        total_quota = sum(k.monthly_quota for k in user_keys) if user_keys else settings.RATE_LIMIT_API_KEY_MONTHLY
        total_used = sum(k.monthly_used for k in user_keys)
        endpoint_breakdown = {"/v1/detect": 0, "/v1/humanize": 0, "/v1/analyze": 0}
        for k in user_keys:
            for ep, count in k.endpoint_usage.items():
                endpoint_breakdown[ep] = endpoint_breakdown.get(ep, 0) + count

        return {
            "monthly_quota": total_quota,
            "monthly_used": total_used,
            "monthly_remaining": max(0, total_quota - total_used),
            "percent_consumed": round((total_used / max(1, total_quota)) * 100, 1),
            "endpoint_breakdown": endpoint_breakdown
        }


key_service = KeyService()
