# MASTER PRODUCT SPECIFICATION — AI Text Intelligence Platform

## Vision
A secure, fast platform for probabilistic AI-writing analysis and natural rewriting.

## Architecture
- `frontend/`: Next.js + TypeScript, public UI, SEO, developer dashboard.
- `backend/`: FastAPI on Render, security, rate limits, ML orchestration and provider adapters.
- Firebase Auth + Firestore: developer identity and metadata.
- Redis-compatible store: short-window rate limiting.
- ML: Python/PyTorch/Transformers/scikit-learn.
- All privileged credentials remain backend-only.

## Core Products
1. Detector — probability, confidence, evidence and uncertainty.
2. Humanizer — natural rewrite with visible changes.
3. Developer API — unique keys, quotas and rate limits.
4. Dashboard — keys, usage, playground and settings.

## Security
Strict CORS, HTTPS, security headers, request validation, body/time limits, hashed API keys, IP/user/key rate limits, least privilege, minimal logs and no frontend access to provider secrets.

## ML
Use diverse human/AI/edited-AI/paraphrased data. Split by source/model/topic where possible. Measure precision, recall, F1, false-positive rate, false-negative rate and calibration. Never claim authorship certainty.

## Humanizer
Semantic analysis → rewrite → grammar/readability check → meaning check → diff generation.

## UX
White/black base with restrained violet accent, responsive layout, accessible interactions and minimal technical jargon.

## SEO
Unique metadata, canonical URLs, sitemap, robots, Open Graph, structured data where appropriate, semantic HTML and Core Web Vitals.

## MVP Definition of Done
Public detector and humanizer work without login; changes are highlighted; API keys are secure; rate limits and quotas work; developer dashboard works; SEO/security foundations exist; ML evaluation is measurable; documentation matches implementation.
