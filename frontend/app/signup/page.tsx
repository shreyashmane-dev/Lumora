"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Zap, RefreshCw, AlertCircle, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LumoraLogo } from "@/components/LumoraLogo";

export default function SignupPage() {
  const router = useRouter();
  const { signup, login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setExistingAccount(false);
    setLoading(true);
    try {
      await signup(email, password);
      router.push("/dashboard/api-keys");
    } catch (err: any) {
      if (err.message === "EMAIL_ALREADY_IN_USE") {
        setError("This email is already registered.");
        setExistingAccount(true);
      } else {
        setError(err?.message || "Registration failed. Please check credentials or use Instant Access.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignInDirect = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard/api-keys");
    } catch (err: any) {
      setError(err?.message || "Could not sign in with this password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <LumoraLogo size={56} animated={true} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Create Developer Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
              Register to receive a persistent API key and 10,000 monthly free requests.
            </p>
          </div>
        </div>

        {/* 1-Click Demo Quick Access */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/40 text-center space-y-2.5 shadow-xl">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-300">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Skip Registration — Instant Console</span>
          </div>
          <button
            onClick={() => {
              loginAsDemo();
              router.push("/dashboard/api-keys");
            }}
            type="button"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/25"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Launch Developer Console Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@domain.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
                {existingAccount && (
                  <button
                    type="button"
                    onClick={handleSignInDirect}
                    className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In With This Password Now</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register &amp; Generate Key</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
