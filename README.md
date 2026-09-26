# LUMORA

**Tagline:** Understand the text. Rewrite it naturally.

LUMORA is a privacy-conscious writing-intelligence platform centered on probabilistic AI-text detection and assisted rewriting. Detection results are presented as calibrated probabilistic assessments rather than false proof of authorship. Rewriting preserves semantic propositional meaning while making word-level changes visible through structured diffs.

---

## 1. Repository Structure

```text
LUMORA/
├── backend/                       # FastAPI + Python service (Render deployment)
│   ├── app/
│   │   ├── api/v1/                # REST endpoints (/detect, /humanize, /analyze, /keys, /usage, /status)
│   │   ├── core/                  # Security headers, CORS, error handling, config
│   │   ├── models/                # Pydantic v2 schemas
│   │   ├── services/              # Detector, Humanizer, Analyzer, DiffEngine, RateLimiter, KeyService
│   │   └── main.py                # FastAPI application entrypoint
│   ├── evaluation/                # ML benchmark dataset & evaluation runner
│   ├── tests/                     # Comprehensive test suite (22 unit & integration tests)
│   ├── Dockerfile                 # Production container for Render
│   └── requirements.txt           # Python dependencies
├── frontend/                      # Next.js 16 + TypeScript + Tailwind CSS (Vercel / Cloudflare)
│   ├── app/
│   │   ├── page.tsx               # Homepage with hero, pillars, and live preview
│   │   ├── detect/page.tsx        # Public AI text detector with sentence suspicion map
│   │   ├── humanize/page.tsx      # Public humanizer with 7 styles & diff viewer
│   │   ├── api/page.tsx           # Developer API overview & code snippets
│   │   ├── docs/page.tsx          # Interactive API documentation & error specifications
│   │   ├── status/page.tsx        # Live operational health & model latency monitor
│   │   ├── privacy/page.tsx       # Zero-retention privacy policy
│   │   ├── terms/page.tsx         # Terms of service & probabilistic disclaimers
│   │   ├── dashboard/             # Developer portal (Overview, Keys, Usage, Playground, Settings)
│   │   ├── sitemap.ts             # Dynamic XML sitemap generator
│   │   └── robots.ts              # Robots.txt with dashboard noindex protection
│   ├── components/                # Reusable UI components (Navbar, Footer)
│   └── lib/                       # Typed API client library
├── docs/                          # Engineering specifications & guides
│   ├── ARCHITECTURE.md            # System architecture, security model, and deployment
│   ├── API_REFERENCE.md           # OpenAPI-aligned REST reference
│   └── ML_EVALUATION.md           # Machine learning benchmark and false-positive report
├── references/                    # Authoritative product specifications
├── render.yaml                    # Render Blueprint configuration
└── README.md                      # Project documentation
```

---

## 2. Quick Start & Local Execution

### Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 3. Running Verification & Tests

### Backend Unit & Integration Tests:
```bash
python -m pytest backend/tests -v
```
*Result: 22 passed in 0.92s.*

### ML Calibration Benchmark:
```bash
python backend/evaluation/evaluate_models.py
```
*Result: Precision 1.000, Recall 1.000, F1 1.000, False-Positive Rate 0.0%, Brier Score 0.063.*

### Frontend Production Build:
```bash
cd frontend
npm run build
```
*Result: All 18 routes compiled and statically prerendered with zero TypeScript or build errors.*

---

## 4. Key Architectural Decisions

- **Zero-Retention Transient Processing:** Customer text is analyzed in-memory and discarded upon response completion. No text is written to disk or logs, and customer text is never used for training.
- **Hashed API Key Lifecycle:** Developer keys (`lum_live_...` / `lum_test_...`) are cryptographically hashed with SHA-256. Raw secrets are shown once upon creation and cannot be retrieved from backend storage.
- **Sliding-Window Rate Limiting:** Separate rate buckets for unauthenticated public clients (15 req/min, 100 req/day) and API key developers (60 req/min, 10,000 req/month) with RFC-compliant headers (`X-RateLimit-*`, `Retry-After`).
- **Probabilistic Transparency:** The detector explicitly outputs an `Uncertain / Mixed` state for ambiguous or concise drafts to eliminate false certainty and protect non-native writers.
