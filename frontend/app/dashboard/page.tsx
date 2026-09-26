"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Key, BarChart3, Terminal, ArrowRight, ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";
import { listApiKeys, getUsageMetrics, KeyItem } from "@/lib/api";

export default function DashboardOverviewPage() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [k, u] = await Promise.all([listApiKeys(), getUsageMetrics()]);
      setKeys(k);
      setUsage(u);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeKeysCount = keys.filter((k) => k.is_active).length;
  const quotaLimit = usage?.monthly_quota || 10000;
  const quotaUsed = usage?.monthly_used || 0;
  const percentUsed = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Monitor API usage, active authentication keys, and quotas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/api-keys"
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-violet-600/10"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Manage Keys</span>
          </Link>
          <Link
            href="/dashboard/playground"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium text-xs transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Playground</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Active Keys */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs font-mono uppercase tracking-wider">Active Keys</span>
            <Key className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="text-3xl font-bold font-mono text-white mb-1">
              {loading ? "..." : activeKeysCount}
            </div>
            <div className="text-xs text-zinc-500">Cryptographically hashed</div>
          </div>
        </div>

        {/* Quota Consumed */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs font-mono uppercase tracking-wider">Monthly Quota</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-bold font-mono text-white mb-1">
              {loading ? "..." : `${percentUsed}%`}
            </div>
            <div className="text-xs text-zinc-500">
              {quotaUsed.toLocaleString()} of {quotaLimit.toLocaleString()} requests
            </div>
          </div>
        </div>

        {/* Available Requests */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs font-mono uppercase tracking-wider">Remaining</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-bold font-mono text-zinc-200 mb-1">
              {loading ? "..." : (quotaLimit - quotaUsed).toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">Resets on next billing cycle</div>
          </div>
        </div>
      </div>

      {/* Monthly Quota Progress */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-white">Monthly Usage Progress</span>
          <span className="font-mono text-zinc-400">
            {quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()} ({percentUsed}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Endpoint Breakdown */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <h3 className="text-sm font-semibold text-white mb-4">Endpoint Consumption Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <div className="text-xs font-mono text-violet-400">POST /v1/detect</div>
            <div className="text-xl font-bold font-mono text-zinc-200 mt-2">
              {usage?.endpoint_breakdown?.["/v1/detect"] || 0}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Detection requests</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <div className="text-xs font-mono text-emerald-400">POST /v1/humanize</div>
            <div className="text-xl font-bold font-mono text-zinc-200 mt-2">
              {usage?.endpoint_breakdown?.["/v1/humanize"] || 0}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Rewrite requests</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <div className="text-xs font-mono text-indigo-400">POST /v1/analyze</div>
            <div className="text-xl font-bold font-mono text-zinc-200 mt-2">
              {usage?.endpoint_breakdown?.["/v1/analyze"] || 0}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Profile requests</div>
          </div>
        </div>
      </div>
    </div>
  );
}
