import type { Metadata } from "next";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import { pageMetadata } from "@/lib/pageMetadata";
import { LOCATIONS } from "@/data/locations";

// Reading searchParams makes this route dynamic; Cloudflare Pages (next-on-pages)
// requires an explicit edge runtime for any non-static route.
export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Join the In-Person Waitlist | CODEship Academy",
  description:
    "In-person CODEship classes are coming to more cities across Canada. Join the waitlist to be first in line when a local cohort opens — or register online today.",
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
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-[#E5A823] text-[#001532] px-3 py-1 rounded-full mb-4">
            In-Person: Waitlist
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {city ? `Join the ${city} In-Person Waitlist` : "Join the In-Person Waitlist"}
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            {city
              ? `We're building in-person classes in ${city}. Add your family to the waitlist and we'll reach out the moment a local cohort is scheduled.`
              : "We're building in-person classes in more cities across Canada. Add your family to the waitlist and we'll reach out the moment a local cohort is scheduled."}
          </p>
          <p className="text-gray-400 text-base max-w-2xl mx-auto mt-4">
            Don&apos;t want to wait? Live online classes are open to your family today — same programs, same flat CAD
            $129/semester.{" "}
            <Link href="/register" className="text-[#E5A823] font-semibold underline">
              Register online now
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#001532] mb-2 text-center">
              {city ? `${city} In-Person Waitlist` : "In-Person Waitlist"}
            </h2>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Joining the waitlist doesn&apos;t enrol your child or charge you anything — it simply reserves your place
              in line for in-person classes.
            </p>
            <RegistrationForm />
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Prefer to start now?{" "}
            <Link href="/register" className="text-[#138A9A] font-semibold underline">
              Register for online classes
            </Link>{" "}
            — open to every city.
          </p>
        </div>
      </section>
    </div>
  );
}
