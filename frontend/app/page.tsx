import Link from "next/link";
import { Sparkles, Shield, Terminal, ArrowRight, CheckCircle2, Zap, RefreshCw, BarChart2, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Probabilistic Writing Intelligence • No Login Required</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1]">
          Understand the text. <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            Rewrite it naturally.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          LUMORA evaluates writing with calibrated probabilistic signals instead of false certainty, 
          and rewrites machine-generated prose with visible change tracking and meaning preservation.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/detect"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-base shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            <span>Launch Detector</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            href="/humanize"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 font-medium text-base transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5 text-violet-400" />
            <span>Try Humanizer</span>
          </Link>
          <Link
            href="/api"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-zinc-400 hover:text-zinc-200 font-medium text-base transition-all flex items-center justify-center gap-1.5"
          >
            <Terminal className="w-4 h-4" />
            <span>Developer API</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-10 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No Signup Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Zero Text Retention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>&lt;100ms Inference</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-violet-400" />
            <span>Calibrated Uncertainty</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-violet-400 font-mono mb-3">Core Pillars</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Scientific rigor, not arbitrary percentages.
          </p>
          <p className="mt-4 text-zinc-400 text-base">
            Conventional tools claim 100% certainty where none exists. LUMORA provides calibrated stylometrics, transparent confidence scores, and visible rewrite diffs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 flex flex-col hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Probabilistic Detector</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
              Evaluates burstiness, perplexity proxy, lexical diversity, and sentence length variance. Communicates calibrated uncertainty instead of accusing writers without proof.
            </p>
            <Link
              href="/detect"
              className="text-sm font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1"
            >
              Test Text Detector <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 flex flex-col hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Natural Humanizer</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
              Rewrites machine clichés into organic prose across 7 targeted styles. Preserves core propositional facts and outputs a word-for-word comparison diff.
            </p>
            <Link
              href="/humanize"
              className="text-sm font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1"
            >
              Explore Humanizer <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 flex flex-col hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">High-Performance API</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
              Integrate detection and humanization directly into your applications. Fast response times, hashed key security, tiered rate limits, and an interactive developer playground.
            </p>
            <Link
              href="/api"
              className="text-sm font-medium text-violet-400 hover:text-violet-300 inline-flex items-center gap-1"
            >
              View API Documentation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 p-8 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-6">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy & Ethics First</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
              Why we never claim 100% authorship proof.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-6">
              AI text detection is inherently statistical. Non-native English speakers, formal academic papers, and edited drafts frequently trigger false positives in uncalibrated commercial detectors.
            </p>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8">
              At LUMORA, <strong className="text-zinc-200">uncertainty is a valid and transparent result</strong>. When stylometric signals are mixed or inconclusive, we explicitly communicate ambiguity rather than guessing. User text is processed transiently in memory and never stored or retained for model training.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/detect"
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
              >
                Analyze a Sample Now
              </Link>
              <Link
                href="/privacy"
                className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium text-sm transition-colors"
              >
                Read Privacy Commitment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
