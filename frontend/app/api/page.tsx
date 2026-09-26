"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Key, Shield, Zap, ArrowRight, Copy, Check, BookOpen, Cpu } from "lucide-react";

export default function ApiPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "python">("curl");
  const [copied, setCopied] = useState(false);

  const snippets = {
    curl: `curl -X POST "https://api.lumora.ai/v1/detect" \\
  -H "Authorization: Bearer lum_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing."
  }'`,
    node: `import fetch from 'node-fetch';

const response = await fetch('https://api.lumora.ai/v1/detect', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer lum_live_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing.'
  })
});

const data = await response.json();
console.log(data.classification, data.ai_probability);`,
    python: `import requests

url = "https://api.lumora.ai/v1/detect"
headers = {
    "Authorization": "Bearer lum_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "text": "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing."
}

res = requests.post(url, json=payload, headers=headers)
data = res.json()
print(f"Classification: {data['classification']}, Probability: {data['ai_probability']}")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono mb-4">
          <Terminal className="w-3.5 h-3.5 text-violet-400" />
          <span>Developer Platform • REST API v1</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Writing Intelligence API
        </h1>
        <p className="mt-4 text-zinc-400 text-base sm:text-lg leading-relaxed">
          Embed probabilistic AI-text analysis, natural rewriting, and deep stylometric writing profiles into your applications with a single API call.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard/api-keys"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
          >
            <Key className="w-4 h-4" />
            <span>Generate Free API Key</span>
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium text-sm transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Read API Reference</span>
          </Link>
          <Link
            href="/dashboard/playground"
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium text-sm transition-all flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Interactive Playground</span>
          </Link>
        </div>
      </div>

      {/* Code Showcase */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden mb-16 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("curl")}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                activeTab === "curl" ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveTab("node")}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                activeTab === "node" ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Node.js / TypeScript
            </button>
            <button
              onClick={() => setActiveTab("python")}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                activeTab === "python" ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Python
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors flex items-center gap-1.5"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="font-mono text-[11px]">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <pre className="p-5 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed bg-zinc-950/40">
          <code>{snippets[activeTab]}</code>
        </pre>
      </div>

      {/* Endpoint Table */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6">REST Endpoints</h2>
        <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-4">Method & Path</th>
                <th className="p-4">Auth</th>
                <th className="p-4">Description</th>
                <th className="p-4">Rate Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans text-zinc-300">
              <tr>
                <td className="p-4 font-mono font-medium text-violet-400">
                  <span className="px-2 py-0.5 rounded bg-violet-950/80 border border-violet-800/40 text-violet-300 mr-2">
                    POST
                  </span>
                  /v1/detect
                </td>
                <td className="p-4 text-zinc-400">Optional Bearer</td>
                <td className="p-4">Probabilistic AI-detection with confidence & sentence breakdown.</td>
                <td className="p-4 font-mono text-xs text-zinc-400">60/min (key), 15/min (anon)</td>
              </tr>
              <tr>
                <td className="p-4 font-mono font-medium text-emerald-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 mr-2">
                    POST
                  </span>
                  /v1/humanize
                </td>
                <td className="p-4 text-zinc-400">Optional Bearer</td>
                <td className="p-4">Semantic rewrite across 7 styles with structured span diffs.</td>
                <td className="p-4 font-mono text-xs text-zinc-400">60/min (key), 15/min (anon)</td>
              </tr>
              <tr>
                <td className="p-4 font-mono font-medium text-indigo-400">
                  <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/40 text-indigo-300 mr-2">
                    POST
                  </span>
                  /v1/analyze
                </td>
                <td className="p-4 text-zinc-400">Optional Bearer</td>
                <td className="p-4">Deep stylometric writing profile separating signals from conclusions.</td>
                <td className="p-4 font-mono text-xs text-zinc-400">60/min (key), 15/min (anon)</td>
              </tr>
              <tr>
                <td className="p-4 font-mono font-medium text-blue-400">
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/40 text-blue-300 mr-2">
                    GET
                  </span>
                  /v1/usage
                </td>
                <td className="p-4 text-zinc-300 font-medium">Bearer Required</td>
                <td className="p-4">Monthly quota consumption and endpoint distribution stats.</td>
                <td className="p-4 font-mono text-xs text-zinc-400">Standard Tier</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
