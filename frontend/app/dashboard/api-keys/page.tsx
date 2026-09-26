"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Trash2, Copy, Check, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { listApiKeys, createApiKey, revokeApiKey, KeyItem } from "@/lib/api";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [environment, setEnvironment] = useState("live");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await listApiKeys();
      setKeys(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setActionLoading(true);
    try {
      const res = await createApiKey(keyName, environment);
      setCreatedSecret(res.raw_key);
      await fetchKeys();
    } catch (e) {
      alert("Failed to create key");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) return;
    try {
      await revokeApiKey(keyId);
      await fetchKeys();
    } catch (e) {
      alert("Failed to revoke key");
    }
  };

  const handleCopySecret = () => {
    if (!createdSecret) return;
    navigator.clipboard.writeText(createdSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Keys</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Create, inspect, and revoke API keys used to authenticate programmatic requests.
          </p>
        </div>
        <button
          onClick={() => {
            setKeyName("");
            setCreatedSecret(null);
            setCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-violet-600/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Key</span>
        </button>
      </div>

      {/* Security Best Practices Banner */}
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          Keys are stored using cryptographic SHA-256 hashes. Your secret key is shown once at creation and cannot be retrieved later. Do not expose keys in client-side code, git repositories, or public bundles.
        </p>
      </div>

      {/* Keys Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/40">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-4">Key Name</th>
              <th className="p-4">Prefix</th>
              <th className="p-4">Environment</th>
              <th className="p-4">Quota Used</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" />
                  Loading API keys...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">
                  No API keys created yet. Click &quot;Create New Key&quot; above to generate your first key.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-violet-400" />
                      <span>{k.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-zinc-400">{k.prefix}</td>
                  <td className="p-4">
                    <span className="capitalize px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300">
                      {k.environment}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-zinc-400">
                    {k.monthly_used.toLocaleString()} / {k.monthly_quota.toLocaleString()}
                  </td>
                  <td className="p-4">
                    {k.is_active ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/80 text-rose-400 border border-rose-800/40">
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {k.is_active && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Creation Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl">
            {!createdSecret ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Create New API Key</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Assign a memorable label to recognize this key in usage reports.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Key Label
                  </label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. Production Backend"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Environment
                  </label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="live">Live (lum_live_...)</option>
                    <option value="test">Test (lum_test_...)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !keyName.trim()}
                    className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Generate Key</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong>Important:</strong> Copy this secret key now. It will never be displayed again.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Your Secret API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdSecret}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-zinc-200 select-all"
                    />
                    <button
                      onClick={handleCopySecret}
                      className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shrink-0 flex items-center gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={() => {
                      setCreateModalOpen(false);
                      setCreatedSecret(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
