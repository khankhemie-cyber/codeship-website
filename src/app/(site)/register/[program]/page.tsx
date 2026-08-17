import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/EnrollButton";
import ClassScheduleCard from "@/components/ClassScheduleCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata, BASE_URL } from "@/lib/pageMetadata";
import { PROGRAM_LINKS, PROGRAM_ORDER, ageLabel, isProgramLevel } from "@/lib/payment-links";
import { SEMESTER_SHAPE_LABEL, SEMESTER_WEEKS } from "@/config/offering";

interface Props {
  params: { program: string };
}

export function generateStaticParams() {
  return PROGRAM_ORDER.map((program) => ({ program }));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isProgramLevel(params.program)) return {};
  const c = PROGRAM_LINKS[params.program];
  return pageMetadata({
    title: `${c.label} — Kids Coding Registration (${ageLabel(params.program, false)}) | CODEship Academy`,
    description: `${c.summary} Register for the ${c.label} program — CAD $${c.priceCad}/semester. ${c.techEn}.`,
    path: `/register/${params.program}`,
  });
}

const INCLUDED = [
  "Live, small-group classes with a dedicated instructor",
  "Weekly, project-based lessons your child keeps and shares",
  "Progress updates for families every step of the way",
  "Inclusive, neurodiverse-friendly classrooms",
];

export default function ProgramRegisterPage({ params }: Props) {
  if (!isProgramLevel(params.program)) notFound();
  const program = params.program;
  const c = PROGRAM_LINKS[program];

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${c.label} — Kids Coding Program`,
    description: c.summary,
    provider: { "@type": "EducationalOrganization", name: "CODEship Academy", sameAs: BASE_URL },
    offers: {
      "@type": "Offer",
      price: c.priceCad,
      priceCurrency: "CAD",
      category: "Tuition per semester",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/register/${program}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Register", href: "/register" },
              { name: c.label, href: `/register/${program}` },
            ])
          ),
        }}
      />

      <div className="bg-[#FAF8F4]">
        {/* Header */}
        <section className="bg-[#001532] py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              className="mb-4"
              items={[
                { name: "Home", href: "/" },
                { name: "Register", href: "/register" },
                { name: c.label, href: `/register/${program}` },
              ]}
            />
            <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-2">Registration</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{c.label}</h1>
            <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">{c.summary}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {ageLabel(program, false)}
              </span>
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">{c.techEn}</span>
              <span className="bg-[#E5A823] text-[#001532] px-3 py-1.5 rounded-full text-sm font-bold">
                CAD ${c.priceCad}/semester
              </span>
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {SEMESTER_SHAPE_LABEL} · in-person in Oshawa or online
              </span>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Outcomes */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">What your child will learn</h2>
                <ul className="space-y-3">
                  {c.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3 text-gray-700">
                      <svg
                        className="w-5 h-5 text-[#138A9A] shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Class dates & times — both formats, always visible */}
              <ClassScheduleCard program={program} />

              {/* Technologies & projects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#001532] mb-2">Technologies</h3>
                  <p className="text-gray-600 text-sm">{c.techEn}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#001532] mb-2">Projects they&apos;ll build</h3>
                  <p className="text-gray-600 text-sm">{c.projectsEn}</p>
                </div>
              </div>

              {/* Included */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Included with every semester</h2>
                <ul className="space-y-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-2 h-2 bg-[#138A9A] rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full curriculum link */}
              <div className="bg-[#138A9A]/10 rounded-xl p-6 border border-[#138A9A]/20">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Want the full semester-by-semester breakdown, schedule, and curriculum alignment for {c.label}?{" "}
                  <Link href={`/programs/${program}`} className="font-semibold text-[#138A9A] underline">
                    See the complete {c.label} curriculum →
                  </Link>
                </p>
              </div>
            </div>

            {/* Sidebar: sticky registration card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
                  <p className="text-gray-500 text-sm mb-1">{ageLabel(program, false)}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-extrabold text-[#001532]">CAD ${c.priceCad}</span>
                    <span className="text-gray-500 text-sm">/ semester</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{SEMESTER_SHAPE_LABEL} — one class a week for {SEMESTER_WEEKS} weeks.</p>
                  <p className="text-gray-500 text-sm mb-5">Secure checkout powered by Stripe.</p>
                  <EnrollButton program={program} label={`Register for ${c.label}`} />
                  <p className="text-gray-400 text-xs mt-3 text-center">
                    You&apos;ll add your child&apos;s details at checkout. This link registers your child for the
                    Oshawa in-person or online {c.label} semester.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other programs */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-[#001532] mb-4">Explore other levels</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROGRAM_ORDER.filter((level) => level !== program).map((level) => (
                <Link
                  key={level}
                  href={`/register/${level}`}
                  className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
                >
                  <span className="block font-bold text-[#001532] text-sm">{PROGRAM_LINKS[level].label}</span>
                  <span className="block text-gray-500 text-xs mt-1">{ageLabel(level, false)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
