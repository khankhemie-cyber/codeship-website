import type { Metadata } from "next";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import { PageHero, Section } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { LOCATIONS } from "@/data/locations";

// Reading searchParams makes this route dynamic; Cloudflare Pages (next-on-pages)
// requires an explicit edge runtime for any non-static route.
export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Join the In-Person Waitlist | CODEship Academy",
  description: "Join the waitlist for in-person CODEship classes in your city. Online classes are open now.",
  path: "/waitlist",
  // Lead-capture page; keep it out of the sitemap and search index.
  noindex: true,
});

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

/** Resolve a clean, display-safe city name from the query string (must match a real location). */
function resolveCity(searchParams: Props["searchParams"]): string | null {
  const raw = typeof searchParams.city === "string" ? searchParams.city : undefined;
  if (!raw) return null;
  const match = LOCATIONS.find((l) => l.name.toLowerCase() === raw.toLowerCase());
  return match ? match.name : null;
}

export default function WaitlistPage({ searchParams }: Props) {
  const city = resolveCity(searchParams);

  return (
    <>
      <PageHero
        eyebrow="In-person waitlist"
        title={city ? `Join the ${city} waitlist` : "Join the in-person waitlist"}
        lead="We will contact you when a local class opens. Joining is free."
      >
        <p className="text-lg text-gray-200">
          Want to start now?{" "}
          <Link href="/register" className="font-bold text-[#F4D734] underline underline-offset-2">
            Book online classes
          </Link>
        </p>
      </PageHero>

      <Section narrow>
        <div className="bg-white shadow-sm p-6 sm:p-8">
          <RegistrationForm />
        </div>
      </Section>
    </>
  );
}
