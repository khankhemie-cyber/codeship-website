import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/franchise/",
    },
    sitemap: "https://www.codeshipacademy.com/sitemap.xml",
  };
}
