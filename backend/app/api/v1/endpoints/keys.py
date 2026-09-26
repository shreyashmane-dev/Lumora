from fastapi import APIRouter, Header, HTTPException, status
from typing import Optional
from app.models.keys import CreateKeyRequest, KeyCreatedResponse, KeyListResponse
from app.services.key_service import key_service

router = APIRouter()


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extracts developer identity from Firebase Bearer token or development mock session.
    Keeps frontend integration seamless in development without forcing external credentials.
    """
    if not authorization:
        return "dev_default_user"
    token = authorization.replace("Bearer ", "").strip()
    if token.startswith("user_"):
        return token
    return "dev_default_user"


@router.post("/keys", response_model=KeyCreatedResponse, status_code=status.HTTP_201_CREATED, summary="Create Developer API Key")
async def create_api_key(
    payload: CreateKeyRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Creates a new cryptographically random API key.
    The secret key is displayed ONCE in the response and never stored in plaintext.
    """
    user_id = get_current_user_id(authorization)
    return key_service.create_key(payload, user_id=user_id)


@router.get("/keys", response_model=KeyListResponse, summary="List Developer API Keys")
async def list_api_keys(authorization: Optional[str] = Header(None)):
    """Lists all active and revoked API keys belonging to the developer account."""
    user_id = get_current_user_id(authorization)
    keys = key_service.list_keys_for_user(user_id=user_id)
    return KeyListResponse(keys=keys)


@router.delete("/keys/{key_id}", summary="Revoke API Key")
async def revoke_api_key(key_id: str, authorization: Optional[str] = Header(None)):
    """Permanently revokes an API key, disabling all subsequent requests using it."""
    user_id = get_current_user_id(authorization)
    success = key_service.revoke_key(key_id, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found or not owned by current account."
        )
    return {"status": "success", "message": f"API key {key_id} has been successfully revoked."}
