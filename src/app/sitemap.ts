import { MetadataRoute } from "next";
import { articles } from "@/data/articles";
import { PROGRAMS } from "@/data/programs";
import { PROGRAM_ORDER } from "@/lib/payment-links";
import { GUYANA_CAMPAIGNS } from "@/data/guyanaCampaigns";
import { TRINIDAD_CAMPAIGNS } from "@/data/trinidadCampaigns";

const cities = [
  "oshawa", "toronto", "mississauga", "brampton", "markham",
  "scarborough", "vaughan", "milton", "calgary", "edmonton", "vancouver", "surrey",
];

const BASE_URL = "https://www.codeshipacademy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/programs`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/programs/camps`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/programs/birthday-parties`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/programs/ai-robotics`, changeFrequency: "monthly", priority: 0.8 },
    ...PROGRAMS.map((p) => ({
      url: `${BASE_URL}/programs/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.9 },
    ...PROGRAM_ORDER.map((level) => ({
      url: `${BASE_URL}/register/${level}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${BASE_URL}/schools`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/franchise`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/franchise/mobile-model`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/franchise/studio-model`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/franchise/regional-model`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/resources`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/locations`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/program-finder`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE_URL}/franchise-selector`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/policies/refund`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politiques/remboursement`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/resources/${a.slug}`,
    lastModified: new Date(a.dateModified ?? a.publishDate),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  const locationPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/locations/${city}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Guyana online-course landing pages are SEO-indexed (unlike /lp/*, which
  // is pure paid traffic and intentionally excluded from this sitemap).
  const guyanaPages: MetadataRoute.Sitemap = GUYANA_CAMPAIGNS.map((c) => ({
    url: `${BASE_URL}/gy/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Trinidad and Tobago online program pages: SEO-indexed like /gy. The /tt
  // index plus the four grade-band program pages (Explorers/Builders/
  // Developers/Engineers). Clean routes only; the paid-only ?lead_submitted=1
  // and ?v= variants are deliberately excluded.
  const trinidadPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/tt`, changeFrequency: "monthly" as const, priority: 0.9 },
    ...TRINIDAD_CAMPAIGNS.map((c) => ({
      url: `${BASE_URL}/tt/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  // The site uses trailing slashes (next.config.mjs), so list the final URLs
  // rather than ones that redirect. Only articles carry a lastModified: they
  // have real edit dates, and a date that changes on every build tells search
  // engines nothing.
  return [...staticPages, ...articlePages, ...locationPages, ...guyanaPages, ...trinidadPages].map((entry) => ({
    ...entry,
    url: entry.url.endsWith("/") ? entry.url : `${entry.url}/`,
  }));
}
