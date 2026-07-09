import LPHeader from "@/components/lp/LPHeader";

/**
 * Paid-ad landing pages are single-purpose and never linked from the main
 * site's nav or footer — this layout replaces (does not extend) the main
 * site chrome. LPHeader is logo-to-home only; each page renders its own
 * LPFooter (language-aware) at the end of its content.
 */
export default function LPLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LPHeader />
      <main>{children}</main>
    </>
  );
}
