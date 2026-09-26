import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lumora.ai";
  const routes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/detect", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/humanize", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/api", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/docs", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/status", priority: 0.7, changeFrequency: "hourly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" as const }
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority
  }));
}
