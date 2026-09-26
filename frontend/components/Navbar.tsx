"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sparkles, Menu, X, Shield, Terminal, BookOpen, Activity, Cpu } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/detect", label: "Detector", icon: Shield },
    { href: "/humanize", label: "Humanizer", icon: Sparkles },
    { href: "/api", label: "API", icon: Terminal },
    { href: "/docs", label: "Docs", icon: BookOpen },
    { href: "/status", label: "Status", icon: Activity },
  ];

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:border-violet-500/60 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-white group-hover:text-violet-300 transition-colors">
              LUMORA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 -mt-1 font-mono">
              Writing Intel
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-violet-600/15 text-violet-300 border border-violet-500/30"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-3">
          {isDashboard ? (
            <Link
              href="/detect"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              ← Back to App
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 hover:border-zinc-600 text-sm font-medium transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>Developer Portal</span>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-violet-600/15 text-violet-300 border border-violet-500/30"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
            >
              <Cpu className="w-4 h-4" />
              <span>Developer Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
