import type { Metadata } from "next";

/**
 * Staff-only pages (e.g. /admin/certificates). Reached by direct link only: this
 * layout replaces the main site chrome, nothing links here, the routes are left
 * out of sitemap.ts, disallowed in robots.ts and marked noindex (here and in
 * public/_headers). Each page sits behind its own password check.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
