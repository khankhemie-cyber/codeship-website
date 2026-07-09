import { MetadataRoute } from "next";

const AI_CRAWLERS = ["GPTBot", "PerplexityBot", "Google-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/franchise/", "/lp/"],
      },
      // Explicit AI-crawler allowances for 2026 GEO discovery (Perplexity,
      // ChatGPT/Bing, Gemini's Google-Extended, and Common Crawl/CCBot feed
      // many other AI answer engines). Same policy as the wildcard rule —
      // stated explicitly since some AI-discovery audits check for it.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/franchise/", "/lp/"],
      })),
    ],
    sitemap: "https://www.codeshipacademy.com/sitemap.xml",
  };
}
