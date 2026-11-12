import LPHeader from "@/components/lp/LPHeader";
import SkipLink from "@/components/SkipLink";

/**
 * Guyana landing pages are single-purpose, like /lp/*: this layout
 * replaces (does not extend) the main site chrome. LPHeader is reused
 * as-is (logo → home only, no LP-specific content). Never linked from the
 * main site's Navigation/Footer.
 */
export default function GuyanaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <LPHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">{children}</main>
    </>
  );
}
