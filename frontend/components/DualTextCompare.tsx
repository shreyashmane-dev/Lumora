"use client";

import React, { useState } from "react";
import { ArrowRight, RefreshCw, AlertCircle, ShieldAlert, ShieldCheck, Scale, Check, Copy } from "lucide-react";
import { detectText, DetectResponse } from "@/lib/api";

export function DualTextCompare() {
  const [draftA, setDraftA] = useState("");
  const [draftB, setDraftB] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [resultA, setResultA] = useState<DetectResponse | null>(null);
  const [resultB, setResultB] = useState<DetectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCountA = draftA.trim() ? draftA.trim().split(/\s+/).length : 0;
  const wordCountB = draftB.trim() ? draftB.trim().split(/\s+/).length : 0;

  const handleCompare = async () => {
    if (wordCountA < 15 || wordCountB < 15) {
      setError("Please provide at least 15 words in both drafts to run dual calibration.");
      return;
    }
    setError(null);
    setEvaluating(true);

    try {
      const [resA, resB] = await Promise.all([detectText(draftA), detectText(draftB)]);
      setResultA(resA);
      setResultB(resB);
    } catch (err: any) {
      setError(err?.message || "Failed to evaluate drafts.");
    } finally {
      setEvaluating(false);
    }
  };

  const probA = resultA ? Math.round(resultA.ai_probability * 100) : 0;
  const probB = resultB ? Math.round(resultB.ai_probability * 100) : 0;
  const shift = probB - probA;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-violet-500" />
            <span>Dual Draft Forensic Comparison</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compare an initial draft against a revised version to measure synthetic drift and AI injection.
          </p>
        </div>

        <button
          onClick={handleCompare}
          disabled={evaluating || wordCountA < 15 || wordCountB < 15}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 shrink-0"
        >
          {evaluating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Both Drafts...</span>
            </>
          ) : (
            <>
              <Scale className="w-3.5 h-3.5" />
              <span>Run Dual Forensic Scan</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Delta Banner (Visible after scan) */}
      {resultA && resultB && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40 border border-violet-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-2">
            <div className="text-[10px] font-mono uppercase text-zinc-400">Draft A (Baseline)</div>
            <div className="text-2xl font-black font-mono mt-1 text-zinc-200">{probA}% AI</div>
            <div className="text-[11px] text-zinc-400">{resultA.classification}</div>
          </div>

          <div className="p-2 border-y sm:border-y-0 sm:border-x border-slate-700/50 flex flex-col items-center justify-center">
            <div className="text-[10px] font-mono uppercase text-zinc-400">Attribution Shift</div>
            <div
              className={`text-2xl font-black font-mono mt-1 ${
                shift > 15 ? "text-rose-400" : shift < -15 ? "text-emerald-400" : "text-zinc-200"
              }`}
            >
              {shift > 0 ? `+${shift}%` : `${shift}%`}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {shift > 15
                ? "Substantial AI Injection"
                : shift < -15
                ? "Successful Humanization"
                : "Consistent Stylometrics"}
            </div>
          </div>

          <div className="p-2">
            <div className="text-[10px] font-mono uppercase text-zinc-400">Draft B (Revised)</div>
            <div className="text-2xl font-black font-mono mt-1 text-zinc-200">{probB}% AI</div>
            <div className="text-[11px] text-zinc-400">{resultB.classification}</div>
          </div>
        </div>
      )}

      {/* Side-by-Side Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Draft A */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold font-mono text-zinc-500">
            <span>Draft A (Original / Baseline)</span>
            <span>{wordCountA} words</span>
          </div>
          <textarea
            value={draftA}
            onChange={(e) => setDraftA(e.target.value)}
            placeholder="Paste your original human draft, outline, or prior version here..."
            rows={10}
            className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 text-xs font-sans text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
          />
        </div>

        {/* Draft B */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold font-mono text-zinc-500">
            <span>Draft B (Revised / Suspect)</span>
            <span>{wordCountB} words</span>
          </div>
          <textarea
            value={draftB}
            onChange={(e) => setDraftB(e.target.value)}
            placeholder="Paste the revised, edited, or suspect submitted version here..."
            rows={10}
            className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 text-xs font-sans text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
          />
        </div>
      </div>
    </div>
  );
}
