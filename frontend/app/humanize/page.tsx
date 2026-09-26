"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Download, RefreshCw, AlertCircle, Eye, Columns, ArrowRight, ShieldCheck, BookOpen } from "lucide-react";
import { humanizeText, HumanizeResponse } from "@/lib/api";

const STYLES = [
  { id: "natural", label: "Natural", desc: "Balanced cadence & rhythm" },
  { id: "academic", label: "Academic", desc: "Rigorous scholarly tone" },
  { id: "professional", label: "Professional", desc: "Executive business clarity" },
  { id: "simple", label: "Simple English", desc: "Clear, accessible prose" },
  { id: "casual", label: "Casual", desc: "Conversational & warm" },
  { id: "native_english", label: "Native English", desc: "Idiomatic natural fluency" },
  { id: "custom", label: "Custom", desc: "User-defined style guidelines" }
];

const DEFAULT_SAMPLE =
  "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing workflows. " +
  "By navigating the complexities of technological evolution, organizations can seamlessly harness the power of scalable innovation. " +
  "Moreover, this multifaceted paradigm stands as a testament to the ever-expanding tapestry of digital progress and human-machine collaboration. " +
  "In conclusion, adopting these automated strategies will foster unparalleled operational efficiency.";

export default function HumanizePage() {
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [style, setStyle] = useState("natural");
  const [customInstructions, setCustomInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"clean" | "diff" | "side_by_side">("diff");
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleHumanize = async () => {
    if (wordCount < 15) {
      setError("Please input at least 15 words to rewrite.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await humanizeText(text, style, customInstructions);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "An error occurred while rewriting.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.rewritten_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.rewritten_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumora-rewrite-${style}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Semantic-Preserving Rewriter • Visible Change Diff</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Natural Text Humanizer
        </h1>
        <p className="mt-3 text-zinc-400 text-sm sm:text-base">
          Eliminate robotic machine clichés, inject natural rhythm, and see precisely what changed.
        </p>
      </div>

      {/* Style Selector */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
          Select Rewriting Style
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {STYLES.map((s) => {
            const isSelected = style === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-violet-600/15 border-violet-500/50 text-white shadow-lg shadow-violet-600/10"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <div className="text-xs font-semibold">{s.label}</div>
                <div className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{s.desc}</div>
              </button>
            );
          })}
        </div>

        {style === "custom" && (
          <div className="mt-3">
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Keep a warm conversational voice and use short, punchy paragraphs..."
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 font-mono">
              Original Text
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setText(DEFAULT_SAMPLE)}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Reset Sample
              </button>
              {text && (
                <button
                  onClick={() => {
                    setText("");
                    setResult(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Paste text to humanize naturally..."
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y leading-relaxed font-sans"
          />

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500 font-mono">
              Words: <strong className={wordCount < 15 ? "text-amber-400" : "text-zinc-300"}>{wordCount}</strong>
            </span>
            <button
              onClick={handleHumanize}
              disabled={loading || wordCount < 15}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-violet-600/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rewriting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Humanize Draft</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output Card */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 font-mono">
              Humanized Output
            </span>

            {/* View Mode Switcher */}
            {result && (
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setViewMode("diff")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === "diff" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Diff Changes
                </button>
                <button
                  onClick={() => setViewMode("clean")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === "clean" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Final Text
                </button>
                <button
                  onClick={() => setViewMode("side_by_side")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === "side_by_side" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            )}
          </div>

          {result ? (
            <>
              {/* Quality & Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                <div>
                  <div className="text-zinc-400 text-[10px] font-mono">Meaning Preservation</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {Math.round(result.meaning_preservation_score * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[10px] font-mono">Readability (Flesch)</div>
                  <div className="text-base font-bold font-mono text-zinc-200 mt-0.5">
                    {result.readability_after}{" "}
                    <span className="text-[10px] text-zinc-500 font-normal">
                      (from {result.readability_before})
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[10px] font-mono">Words Modified</div>
                  <div className="text-base font-bold font-mono text-violet-400 mt-0.5">
                    {result.stats.words_modified + result.stats.words_removed + result.stats.words_added}
                  </div>
                </div>
              </div>

              {/* Display Area */}
              <div className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 text-zinc-200 text-sm leading-relaxed min-h-[260px] max-h-[380px] overflow-y-auto">
                {viewMode === "clean" && (
                  <p className="whitespace-pre-wrap">{result.rewritten_text}</p>
                )}

                {viewMode === "diff" && (
                  <div className="whitespace-pre-wrap leading-loose">
                    {result.changes_diff.map((span, idx) => {
                      if (span.type === "equal") {
                        return <span key={idx}>{span.original}</span>;
                      } else if (span.type === "removed") {
                        return (
                          <span key={idx} className="diff-removed mx-0.5">
                            {span.original}
                          </span>
                        );
                      } else if (span.type === "added") {
                        return (
                          <span key={idx} className="diff-added mx-0.5">
                            {span.revised}
                          </span>
                        );
                      } else {
                        return (
                          <span key={idx} className="diff-modified mx-0.5" title={`Original: "${span.original}"`}>
                            {span.revised}
                          </span>
                        );
                      }
                    })}
                  </div>
                )}

                {viewMode === "side_by_side" && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-850">
                      <div className="font-mono text-zinc-500 mb-2 uppercase text-[10px]">Original</div>
                      <p>{result.original_text}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-850">
                      <div className="font-mono text-violet-400 mb-2 uppercase text-[10px]">Rewritten ({result.style})</div>
                      <p>{result.rewritten_text}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Rewrite"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <button
                  onClick={handleHumanize}
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[350px] rounded-xl bg-zinc-950/30 border border-zinc-800/40 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-1">Ready to Rewrite</h3>
              <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">
                Click &quot;Humanize Draft&quot; to transform the text and inspect word-for-word modifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
