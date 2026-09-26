# LUMORA System Architecture Documentation

## 1. System Vision & Architecture Overview

LUMORA is a high-performance, privacy-conscious writing intelligence platform providing calibrated probabilistic AI-text analysis, natural semantic-preserving rewriting, and a developer REST API.

The platform is strictly architected into two decoupled, independently deployable tiers:

```text
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│  (Static/SSR Edge Deployment: Vercel / Cloudflare)    │
│  - Public Detector UI (/detect)                        │
│  - Public Humanizer UI (/humanize)                     │
│  - Developer Portal & Playground (/dashboard)          │
│  - SEO Foundation, Sitemaps, Robots, Metadata          │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON (Bearer / Anon)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│            (Render Web Service Container)              │
│  - Security & Headers Middleware (OWASP, CSP, HSTS)    │
│  - Sliding-Window Rate Limiting & Quotas (IP & Key)    │
│  - Hashed API Key Lifecycle (SHA-256 Storage)          │
│  - Probabilistic Detector Service (Burstiness, TTR)    │
│  - Natural Humanizer Service (Semantic Diff Engine)    │
│  - Stylometric Analyzer Profile Service                │
└────────────────────────────────────────────────────────┘
```

---

## 2. Security Boundaries & Zero-Retention Policy

1. **Server-Side Secret Isolation:**
   - No privileged credentials, master keys, or provider tokens are ever embedded in client-side bundles or exposed to the browser.
   - API keys are hashed with cryptographic SHA-256 before storage; the raw secret is displayed once upon creation and cannot be decrypted or retrieved.

2. **Transient In-Memory Processing:**
   - User text submitted to `/v1/detect`, `/v1/humanize`, or `/v1/analyze` is processed purely in volatile memory.
   - Text is never written to disk, databases, or application log files.
   - User text is never retained or utilized to train or fine-tune models.

3. **HTTP Security Headers & CORS:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production)
   - Strict CORS origin allowlist configured in `Settings.CORS_ORIGINS`.

---

## 3. Rate Limiting & Quota Management

LUMORA implements a dual-tier sliding-window rate limiter:
- **Public Anonymous Clients:**
  - Burst limit: 15 requests / minute per client IP.
  - Daily quota: 100 requests / day per client IP.
  - Managed via `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.
- **Developer API Key Clients:**
  - Burst limit: 60 requests / minute per API key.
  - Monthly quota: 10,000 requests / month per account.
  - Stable 429 errors (`RATE_LIMITED` or `QUOTA_EXCEEDED`) with `Retry-After` header.

---

## 4. Machine Learning & Stylometric Pipeline

Detection relies on statistical stylometry rather than brittle pattern matching:
1. **Burstiness / Rhythm Variance:** Coefficient of variation ($CV = \sigma / \mu$) across sentence lengths. Human writing displays high natural rhythm variation; uniform sentence lengths trigger AI signals.
2. **Lexical Diversity (TTR):** Type-token ratio and Guiraud's root index measuring vocabulary breadth.
3. **Perplexity Proxy:** Syntactic predictability and recurring formulaic AI markers.
4. **Repetition & Anaphora:** Frequency of identical sentence-initial constructs and recurring n-grams.
5. **Calibrated Logistic Sigmoid:** Maps signals to a probability score $[0.0, 1.0]$ with an explicit **Uncertainty State** for ambiguous scores ($0.40 - 0.60$) or short texts.

---

## 5. Deployment Instructions

### Backend (Render):
1. Connect repository to Render.
2. Select Web Service, specify Root Directory: `backend`.
3. Set Build Command: `pip install -r requirements.txt`.
4. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Health Check Path: `/health`.

### Frontend (Vercel / Cloudflare):
1. Set Root Directory: `frontend`.
2. Framework Preset: Next.js.
3. Environment Variable: `NEXT_PUBLIC_API_URL=https://<your-render-backend-url>`.
