import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import { pageMetadata } from "@/lib/pageMetadata";
import { PROGRAM_LINKS, PROGRAM_ORDER, ageLabel, isProgramLevel } from "@/lib/payment-links";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL, SEMESTER_WEEKS } from "@/config/offering";

// Reading searchParams makes this route dynamic; Cloudflare Pages (next-on-pages)
// requires an explicit edge runtime for any non-static route.
export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Register | CODEship Academy",
  description:
    "Register your child for CODEship Academy coding, AI, and STEM programs. Canadian programs checkout securely with Stripe; Guyana and Trinidad and Tobago registrations use the website form.",
  path: "/register",
});

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Canadian (CAD) program registrations checkout via Stripe on the per-program
 * pages (/register/[program]). Old "Register" links and bookmarks point here
 * with ?program=&location=; if the program resolves, forward to its Stripe
 * registration page.
 *
 * Guyana registrations (?country=guyana, built by buildGuyanaRegistrationUrl)
 * and Trinidad and Tobago registrations (?country=trinidad-tobago, built by
 * buildTrinidadRegistrationUrl) stay on the existing HubSpot lead-capture
 * form embedded below.
 */
export default function RegisterPage({ searchParams }: Props) {
  const programParam = typeof searchParams.program === "string" ? searchParams.program : undefined;

  if (programParam && isProgramLevel(programParam)) {
    redirect(`/register/${programParam}`);
  }

  const isGuyana = searchParams.country === "guyana";
  const isTrinidad = searchParams.country === "trinidad-tobago";

  if (isTrinidad) {
    return (
      <div className="bg-[#FAF8F4]">
        <section className="bg-[#001532] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Register for Trinidad and Tobago Online Classes
            </h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Complete the form below and a member of the CODEship Academy team will contact you to confirm your
              child&apos;s class placement, schedule and next steps.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#001532] mb-6 text-center">Online Programme Registration</h2>
              <RegistrationForm />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (isGuyana) {
    return (
      <div className="bg-[#FAF8F4]">
        <section className="bg-[#001532] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Register Now</h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Complete the form below and a member of our team will be in touch to confirm your spot and answer any
              questions.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#001532] mb-6 text-center">Program Registration</h2>
              <RegistrationForm />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Register for a program</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Choose your child&apos;s level below to see the course details and secure their spot. Every program is a
            flat {PRICE_LABEL} for {SEMESTER_SHAPE_LABEL} — one class a week for {SEMESTER_WEEKS} weeks, in-person in
            Oshawa or online anywhere.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROGRAM_ORDER.map((level) => {
              const config = PROGRAM_LINKS[level];
              return (
                <Link
                  key={level}
                  href={`/register/${level}`}
                  className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h2 className="text-xl font-bold text-[#001532]">{config.label}</h2>
                    <span className="text-xs bg-[#E5A823]/20 text-[#001532] font-semibold px-2 py-0.5 rounded whitespace-nowrap">
                      {ageLabel(level, false)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{config.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#001532]">CAD ${config.priceCad}/semester</span>
                    <span className="text-[#E5A823] font-semibold text-sm">Details &amp; register →</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
            Looking for camps, school workshops, or a location near you?{" "}
            <Link href="/programs" className="text-[#138A9A] font-semibold underline">
              See all programs
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
