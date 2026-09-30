import Link from "next/link";
import { Shield, Heart } from "lucide-react";
import { LumoraLogo } from "./LumoraLogo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <LumoraLogo size={30} animated={true} />
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-white text-base">LUMORA</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono -mt-1">Writing Intel</span>
              </div>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm">
              Understand the text. Rewrite it naturally. A privacy-first writing intelligence platform providing probabilistic AI-text analysis and semantic-preserving rewriting.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transient processing by default • Zero text retention</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/detect" className="hover:text-violet-400 transition-colors">
                  AI Text Detector
                </Link>
              </li>
              <li>
                <Link href="/humanize" className="hover:text-violet-400 transition-colors">
                  Natural Humanizer
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-violet-400 transition-colors">
                  Developer API
                </Link>
              </li>
              <li>
                <Link href="/dashboard/playground" className="hover:text-violet-400 transition-colors">
                  API Playground
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-violet-400 transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal and Docs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">Resources & Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/docs" className="hover:text-violet-400 transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-violet-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-violet-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-violet-400 transition-colors">
                  Developer Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} LUMORA. All rights reserved. Results are probabilistic evaluations, not proof of authorship.</p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Engineered with precision</span>
            <Heart className="w-3 h-3 text-violet-400 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
