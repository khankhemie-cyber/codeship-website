import LPHeader from "@/components/lp/LPHeader";

/**
 * Trinidad and Tobago landing pages are single-purpose, like /gy/* — this
 * layout replaces (does not extend) the main site chrome. LPHeader is reused
 * as-is (logo → home only, no LP-specific content). Never linked from the
 * main site's Navigation/Footer.
 */
export default function TrinidadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LPHeader />
      <main>{children}</main>
    </>
  );
}
