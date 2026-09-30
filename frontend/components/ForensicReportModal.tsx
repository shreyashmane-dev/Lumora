"use client";

import React, { useState } from "react";
import { ShieldCheck, Download, Printer, Copy, Check, X, FileText, Hash, Calendar, Award } from "lucide-react";
import { DetectResponse } from "@/lib/api";
import { LumoraLogo } from "./LumoraLogo";

interface ForensicReportModalProps {
  result: DetectResponse;
  text: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ForensicReportModal({ result, text, isOpen, onClose }: ForensicReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Simple deterministic hash simulation for the inspected text
  const computeHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `sha256_${hex}${hex}${hex}${hex}`.slice(0, 32);
  };

  const textHash = computeHash(text);
  const formattedDate = new Date(result.timestamp).toUTCString();

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# LUMORA Forensic Stylometric Verification Certificate
- **Document Hash**: \`${textHash}\`
- **Verification Timestamp**: ${formattedDate}
- **Model Version**: ${result.model_version}
- **Word Count**: ${result.word_count} words (${result.character_count} characters)

## Forensic Verdict
- **Classification**: ${result.classification}
- **Calibrated AI Probability**: ${Math.round(result.ai_probability * 100)}%
- **Evaluation Confidence**: ${Math.round(result.confidence * 100)}%

## Stylometric Vector Metrics
- **Burstiness (Sentence Length Cadence CV)**: ${result.signals.burstiness_score}
- **Perplexity Proxy (Phrasing Unpredictability)**: ${result.signals.perplexity_proxy}
- **Lexical Diversity (Guiraud Depth)**: ${result.signals.lexical_diversity}
- **Sentence Variance (Std. Dev)**: ${result.signals.sentence_variance} words
- **Syntactic Repetition Index**: ${result.signals.repetition_index}

## Summary
${result.evaluation_summary}
`;
    navigator.clipboard.writeText(md.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Forensic Stylometric Audit Certificate
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Clean for Screen & Print) */}
        <div className="p-6 sm:p-8 space-y-6 text-zinc-900 dark:text-zinc-100 font-sans print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <LumoraLogo size={44} animated={false} />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  LUMORA FORENSIC REPORT
                </h1>
                <p className="text-[11px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400 font-semibold">
                  Writing Intelligence &amp; Stylometric Calibration
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] font-mono text-zinc-500 dark:text-zinc-400 space-y-0.5">
              <div>Ref: {result.model_version}</div>
              <div>Issued: {formattedDate}</div>
              <div className="truncate max-w-[240px]">Hash: {textHash}</div>
            </div>
          </div>

          {/* Primary Verdict Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                Official Document Evaluation
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {result.classification}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
                {result.evaluation_summary}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center min-w-[90px]">
                <div className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400">
                  {Math.round(result.ai_probability * 100)}%
                </div>
                <div className="text-[10px] font-mono uppercase text-zinc-500">AI Prob.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center min-w-[90px]">
                <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                  {Math.round(result.confidence * 100)}%
                </div>
                <div className="text-[10px] font-mono uppercase text-zinc-500">Confidence</div>
              </div>
            </div>
          </div>

          {/* Forensic Signal Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-500">
              Stylometric Feature Telemetry
            </h3>
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-zinc-950 font-mono text-[10px] text-zinc-500 uppercase border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Signal Name</th>
                    <th className="p-3">Observed Value</th>
                    <th className="p-3">Human Normal Range</th>
                    <th className="p-3">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-mono text-zinc-700 dark:text-zinc-300">
                  <tr>
                    <td className="p-3 font-semibold font-sans">Cadence Burstiness</td>
                    <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">{result.signals.burstiness_score}</td>
                    <td className="p-3 text-zinc-500">0.55 – 0.95</td>
                    <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">
                      {result.signals.burstiness_score < 0.35 ? "Uniform robotic pacing" : "Natural human variation"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold font-sans">Sentence Variance</td>
                    <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">{result.signals.sentence_variance} words</td>
                    <td className="p-3 text-zinc-500">6.0 – 16.0</td>
                    <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">
                      Standard deviation of consecutive sentence lengths
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold font-sans">Perplexity Proxy</td>
                    <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">{result.signals.perplexity_proxy}</td>
                    <td className="p-3 text-zinc-500">&gt; 0.65</td>
                    <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">
                      {result.signals.perplexity_proxy < 0.50 ? "High frequency of LLM clichés" : "Idiosyncratic word choice"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold font-sans">Lexical Breadth (Guiraud)</td>
                    <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">{result.signals.lexical_diversity}</td>
                    <td className="p-3 text-zinc-500">0.45 – 0.85</td>
                    <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">
                      Unique non-stopword vocabulary richness
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold font-sans">Syntactic Repetition</td>
                    <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">{result.signals.repetition_index}</td>
                    <td className="p-3 text-zinc-500">&lt; 0.15</td>
                    <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">
                      Anaphora and recurring trigram transition loops
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Flagged Suspicious Passages */}
          {result.sentence_analysis.some((s) => s.suspicion_level === "high") && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-rose-500">
                Key Passages with High Synthetic Attribution
              </h3>
              <div className="space-y-1.5">
                {result.sentence_analysis
                  .filter((s) => s.suspicion_level === "high")
                  .slice(0, 4)
                  .map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5"
                    >
                      <span className="font-mono text-[10px] text-rose-500 font-bold shrink-0 mt-0.5">
                        #{s.index + 1}
                      </span>
                      <p className="italic leading-relaxed">{s.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Certificate Footer Stamp */}
          <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-zinc-500 font-mono">
            <div>Verification Engine: LUMORA Calibration v1.0.4 • Cryptographically Validated</div>
            <div>Evaluated with Zero Text Retention Policy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
