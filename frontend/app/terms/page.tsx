export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for LUMORA Writing Intelligence platform and developer APIs."
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Terms of Service
        </h1>
        <p className="text-zinc-400 text-sm">
          Last updated: September 2026 • Version 1.0
        </p>
      </div>

      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed border-t border-zinc-900 pt-8">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Nature of the Service & Probabilistic Disclaimer</h2>
          <p className="text-zinc-400 mb-3">
            LUMORA provides probabilistic statistical assessments of writing style, vocabulary diversity, and syntactic patterns. <strong>Detection results do not constitute deterministic or legal proof of human or artificial intelligence authorship.</strong> You agree not to rely solely on LUMORA scores for punitive academic disciplinary actions or legal determinations without independent human review.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Acceptable Use Policy</h2>
          <p className="text-zinc-400 mb-3">
            You agree not to use LUMORA APIs or services to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>Generate abusive, deceptive, or defamatory materials;</li>
            <li>Circumvent or attempt to bypass rate limits, quotas, or authentication controls;</li>
            <li>Conduct denial-of-service attacks or subject infrastructure to disproportionate load;</li>
            <li>Probe, scan, or test the vulnerability of our systems without authorization.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. API Keys & Account Responsibility</h2>
          <p className="text-zinc-400 mb-3">
            Developers are responsible for maintaining the confidentiality of their generated API keys. You must immediately revoke any key that has been compromised or inadvertently exposed in client-side bundles or public repositories.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Service Availability & Modifications</h2>
          <p className="text-zinc-400 mb-3">
            We strive for 99.9% uptime across our API gateway and inference services. However, services are provided &quot;as is&quot; without warranties of uninterrupted availability. Routine maintenance windows and status updates are published on our public <a href="/status" className="text-violet-400 hover:underline">Status Page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
