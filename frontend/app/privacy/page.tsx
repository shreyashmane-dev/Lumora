import { Shield, Lock, EyeOff, Server, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "LUMORA Privacy Commitment: transient processing by default, zero text retention, and zero model training on customer text."
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-4">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Privacy & Security Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-zinc-400 text-sm">
          Last updated: September 2026 • Effective version 1.0
        </p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col">
          <Lock className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Transient Processing</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Text submitted for detection or rewriting is processed in-memory and discarded immediately upon response completion.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col">
          <EyeOff className="w-6 h-6 text-violet-400 mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Zero Text Retention</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We never store submitted documents, customer paragraphs, or generated rewrites in databases or persistent logs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col">
          <Server className="w-6 h-6 text-indigo-400 mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No Model Training</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your text is never used to train, evaluate, or fine-tune machine learning models or commercial LLMs.
          </p>
        </div>
      </div>

      {/* Detailed Content */}
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed border-t border-zinc-900 pt-8">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Data Minimization & Text Handling</h2>
          <p className="text-zinc-400 mb-3">
            LUMORA is built strictly as a privacy-conscious utility. When you send text to <code className="text-zinc-200 font-mono">/v1/detect</code>, <code className="text-zinc-200 font-mono">/v1/humanize</code>, or <code className="text-zinc-200 font-mono">/v1/analyze</code>, the payload is held in volatile memory only for the duration of the HTTP transaction. Our server logs record timestamp, response latency, and request IDs—never the text content or document body.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Developer Accounts & API Keys</h2>
          <p className="text-zinc-400 mb-3">
            When developers create an account through the Developer Portal, we store minimal account metadata (e.g., email address, user ID). API keys generated through the platform are immediately hashed using cryptographic SHA-256 before storage. Raw secrets are shown once to the creator and are unrecoverable thereafter.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Encryption & Transport Security</h2>
          <p className="text-zinc-400 mb-3">
            All network communication with LUMORA endpoints is enforced via Transport Layer Security (TLS 1.3) with strict HTTP Strict Transport Security (HSTS) headers. Requests over unencrypted HTTP are systematically rejected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Subprocessors</h2>
          <p className="text-zinc-400 mb-3">
            LUMORA utilizes trusted cloud infrastructure providers including Render (application hosting) and Firebase (developer identity authentication). Each infrastructure vendor complies with SOC 2 Type II and GDPR standards.
          </p>
        </section>
      </div>
    </div>
  );
}
