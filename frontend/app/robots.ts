import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/detect", "/humanize", "/api", "/docs", "/privacy", "/terms", "/status"],
        disallow: ["/dashboard", "/dashboard/*", "/api/*"]
      }
    ],
    sitemap: "https://lumora.ai/sitemap.xml"
  };
}
