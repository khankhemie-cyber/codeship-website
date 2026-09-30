import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import { pageMetadata } from "@/lib/pageMetadata";
import { PROGRAM_LINKS, PROGRAM_ORDER, ageLabel, isProgramLevel } from "@/lib/payment-links";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";
import { PageHero, Section } from "@/components/ui/Page";
import { CLASS_SCHEDULE, startsSummary } from "@/config/classSchedule";
import { IN_PERSON_VENUE } from "@/data/locations";

// Reading searchParams makes this route dynamic; Cloudflare Pages (next-on-pages)
// requires an explicit edge runtime for any non-static route.
export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Book a Kids Coding Class | CODEship Academy",
  description:
    "Book a CODEship coding class for K–Grade 8. Saturdays at Core21 in Oshawa or live online. CAD $129 for 8 weekly classes.",
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
    <>
      <PageHero
        eyebrow="Book a class"
        title="Choose your child's level"
        lead={`${PRICE_LABEL} per semester · ${SEMESTER_SHAPE_LABEL}. Pick in person or online at checkout.`}
      />
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROGRAM_ORDER.map((level) => {
            const config = PROGRAM_LINKS[level];
            const sched = CLASS_SCHEDULE[level];
            return (
              <Link
                key={level}
                href={`/register/${level}`}
                className="group block bg-white rounded-2xl p-7 shadow-sm border border-gray-200 hover:border-[#F4D734] hover:shadow-lg transition-all"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{ageLabel(level, false)}</p>
                <h2 className="text-2xl font-extrabold text-[#001532] mt-1">{config.label}</h2>
                <p className="text-lg text-gray-600 mt-2">{config.summary}</p>
                <dl className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                  <div>
                    <dt className="text-sm text-gray-500">In person · {IN_PERSON_VENUE.building}, Oshawa</dt>
                    <dd className="text-base font-semibold text-[#001532]">
                      {sched.inperson.days}, {sched.inperson.time.replace(" ET", "")} · {startsSummary(sched.inperson)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Online</dt>
                    <dd className="text-base font-semibold text-[#001532]">
                      {sched.online.days}, {sched.online.time} · {startsSummary(sched.online)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-6 text-lg font-bold text-[#001532] group-hover:text-[#138A9A]">Book {config.label} →</p>
              </Link>
            );
          })}
        </div>
        <p className="text-lg text-gray-600 mt-10 text-center">
          Not sure which level?{" "}
          <Link href="/program-finder" className="font-semibold text-[#0f6f7c] underline underline-offset-2">
            Take the quick quiz
          </Link>
        </p>
      </Section>
    </>
  );
}
