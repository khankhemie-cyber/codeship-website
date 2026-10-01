import type { Metadata } from "next";

/**
 * Student tools (e.g. /tools/web-playground) are reached by direct link only:
 * this layout replaces (does not extend) the main site chrome, nothing in
 * Navigation/Footer links here, the routes are excluded from sitemap.ts,
 * disallowed in robots.ts, and marked noindex (here and in public/_headers).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
