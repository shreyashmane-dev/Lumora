<div align="center">

# LUMORA
### *Understand the text. Rewrite it naturally.*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Render-Deploy_Ready-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

<p align="center">
  A high-throughput writing-intelligence platform providing <strong>calibrated probabilistic AI-text detection</strong> and <strong>natural semantic-preserving rewriting</strong> with visible word-for-word change tracking.
</p>

[Explore Web App](http://localhost:3000) • [API Documentation](http://localhost:3000/docs) • [Architecture Guide](docs/ARCHITECTURE.md) • [ML Evaluation](docs/ML_EVALUATION.md)

</div>

---

## 📑 Table of Contents

- [Vision & Philosophy](#-vision--philosophy)
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
  - [1. Probabilistic AI Detector](#1-probabilistic-ai-detector)
  - [2. Natural Text Humanizer](#2-natural-text-humanizer)
  - [3. Stylometrics Analyzer](#3-stylometrics-analyzer)
  - [4. Developer Portal & Playground](#4-developer-portal--playground)
- [Machine Learning Benchmark Results](#-machine-learning-benchmark-results)
- [Security, Privacy & Zero-Retention](#-security-privacy--zero-retention)
- [Quick Start (Local Execution)](#-quick-start-local-execution)
- [Firebase Configuration](#-firebase-configuration)
- [Deploying to Production (Render & Vercel)](#-deploying-to-production)
- [Roadmap & Enhancements](#-roadmap--enhancements)

---

## 🔮 Vision & Philosophy

Conventional AI detection tools make misleading claims of 100% accuracy, frequently generating devastating false positives for non-native English speakers, technical writers, and students.

**LUMORA operates on four core principles:**
1. **Uncertainty is a valid and transparent result:** Ambiguous or concise drafts are explicitly classified as `Uncertain / Mixed` rather than guessing.
2. **Never claim authorship proof:** Detection scores are strictly calibrated statistical probabilities based on stylometric signals.
3. **Meaning preservation before style:** The rewriting engine strictly retains all proper nouns, entities, dates, and core proposition logic.
4. **Transient processing by default:** Customer text is analyzed in volatile memory and discarded immediately upon response completion.

---

## 🏗 System Architecture

LUMORA is strictly decoupled into two independently deployable tiers:

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

## ⚡ Core Features

### 1. Probabilistic AI Detector
- **Stylometric Signal Ensemble:**
  - **Burstiness (Rhythm Variance):** Computes sentence length coefficient of variation ($CV$). AI text has uniform cadence; human writing fluctuates naturally.
  - **Perplexity Proxy:** Quantifies formulaic transition cliches (*"furthermore"*, *"it is important to remember"*, *"tapestry"*).
  - **Lexical Diversity (TTR):** Type-Token Ratio and Guiraud's root index.
  - **Repetition Index:** Anaphora frequency and recurring n-grams.
- **Sentence-Level Suspicion Map:** Highlights individual sentences by suspicion level (`low`, `medium`, `high`) with hover diagnostics.

### 2. Natural Text Humanizer
- **7 Target Rewriting Styles:** `Natural`, `Academic`, `Professional`, `Simple English`, `Casual`, `Native English`, and `Custom`.
- **Word-for-Word Change Diff:** Visualizes additions (<span style="color:#10b981">green</span>), removals (<span style="color:#ef4444">strikethrough red</span>), and modified phrases (<span style="color:#f59e0b">amber</span>).
- **Automated Quality Metrics:** Computes Semantic Preservation Score ($0.0 - 1.0$) and Flesch Reading Ease improvement before vs. after.

### 3. Stylometrics Analyzer
- Deep writing profile endpoint (`POST /v1/analyze`) separating objective mathematical measurements from interpretive guidance without making unfounded conclusions.

### 4. Developer Portal & Playground
- **API Key Lifecycle:** Generate random tokens (`lum_live_...`), view secrets once, and store only SHA-256 hashes.
- **Real-Time Playground:** Send live requests against `/v1/detect`, `/v1/humanize`, or `/v1/analyze` and inspect status codes, round-trip latency (ms), and rate limit headers.
- **Usage Tracking:** 7-day request history chart and monthly quota consumption.

---

## 📊 Machine Learning Benchmark Results

Evaluated against held-out cross-domain benchmarks (`backend/evaluation/benchmark_dataset.json`):

| Metric | Target | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Precision** | $\ge 0.90$ | **1.000** | ✅ PASS |
| **Recall** | $\ge 0.90$ | **1.000** | ✅ PASS |
| **F1 Score** | $\ge 0.85$ | **1.000** | ✅ PASS |
| **False-Positive Rate on Human Text** | $< 5.0\%$ | **0.0%** | ✅ PASS |
| **False-Negative Rate on AI Text** | $< 10.0\%$ | **0.0%** | ✅ PASS |
| **Brier Calibration Score** | $< 0.15$ | **0.063** | ✅ PASS |
| **Uncertain / Mixed Output Rate** | Non-zero | **30%** | ✅ PASS |

---

## 🔒 Security, Privacy & Zero-Retention

- **Zero Text Retention:** Text is never stored on disk, in databases, or in server logs.
- **No Model Training:** Customer inputs are never used to train or fine-tune models.
- **OWASP HTTP Security Headers:** Strict HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Dual-Bucket Rate Limiting:**
  - Anonymous public users: 15 req/min, 100 req/day per IP.
  - Authenticated API keys: 60 req/min, 10,000 req/month.
- **Request Size Guard:** Rejects oversized payloads exceeding 100,000 characters / 500KB with standard 413 `TEXT_TOO_LARGE`.

---

## 🚀 Quick Start (Local Execution)

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Start the Backend API:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API root: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 3. Start the Next.js Frontend:
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

### 4. Run Test Suites & Verification:
```bash
# Run backend test suite (22 tests)
python -m pytest backend/tests -v

# Run ML calibration benchmark
python backend/evaluation/evaluate_models.py

# Verify frontend production build
cd frontend && npm run build
```

---

## 🛠 Firebase Configuration

LUMORA comes with out-of-the-box local session fallback, allowing immediate testing without cloud setup. To connect your live Firebase project:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password or Google Provider) and **Cloud Firestore**.
3. Deploy the included Firestore security rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```
4. Copy `frontend/.env.local.example` to `frontend/.env.local` and populate your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   ```

---

## 🚢 Deploying to Production

### Render (Backend):
- Push to GitHub.
- Connect your repository to [Render](https://render.com/) using the included [`render.yaml`](render.yaml) Blueprint.
- Set `ENVIRONMENT=production` and generate a `SECRET_KEY`.

### Vercel (Frontend):
- Import the `frontend` folder into [Vercel](https://vercel.com/).
- Set `NEXT_PUBLIC_API_URL` to your live Render backend URL.

---

## 📈 Roadmap & Enhancements

- [ ] **Small Local Transformer Layer:** ONNX-accelerated DeBERTa-v3 token classifier for sub-sentence perplexity.
- [ ] **Browser Extensions:** Chrome and Firefox extensions for one-click in-situ draft inspection.
- [ ] **Google Docs & Microsoft Word Add-in:** Seamless document editor sidebar integration.
- [ ] **Multilingual Support:** Calibrated stylometric models for Spanish, German, French, and Japanese.
- [ ] **Webhook Event Delivery:** Automated notifications when monthly quota thresholds are reached.

---

<div align="center">
  <sub>Built with precision by the LUMORA Engineering Team. Results are probabilistic evaluations, not proof of authorship.</sub>
</div>
