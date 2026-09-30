"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Sparkles, Copy, Check, AlertCircle, RefreshCw, BarChart3, HelpCircle, Activity, Info, Award, FileText, Scale, Eye } from "lucide-react";
import { detectText, DetectResponse } from "@/lib/api";
import { StylometricRadar } from "@/components/StylometricRadar";
import { DocumentUploadZone } from "@/components/DocumentUploadZone";
import { ForensicReportModal } from "@/components/ForensicReportModal";
import { DualTextCompare } from "@/components/DualTextCompare";

const SAMPLES = {
  ai: "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing workflows. Navigating the complexities of technological evolution allows organizations to seamlessly harness the power of scalable innovation. Moreover, this multifaceted paradigm stands as a testament to the ever-expanding tapestry of digital progress and human-machine collaboration. In conclusion, adopting these automated strategies will foster unparalleled operational efficiency across diverse domains.",
  human: "I was sitting on my grandfather's front porch early this morning, listening to the rain rattle against the tin awning. The coffee had cooled down to a lukewarm sip, but I didn't care. Sometimes you just need thirty quiet minutes to watch the neighbor's stubborn beagle bark at passing delivery vans before the real day starts.",
  mixed: "Cloud computing remains fundamental for enterprise scaling. While companies frequently face architectural hurdles, agile teams help simplify migrations. We observed tangible latency improvements after establishing basic Redis caching."
};

export default function DetectPage() {
  const [activeTab, setActiveTab] = useState<"single" | "compare">("single");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const incoming = sessionStorage.getItem("lumora_detect_text");
      if (incoming) {
        setText(incoming);
        sessionStorage.removeItem("lumora_detect_text");
      }
    }
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleAnalyze = async () => {
    if (wordCount < 15) {
      setError("Please input at least 15 words for a calibrated statistical evaluation.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await detectText(text);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "An error occurred while evaluating the text.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileLoaded = (extractedText: string) => {
    setText(extractedText);
    setError(null);
  };

  const handleCopySummary = () => {
    if (!result) return;
    const summary = `LUMORA Detection Evaluation:\nClassification: ${result.classification}\nAI Probability: ${Math.round(result.ai_probability * 100)}%\nConfidence: ${Math.round(result.confidence * 100)}%\n\nSummary:\n${result.evaluation_summary}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-mono mb-4 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Calibrated Stylometrics • Forensic Verification</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          AI Writing Intelligence &amp; Forensics
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Deep probabilistic evaluation across sentence rhythm burstiness, vocabulary disparity, and 120+ syntactic LLM patterns.
        </p>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex p-1 mt-6 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "single"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Single Document Scan</span>
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "compare"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Dual Draft Compare</span>
          </button>
        </div>
      </div>

      {activeTab === "compare" ? (
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
          <DualTextCompare />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Drag & Drop Upload Zone */}
            <DocumentUploadZone onTextLoaded={handleFileLoaded} />

            <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                  Editor Text
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500 mr-1">Load sample:</span>
                  <button
                    onClick={() => setText(SAMPLES.ai)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                  >
                    AI Generated
                  </button>
                  <button
                    onClick={() => setText(SAMPLES.human)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                  >
                    Human
                  </button>
                  <button
                    onClick={() => setText(SAMPLES.mixed)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                  >
                    Mixed
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste an essay, article, or draft (minimum 15 words) to evaluate for probabilistic machine signatures..."
                rows={12}
                className="w-full bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-sans text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors resize-y leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {wordCount.toLocaleString()} words • {charCount.toLocaleString()} chars
                </div>

                <div className="flex items-center gap-3">
                  {text && (
                    <button
                      onClick={() => {
                        setText("");
                        setResult(null);
                        setError(null);
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || wordCount < 15}
                    className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-md shadow-violet-600/20 hover:shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Stylometrics...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Analyze Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Sentence-by-Sentence Breakdown (If result exists) */}
            {result && result.sentence_analysis && result.sentence_analysis.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-violet-500" />
                    <span>Sentence-Level Stylometric Attribution</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
                    </span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
                    </span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> High
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed max-h-[350px] overflow-y-auto pr-1">
                  {result.sentence_analysis.map((s) => {
                    const badgeColor =
                      s.suspicion_level === "high"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : s.suspicion_level === "medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

                    return (
                      <div
                        key={s.index}
                        className={`p-2.5 rounded-xl border transition-all ${
                          s.suspicion_level === "high"
                            ? "border-rose-500/30 bg-rose-950/10"
                            : s.suspicion_level === "medium"
                            ? "border-amber-500/20 bg-amber-950/5"
                            : "border-slate-100 dark:border-zinc-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono text-zinc-400">#{s.index + 1}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {Math.round(s.ai_probability * 100)}% Synthetic
                          </span>
                        </div>
                        <p className="text-zinc-800 dark:text-zinc-200">{s.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {result ? (
              <>
                {/* Primary Metric Score Card */}
                <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm dark:shadow-none space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                      Verdict
                    </span>
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 hover:bg-violet-600/25 text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Audit Certificate</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                      {result.classification}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {result.evaluation_summary}
                    </p>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-mono">
                        <span className="text-zinc-500">AI Probability</span>
                        <span className="font-bold text-violet-600 dark:text-violet-400">
                          {Math.round(result.ai_probability * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-950 overflow-hidden border border-slate-200 dark:border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                          style={{ width: `${Math.round(result.ai_probability * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-mono">
                        <span className="text-zinc-500">Confidence Rating</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          {Math.round(result.confidence * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-950 overflow-hidden border border-slate-200 dark:border-zinc-800">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-500"
                          style={{ width: `${Math.round(result.confidence * 100)}%` }}
                        />
                      </div>
                    </div>

                    {result.ai_probability > 0.25 && (
                      <Link
                        href="/humanize"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            sessionStorage.setItem("lumora_humanize_text", text);
                          }
                        }}
                        className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Bypass AI: Humanize Text to &lt;20% Score</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stylometric Radar Chart */}
                <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-500">
                    Multi-Dimensional Stylometric Fingerprint
                  </h3>
                  <StylometricRadar signals={result.signals} aiProbability={result.ai_probability} />
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-500 mx-auto flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Awaiting Text Input
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Paste an essay above or drag-and-drop a document to render the interactive stylometric radar and sentence attribution.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forensic Report / Certificate Modal */}
      {result && (
        <ForensicReportModal
          result={result}
          text={text}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
}
