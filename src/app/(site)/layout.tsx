import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { organizationSchema } from "@/lib/schema";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Sitewide Organization schema — every main-site page, not just home. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />
      <Navigation />
      <main className="pt-[76px] lg:pt-24">{children}</main>
      <Footer />
    </>
  );
}
