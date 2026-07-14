import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PROGRAMS, getProgram, PROGRAM_STRUCTURE, JOURNEY_ARC, type ProgramSlug } from "@/data/programs";
import { IN_PERSON, IN_PERSON_SATURDAY_SCHEDULE, ONLINE } from "@/data/locations";
import { breadcrumbSchema, courseSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import ProgramLocationSelector from "@/components/ProgramLocationSelector";
import JourneyMap from "@/components/JourneyMap";
import FAQAccordion from "@/components/FAQAccordion";
import Breadcrumbs from "@/components/Breadcrumbs";

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
    title: `${program.level} (${program.gradeBand}) | ${program.codingSpace}`,
    description: `${program.level} — ${program.gradeBand}. ${program.outcome} ${PROGRAM_STRUCTURE.semesters} semesters, ~${PROGRAM_STRUCTURE.sessionsApprox} sessions, project-based. In-person in Toronto, Vaughan, Oshawa, Calgary & Vancouver, or online.`,
    path: `/programs/${program.slug}`,
    image: PROGRAM_OG_IMAGE[program.slug],
    imageAlt: `${program.level} — CODEship Academy`,
  });
}

const WEEK_STRUCTURE = [
  {
    step: "Warm-up",
    desc: "A quick activity that reviews last session's ideas and gets everyone thinking in code.",
  },
  {
    step: "Teach",
    desc: "Instructors introduce the session's concept through a short, hands-on demonstration.",
  },
  {
    step: "Build",
    desc: "The bulk of class time — students apply what they've learned to their own project, with instructor support.",
  },
  {
    step: "Reflect",
    desc: "Students share progress, get warm feedback, and set a goal for next session.",
  },
];

const ALIGNMENT_COPY: Record<string, string> = {
  explorers:
    "Explorers' K–1 curriculum is designed to support Ontario's early digital literacy expectations and maps to the foundational strand of BC's Applied Design, Skills & Technologies (ADST) curriculum.",
  builders:
    "Builders' Grades 2–3 curriculum is designed to support Ontario's coding expectations and aligns with BC's ADST curriculum and Alberta's Computer Science outcomes for the primary grades.",
  developers:
    "Developers' Grades 4–5 curriculum maps to Ontario's coding and financial literacy expectations and aligns with Alberta's Computer Science and CTF outcomes.",
  engineers:
    "Engineers' Grades 6–8 curriculum supports Ontario's coding and AI literacy expectations, maps to Alberta's Computer Science and CTF outcomes, and aligns with Québec's Cadre de référence de la compétence numérique (available in French).",
};

function programFaqs(program: ReturnType<typeof getProgram>) {
  if (!program) return [];
  const online = ONLINE[program.slug];
  return [
    {
      question: `Is ${program.level} the right fit for my child?`,
      answer: `${program.level} is built for ${program.gradeBand}. No prior coding experience is needed.`,
    },
    {
      question: "Does my child need coding experience already?",
      answer: "No. Every class starts from the basics and includes inclusive-design accommodations.",
    },
    {
      question: "How long is the program?",
      answer: `${PROGRAM_STRUCTURE.semesters} semesters, about ${PROGRAM_STRUCTURE.sessionsApprox} sessions total, plus a capstone project.`,
    },
    {
      question: "Where and when does it run?",
      answer: `In-person Saturdays in ${IN_PERSON.join(", ")}, or online ${online.day}s, ${online.window}.`,
    },
  ];
}

export default function ProgramPage({ params }: Props) {
  const program = getProgram(params.slug);
  if (!program) notFound();

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(programFaqs(program))) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Programs", href: "/programs" },
              { name: program.level, href: `/programs/${program.slug}` },
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
                { name: "Programs", href: "/programs" },
                { name: program.level, href: `/programs/${program.slug}` },
              ]}
            />
            <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-2">
              {JOURNEY_ARC[program.slug]} · The CODEship Journey
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{program.level}</h1>
            <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">{program.summary}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">{program.gradeBand}</span>
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">{program.codingSpace}</span>
              <span className="bg-[#E5A823] text-[#001532] px-3 py-1.5 rounded-full text-sm font-bold">
                {PROGRAM_STRUCTURE.semesters} semesters + capstone
              </span>
            </div>
            <p className="text-white font-semibold text-lg mt-6 max-w-2xl">{program.outcome}</p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-14">
              {/* Semester breakdown */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-1">Semester by Semester</h2>
                <p className="text-gray-500 text-sm mb-6">
                  {PROGRAM_STRUCTURE.semesters} semesters, ~{PROGRAM_STRUCTURE.sessionsApprox} sessions total, each building toward the capstone.
                </p>
                <div className="space-y-4">
                  {program.semesters.map((sem) => (
                    <div key={sem.number} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 border-l-4" style={{ borderLeftColor: program.accentColour }}>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: program.accentColour }}
                        >
                          {sem.number}
                        </span>
                        <h3 className="font-bold text-[#001532]">{sem.project}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{sem.bigIdea}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sem.learn.map((skill) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Capstone */}
                  <div className="bg-[#001532] rounded-xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E5A823] text-[#001532] font-bold text-xs shrink-0">
                        ★
                      </span>
                      <h3 className="font-bold">Capstone: {program.capstone.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">{program.capstone.description}</p>
                  </div>
                </div>
              </div>

              {/* A week in the program */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-6">A Week in {program.level}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {WEEK_STRUCTURE.map((w, i) => (
                    <div key={w.step} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <span className="text-xs font-bold text-[#E5A823] uppercase tracking-widest">Step {i + 1}</span>
                      <h3 className="font-bold text-[#001532] mt-1 mb-1.5">{w.step}</h3>
                      <p className="text-gray-600 text-sm">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Assessment</h2>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
                  <p className="text-gray-600 text-sm">
                    <strong className="text-[#001532]">
                      {PROGRAM_STRUCTURE.quizzesPerSemester} quizzes per semester ({PROGRAM_STRUCTURE.quizzes} total)
                    </strong>{" "}
                    check understanding of key concepts along the way.
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong className="text-[#001532]">A project rubric</strong> evaluates each semester&apos;s build —
                    not just whether it works, but the thinking behind it.
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong className="text-[#001532]">Warm, specific feedback</strong> from instructors after every
                    project, focused on growth and encouragement.
                  </p>
                </div>
              </div>

              {/* Accommodations */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Accommodations</h2>
                <div className="bg-[#138A9A]/10 rounded-xl p-6 border border-[#138A9A]/20">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Inclusive-design accommodations are built into every {program.level} class — flexible pacing,
                    multiple ways to show understanding, and support for a range of learning styles and needs. Let us
                    know about any specific accommodations your child needs, and our team will work with you before
                    the first session.
                  </p>
                </div>
              </div>

              {/* Alignment note */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Curriculum Alignment</h2>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed">{ALIGNMENT_COPY[program.slug]}</p>
                  <p className="text-gray-400 text-xs mt-3">
                    Not endorsed or approved by any ministry of education.
                  </p>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Common Questions</h2>
                <FAQAccordion faqs={programFaqs(program)} />
              </div>
            </div>

            {/* Sidebar: location & schedule selector */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <Suspense fallback={<div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 h-96" aria-hidden="true" />}>
                  <ProgramLocationSelector program={program} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        {/* Journey context */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <JourneyMap currentSlug={program.slug} />
          </div>
        </section>
      </div>
    </>
  );
}
