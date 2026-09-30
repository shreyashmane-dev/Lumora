"use client";

import React, { useState } from "react";
import { EvidenceSignals } from "@/lib/api";

interface StylometricRadarProps {
  signals?: EvidenceSignals;
  aiProbability?: number;
  className?: string;
}

export function StylometricRadar({
  signals,
  aiProbability = 0.5,
  className = ""
}: StylometricRadarProps) {
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  // Compute 5 normalized dimensions (0.0 to 1.0)
  // Higher = more human-like; lower = more synthetic
  const burstiness = signals ? Math.min(1.0, signals.burstiness_score) : 0.5;
  const perplexity = signals ? Math.min(1.0, signals.perplexity_proxy) : 0.5;
  const lexical = signals ? Math.min(1.0, signals.lexical_diversity) : 0.6;
  const organicSyntax = signals ? Math.max(0.05, 1.0 - signals.repetition_index) : 0.5;
  // Natural variability estimated from sentence variance
  const cadenceVariance = signals ? Math.min(1.0, signals.sentence_variance / 8.5) : 0.45;

  const axes = [
    {
      key: "burstiness",
      label: "Burstiness",
      value: burstiness,
      humanRef: 0.78,
      aiRef: 0.22,
      desc: "Sentence length pacing variation (CV). High = natural human rhythm; Low = uniform machine cadence."
    },
    {
      key: "perplexity",
      label: "Perplexity",
      value: perplexity,
      humanRef: 0.85,
      aiRef: 0.28,
      desc: "Phrase unpredictability. High = organic, original idioms; Low = standard LLM template transitions."
    },
    {
      key: "lexical",
      label: "Vocabulary Depth",
      value: lexical,
      humanRef: 0.72,
      aiRef: 0.82,
      desc: "Breadth of specialized Latinate vocabulary vs common English core words."
    },
    {
      key: "organicSyntax",
      label: "Organic Cadence",
      value: organicSyntax,
      humanRef: 0.88,
      aiRef: 0.35,
      desc: "Absence of repeated anaphora, robotic list templates, and identical sentence openers."
    },
    {
      key: "cadenceVariance",
      label: "Length Variance",
      value: cadenceVariance,
      humanRef: 0.80,
      aiRef: 0.25,
      desc: "Standard deviation of word counts across consecutive sentences."
    }
  ];

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const angleStep = (2 * Math.PI) / axes.length;

  // Helper to convert polar coordinates (radius, angle) to cartesian (x, y)
  const getCoordinates = (val: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * Math.max(0.1, Math.min(1.0, val));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build polygon path strings
  const inputPolygon = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.value, i);
      return `${x},${y}`;
    })
    .join(" ");

  const humanPolygon = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.humanRef, i);
      return `${x},${y}`;
    })
    .join(" ");

  const aiPolygon = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.aiRef, i);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <linearGradient id="radar-input-grad" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
            </linearGradient>
            <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric grid rings (25%, 50%, 75%, 100%) */}
          {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
            const ringPoints = axes
              .map((_, i) => {
                const { x, y } = getCoordinates(level, i);
                return `${x},${y}`;
              })
              .join(" ");
            return (
              <polygon
                key={idx}
                points={ringPoints}
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-zinc-800"
                strokeWidth={level === 1.0 ? "1.5" : "0.75"}
                strokeDasharray={level < 1.0 ? "2 3" : undefined}
              />
            );
          })}

          {/* Radial axis lines */}
          {axes.map((axis, i) => {
            const { x, y } = getCoordinates(1.0, i);
            return (
              <line
                key={axis.key}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-zinc-800"
                strokeWidth="0.8"
              />
            );
          })}

          {/* Human Baseline Layer (Green dashed) */}
          <polygon
            points={humanPolygon}
            fill="rgba(16, 185, 129, 0.05)"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            strokeOpacity="0.7"
          />

          {/* AI / LLM Baseline Layer (Rose dashed) */}
          <polygon
            points={aiPolygon}
            fill="rgba(244, 63, 94, 0.05)"
            stroke="#F43F5E"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />

          {/* Evaluated Text Layer (Dynamic Cyan-Violet Glow) */}
          <polygon
            points={inputPolygon}
            fill="url(#radar-input-grad)"
            stroke="#A78BFA"
            strokeWidth="2.2"
            filter="url(#radar-glow)"
          />

          {/* Vertices and Interactive Anchors */}
          {axes.map((axis, i) => {
            const { x, y } = getCoordinates(axis.value, i);
            const labelPos = getCoordinates(1.22, i);
            const isHovered = hoveredAxis === axis.key;

            return (
              <g key={axis.key} className="cursor-pointer" onMouseEnter={() => setHoveredAxis(axis.key)} onMouseLeave={() => setHoveredAxis(null)}>
                {/* Vertex Pip */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5.5 : 4}
                  fill="#06B6D4"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />

                {/* Axis Label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[10px] font-mono tracking-tight transition-colors ${
                    isHovered
                      ? "fill-violet-400 font-bold"
                      : "fill-zinc-600 dark:fill-zinc-400"
                  }`}
                >
                  {axis.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Tooltip Description */}
      <div className="w-full mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/80 text-[11px] text-center min-h-[46px] flex flex-col items-center justify-center transition-all">
        {hoveredAxis ? (
          <div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {axes.find((a) => a.key === hoveredAxis)?.label}:{" "}
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {axes.find((a) => a.key === hoveredAxis)?.desc}
            </span>
          </div>
        ) : (
          <div className="text-zinc-500 dark:text-zinc-400 text-[10px]">
            Hover over any axis to inspect the stylometric vector mechanics.
          </div>
        )}
      </div>

      {/* Radar Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-cyan-400 border border-violet-400" />
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">Scanned Text</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-500 border-t border-dashed border-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400">Human Baseline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-rose-500 border-t border-dashed border-rose-400" />
          <span className="text-rose-500 dark:text-rose-400">GPT-4 Baseline</span>
        </div>
      </div>
    </div>
  );
}
