"use client";

import Link from "next/link";
import { BookOpen, Terminal, Shield, AlertTriangle, Layers, ExternalLink, Key, Cpu } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">Getting Started</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#overview" className="text-zinc-400 hover:text-white transition-colors">Overview</a></li>
                <li><a href="#authentication" className="text-zinc-400 hover:text-white transition-colors">Authentication</a></li>
                <li><a href="#rate-limits" className="text-zinc-400 hover:text-white transition-colors">Rate Limits & Headers</a></li>
                <li><a href="#errors" className="text-zinc-400 hover:text-white transition-colors">Stable Error Codes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">API Reference</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#post-detect" className="text-zinc-400 hover:text-white transition-colors font-mono text-xs">POST /v1/detect</a></li>
                <li><a href="#post-humanize" className="text-zinc-400 hover:text-white transition-colors font-mono text-xs">POST /v1/humanize</a></li>
                <li><a href="#post-analyze" className="text-zinc-400 hover:text-white transition-colors font-mono text-xs">POST /v1/analyze</a></li>
                <li><a href="#get-usage" className="text-zinc-400 hover:text-white transition-colors font-mono text-xs">GET /v1/usage</a></li>
                <li><a href="#keys-lifecycle" className="text-zinc-400 hover:text-white transition-colors font-mono text-xs">/v1/keys Lifecycle</a></li>
                <li><a href="#get-status" className="text-zinc-400 hover:text-white transition-colors font-mono text-xs">GET /v1/status</a></li>
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Link
                href="/dashboard/playground"
                className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-medium flex items-center justify-between transition-colors"
              >
                <span>Live Playground</span>
                <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-16 max-w-4xl">
          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <h1 className="text-3xl font-bold text-white mb-4">LUMORA API Documentation</h1>
            <p className="text-zinc-400 text-base leading-relaxed mb-6">
              The LUMORA API provides high-throughput probabilistic text classification, stylistic humanization, and stylometric writing analysis. The service communicates uncertainty bounds and operates under a strict privacy policy with transient in-memory processing.
            </p>
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-800/40 text-violet-200 text-xs leading-relaxed flex items-center gap-3">
              <Shield className="w-5 h-5 shrink-0 text-violet-400" />
              <span>
                <strong>Base URL:</strong> <code className="font-mono bg-zinc-900 px-2 py-0.5 rounded text-white">https://api.lumora.ai</code> or local development <code className="font-mono bg-zinc-900 px-2 py-0.5 rounded text-white">http://127.0.0.1:8000</code>
              </span>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-24 border-t border-zinc-900 pt-10">
            <h2 className="text-2xl font-bold text-white mb-3">Authentication</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              All authenticated API requests must include your API key in the <code className="text-zinc-200 font-mono">Authorization</code> HTTP header using the Bearer scheme:
            </p>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 mb-4">
              Authorization: Bearer lum_live_a1b2c3d4e5f6...
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              API keys are prefixed with <code className="text-violet-400 font-mono">lum_live_</code> or <code className="text-violet-400 font-mono">lum_test_</code> and stored hashed using SHA-256 on our servers. You can create and revoke keys in the <Link href="/dashboard/api-keys" className="text-violet-400 hover:underline">Developer Dashboard</Link>.
            </p>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="scroll-mt-24 border-t border-zinc-900 pt-10">
            <h2 className="text-2xl font-bold text-white mb-3">Rate Limits & Headers</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Every request response includes standard rate limit headers indicating your remaining quota for the active sliding window:
            </p>
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40 text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 font-mono text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Header</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-sans text-zinc-300">
                  <tr>
                    <td className="p-3 font-mono text-violet-400">X-RateLimit-Limit</td>
                    <td className="p-3">Maximum allowed requests per minute (e.g. 60 for keys, 15 for anonymous).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-violet-400">X-RateLimit-Remaining</td>
                    <td className="p-3">Remaining requests permitted in current window.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-violet-400">X-RateLimit-Reset</td>
                    <td className="p-3">Seconds until rate limit window resets.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-violet-400">Retry-After</td>
                    <td className="p-3">Returned with 429 status code indicating wait duration.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Stable Errors */}
          <section id="errors" className="scroll-mt-24 border-t border-zinc-900 pt-10">
            <h2 className="text-2xl font-bold text-white mb-3">Stable Error Codes</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Errors follow a uniform JSON schema containing stable machine-readable codes and unique request IDs:
            </p>
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/40 text-xs mb-4">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 font-mono text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Error Code</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-sans text-zinc-300">
                  <tr>
                    <td className="p-3 font-mono text-amber-400">400</td>
                    <td className="p-3 font-mono text-white">INVALID_REQUEST</td>
                    <td className="p-3">Malformed JSON or failed parameter validation.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-amber-400">400</td>
                    <td className="p-3 font-mono text-white">TEXT_TOO_SHORT</td>
                    <td className="p-3">Text contains less than the required minimum of 15 words.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-amber-400">413</td>
                    <td className="p-3 font-mono text-white">TEXT_TOO_LARGE</td>
                    <td className="p-3">Payload exceeds maximum character or byte limits (100,000 chars / 500KB).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-rose-400">401</td>
                    <td className="p-3 font-mono text-white">INVALID_API_KEY</td>
                    <td className="p-3">API key is missing, invalid, or has been revoked.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-amber-400">429</td>
                    <td className="p-3 font-mono text-white">RATE_LIMITED</td>
                    <td className="p-3">Per-minute burst rate limit exceeded. Check Retry-After header.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-amber-400">429</td>
                    <td className="p-3 font-mono text-white">QUOTA_EXCEEDED</td>
                    <td className="p-3">Monthly or daily request quota consumed.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-rose-400">503</td>
                    <td className="p-3 font-mono text-white">MODEL_UNAVAILABLE</td>
                    <td className="p-3">Inference pipeline undergoing maintenance or temporary scaling.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* POST /v1/detect */}
          <section id="post-detect" className="scroll-mt-24 border-t border-zinc-900 pt-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded bg-violet-950/80 border border-violet-800/40 text-violet-300 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="text-xl font-bold text-white font-mono">/v1/detect</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Performs statistical stylometric detection on text. Returns calibrated AI probability, confidence score, and sentence-level suspicion analysis.
            </p>
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase text-zinc-400">Request Body</h4>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
                {`{\n  "text": "Furthermore, it is important to remember that artificial intelligence plays a crucial role..."\n}`}
              </div>

              <h4 className="text-xs font-mono uppercase text-zinc-400">Response (200 OK)</h4>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
{`{
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
  "sentence_analysis": [ ... ],
  "evaluation_summary": "The text displays structural patterns and rhythmic regularities...",
  "model_version": "lumora-ensemble-v1.0.4",
  "timestamp": "2026-09-26T12:00:00Z"
}`}
              </div>
            </div>
          </section>

          {/* POST /v1/humanize */}
          <section id="post-humanize" className="scroll-mt-24 border-t border-zinc-900 pt-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="text-xl font-bold text-white font-mono">/v1/humanize</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Transforms repetitive AI markers into natural prose while preserving core semantic entities and returning structured diff spans.
            </p>
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase text-zinc-400">Request Body</h4>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
                {`{\n  "text": "Furthermore, it is important to remember...",\n  "style": "natural",\n  "custom_instructions": null\n}`}
              </div>

              <h4 className="text-xs font-mono uppercase text-zinc-400">Supported Styles</h4>
              <p className="text-zinc-400 text-xs">
                <code className="text-zinc-200 font-mono">natural</code>, <code className="text-zinc-200 font-mono">academic</code>, <code className="text-zinc-200 font-mono">professional</code>, <code className="text-zinc-200 font-mono">simple</code>, <code className="text-zinc-200 font-mono">casual</code>, <code className="text-zinc-200 font-mono">native_english</code>, <code className="text-zinc-200 font-mono">custom</code>
              </p>
            </div>
          </section>

          {/* POST /v1/analyze */}
          <section id="post-analyze" className="scroll-mt-24 border-t border-zinc-900 pt-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-800/40 text-indigo-300 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="text-xl font-bold text-white font-mono">/v1/analyze</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Returns a deep stylometric profile (sentence variance, TTR, hapax legomena, readability) with strict separation of objective signals from conclusions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
