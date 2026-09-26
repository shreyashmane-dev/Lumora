from typing import List, Optional
from pydantic import BaseModel, Field


class CreateKeyRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="A friendly name for the API key.")
    environment: str = Field("live", description="'live' or 'test'")


class KeyCreatedResponse(BaseModel):
    id: str
    name: str
    raw_key: str = Field(..., description="The full secret API key. Store this safely now; it will not be shown again.")
    prefix: str
    environment: str
    created_at: str
    monthly_quota: int
    message: str = "Store this API key in a secure location. It will never be displayed again."


class KeyListItem(BaseModel):
    id: str
    name: str
    prefix: str
    environment: str
    created_at: str
    last_used_at: Optional[str] = None
    is_active: bool
    monthly_quota: int
    monthly_used: int


class KeyListResponse(BaseModel):
    keys: List[KeyListItem]
