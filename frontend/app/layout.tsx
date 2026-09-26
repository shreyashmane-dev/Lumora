import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "LUMORA — AI Text Intelligence & Natural Rewriter",
    template: "%s | LUMORA"
  },
  description: "A secure, fast platform for probabilistic AI-writing analysis and natural semantic-preserving rewriting. Understand writing signals without false certainty.",
  keywords: [
    "AI text detector",
    "AI detection",
    "humanize AI text",
    "text rewriter",
    "writing intelligence",
    "burstiness",
    "perplexity",
    "API",
    "stylometrics"
  ],
  authors: [{ name: "LUMORA Team" }],
  openGraph: {
    title: "LUMORA — Probabilistic AI Writing Detection & Natural Rewriting",
    description: "Understand writing signals. Rewrite naturally with visible change tracking.",
    url: "https://lumora.ai",
    siteName: "LUMORA",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMORA — AI Writing Intelligence",
    description: "Probabilistic AI detection & natural humanizing."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="canonical" href="https://lumora.ai" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "LUMORA",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Privacy-conscious writing intelligence platform for probabilistic AI-text analysis and natural rewriting."
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
