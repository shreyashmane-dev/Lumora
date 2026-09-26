from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "lumora-backend"


def test_security_headers_present():
    res = client.get("/health")
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "X-Request-ID" in res.headers


def test_public_detect_anonymous():
    text = (
        "Furthermore, it is important to remember that artificial intelligence plays a crucial role "
        "in modern writing workflows. Navigating the complexities of machine learning models helps developers understand signals."
    )
    res = client.post("/v1/detect", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    assert "classification" in data
    assert "ai_probability" in data
    assert "confidence" in data
    assert "signals" in data
    assert "sentence_analysis" in data
    assert "X-RateLimit-Limit" in res.headers
    assert "X-RateLimit-Remaining" in res.headers


def test_public_humanize_anonymous():
    text = (
        "It is important to remember that this approach plays a crucial role in navigating modern challenges. "
        "Furthermore, in conclusion, we delve into the details."
    )
    res = client.post("/v1/humanize", json={"text": text, "style": "natural"})
    assert res.status_code == 200
    data = res.json()
    assert "rewritten_text" in data
    assert "changes_diff" in data
    assert "meaning_preservation_score" in data
    assert data["meaning_preservation_score"] >= 0.70


def test_public_analyze_endpoint():
    text = (
        "Every writer learns to balance brevity and detail. When words flow naturally, readers stay engaged. "
        "Conversely, repetitive structures tire the audience and weaken the argument."
    )
    res = client.post("/v1/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    assert "signals_vs_conclusions" in data
    assert "burstiness_score" in data
    assert "flesch_reading_ease" in data


def test_invalid_api_key_header():
    res = client.post(
        "/v1/detect",
        json={"text": "A valid sentence with sufficient length for analysis to trigger error handling."},
        headers={"Authorization": "Bearer lum_live_invalid_key_9999"}
    )
    assert res.status_code == 401
    data = res.json()
    assert data["error"]["code"] == "INVALID_API_KEY"


def test_text_too_short_error_contract():
    res = client.post("/v1/detect", json={"text": "Short."})
    assert res.status_code == 400
    data = res.json()
    assert data["error"]["code"] == "TEXT_TOO_SHORT"
    assert "request_id" in data["error"]


def test_api_keys_and_usage_endpoints():
    # Create key
    create_res = client.post("/v1/keys", json={"name": "Test Key Endpoint", "environment": "live"})
    assert create_res.status_code == 201
    key_data = create_res.json()
    raw_key = key_data["raw_key"]
    key_id = key_data["id"]

    # Use key
    detect_res = client.post(
        "/v1/detect",
        json={"text": "This is a full sentence containing sufficient words to verify authenticated API calls under test."},
        headers={"Authorization": f"Bearer {raw_key}"}
    )
    assert detect_res.status_code == 200

    # Check usage
    usage_res = client.get("/v1/usage", headers={"Authorization": f"Bearer {raw_key}"})
    assert usage_res.status_code == 200
    usage_data = usage_res.json()
    assert usage_data["monthly_used"] >= 1

    # Revoke key
    del_res = client.delete(f"/v1/keys/{key_id}")
    assert del_res.status_code == 200


def test_status_endpoint():
    res = client.get("/v1/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert "detector_model" in data["services"]
    assert "humanizer_model" in data["services"]
