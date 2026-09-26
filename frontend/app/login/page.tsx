"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Key, Lock, Mail, ArrowRight, ShieldCheck, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 mb-2">
            <Key className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Developer Sign In
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Access your API keys, monitor usage quotas, and test in the playground.
          </p>
        </div>

        {/* Demo Mode Quick Access Button */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-indigo-950/40 border border-violet-500/40 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-300">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>Instant Developer Access</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            No password required. Jump straight into the Developer Console with pre-seeded test keys.
          </p>
          <button
            onClick={handleDemo}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
          >
            <span>Enter Developer Console (Instant Access)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In with Email</span>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] uppercase font-mono text-zinc-400 shrink-0">
              Or
            </span>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue with Google</span>
          </button>

          <div className="text-center text-xs text-zinc-500 pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-violet-500 hover:underline font-medium">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
