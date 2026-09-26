"use client";

import { useState } from "react";
import { Shield, Sparkles, Copy, Check, AlertCircle, RefreshCw, BarChart3, HelpCircle, Activity, Info } from "lucide-react";
import { detectText, DetectResponse } from "@/lib/api";

const SAMPLES = {
  ai: "Furthermore, it is important to remember that artificial intelligence plays a crucial role in modern writing workflows. Navigating the complexities of technological evolution allows organizations to seamlessly harness the power of scalable innovation. Moreover, this multifaceted paradigm stands as a testament to the ever-expanding tapestry of digital progress and human-machine collaboration. In conclusion, adopting these automated strategies will foster unparalleled operational efficiency across diverse domains.",
  human: "I was sitting on my grandfather's front porch early this morning, listening to the rain rattle against the tin awning. The coffee had cooled down to a lukewarm sip, but I didn't care. Sometimes you just need thirty quiet minutes to watch the neighbor's stubborn beagle bark at passing delivery vans before the real day starts.",
  mixed: "Cloud computing remains fundamental for enterprise scaling. While companies frequently face architectural hurdles, agile teams help simplify migrations. We observed tangible latency improvements after establishing basic Redis caching."
};

export default function DetectPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-mono mb-4 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Calibrated Stylometrics • Zero Text Retention</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          AI Text Detector
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Advanced statistical modeling of rhythm burstiness ($CV = \sigma / \mu$), vocabulary richness, perplexity, and formulaic LLM patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                Input Text
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
              placeholder="Paste or write your text here (minimum 15 words for calibrated analysis)..."
              rows={12}
              className="w-full bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y leading-relaxed font-sans transition-colors"
            />

            {/* Counters and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                <span>
                  Words: <strong className={wordCount < 15 ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"}>{wordCount}</strong>
                  {wordCount < 15 && " (min 15)"}
                </span>
                <span>Characters: {charCount}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {text && (
                  <button
                    onClick={() => {
                      setText("");
                      setResult(null);
                      setError(null);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || wordCount < 15}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/20"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Evaluating Signals...</span>
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
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Probabilistic Disclaimer */}
          <div className="rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5 shadow-sm dark:shadow-none">
            <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> Detection results are statistical assessments reflecting stylometric regularities ($0.40 - 0.60$ represents an uncertainty boundary). They do not constitute deterministic proof of authorship. Short or edited texts may naturally exhibit mixed signals.
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {result ? (
            <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6 shadow-sm dark:shadow-none transition-colors">
              {/* Classification Banner */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Classification Result
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-base sm:text-lg font-bold px-3 py-1 rounded-xl border ${
                        result.classification === "Likely Human"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                          : result.classification === "Likely AI-Generated"
                          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-500/40 text-violet-700 dark:text-violet-300"
                          : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {result.classification}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopySummary}
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs transition-colors flex items-center gap-1.5"
                  title="Copy result summary"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">AI Probability</div>
                  <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                    {Math.round(result.ai_probability * 100)}%
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.ai_probability > 0.6
                          ? "bg-violet-600 dark:bg-violet-500"
                          : result.ai_probability > 0.35
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.round(result.ai_probability * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Confidence Score</div>
                  <div className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {Math.round(result.confidence * 100)}%
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-zinc-500 dark:bg-zinc-400 transition-all duration-500"
                      style={{ width: `${Math.round(result.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Evaluation Summary */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {result.evaluation_summary}
              </div>

              {/* Stylometric Evidence Signals */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Stylometric Evidence Signals</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Rhythm Burstiness ($CV$)</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {(result.signals.burstiness_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Perplexity Proxy</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {(result.signals.perplexity_proxy * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Lexical Richness (TTR)</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {(result.signals.lexical_diversity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Pattern Repetition</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {(result.signals.repetition_index * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Sentence Level Breakdown */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Sentence Suspicion Map
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {result.sentence_analysis.map((s) => (
                    <div
                      key={s.index}
                      className={`p-3 rounded-xl border text-xs leading-relaxed transition-colors ${
                        s.suspicion_level === "high"
                          ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200"
                          : s.suspicion_level === "medium"
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200"
                          : "bg-emerald-50/60 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-800/30 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>Sentence #{s.index + 1}</span>
                        <span className="font-semibold">
                          Suspicion: {Math.round(s.ai_probability * 100)}% ({s.suspicion_level})
                        </span>
                      </div>
                      <p>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 p-8 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-violet-500 dark:text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">No Evaluation Yet</h3>
              <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">
                Paste or type at least 15 words on the left, or select one of the sample texts to see the calibrated probability breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
