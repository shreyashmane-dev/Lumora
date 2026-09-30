"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Shield, Terminal, BookOpen, Activity, Cpu, LogOut, Sparkles } from "lucide-react";
import { LumoraLogo } from "./LumoraLogo";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/detect", label: "Detector", icon: Shield },
    { href: "/humanize", label: "Humanizer", icon: Sparkles },
    { href: "/api", label: "API", icon: Terminal },
    { href: "/docs", label: "Docs", icon: BookOpen },
    { href: "/status", label: "Status", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E293B]/80 bg-[#07090E]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with custom animated emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <LumoraLogo size={36} animated={true} />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-violet-300 transition-colors">
              LUMORA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 -mt-1 font-mono">
              Writing Intel
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-violet-600/25"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-300" />
                <span>Developer Console</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard/api-keys"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-md shadow-violet-600/20"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-300" />
                <span>Developer API</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0A0E17] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-xs"
                >
                  <Cpu className="w-4 h-4 text-cyan-300" />
                  <span>Developer Console</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard/api-keys"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-violet-600 text-white text-xs font-medium"
                >
                  Developer API
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
