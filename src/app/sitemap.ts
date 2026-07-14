import { MetadataRoute } from "next";
import { articles } from "@/data/articles";
import { PROGRAMS } from "@/data/programs";
import { GUYANA_CAMPAIGNS } from "@/data/guyanaCampaigns";

const cities = [
  "oshawa", "toronto", "mississauga", "brampton", "markham",
  "scarborough", "vaughan", "milton", "calgary", "edmonton", "vancouver", "surrey",
];

const BASE_URL = "https://www.codeshipacademy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/programs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/programs/weekly-classes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/programs/camps`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/programs/school-workshops`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/programs/birthday-parties`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/programs/ai-robotics`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...PROGRAMS.map((p) => ({
      url: `${BASE_URL}/programs/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/schools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/franchise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/franchise/mobile-model`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/franchise/studio-model`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/franchise/regional-model`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/locations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/program-finder`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE_URL}/franchise-selector`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/policies/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politiques/remboursement`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/resources/${a.slug}`,
    lastModified: new Date(a.dateModified ?? a.publishDate),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  const locationPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/locations/${city}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Guyana online-course landing pages are SEO-indexed (unlike /lp/*, which
  // is pure paid traffic and intentionally excluded from this sitemap).
  const guyanaPages: MetadataRoute.Sitemap = GUYANA_CAMPAIGNS.map((c) => ({
    url: `${BASE_URL}/gy/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages, ...locationPages, ...guyanaPages];
}
