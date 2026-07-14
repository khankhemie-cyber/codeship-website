import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getProgram } from "@/data/programs";
import { getCorsizioUrl } from "@/config/corsizioEvents";
import { pageMetadata } from "@/lib/pageMetadata";

// Reading searchParams makes this route dynamic; Cloudflare Pages (next-on-pages)
// requires an explicit edge runtime for any non-static route.
export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Register | CODEship Academy",
  description:
    "Register your child for CODEship Academy coding, AI, and STEM programs. Registration and payment are handled by Corsizio.",
  path: "/register",
});

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Registration and payment now happen on Corsizio, not this site. Old
 * "Register" links and bookmarks point here with ?program=&location=; if
 * that combination resolves to a live Corsizio event, forward straight to
 * it (carrying any utm_* through for attribution). Otherwise, show a
 * fallback so visitors aren't dropped on a dead end.
 */
export default function RegisterPage({ searchParams }: Props) {
  const programParam = typeof searchParams.program === "string" ? searchParams.program : undefined;
  const locationParam = typeof searchParams.location === "string" ? searchParams.location : undefined;
  const program = programParam ? getProgram(programParam) : undefined;

  if (program && locationParam) {
    const baseUrl = getCorsizioUrl(program.slug, locationParam);
    if (baseUrl) {
      const url = new URL(baseUrl);
      for (const [key, value] of Object.entries(searchParams)) {
        if (key.startsWith("utm_") && typeof value === "string") url.searchParams.set(key, value);
      }
      redirect(url.toString());
    }
  }

  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Registration opening soon</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            We couldn&apos;t find that program and location. Pick a program below to see availability and register.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/programs"
            className="inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors"
          >
            See Programs
          </Link>
        </div>
      </section>
    </div>
  );
}
