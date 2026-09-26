import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Key, BarChart3, Terminal, Settings, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Developer Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/usage", label: "Usage & Quota", icon: BarChart3 },
    { href: "/dashboard/playground", label: "Playground", icon: Terminal },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
      {/* Dashboard Nav Sidebar */}
      <aside className="w-full md:w-56 shrink-0">
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-violet-400">Developer</span>
              <h2 className="text-base font-bold text-white">Console</h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              Live
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <Icon className="w-4 h-4 text-zinc-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-zinc-900">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Dashboard Main Workspace */}
      <section className="flex-1 w-full min-w-0">
        {children}
      </section>
    </div>
  );
}
