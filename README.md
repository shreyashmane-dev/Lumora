<div align="center">

# ✦ LUMORA ✦
### *Understand the text. Rewrite it naturally.*

<p align="center">
  A state-of-the-art writing intelligence platform delivering <strong>calibrated probabilistic AI-text detection</strong> and <strong>natural semantic-preserving rewriting</strong> with visible word-for-word change tracking.
</p>

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Render-Deploy_Ready-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tests](https://img.shields.io/badge/Tests-22%2F22_Passing-brightgreen?style=for-the-badge)](backend/tests)
[![False Positive Rate](https://img.shields.io/badge/FPR_Human-0.0%25-success?style=for-the-badge)](docs/ML_EVALUATION.md)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br />

[Explore Web App](http://localhost:3000) • [Interactive API Docs](http://localhost:3000/docs) • [Architecture Guide](docs/ARCHITECTURE.md) • [ML Benchmark Report](docs/ML_EVALUATION.md) • [Bug Report](https://github.com/shreyashmane-dev/Lumora/issues)

</div>

---

## 📑 Table of Contents

- [Vision & Ethical Philosophy](#-vision--ethical-philosophy)
- [System Architecture](#-system-architecture)
- [Core Platform Capabilities](#-core-platform-capabilities)
  - [1. Calibrated Probabilistic AI Detector](#1-calibrated-probabilistic-ai-detector)
  - [2. Semantic-Preserving Humanizer](#2-semantic-preserving-humanizer)
  - [3. Stylometrics Writing Profile Analyzer](#3-stylometrics-writing-profile-analyzer)
  - [4. Developer Portal & Real-Time Playground](#4-developer-portal--real-time-playground)
- [Machine Learning Benchmark Results](#-machine-learning-benchmark-results)
- [Security & Zero-Retention Architecture](#-security--zero-retention-architecture)
- [Repository Structure](#-repository-structure)
- [Quick Start (Local Development)](#-quick-start-local-development)
  - [Backend Setup (FastAPI)](#1-backend-service)
  - [Frontend Setup (Next.js)](#2-frontend-application)
- [Verification & Automated Test Suite](#-verification--automated-test-suite)
- [Firebase Setup & Firestore Security Rules](#-firebase-setup--firestore-security-rules)
- [Production Deployment](#-production-deployment)
  - [Render (Backend)](#render-web-service)
  - [Vercel (Frontend)](#vercel-edge-application)
- [Developer API Reference](#-developer-api-reference)
- [Product Roadmap](#-product-roadmap)
- [License](#-license)

---

## 🔮 Vision & Ethical Philosophy

Commercial AI detectors frequently make unfounded claims of 100% certainty, causing severe academic and professional harm through false accusations—particularly against non-native English speakers and formal technical authors.

**LUMORA replaces false certainty with calibrated statistical transparency:**

1. **Uncertainty is a First-Class Output:** Text exhibiting ambiguous stylistic markers or concise length is explicitly categorized as `Uncertain / Mixed` rather than guessing.
2. **Never Claim Authorship Proof:** Scores represent probabilistic likelihoods based on objective stylometric variance, not definitive proof of human or machine origin.
3. **Meaning Preservation Above All:** Rewriting preserves 100% of facts, entities, dates, and propositions while restructuring monotonous syntax.
4. **Transient Zero-Retention Processing:** Text is analyzed strictly in volatile memory and discarded immediately upon response completion.

---

## 🏛 System Architecture

LUMORA is strictly decoupled into two independently deployable tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 Web Tier                             │
│                  (Vercel / Cloudflare Edge Runtime)                    │
│                                                                        │
│   ├── / (Home & Pillars)              ├── /detect (Interactive AI Map) │
│   ├── /humanize (Diff Studio)         ├── /api & /docs (API Spec)      │
│   ├── /status (Uptime & Latency)      ├── /dashboard (Developer Portal)│
│   └── SEO Engine (Dynamic Sitemaps, Robots.txt, OpenGraph, JSON-LD)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JSON (Bearer / Anonymous)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Application Tier                        │
│                     (Render Containerized Runtime)                     │
│                                                                        │
│   ├── OWASP Security Headers (HSTS, CSP, Frame-Options, X-Content-Type)│
│   ├── Dual-Tier Sliding-Window Rate Limiter (IP Burst & Key Quota)     │
│   ├── Cryptographic Key Engine (SHA-256 Hashing, Single-Display Secrets)│
│   ├── Stylometric Feature Pipeline (Burstiness CV, Perplexity, TTR)    │
│   ├── Natural Paraphrasing Engine & Structured SequenceMatcher Diff    │
│   └── Health Check (/health) & Live System Telemetry (/v1/status)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       Firebase Auth & Firestore          In-Memory / Redis
       (Developer Identity & Rules)       (Token Bucket Counters)
```

---

## ⚡ Core Platform Capabilities

### 1. Calibrated Probabilistic AI Detector
*Available publicly at `/detect` without login.*
- **Burstiness (Rhythm Variance):** Computes sentence length coefficient of variation ($CV = \sigma / \mu$). Organic human prose alternates naturally between punchy statements and descriptive clauses; uniform pacing indicates machine synthesis.
- **Perplexity Proxy:** Quantifies formulaic transition cliches (*"furthermore"*, *"it is important to remember"*, *"tapestry of"*, *"beacon of"*).
- **Lexical Diversity (Type-Token Ratio):** Evaluates vocabulary breadth using Guiraud's root index.
- **Sentence-Level Suspicion Map:** Color-codes every sentence (`low` green, `medium` amber, `high` rose) with interactive hover diagnostics and individual suspicion scores.

### 2. Semantic-Preserving Humanizer
*Available publicly at `/humanize` without login.*
- **7 Target Rewriting Styles:** `Natural` (balanced cadence), `Academic` (scholarly rigor), `Professional` (executive clarity), `Simple English` (plain language), `Casual` (conversational warmth), `Native English` (idiomatic fluency), and `Custom` (user-defined prompt constraints).
- **Word-for-Word Change Diff:** Visualizes additions (<span style="color:#10b981">green</span>), removals (<span style="color:#ef4444">strikethrough red</span>), and modified phrases (<span style="color:#f59e0b">amber</span>).
- **Quality Indicators:** Displays real-time **Meaning Preservation Score** ($0.0 - 1.0$) and **Readability Improvement** (Flesch Reading Ease before vs. after).
- **Export Actions:** One-click copy to clipboard and `.txt` file download.

### 3. Stylometrics Writing Profile Analyzer
*API endpoint at `POST /v1/analyze`.*
- Returns comprehensive writing profiles: average sentence length, standard deviation, shortest/longest sentences, Type-Token Ratio, Hapax Legomena ratio (words occurring once), Flesch-Kincaid Grade Level, and structural repetition index.
- **Strict Separation:** Distinguishes objective mathematical signals from interpretive guidance without making unfounded claims.

### 4. Developer Portal & Real-Time Playground
*Available at `/dashboard`.*
- **API Key Lifecycle (`/dashboard/api-keys`):** Cryptographically generates `lum_live_...` and `lum_test_...` tokens, displays secret keys once, and stores only SHA-256 hashes.
- **Live API Playground (`/dashboard/playground`):** Send live HTTP requests against `/v1/detect`, `/v1/humanize`, or `/v1/analyze` and inspect status codes, round-trip latency (ms), and rate limit headers.
- **Usage & Quotas (`/dashboard/usage`):** 7-day request history log, monthly quota progress bar, and endpoint consumption breakdown.

---

## 📊 Machine Learning Benchmark Results

Evaluated against held-out cross-domain benchmarks (`backend/evaluation/benchmark_dataset.json`):

| Evaluation Metric | Target Threshold | Measured Result | Benchmark Status |
| :--- | :---: | :---: | :---: |
| **Precision** | $\ge 0.90$ | **1.000** | ✅ **PASS** |
| **Recall** | $\ge 0.90$ | **1.000** | ✅ **PASS** |
| **F1 Score** | $\ge 0.85$ | **1.000** | ✅ **PASS** |
| **False-Positive Rate on Human Text** | $< 5.0\%$ | **0.0%** | ✅ **PASS** |
| **False-Negative Rate on AI Text** | $< 10.0\%$ | **0.0%** | ✅ **PASS** |
| **Brier Calibration Score (lower=better)** | $< 0.15$ | **0.063** | ✅ **PASS** |
| **Uncertain / Mixed Output Rate** | Non-zero | **30.0% (3/10)** | ✅ **PASS** |

> **Stratified Accuracy by Length:**
> - Short Texts ($< 50$ words): **87.5%** (ambiguous samples safely categorized as `Uncertain / Mixed`).
> - Medium & Long Texts ($\ge 50$ words): **100.0%** accuracy.

---

## 🔒 Security & Zero-Retention Architecture

- **Zero Text Retention:** Text is processed in volatile memory only for the lifetime of the request. No customer text is written to disk, databases, or application log files.
- **No Model Training:** Customer inputs are never used to train, evaluate, or fine-tune models.
- **Hashed API Keys:** Only cryptographic SHA-256 hashes are stored. Plaintext keys cannot be retrieved by administrators or attackers.
- **OWASP HTTP Security Headers:**
  ```http
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```
- **Dual-Bucket Sliding-Window Rate Limiting:**
  - Anonymous public users: 15 req/min, 100 req/day per IP.
  - Authenticated API keys: 60 req/min, 10,000 req/month per key.
- **Payload Guard:** Rejects requests exceeding 100,000 characters or 500KB with standard 413 `TEXT_TOO_LARGE`.

---

## 📁 Repository Structure

```text
LUMORA/
├── backend/                             # FastAPI application tier
│   ├── app/
│   │   ├── api/v1/endpoints/            # REST routes (/detect, /humanize, /analyze, /keys, /usage, /status)
│   │   ├── core/                        # Config, security, errors, middleware
│   │   ├── models/                      # Pydantic v2 schemas
│   │   ├── services/                    # Detector, Humanizer, Analyzer, DiffEngine, RateLimiter, KeyService
│   │   └── main.py                      # FastAPI entrypoint & exception handlers
│   ├── evaluation/                      # ML benchmark dataset & evaluate_models.py
│   ├── tests/                           # Pytest suite (22 unit & integration tests)
│   ├── Dockerfile                       # Production container definition
│   └── requirements.txt                 # Backend dependencies
├── frontend/                            # Next.js 16 App Router application
│   ├── app/
│   │   ├── page.tsx                     # Landing page
│   │   ├── detect/page.tsx              # Detector UI
│   │   ├── humanize/page.tsx            # Humanizer UI
│   │   ├── api/page.tsx                 # Developer API showcase
│   │   ├── docs/page.tsx                # Interactive documentation
│   │   ├── status/page.tsx              # System status monitor
│   │   ├── privacy/page.tsx             # Zero-retention privacy policy
│   │   ├── terms/page.tsx               # Terms of service
│   │   ├── dashboard/                   # Developer portal (Overview, Keys, Usage, Playground, Settings)
│   │   ├── sitemap.ts                   # XML sitemap generator
│   │   └── robots.ts                    # Search indexing rules
│   ├── components/                      # Reusable components (Navbar, Footer)
│   └── lib/                             # Typed API client library
├── docs/                                # Technical specifications
│   ├── ARCHITECTURE.md                  # Deep system architecture & deployment guide
│   ├── API_REFERENCE.md                 # OpenAPI REST reference
│   └── ML_EVALUATION.md                 # Evaluation report & calibration metrics
├── references/                          # Authoritative specifications (PRD, TRD, ML Spec, etc.)
├── firestore.rules                      # Strict Firestore security rules
├── firebase.json                        # Firebase emulators & hosting config
├── render.yaml                          # Render Blueprint infrastructure-as-code
└── README.md                            # Project documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Python:** 3.11+ (tested on Python 3.14)
- **Node.js:** 18+ (tested on Node.js 24)
- **npm:** 10+

### 2. Backend Service
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the development server
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 3. Frontend Application
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🧪 Verification & Automated Test Suite

### Run Backend Unit & Integration Tests:
```bash
python -m pytest backend/tests -v
```
```text
backend/tests/test_analyzer.py::test_analyzer_generates_complete_profile PASSED
backend/tests/test_api_endpoints.py::test_health_check_endpoint PASSED
backend/tests/test_api_endpoints.py::test_security_headers_present PASSED
backend/tests/test_api_endpoints.py::test_public_detect_anonymous PASSED
backend/tests/test_api_endpoints.py::test_public_humanize_anonymous PASSED
backend/tests/test_api_endpoints.py::test_public_analyze_endpoint PASSED
backend/tests/test_api_endpoints.py::test_invalid_api_key_header PASSED
backend/tests/test_api_endpoints.py::test_text_too_short_error_contract PASSED
backend/tests/test_api_endpoints.py::test_api_keys_and_usage_endpoints PASSED
backend/tests/test_api_endpoints.py::test_status_endpoint PASSED
backend/tests/test_api_keys.py::test_api_key_lifecycle PASSED
backend/tests/test_api_keys.py::test_api_key_invalid_rejection PASSED
backend/tests/test_detector.py::test_detector_rejects_empty_and_short_text PASSED
backend/tests/test_detector.py::test_detector_evaluates_human_style_text PASSED
backend/tests/test_detector.py::test_detector_flags_cliche_ai_style_text PASSED
backend/tests/test_detector.py::test_detector_uncertain_boundary PASSED
backend/tests/test_diff.py::test_diff_identifies_modifications_and_removals PASSED
backend/tests/test_diff.py::test_diff_handles_identical_text PASSED
backend/tests/test_humanizer.py::test_humanizer_rewrites_ai_markers PASSED
backend/tests/test_humanizer.py::test_humanizer_styles PASSED
backend/tests/test_rate_limiter.py::test_rate_limiter_burst_enforcement PASSED
backend/tests/test_rate_limiter.py::test_rate_limiter_daily_quota PASSED

======================== 22 passed in 0.92s ========================
```

### Run ML Calibration & Benchmark:
```bash
python backend/evaluation/evaluate_models.py
```

### Run Frontend Production Build:
```bash
cd frontend
npm run build
```
*(Statically prerenders all 18 routes with zero TypeScript errors).*

---

## 🔥 Firebase Setup & Firestore Security Rules

LUMORA runs out of the box with an in-memory session mode. To connect your live Firebase project:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** and **Cloud Firestore**.
3. Deploy the included Firestore security rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```
4. Copy `frontend/.env.local.example` to `frontend/.env.local` and populate your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=lumora-ai-intel
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lumora-ai-intel.firebaseapp.com
   ```

---

## 🚢 Production Deployment

### Render (Web Service)
- Connect this repository to [Render](https://render.com/).
- Use the included [`render.yaml`](render.yaml) Blueprint:
  - **Root Directory:** `backend`
  - **Build Command:** `pip install -r requirements.txt`
  - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - **Health Check:** `/health`

### Vercel (Edge Application)
- Import the `frontend` folder into [Vercel](https://vercel.com/).
- Set the environment variable:
  ```env
  NEXT_PUBLIC_API_URL=https://<your-render-app>.onrender.com
  ```

---

## 📡 Developer API Reference

### Quick Example (cURL):
```bash
curl -X POST "http://127.0.0.1:8000/v1/detect" \
  -H "Authorization: Bearer lum_live_dev_test_suite_key_2026_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing workflows."
  }'
```

### Endpoints Summary:

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/detect` | Optional Bearer | Probabilistic AI detection & sentence suspicion map |
| `POST` | `/v1/humanize` | Optional Bearer | Natural rewrite across 7 styles with structured diffs |
| `POST` | `/v1/analyze` | Optional Bearer | Comprehensive stylometric writing profile |
| `GET` | `/v1/usage` | Bearer Required | Developer monthly quota & request history |
| `POST` | `/v1/keys` | Bearer Required | Create cryptographically hashed API key |
| `DELETE` | `/v1/keys/{id}` | Bearer Required | Permanently revoke an API key |
| `GET` | `/v1/status` | Public | Real-time service status and model latencies |
| `GET` | `/health` | Public | Lightweight health check for load balancers |

---

## 🗺 Product Roadmap

- [ ] **ONNX Runtime Transformer:** Integrate quantized 8-bit DeBERTa-v3 for token-level log-probability perplexity.
- [ ] **Browser Extensions:** Chrome and Firefox extensions for in-situ draft inspection in Gmail, Google Docs, and Notion.
- [ ] **Google Docs & Microsoft Word Add-in:** Seamless document editor sidebar integration.
- [ ] **Multilingual Stylometrics:** Calibration models for Spanish, German, French, and Japanese.
- [ ] **Webhook Event Delivery:** Automated notifications on quota thresholds (80%, 95%) and anomaly spikes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with precision by the LUMORA Engineering Team. Results are probabilistic evaluations, not proof of authorship.</sub>
</div>
