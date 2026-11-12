import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import { organizationSchema } from "@/lib/schema";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Sitewide Organization schema, every main-site page, not just home. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />
      <SkipLink />
      <Navigation />
      <main id="main" tabIndex={-1} className="pt-[76px] lg:pt-24 focus:outline-none">{children}</main>
      <Footer />
    </>
  );
}
