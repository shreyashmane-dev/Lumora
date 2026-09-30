"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Key, Lock, Mail, ArrowRight, Zap, RefreshCw, AlertCircle, Sparkles, CheckCircle2, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LumoraLogo } from "@/components/LumoraLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginWithGoogle, loginAsDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAutoSwitch, setShowAutoSwitch] = useState<"to_signup" | "to_signin" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setShowAutoSwitch(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        await signup(email, password);
      } else {
        await login(email, password);
      }
      router.push("/dashboard/api-keys");
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        setError("Account not found or password incorrect.");
        setShowAutoSwitch("to_signup");
      } else if (err.message === "EMAIL_ALREADY_IN_USE") {
        setError("An account with this email already exists.");
        setShowAutoSwitch("to_signin");
      } else {
        setError(err?.message || "Authentication could not be completed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCreateAccount = async () => {
    if (!email || !password) return;
    setError(null);
    setShowAutoSwitch(null);
    setLoading(true);
    try {
      await signup(email, password);
      router.push("/dashboard/api-keys");
    } catch (err: any) {
      setError(err?.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSignIn = async () => {
    if (!email || !password) return;
    setError(null);
    setShowAutoSwitch(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard/api-keys");
    } catch (err: any) {
      setError(err?.message || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setShowAutoSwitch(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard/api-keys");
    } catch (err: any) {
      setError(err?.message || "Google sign-in could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    router.push("/dashboard/api-keys");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header with Custom Bespoke Lumora Logo */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <LumoraLogo size={56} animated={true} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isSignUp ? "Create Developer Account" : "Developer Sign In"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
              {isSignUp
                ? "Register to receive a persistent API key and 10,000 monthly quota."
                : "Manage API keys, track quota consumption, and access the live engine."}
            </p>
          </div>
        </div>

        {/* 1-Click Instant Developer Access */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/40 text-center space-y-2.5 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-violet-600/5 group-hover:bg-violet-600/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-300">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Instant Developer Access (Zero Wait)</span>
          </div>
          <p className="text-[11px] text-slate-300">
            No signup or password required. Jump straight into the developer console and generate active API keys.
          </p>
          <button
            onClick={handleDemo}
            type="button"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/25 active:scale-[0.99]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Launch Developer Console Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-2xl backdrop-blur-md">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
                setShowAutoSwitch(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                !isSignUp ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
                setShowAutoSwitch(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                isSignUp ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Developer Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@domain.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-slate-600"
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
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Error & Smart Resolution Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>

                {/* 1-Click Smart Resolution Action */}
                {showAutoSwitch === "to_signup" && (
                  <button
                    type="button"
                    onClick={handleAutoCreateAccount}
                    className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create New Account with This Email &amp; Password</span>
                  </button>
                )}

                {showAutoSwitch === "to_signin" && (
                  <button
                    type="button"
                    onClick={handleAutoSignIn}
                    className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with This Password</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isSignUp ? "Create Developer Account" : "Sign In to Console"}</span>
              )}
            </button>
          </form>

          {/* Social OAuth */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            type="button"
            className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/60 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
