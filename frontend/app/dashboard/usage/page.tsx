"use client";

import { useEffect, useState } from "react";
import { BarChart3, Calendar, Layers, RefreshCw, Zap, Shield } from "lucide-react";
import { getUsageMetrics } from "@/lib/api";

export default function UsagePage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const data = await getUsageMetrics();
      setUsage(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const quotaLimit = usage?.monthly_quota || 10000;
  const quotaUsed = usage?.monthly_used || 0;
  const percentUsed = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Usage & Quotas</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Track consumption against your account tier and review daily API request distribution.
          </p>
        </div>
        <button
          onClick={fetchUsage}
          disabled={loading}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs transition-colors flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-1">Monthly Quota</div>
          <div className="text-2xl font-bold font-mono text-white">
            {quotaLimit.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Developer Tier</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-1">Requests Used</div>
          <div className="text-2xl font-bold font-mono text-violet-400">
            {quotaUsed.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">{percentUsed}% consumed</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-1">Remaining</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(quotaLimit - quotaUsed).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Available now</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-1">Next Reset</div>
          <div className="text-base font-bold font-mono text-zinc-300 mt-1.5">
            {usage?.reset_date || "First of Month"}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Automatic cycle renewal</div>
        </div>
      </div>

      {/* Usage Progress Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-white">Active Month Consumption</span>
          <span className="font-mono text-zinc-400">
            {quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()} requests
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Daily Usage Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">7-Day Activity History</h3>
        <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">/v1/detect</th>
                <th className="p-4">/v1/humanize</th>
                <th className="p-4">/v1/analyze</th>
                <th className="p-4 text-right">Total Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300 text-xs">
              {usage?.daily_history?.map((d: any) => (
                <tr key={d.date} className="hover:bg-zinc-900/30">
                  <td className="p-4 text-white font-sans font-medium">{d.date}</td>
                  <td className="p-4 text-violet-400">{d.detect_requests}</td>
                  <td className="p-4 text-emerald-400">{d.humanize_requests}</td>
                  <td className="p-4 text-indigo-400">{d.analyze_requests}</td>
                  <td className="p-4 text-right font-bold text-white">{d.total_requests}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500 font-sans">
                    No recent activity.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
