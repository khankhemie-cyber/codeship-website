import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PROGRAMS, getProgram, PROGRAM_STRUCTURE, type ProgramSlug } from "@/data/programs";
import { IN_PERSON, IN_PERSON_SATURDAY_SCHEDULE, IN_PERSON_VENUE, ONLINE } from "@/data/locations";
import { breadcrumbSchema, courseSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import ProgramLocationSelector from "@/components/ProgramLocationSelector";
import ClassScheduleCard from "@/components/ClassScheduleCard";
import FAQAccordion from "@/components/FAQAccordion";
import Link from "next/link";
import { PageHero, Section, SectionHeader } from "@/components/ui/Page";
import { saturdayTime } from "@/lib/booking";
import { PRICE_LABEL } from "@/config/offering";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

const PROGRAM_OG_IMAGE: Record<ProgramSlug, string> = {
  explorers: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
  builders: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80",
  developers: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
  engineers: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = getProgram(params.slug);
  if (!program) return {};
  return pageMetadata({
    title: `${program.level} Coding Classes (${program.gradeBand}) — Oshawa & Online`,
    description: `${program.level} coding classes for ${program.gradeBand}. ${program.outcome} Saturdays at Core21 in Oshawa or online. CAD $129 per 8-week semester.`,
    path: `/programs/${program.slug}`,
    image: PROGRAM_OG_IMAGE[program.slug],
    imageAlt: `${program.level} — CODEship Academy`,
  });
}

const ALIGNMENT_COPY: Record<ProgramSlug, string> = {
  explorers: "It supports Ontario's early digital literacy expectations. It also maps to BC's ADST curriculum.",
  builders: "It supports Ontario's coding expectations. It also aligns with BC's ADST and Alberta's Computer Science outcomes.",
  developers: "It supports Ontario's coding and financial literacy expectations. It also aligns with Alberta's Computer Science outcomes.",
  engineers: "It supports Ontario's coding and AI literacy expectations. It also aligns with Alberta's Computer Science outcomes.",
};

function programFaqs(program: NonNullable<ReturnType<typeof getProgram>>) {
  const online = ONLINE[program.slug];
  return [
    {
      question: `Who is ${program.level} for?`,
      answer: `${program.level} is for children in ${program.gradeBand}. No coding experience is needed.`,
    },
    {
      question: "When and where are classes?",
      answer: `In person on Saturdays, ${saturdayTime(program.slug)}, at ${IN_PERSON_VENUE.full}. Online classes run ${online.day}s, ${online.window}.`,
    },
    {
      question: "How much does it cost?",
      answer: `${PRICE_LABEL} per semester. Each semester has 8 weekly classes.`,
    },
    {
      question: `How long is ${program.level}?`,
      answer: `The full level is ${PROGRAM_STRUCTURE.semesters} semesters plus a capstone project. You can book one semester at a time.`,
    },
    {
      question: "How is progress measured?",
      answer: `Short quizzes check key ideas. Each project gets clear, kind feedback from the instructor.`,
    },
    {
      question: "Can you support my child's learning needs?",
      answer: "Yes. Pacing is flexible and there are many ways to show learning. Tell us what your child needs before the first class.",
    },
    {
      question: "Does it follow the school curriculum?",
      answer: `${ALIGNMENT_COPY[program.slug]} It is not endorsed by any ministry of education.`,
    },
  ];
}

export default function ProgramPage({ params }: Props) {
  const program = getProgram(params.slug);
  if (!program) notFound();

  const index = PROGRAMS.findIndex((p) => p.slug === program.slug);
  const next = PROGRAMS[index + 1];
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Programs", href: "/programs" },
    { name: program.level, href: `/programs/${program.slug}` },
  ];
  const faqs = programFaqs(program);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            courseSchema(program, {
              inPersonCities: [...IN_PERSON],
              inPersonSchedule: IN_PERSON_SATURDAY_SCHEDULE[program.slug],
              online: ONLINE[program.slug],
            })
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <PageHero crumbs={crumbs} eyebrow={program.gradeBand} title={program.level} lead={program.summary}>
        <div className="flex flex-wrap gap-3">
          {[program.codingSpace, `Saturdays ${saturdayTime(program.slug)}`, `${PRICE_LABEL} / semester`].map((chip) => (
            <span key={chip} className="bg-white/10 text-white text-base font-semibold px-4 py-2 rounded-full">
              {chip}
            </span>
          ))}
        </div>
      </PageHero>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-16">
            {/* What they build */}
            <div>
              <SectionHeader eyebrow="The level" title="What your child will build" lead={program.outcome} />
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {program.semesters.map((sem) => (
                  <li
                    key={sem.number}
                    className="bg-white rounded-2xl p-6 border-l-4 shadow-sm"
                    style={{ borderLeftColor: program.accentColour }}
                  >
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Semester {sem.number}</p>
                    <h3 className="text-xl font-bold text-[#001532] mt-1">{sem.project}</h3>
                    <p className="text-base text-gray-600 mt-2">{sem.bigIdea}</p>
                  </li>
                ))}
                <li className="sm:col-span-2 bg-[#001532] rounded-2xl p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#E5A823]">Capstone</p>
                  <h3 className="text-xl font-bold mt-1">{program.capstone.title}</h3>
                  <p className="text-base text-gray-300 mt-2">{program.capstone.description}</p>
                </li>
              </ol>
            </div>

            <ClassScheduleCard program={program.slug} />

            <div>
              <SectionHeader title="Common questions" />
              <FAQAccordion faqs={faqs} />
            </div>

            {next && (
              <Link
                href={`/programs/${next.slug}`}
                className="block rounded-2xl bg-white border border-gray-200 p-6 hover:border-[#E5A823] hover:shadow-md transition-all"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Next level</p>
                <p className="text-2xl font-extrabold text-[#001532] mt-1">
                  {next.level} · {next.gradeBand} →
                </p>
              </Link>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <Suspense
                fallback={<div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 h-96" aria-hidden="true" />}
              >
                <ProgramLocationSelector program={program} />
              </Suspense>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
