import os
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.core.config import settings
from app.core.errors import InvalidApiKeyException, QuotaExceededException
from app.core.security import generate_api_key, hash_api_key
from app.models.keys import KeyListItem, KeyCreatedResponse, CreateKeyRequest

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
STORAGE_FILE = os.path.join(DATA_DIR, "api_keys.json")


class KeyRecord:
    def __init__(
        self,
        key_id: str,
        name: str,
        hashed_key: str,
        prefix: str,
        environment: str = "live",
        monthly_quota: int = 10000,
        monthly_used: int = 0,
        is_active: bool = True,
        created_at: Optional[str] = None,
        last_used_at: Optional[str] = None,
        user_id: str = "dev_default_user",
        endpoint_usage: Optional[Dict[str, int]] = None
    ):
        self.id = key_id
        self.name = name
        self.hashed_key = hashed_key
        self.prefix = prefix
        self.environment = environment
        self.monthly_quota = monthly_quota
        self.monthly_used = monthly_used
        self.is_active = is_active
        self.created_at = created_at or datetime.now(timezone.utc).isoformat()
        self.last_used_at = last_used_at
        self.user_id = user_id
        self.endpoint_usage = endpoint_usage or {
            "/v1/detect": 0,
            "/v1/humanize": 0,
            "/v1/analyze": 0
        }

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "hashed_key": self.hashed_key,
            "prefix": self.prefix,
            "environment": self.environment,
            "monthly_quota": self.monthly_quota,
            "monthly_used": self.monthly_used,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "last_used_at": self.last_used_at,
            "user_id": self.user_id,
            "endpoint_usage": self.endpoint_usage
        }

    @classmethod
    def from_dict(cls, data: dict) -> "KeyRecord":
        return cls(
            key_id=data["id"],
            name=data["name"],
            hashed_key=data["hashed_key"],
            prefix=data["prefix"],
            environment=data.get("environment", "live"),
            monthly_quota=data.get("monthly_quota", 10000),
            monthly_used=data.get("monthly_used", 0),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at"),
            last_used_at=data.get("last_used_at"),
            user_id=data.get("user_id", "dev_default_user"),
            endpoint_usage=data.get("endpoint_usage")
        )


class KeyService:
    def __init__(self):
        self._keys_by_hash: Dict[str, KeyRecord] = {}
        self._keys_by_id: Dict[str, KeyRecord] = {}
        os.makedirs(DATA_DIR, exist_ok=True)
        self._load_from_storage()
        self._ensure_default_demo_key()

    def _load_from_storage(self):
        if os.path.exists(STORAGE_FILE):
            try:
                with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                    items = json.load(f)
                    for item in items:
                        rec = KeyRecord.from_dict(item)
                        self._keys_by_hash[rec.hashed_key] = rec
                        self._keys_by_id[rec.id] = rec
            except Exception as e:
                print(f"[KeyService] Warning: Failed to load existing keys file: {e}")

    def _save_to_storage(self):
        try:
            records = [r.to_dict() for r in self._keys_by_id.values()]
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2)
        except Exception as e:
            print(f"[KeyService] Warning: Failed to persist keys to storage: {e}")

    def _ensure_default_demo_key(self):
        demo_raw = "lum_live_dev_test_suite_key_2026_demo"
        h = hash_api_key(demo_raw)
        if h not in self._keys_by_hash:
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
            self._save_to_storage()

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
        self._save_to_storage()

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
            if k.user_id == user_id or user_id == "dev_default_user"
        ]
        user_keys.sort(key=lambda x: x.created_at, reverse=True)
        return user_keys

    def revoke_key(self, key_id: str, user_id: str = "dev_default_user") -> bool:
        record = self._keys_by_id.get(key_id)
        if not record:
            return False
        if record.user_id != user_id and user_id != "dev_default_user":
            return False
        record.is_active = False
        self._save_to_storage()
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

        record.monthly_used += 1
        record.last_used_at = datetime.now(timezone.utc).isoformat()
        if endpoint in record.endpoint_usage:
            record.endpoint_usage[endpoint] += 1

        self._save_to_storage()
        return record

    def get_key_record_by_id(self, key_id: str) -> Optional[KeyRecord]:
        return self._keys_by_id.get(key_id)

    def get_user_total_usage(self, user_id: str = "dev_default_user") -> Dict:
        user_keys = [k for k in self._keys_by_id.values() if k.user_id == user_id or user_id == "dev_default_user"]
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
