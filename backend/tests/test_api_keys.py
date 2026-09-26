import pytest
from app.services.key_service import KeyService
from app.models.keys import CreateKeyRequest
from app.core.errors import InvalidApiKeyException


def test_api_key_lifecycle():
    service = KeyService()
    # Create key
    req = CreateKeyRequest(name="Analytics Integration Key", environment="live")
    created = service.create_key(req, user_id="test_user_42")

    assert created.raw_key.startswith("lum_live_")
    prefix_start = created.prefix.split("...")[0]
    prefix_end = created.prefix.split("...")[1]
    assert prefix_start in created.raw_key
    assert prefix_end in created.raw_key
    assert created.name == "Analytics Integration Key"

    # Validate raw key works
    record = service.validate_key(created.raw_key, endpoint="/v1/detect")
    assert record.id == created.id
    assert record.monthly_used == 1

    # Revoke key
    revoked = service.revoke_key(created.id, user_id="test_user_42")
    assert revoked is True

    # Validate revoked key throws 401 InvalidApiKeyException
    with pytest.raises(InvalidApiKeyException):
        service.validate_key(created.raw_key)


def test_api_key_invalid_rejection():
    service = KeyService()
    with pytest.raises(InvalidApiKeyException):
        service.validate_key("lum_live_completely_fake_key_12345")
