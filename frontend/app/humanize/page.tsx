"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Download, RefreshCw, AlertCircle, Eye, Columns, ArrowRight, ShieldCheck, BookOpen, Sliders, Briefcase, Feather, Newspaper, Coffee, Compass } from "lucide-react";
import { humanizeText, HumanizeResponse } from "@/lib/api";
import { DocumentUploadZone } from "@/components/DocumentUploadZone";

const STYLES = [
  { id: "natural", label: "Natural", icon: Compass, desc: "Balanced organic rhythm & cadence" },
  { id: "academic", label: "Academic", icon: BookOpen, desc: "Scholarly, authoritative, thesis-driven" },
  { id: "executive", label: "Executive", icon: Briefcase, desc: "Concise, strategic C-suite briefing" },
  { id: "creative", label: "Creative", icon: Feather, desc: "Expressive prose with dynamic burstiness" },
  { id: "journalistic", label: "Journalistic", icon: Newspaper, desc: "Direct, active voice & objective clarity" },
  { id: "casual", label: "Casual", icon: Coffee, desc: "Conversational, warm & friendly tone" }
];

const DEFAULT_SAMPLE =
  "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing workflows. " +
  "By navigating the complexities of technological evolution, organizations can seamlessly harness the power of scalable innovation. " +
  "Moreover, this multifaceted paradigm stands as a testament to the ever-expanding tapestry of digital progress and human-machine collaboration. " +
  "In conclusion, adopting these automated strategies will foster unparalleled operational efficiency.";

export default function HumanizePage() {
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [style, setStyle] = useState("natural");
  const [intensity, setIntensity] = useState<"subtle" | "balanced" | "deep">("balanced");
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
      const instructions = intensity === "deep"
        ? "Aggressively restructure sentences, vary clause lengths, and eliminate all template transitions."
        : intensity === "subtle"
        ? "Make minimal light adjustments only to obvious clichés while preserving original phrasing."
        : customInstructions;

      const res = await humanizeText(text, style, instructions);
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

  const handleFileLoaded = (extractedText: string) => {
    setText(extractedText);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-mono mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Semantic-Preserving Rewriter • Visible Change Diff</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Natural Text Humanizer
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Eliminate robotic machine clichés, inject natural rhythm cadence, and see precisely what changed.
        </p>
      </div>

      {/* Style Selector Grid */}
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 font-semibold">
          Select Target Tone
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STYLES.map((s) => {
            const Icon = s.icon;
            const isSelected = style === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-violet-600/15 border-violet-500 text-violet-900 dark:text-white shadow-sm ring-1 ring-violet-500"
                    : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-violet-500" : "text-zinc-400"}`} />
                  <span className="font-semibold text-xs text-zinc-900 dark:text-white">{s.label}</span>
                </div>
                <div className="text-[10px] text-zinc-500 line-clamp-1">{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rewriting Intensity Selector */}
      <div className="mb-8 flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs">
        <span className="font-mono uppercase text-zinc-500 font-semibold text-[11px] flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-violet-500" />
          <span>Intensity:</span>
        </span>
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
          {(["subtle", "balanced", "deep"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setIntensity(level)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                intensity === level
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {level} {level === "deep" ? "⚡" : ""}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-zinc-400">
          {intensity === "deep"
            ? "Aggressive sentence length variation & cadence injection"
            : intensity === "subtle"
            ? "Gentle polish of clichés without structural reordering"
            : "Balanced tone shifting with high meaning preservation"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <DocumentUploadZone onTextLoaded={handleFileLoaded} />

          <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                Original Text
              </span>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {wordCount.toLocaleString()} words
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste text to humanize (minimum 15 words)..."
              rows={12}
              className="w-full bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-sans text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <button
                onClick={() => setText("")}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                Clear
              </button>

              <button
                onClick={handleHumanize}
                disabled={loading || wordCount < 15}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-md shadow-violet-600/20 hover:shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Humanizing Cadence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Rewrite &amp; Humanize</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output & Visible Diff */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors h-full min-h-[460px]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                  Rewritten Output
                </span>
                {result && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
                    {Math.round(result.meaning_preservation_score * 100)}% Meaning Preserved
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setViewMode("diff")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      viewMode === "diff"
                        ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Inline Diff
                  </button>
                  <button
                    onClick={() => setViewMode("clean")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      viewMode === "clean"
                        ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Clean Text
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            {result ? (
              <div className="flex-1 flex flex-col justify-between gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 text-sm font-sans text-zinc-900 dark:text-zinc-100 overflow-y-auto max-h-[360px] leading-relaxed">
                  {viewMode === "diff" ? (
                    <div className="space-x-1">
                      {result.changes_diff.map((span, idx) => {
                        if (span.type === "equal") {
                          return <span key={idx}>{span.revised || span.original} </span>;
                        }
                        if (span.type === "added") {
                          return (
                            <span
                              key={idx}
                              className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1 py-0.5 rounded font-medium border border-emerald-300 dark:border-emerald-800/50"
                            >
                              {span.revised}{" "}
                            </span>
                          );
                        }
                        if (span.type === "removed") {
                          return (
                            <span
                              key={idx}
                              className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 line-through px-1 py-0.5 rounded border border-rose-300 dark:border-rose-800/50"
                            >
                              {span.original}{" "}
                            </span>
                          );
                        }
                        if (span.type === "modified") {
                          return (
                            <span key={idx} className="inline-flex items-center gap-1">
                              <span className="line-through text-rose-400 text-xs">{span.original}</span>
                              <span className="bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 px-1 py-0.5 rounded font-medium border border-violet-300 dark:border-violet-700/50">
                                {span.revised}
                              </span>{" "}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{result.rewritten_text}</div>
                  )}
                </div>

                {/* Diff Stats Banner */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 text-center text-xs font-mono">
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      +{result.stats.words_added}
                    </span>{" "}
                    <span className="text-zinc-500">added</span>
                  </div>
                  <div>
                    <span className="text-rose-500 font-bold">-{result.stats.words_removed}</span>{" "}
                    <span className="text-zinc-500">removed</span>
                  </div>
                  <div>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">
                      {Math.round(result.stats.similarity_percentage)}%
                    </span>{" "}
                    <span className="text-zinc-500">structural match</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Rewrite"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                  <Columns className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Ready to Humanize
                </h4>
                <p className="text-xs text-zinc-500 max-w-xs mt-1 leading-relaxed">
                  Select a target tone and click Rewrite to inject organic burstiness with visible before-and-after diff tracking.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
