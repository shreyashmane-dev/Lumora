# LUMORA REST API v1 Reference

All API calls must use HTTPS in production.

**Base URLs:**
- Production: `https://api.lumora.ai`
- Development: `http://127.0.0.1:8000`

---

## Headers

| Header | Type | Description |
| :--- | :--- | :--- |
| `Authorization` | Optional/Required | `Bearer <API_KEY>` for authenticated developer requests. |
| `Content-Type` | Required | `application/json` |
| `X-Request-ID` | Outgoing | Unique UUID assigned to the transaction for tracing. |
| `X-RateLimit-Limit` | Outgoing | Maximum requests permitted in the current sliding window. |
| `X-RateLimit-Remaining` | Outgoing | Remaining requests available in the window. |
| `X-RateLimit-Reset` | Outgoing | Seconds remaining until the window resets. |

---

## Endpoints

### 1. `POST /v1/detect`
Evaluates text for probabilistic AI generation signals.

**Request Body:**
```json
{
  "text": "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing..."
}
```

**Response (200 OK):**
```json
{
  "classification": "Likely AI-Generated",
  "ai_probability": 0.84,
  "confidence": 0.52,
  "is_uncertain": false,
  "word_count": 48,
  "character_count": 312,
  "signals": {
    "burstiness_score": 0.18,
    "perplexity_proxy": 0.42,
    "lexical_diversity": 0.54,
    "sentence_variance": 3.2,
    "repetition_index": 0.65
  },
  "sentence_analysis": [
    {
      "index": 0,
      "text": "Furthermore, it is important to remember...",
      "ai_probability": 0.85,
      "suspicion_level": "high",
      "perplexity_indicator": 0.15
    }
  ],
  "evaluation_summary": "The text displays structural patterns and rhythmic regularities...",
  "model_version": "lumora-ensemble-v1.0.4",
  "timestamp": "2026-09-26T12:00:00Z"
}
```

---

### 2. `POST /v1/humanize`
Rewrites text to eliminate artificial clichés while preserving core propositional facts.

**Request Body:**
```json
{
  "text": "Furthermore, it is important to remember that this multifaceted strategy plays a crucial role...",
  "style": "natural",
  "custom_instructions": null
}
```

**Supported Styles:**
- `natural` (default)
- `academic`
- `professional`
- `simple`
- `casual`
- `native_english`
- `custom`

**Response (200 OK):**
```json
{
  "original_text": "...",
  "rewritten_text": "Notably, keep in mind that this layered strategy is essential...",
  "style": "natural",
  "changes_diff": [
    { "type": "modified", "original": "Furthermore,", "revised": "Notably," },
    { "type": "equal", "original": " this ", "revised": " this " }
  ],
  "meaning_preservation_score": 0.94,
  "readability_before": 42.5,
  "readability_after": 68.2,
  "stats": {
    "words_added": 3,
    "words_removed": 4,
    "words_modified": 6,
    "words_unchanged": 35,
    "similarity_percentage": 82.5
  },
  "model_version": "lumora-humanizer-v1.2.0",
  "timestamp": "2026-09-26T12:00:00Z"
}
```

---

### 3. `POST /v1/analyze`
Generates a comprehensive stylometric writing profile separating factual signals from interpretive conclusions.

**Response (200 OK):**
```json
{
  "word_count": 52,
  "character_count": 340,
  "sentence_count": 3,
  "average_sentence_length": 17.3,
  "sentence_length_std_dev": 8.4,
  "shortest_sentence_length": 8,
  "longest_sentence_length": 25,
  "unique_word_count": 42,
  "type_token_ratio": 0.808,
  "hapax_legomena_ratio": 0.692,
  "flesch_reading_ease": 62.4,
  "flesch_kincaid_grade": 8.6,
  "burstiness_score": 0.572,
  "structural_repetition_score": 0.0,
  "anaphora_detected": [],
  "signals_vs_conclusions": {
    "objective_signals": { ... },
    "interpretive_guidance": { ... }
  },
  "model_version": "lumora-stylometrics-v1.0.1",
  "timestamp": "2026-09-26T12:00:00Z"
}
```

---

### 4. `GET /v1/usage`
Returns monthly quota metrics and 7-day request history for the authenticated developer key.

---

### 5. `POST /v1/keys` & `DELETE /v1/keys/{id}`
Developer key lifecycle endpoints to create and revoke cryptographic API tokens.
