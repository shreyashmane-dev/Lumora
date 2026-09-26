"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Key, BarChart3, Terminal, Settings, ArrowLeft, User, LogIn, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, loginAsDemo, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/usage", label: "Usage & Quota", icon: BarChart3 },
    { href: "/dashboard/playground", label: "Playground", icon: Terminal },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-semibold">
              Developer
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Console</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
            Live v1.0
          </span>
        </div>

        {/* Developer Account Badge */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
                  {user.email ? user.email[0].toUpperCase() : "D"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {user.email || "developer@lumora.ai"}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                    ID: {user.uid.slice(0, 10)}...
                  </div>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
                Not signed in. Keys will be scoped to demo mode.
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => loginAsDemo()}
                  className="w-full px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Demo Login</span>
                </button>
                <Link
                  href="/login"
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet-100 dark:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Site</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
