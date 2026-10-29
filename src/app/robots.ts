import { MetadataRoute } from "next";

const AI_CRAWLERS = [
  // OpenAI: training, ChatGPT search, and on-demand fetches for users
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  // Anthropic: training, Claude search, and on-demand fetches for users
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  // Perplexity, Google Gemini, Apple Intelligence, Microsoft Copilot (Bing), Common Crawl
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "bingbot", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/franchise/", "/lp/", "/tools/", "/workbooks/", "/quizzes/"],
      },
      // Explicit AI-crawler allowances for 2026 GEO discovery (ChatGPT,
      // Claude, Perplexity, Gemini's Google-Extended, Apple, Copilot via Bing,
      // and Common Crawl/CCBot, which feeds many other AI answer engines). Same policy as the wildcard rule
      // stated explicitly since some AI-discovery audits check for it.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/franchise/", "/lp/", "/tools/", "/workbooks/", "/quizzes/"],
      })),
    ],
    sitemap: "https://www.codeshipacademy.com/sitemap.xml",
  };
}
