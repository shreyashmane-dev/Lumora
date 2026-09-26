"use client";

import { useEffect, useState } from "react";
import { Terminal, Play, Copy, Check, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { listApiKeys, KeyItem } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const DEFAULT_PAYLOADS = {
  detect: JSON.stringify(
    {
      text: "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing workflows. Navigating these complexities serves as a testament to progress."
    },
    null,
    2
  ),
  humanize: JSON.stringify(
    {
      text: "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing workflows. Navigating these complexities serves as a testament to progress.",
      style: "natural"
    },
    null,
    2
  ),
  analyze: JSON.stringify(
    {
      text: "Good writing balances rhythm and clarity. Sometimes sentences are short and sharp. Other times they flow with deliberate descriptive weight."
    },
    null,
    2
  )
};

export default function PlaygroundPage() {
  const [endpoint, setEndpoint] = useState<"detect" | "humanize" | "analyze">("detect");
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("lum_live_dev_test_suite_key_2026_demo");
  const [customKey, setCustomKey] = useState<string>("");
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOADS.detect);
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    listApiKeys()
      .then((k) => setKeys(k.filter((key) => key.is_active)))
      .catch((e) => console.error(e));
  }, []);

  const handleEndpointChange = (ep: "detect" | "humanize" | "analyze") => {
    setEndpoint(ep);
    setPayloadText(DEFAULT_PAYLOADS[ep]);
    setResponseBody(null);
    setResponseStatus(null);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponseBody(null);
    setResponseStatus(null);
    setResponseTime(null);

    const activeApiKey = customKey.trim() || selectedKey;
    const url = `${API_BASE}/v1/${endpoint}`;
    const startTime = performance.now();

    try {
      let parsedBody;
      try {
        parsedBody = JSON.parse(payloadText);
      } catch (err) {
        alert("Payload must be valid JSON.");
        setLoading(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (activeApiKey) {
        headers["Authorization"] = `Bearer ${activeApiKey}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(parsedBody)
      });

      const duration = Math.round(performance.now() - startTime);
      setResponseTime(duration);
      setResponseStatus(res.status);

      // Collect headers
      const resHdrs: Record<string, string> = {};
      ["x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset", "x-request-id", "content-type"].forEach((h) => {
        const val = res.headers.get(h);
        if (val) resHdrs[h] = val;
      });
      setResponseHeaders(resHdrs);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (e: any) {
      setResponseBody(JSON.stringify({ error: e?.message || "Request failed" }, null, 2));
      setResponseStatus(500);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!responseBody) return;
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">API Playground</h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Test live HTTP requests against LUMORA REST endpoints with customized authentication and payloads.
        </p>
      </div>

      {/* Request Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Request Builder */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Request Configuration
            </span>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <button
                onClick={() => handleEndpointChange("detect")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  endpoint === "detect" ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                POST /v1/detect
              </button>
              <button
                onClick={() => handleEndpointChange("humanize")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  endpoint === "humanize" ? "bg-emerald-600 text-white font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                POST /v1/humanize
              </button>
              <button
                onClick={() => handleEndpointChange("analyze")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  endpoint === "analyze" ? "bg-indigo-600 text-white font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                POST /v1/analyze
              </button>
            </div>
          </div>

          {/* Authentication selection */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              API Key Authentication
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedKey}
                onChange={(e) => {
                  setSelectedKey(e.target.value);
                  setCustomKey("");
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 flex-1"
              >
                <option value="lum_live_dev_test_suite_key_2026_demo">Default Development Key</option>
                {keys.map((k) => (
                  <option key={k.id} value={k.prefix}>
                    {k.name} ({k.prefix})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or paste full raw key..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 flex-1"
              />
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              JSON Body
            </label>
            <textarea
              rows={11}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-lg shadow-violet-600/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Response Inspector */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Response
              </span>
              {responseStatus !== null && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {responseStatus} {responseStatus === 200 ? "OK" : "ERROR"}
                </span>
              )}
              {responseTime !== null && (
                <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {responseTime}ms
                </span>
              )}
            </div>

            {responseBody && (
              <button
                onClick={handleCopyResponse}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-mono">{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          {/* Response Headers if available */}
          {Object.keys(responseHeaders).length > 0 && (
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 text-[10px] font-mono space-y-1">
              {Object.entries(responseHeaders).map(([k, v]) => (
                <div key={k} className="flex justify-between text-zinc-400">
                  <span className="text-zinc-500">{k}:</span>
                  <span className="text-zinc-300 truncate max-w-[280px]">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Response Body Viewer */}
          <div className="flex-1 min-h-[300px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-auto font-mono text-xs text-zinc-200">
            {responseBody ? (
              <pre className="whitespace-pre-wrap">{responseBody}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center">
                <Terminal className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Click &quot;Send Request&quot; to inspect real response data and rate limit headers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
