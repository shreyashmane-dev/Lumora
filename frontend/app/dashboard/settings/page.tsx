"use client";

import { useState } from "react";
import { Settings, Shield, Bell, Check, Save } from "lucide-react";

export default function DashboardSettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [defaultStyle, setDefaultStyle] = useState("natural");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Developer Settings</h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Manage developer preferences, webhook listeners, and integration settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Info */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Developer Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500 uppercase text-[10px]">Account ID</span>
              <div className="text-zinc-300 mt-1 p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                dev_default_user
              </div>
            </div>
            <div>
              <span className="text-zinc-500 uppercase text-[10px]">Plan Tier</span>
              <div className="text-violet-400 font-semibold mt-1 p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                Developer Pro (Free Tier)
              </div>
            </div>
          </div>
        </div>

        {/* Integration Preferences */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Default Preferences</h3>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Default Humanizer Style
            </label>
            <select
              value={defaultStyle}
              onChange={(e) => setDefaultStyle(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 w-full sm:w-64"
            >
              <option value="natural">Natural (Balanced)</option>
              <option value="academic">Academic</option>
              <option value="professional">Professional</option>
              <option value="simple">Simple English</option>
              <option value="casual">Casual</option>
              <option value="native_english">Native English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Webhook Endpoint (Optional)
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/api/lumora-webhooks"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Receive automated event notifications when quota thresholds (80%, 95%) are reached.
            </p>
          </div>
        </div>

        {/* Security & Access Controls */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="text-sm font-semibold text-white">Security Safeguards</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            All API keys are cryptographically salted and hashed. Frontend requests without secret keys are confined to public anonymous rate limit buckets. Privileged provider secrets never leave the server.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3.5 h-3.5" />
              Settings saved
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-violet-600/10"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
