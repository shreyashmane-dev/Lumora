"use client";

import React from "react";

interface LumoraLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  showWordmark?: boolean;
}

export function LumoraLogo({
  size = 40,
  className = "",
  animated = true,
  showWordmark = false
}: LumoraLogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 shrink-0 select-none group ${className}`}
    >
      {/* Emblem Frame with Ambient Iridescent Glow */}
      <div
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {animated && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600/40 via-indigo-500/25 to-cyan-400/25 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}

        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 transition-transform duration-500 ${animated ? "group-hover:scale-105" : ""}`}
        >
          <defs>
            <linearGradient id="lumora-bezel-main" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="35%" stopColor="#0F172A" />
              <stop offset="70%" stopColor="#090D16" />
              <stop offset="100%" stopColor="#04060A" />
            </linearGradient>

            <linearGradient id="lumora-specular-main" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="25%" stopColor="rgba(168, 85, 247, 0.4)" />
              <stop offset="70%" stopColor="rgba(6, 182, 212, 0.3)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
            </linearGradient>

            <linearGradient id="lumora-core-main" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="35%" stopColor="#8B5CF6" />
              <stop offset="70%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <filter id="lumora-glow-main" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Obsidian Base Tile */}
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="18"
            fill="url(#lumora-bezel-main)"
            stroke="url(#lumora-specular-main)"
            strokeWidth="1.2"
          />

          {/* Hexagonal Geometry Wireframe */}
          <polygon
            points="32,10 50,21 50,43 32,54 14,43 14,21"
            stroke="rgba(139, 92, 246, 0.35)"
            strokeWidth="1"
            fill="none"
          />
          <polygon
            points="32,18 43,25 43,39 32,46 21,39 21,25"
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="0.8"
            fill="none"
          />

          {/* Crystalline Refraction Facets */}
          <polygon points="32,10 50,21 32,32" fill="url(#lumora-core-main)" fillOpacity="0.22" />
          <polygon points="32,54 14,43 32,32" fill="url(#lumora-core-main)" fillOpacity="0.18" />
          <polygon points="50,43 32,54 32,32" fill="url(#lumora-core-main)" fillOpacity="0.32" />

          {/* Quantum Stylometric Quill */}
          <path
            d="M46 14C41 20 28 27 20 44C27 41 39 36 46 14Z"
            fill="url(#lumora-core-main)"
            fillOpacity="0.88"
          />
          <path
            d="M46 14C38 23 33 34 26 48C31 43 40 31 46 14Z"
            fill="url(#lumora-core-main)"
            fillOpacity="0.55"
          />

          {/* Laser Core Spine Line */}
          <line
            x1="46"
            y1="14"
            x2="19"
            y2="50"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            filter="url(#lumora-glow-main)"
          />

          {/* Focal Light Points */}
          <circle cx="46" cy="14" r="2.2" fill="#E9D5FF" filter="url(#lumora-glow-main)" />
          <circle cx="19" cy="50" r="2" fill="#38BDF8" filter="url(#lumora-glow-main)" />
          <circle cx="33" cy="32" r="1.3" fill="#34D399" />

          {/* Outer Calibration Micro-Dots */}
          <circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.3)" />
          <circle cx="54" cy="10" r="0.8" fill="rgba(255,255,255,0.3)" />
          <circle cx="10" cy="54" r="0.8" fill="rgba(255,255,255,0.3)" />
          <circle cx="54" cy="54" r="0.8" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>

      {/* Optional Integrated Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-wider text-white group-hover:text-violet-300 transition-colors">
            LUMORA
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 -mt-1 font-mono">
            Writing Intel
          </span>
        </div>
      )}
    </div>
  );
}
