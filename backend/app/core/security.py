import hashlib
import secrets
import time
from typing import Optional, Tuple
from fastapi import Header, Request
from app.core.errors import InvalidApiKeyException


def generate_api_key(prefix: str = "lum_live") -> Tuple[str, str, str]:
    """
    Generates a cryptographically random API key.
    Returns:
        raw_key: Full secret key shown to developer ONCE (e.g. lum_live_...)
        key_hash: SHA-256 hash stored in backend
        display_prefix: Truncated preview (e.g. lum_live_a1b2c3...)
    """
    token_bytes = secrets.token_hex(24)
    raw_key = f"{prefix}_{token_bytes}"
    key_hash = hash_api_key(raw_key)
    display_prefix = f"{raw_key[:12]}...{raw_key[-4:]}"
    return raw_key, key_hash, display_prefix


def hash_api_key(api_key: str) -> str:
    """SHA-256 hash for secure storage and constant-time comparison."""
    return hashlib.sha256(api_key.strip().encode("utf-8")).hexdigest()


async def get_api_key_from_header(
    authorization: Optional[str] = Header(None)
) -> Optional[str]:
    """
    Extracts Bearer API key from the Authorization header.
    Returns None if no authorization header is present (for public anonymous requests).
    """
    if not authorization:
        return None
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise InvalidApiKeyException("Authorization header must be formatted as 'Bearer <API_KEY>'")
    
    return parts[1].strip()
