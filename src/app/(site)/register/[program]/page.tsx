import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/EnrollButton";
import ClassScheduleCard from "@/components/ClassScheduleCard";
import { PageHero, Section, CheckList } from "@/components/ui/Page";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata, BASE_URL } from "@/lib/pageMetadata";
import { PROGRAM_LINKS, PROGRAM_ORDER, ageLabel, isProgramLevel } from "@/lib/payment-links";
import { SEMESTER_SHAPE_LABEL } from "@/config/offering";

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
    title: `Enroll in ${c.label} (${c.gradesEn}): Kids Coding | CODEship Academy`,
    description: `${c.summary} CAD $${c.priceCad} for 8 weekly classes. Saturdays at Core21 in Oshawa or online.`,
    path: `/register/${params.program}`,
  });
}

const INCLUDED = ["Small-group classes", "A dedicated instructor", "Projects your child keeps", "Progress updates for parents"];

export default function ProgramRegisterPage({ params }: Props) {
  if (!isProgramLevel(params.program)) notFound();
  const program = params.program;
  const c = PROGRAM_LINKS[program];

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Enroll", href: "/register" },
    { name: c.label, href: `/register/${program}` },
  ];

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${c.label}: Kids Coding Program`,
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
            breadcrumbSchema(crumbs)
          ),
        }}
      />

      <PageHero crumbs={crumbs} eyebrow={ageLabel(program, false)} title={`Enroll in ${c.label}`} lead={c.summary}>
        <div className="flex flex-wrap gap-3">
          {[c.techEn, `CAD $${c.priceCad} / semester`, SEMESTER_SHAPE_LABEL].map((chip) => (
            <span key={chip} className="bg-white/10 text-white text-base font-semibold px-4 py-2">
              {chip}
            </span>
          ))}
        </div>
      </PageHero>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-14">
            <div>
              <h2 className="text-3xl font-extrabold text-[#001532] mb-6">What your child will learn</h2>
              <CheckList items={c.outcomes} />
              <p className="text-lg text-gray-600 mt-6">
                Projects: {c.projectsEn}.{" "}
                <Link href={`/programs/${program}`} className="font-semibold text-[#0f6f7c] underline underline-offset-2">
                  See the full {c.label} curriculum
                </Link>
              </p>
            </div>

            <ClassScheduleCard program={program} />

            <div>
              <h2 className="text-2xl font-extrabold text-[#001532] mb-4">Other levels</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROGRAM_ORDER.filter((level) => level !== program).map((level) => (
                  <Link
                    key={level}
                    href={`/register/${level}`}
                    className="block bg-white p-5 border border-gray-200 hover:border-[#F4D734] hover:shadow-md transition-all"
                  >
                    <span className="block text-lg font-bold text-[#001532]">{PROGRAM_LINKS[level].label}</span>
                    <span className="block text-base text-gray-600 mt-1">{ageLabel(level, false)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 bg-white shadow-md border border-gray-100 p-6 sm:p-8">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#001532]">CAD ${c.priceCad}</span>
                <span className="text-base text-gray-600">/ semester</span>
              </div>
              <p className="text-base text-gray-600 mt-1 mb-6">{SEMESTER_SHAPE_LABEL}</p>
              <CheckList items={INCLUDED} />
              <div className="mt-6">
                <EnrollButton program={program} label={`Enroll in ${c.label}`} />
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Choose in person or online and your semester at checkout. Secure checkout with Stripe.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
