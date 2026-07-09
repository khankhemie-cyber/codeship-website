import type { Metadata } from "next";

export const BASE_URL = "https://www.codeshipacademy.com";
export const DEFAULT_OG_IMAGE = "/logo-banner.png";

interface PageMetadataArgs {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/programs/explorers" (no trailing slash needed). */
  path: string;
  /** Site-relative image path or absolute URL. Defaults to the CODEship banner. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** RFC 3339 date string — only meaningful when type is "article". */
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

/**
 * Every page must emit its own self-referential og:title/description/url +
 * twitter:*, rather than inheriting the root layout's homepage-only
 * defaults (Next.js does not deep-merge `openGraph` between layout and
 * page — a page that omits it entirely inherits the parent's verbatim).
 * Centralizing this guarantees every page stays correct and consistent.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
}: PageMetadataArgs): Metadata {
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type,
      locale: "en_CA",
      url,
      siteName: "CODEship Academy",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt ?? title }],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
