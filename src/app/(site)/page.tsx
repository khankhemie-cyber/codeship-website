import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import NewsletterForm from "@/components/NewsletterForm";
import ScrollReveal from "@/components/ScrollReveal";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import JourneyMap from "@/components/JourneyMap";
import AlignmentStrip from "@/components/AlignmentStrip";
import { websiteSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import { getVisitorGeo } from "@/lib/geo";
import ScrollRegisterPopup from "@/components/ScrollRegisterPopup";
import { PROGRAMS } from "@/data/programs";
import { IN_PERSON_VENUE, IN_PERSON_SATURDAY_SCHEDULE } from "@/data/locations";
import { CLASS_SCHEDULE, START_OPTIONS } from "@/config/classSchedule";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";

// Reading Cloudflare geo headers for the city callout opts this route into
// dynamic rendering; next-on-pages requires an explicit edge runtime for that.
export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding, AI & STEM — Oshawa & Online | CODEship Academy",
  description:
    "K–8 coding, AI & STEM for kids — in-person in Oshawa (Durham Region) and live online across Canada. Small-group, project-based, a great Saturdays at Core21, 21 Simcoe St South, Oshawa. Booking October & November semesters. Flat CAD $129/semester (8 weekly classes).",
  path: "/",
});

const homeFaqs = [
  {
    question: "Where are the in-person classes?",
    answer:
      "In-person Saturday classes are at 21 Simcoe St South, Oshawa, in the Core21 building. We serve families across Durham Region — Oshawa, Whitby, Courtice, Bowmanville, and Clarington.",
  },
  {
    question: "What are the Saturday class times?",
    answer:
      "Explorers (K–Grade 1) and Builders (Grades 2–3) run 9:00–10:00 AM. Developers (Grades 4–5) and Engineers (Grades 6–8) run 11:30 AM–12:30 PM.",
  },
  {
    question: "Which semesters can I book?",
    answer:
      "The October semester (Oct 3 – Nov 28, 2026) and the November semester (Nov 7, 2026 – Jan 9, 2027) are open for booking. Each is 8 weekly Saturday classes for a flat CAD $129.",
  },
  {
    question: "What is CODEship Academy?",
    answer:
      "CODEship Academy is a children's STEM, coding, AI, and digital skills education program. We offer weekly classes, camps, school workshops, and birthday parties for children ages 4–18, with a focus on project-based learning and creativity.",
  },
  {
    question: "How is CODEship different from other coding programs?",
    answer:
      "We put creativity first. Children don't follow tutorials — they build their own games, apps, websites, and AI projects from their own ideas. Our approach is inclusive, project-based, and focused on building real things kids are proud of.",
  },
  {
    question: "What can my child build?",
    answer:
      "Children in CODEship programs build games, websites, mobile app prototypes, animations, AI projects, interactive stories, and more — all based on their own ideas and interests.",
  },
  {
    question: "Does coding help with school subjects?",
    answer:
      "Yes. Coding naturally reinforces mathematical thinking, reading comprehension, logical reasoning, and problem-solving — skills that support performance across all academic subjects.",
  },
  {
    question: "Does my child need prior experience?",
    answer:
      "No prior experience is required. Our programs welcome complete beginners and provide pathways for children at every experience level.",
  },
  {
    question: "Can schools book CODEship programs?",
    answer:
      "Yes! CODEship Academy offers after-school clubs, PA Day workshops, March Break camps, and in-school STEM workshops for schools and school boards across Canada. Contact us to learn more.",
  },
];

/** "Weekly, Oct 3 – Nov 28, 2026" -> "Oct 3 – Nov 28, 2026" */
function rangeOnly(range: string) {
  return range.replace(/^Weekly,\s*/, "");
}

/** The open semesters (in-person dates are the same for every level). */
const SEMESTERS = START_OPTIONS.map((opt) => ({
  key: opt.key,
  label: opt.label.replace(" semester", ""),
  dates: rangeOnly(CLASS_SCHEDULE.explorers.inperson.starts[opt.key as "october" | "november"]),
}));

/** Saturday time slots with the levels that share each one, in run order. */
const SATURDAY_SLOTS = PROGRAMS.reduce<{ time: string; programs: typeof PROGRAMS }[]>((slots, p) => {
  const { start, end } = IN_PERSON_SATURDAY_SCHEDULE[p.slug];
  const time = `${start.replace(":00", "")} – ${end.replace(":00", "")}`;
  const slot = slots.find((s) => s.time === time);
  if (slot) slot.programs.push(p);
  else slots.push({ time, programs: [p] });
  return slots;
}, []);

const LEVEL_ACCENT = ["border-[#E5A823]", "border-[#138A9A]", "border-[#6E43A8]", "border-[#001532]"];

const differentiators = [
  {
    title: "Creativity-First Learning",
    desc: "Children bring their own ideas. We provide the tools, guidance, and environment to make them real.",
  },
  {
    title: "Real Project Building",
    desc: "Every child leaves with something they built — not a tutorial copy, but a genuine creation.",
  },
  {
    title: "AI & Digital Skills",
    desc: "Beyond coding, children develop AI literacy and digital skills for an evolving world.",
  },
  {
    title: "Inclusive for All Learners",
    desc: "Our programs welcome children of all backgrounds, genders, abilities, and experience levels.",
  },
  {
    title: "Academic Skill-Building",
    desc: "Coding naturally reinforces math, reading, and problem-solving skills children use in school.",
  },
  {
    title: "School & Community Model",
    desc: "We bring programs to schools and community spaces, making access easier for more families.",
  },
];

export default async function HomePage() {
  const { city } = await getVisitorGeo();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      {/* Organization schema now rendered sitewide by (site)/layout.tsx */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(homeFaqs)) }}
      />

      {/* Booking callout — what's open right now and where. */}
      <Link
        href="#book"
        className="block bg-[#E5A823] text-[#001532] text-center text-sm font-semibold px-4 py-2.5 hover:bg-[#d4941f] transition-colors"
      >
        Now booking: October &amp; November semesters
        <span className="hidden sm:inline"> · Saturdays at {IN_PERSON_VENUE.full}</span>
        {city && city !== "Oshawa" ? ` · live online in ${city} too` : ""} · Book now →
      </Link>

      {/* ── Hero: headline + "Now booking" card, all above the fold ── */}
      <section className="relative overflow-hidden bg-[#001532]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          aria-hidden="true"
        >
          <source
            src="https://videos.pexels.com/video-files/7868164/7868164-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#001532]/95 via-[#001532]/85 to-[#001532]/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 items-center">
            {/* Left (top): who, what, where */}
            <div className="animate-fade-in-up lg:col-start-1 lg:row-start-1 lg:self-end">
              <p className="text-[#E5A823] font-bold text-xs sm:text-sm uppercase tracking-widest mb-3">
                Kids coding, AI &amp; STEM · Kindergarten to Grade 8
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                Saturday coding classes in{" "}
                <span className="text-[#E5A823]">Oshawa</span>
              </h1>

              {/* Location */}
              <a
                href={IN_PERSON_VENUE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-colors"
              >
                <span className="shrink-0 w-10 h-10 rounded-full bg-[#E5A823] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#001532]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-white font-bold">
                    {IN_PERSON_VENUE.street}, {IN_PERSON_VENUE.city}
                  </span>
                  <span className="block text-gray-300 text-sm">
                    In the {IN_PERSON_VENUE.building} building · Saturdays ·{" "}
                    <span className="text-[#E5A823] font-semibold group-hover:underline">Get directions →</span>
                  </span>
                </span>
              </a>
            </div>

            {/* Right: exactly what's open for booking (directly under the address on mobile) */}
            <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-7 lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#001532]">Now booking</h2>
                <span className="text-xs font-bold uppercase tracking-wide bg-[#138A9A]/10 text-[#138A9A] px-3 py-1 rounded-full">
                  In-person · Oshawa
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {SEMESTERS.map((sem) => (
                  <div key={sem.key} className="rounded-2xl border-2 border-[#E5A823] bg-[#E5A823]/10 p-3 sm:p-4">
                    <p className="font-extrabold text-[#001532] text-base sm:text-lg leading-tight">{sem.label}</p>
                    <p className="text-[#001532] text-xs sm:text-sm mt-1 font-medium">{sem.dates}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Saturday class times · {IN_PERSON_VENUE.building}
              </p>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {SATURDAY_SLOTS.map((slot) => (
                  <div key={slot.time} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4">
                    <p className="font-extrabold text-[#001532] sm:w-40 shrink-0">{slot.time}</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.programs.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/register/${p.slug}`}
                          className="inline-flex items-baseline gap-1.5 rounded-lg bg-[#001532] text-white px-3 py-1.5 text-sm font-semibold hover:bg-[#138A9A] transition-colors"
                        >
                          {p.level}
                          <span className="text-[11px] font-normal text-gray-300">{p.gradeBand}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                {PRICE_LABEL} · {SEMESTER_SHAPE_LABEL}. Can&apos;t make Saturdays?{" "}
                <Link href="/register" className="text-[#138A9A] font-semibold hover:underline">
                  Live online weekday classes
                </Link>{" "}
                run the same semesters.
              </p>
            </div>

            {/* Left (bottom): why + actions */}
            <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
              <p className="text-base sm:text-lg text-gray-200 mb-5 leading-relaxed">
                Where curiosity becomes creation. Your child builds real games, websites and AI projects from their own
                ideas — in small, friendly groups. No experience needed.
              </p>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-200 mb-6">
                {[`${PRICE_LABEL} per semester`, SEMESTER_SHAPE_LABEL, "Beginners welcome"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E5A823]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="#book"
                  className="bg-[#E5A823] text-[#001532] font-bold px-7 py-3.5 rounded-xl hover:bg-[#d4941f] transition-all duration-200 text-center text-lg shadow-lg hover:-translate-y-0.5"
                >
                  Book a Semester
                </Link>
                <Link
                  href="/program-finder"
                  className="border-2 border-white/70 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white hover:text-[#001532] transition-all duration-200 text-center text-lg"
                >
                  Which level is right?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Book: one card per level, with its time and both open semesters ── */}
      <section id="book" className="py-16 bg-[#FAF8F4] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-2">Book in 3 minutes</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#001532] mb-3">Pick your child&apos;s grade</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every class runs Saturdays at {IN_PERSON_VENUE.full}. Choose the October or November semester at
              checkout.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROGRAMS.map((p, i) => {
              const sched = CLASS_SCHEDULE[p.slug].inperson;
              return (
                <ScrollReveal key={p.slug} delay={i * 80}>
                  <div className={`h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 ${LEVEL_ACCENT[i]} p-6 flex flex-col`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{p.gradeBand}</p>
                    <h3 className="text-2xl font-extrabold text-[#001532] mt-1">{p.level}</h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4">{p.codingSpace}</p>
                    <dl className="text-sm space-y-2 mb-5 flex-1">
                      <div>
                        <dt className="text-gray-400 text-xs">Saturdays</dt>
                        <dd className="font-bold text-[#001532]">{sched.time.replace(" ET", "")}</dd>
                      </div>
                      {SEMESTERS.map((sem) => (
                        <div key={sem.key}>
                          <dt className="text-gray-400 text-xs">{sem.label}</dt>
                          <dd className="font-semibold text-[#001532]">{rangeOnly(sched.starts[sem.key as "october" | "november"])}</dd>
                        </div>
                      ))}
                    </dl>
                    <Link
                      href={`/register/${p.slug}`}
                      className="bg-[#E5A823] text-[#001532] font-bold px-4 py-3 rounded-xl text-center hover:bg-[#d4941f] transition-colors"
                    >
                      Book {p.level}
                    </Link>
                    <Link
                      href={`/programs/${p.slug}`}
                      className="text-center text-sm text-[#001532] font-semibold mt-3 hover:text-[#138A9A]"
                    >
                      What they&apos;ll learn →
                    </Link>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Quick links for everything else parents look for */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Online classes", sub: "Live, weekday evenings", href: "/register" },
              { label: "Camps", sub: "Summer, March Break, PA Days", href: "/programs/camps" },
              { label: "Birthday parties", sub: "Build a game together", href: "/programs/birthday-parties" },
              { label: "For schools", sub: "Clubs & workshops", href: "/schools" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-[#E5A823] hover:shadow-md transition-all"
              >
                <span className="block font-bold text-[#001532] group-hover:text-[#138A9A]">{item.label} →</span>
                <span className="block text-xs text-gray-500">{item.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The CODEship Journey (K–8 grade-band programs) ── */}
      <section className="py-20 bg-[#FAF8F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <JourneyMap />
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="mt-10">
              <AlignmentStrip />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Why CODEship is Different ── */}
      <section className="py-24 bg-[#F1EEE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl mb-16">
              <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-3">
                What Sets Us Apart
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#001532] leading-tight mb-4">
                More than coding.<br />More than robotics.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                CODEship Academy is built around a simple belief: when children are given the freedom to create —
                not just follow instructions — they discover what they&apos;re truly capable of.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
            {differentiators.map((d, i) => (
              <ScrollReveal key={d.title} delay={i * 80}>
                <div className="group flex gap-5 py-7 border-b border-gray-100 last:border-0 hover:bg-[#FAF8F4] -mx-4 px-4 rounded-xl transition-colors duration-200">
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    i % 3 === 0 ? "bg-[#E5A823] border border-[#E5A823]" :
                    i % 3 === 1 ? "bg-[#138A9A] border border-[#138A9A]" :
                    "bg-[#6E43A8] border border-[#6E43A8]"
                  }`}>
                    <span className={`font-extrabold text-xs ${i % 3 === 0 ? "text-[#001532]" : "text-white"}`}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#001532] text-base mb-1 group-hover:text-[#E5A823] transition-colors duration-200">
                      {d.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How CODEship Works + Video ── */}
      <section className="py-20 bg-[#001532]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14">
              How CODEship Works
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  label: "Explore",
                  desc: "Children explore tools, concepts, and possibilities. Curiosity leads the way.",
                  image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&q=80",
                },
                {
                  step: "2",
                  label: "Create",
                  desc: "With guidance and support, children build their own original projects from their own ideas.",
                  image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80",
                },
                {
                  step: "3",
                  label: "Present",
                  desc: "Children share their work with pride — celebrating what they built.",
                  image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80",
                },
              ].map((s, i) => (
                <ScrollReveal key={s.step} delay={i * 150}>
                  <div className="flex gap-5 items-start group">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg ${
                      i === 0 ? "bg-[#E5A823] text-[#001532]" :
                      i === 1 ? "bg-[#138A9A] text-white" :
                      "bg-[#6E43A8] text-white"
                    }`}>
                      {s.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-1">{s.label}</h4>
                      <p className="text-gray-300 text-sm">{s.desc}</p>
                    </div>
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 ring-2 ring-[#E5A823]/30">
                      <Image
                        src={s.image}
                        alt={`Step ${s.step}: ${s.label}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="64px"
                      />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Video placeholder */}
            <ScrollReveal delay={200}>
              <div className="bg-[#2a3052] rounded-2xl overflow-hidden border border-[#E5A823]/20 shadow-2xl">
                <div className="relative aspect-video bg-[#1e2240] flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
                    alt="CODEship Academy workshop — children building digital projects"
                    fill
                    className="object-cover opacity-40"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="relative z-10 text-center p-6">
                    <div className="w-16 h-16 bg-[#E5A823] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                      <svg className="w-7 h-7 text-[#001532] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-lg mb-1">See CODEship in Action</p>
                    <p className="text-gray-400 text-sm">
                      Watch students build, create, and present their own digital projects
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-[#E5A823]/10">
                  <p className="text-gray-400 text-xs text-center">
                    Follow us on{" "}
                    <a
                      href="https://www.instagram.com/codeshipacademy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E5A823] hover:underline font-semibold"
                    >
                      @codeshipacademy
                    </a>
                    {" "}to see real student projects
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── School Partnership CTA ── */}
      <section className="py-20 bg-[#001532] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5A823]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E5A823]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Bring CODEship to Your School
                </h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  We partner with schools across Canada to deliver curriculum-aligned coding, AI, and STEM programs —
                  from after-school clubs and PA Day workshops to in-school enrichment and March Break camps.
                </p>
                <ul className="space-y-2 mb-8">
                  {["After-school coding clubs", "PA Day workshops", "March Break programs", "In-school STEM workshops", "Curriculum enrichment"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                      <span className="w-2 h-2 bg-[#E5A823] rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/schools"
                  className="bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-all duration-200 inline-block text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Request School Partnership Info
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80"
                  alt="School STEM workshop with students learning coding"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[#001532]/30" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials (rolling marquee) ── */}
      <TestimonialMarquee />

      {/* ── Newsletter ── */}
      <section className="py-16 bg-[#001532] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#E5A823]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white mb-4">Stay in the Loop</h2>
            <p className="text-gray-300 mb-8">
              Get updates on new programs, resources for parents, and coding education tips — delivered straight to your inbox.
            </p>
            <NewsletterForm />
            <p className="text-gray-400 text-xs mt-3">No spam. Unsubscribe anytime.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-[#FAF8F4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-[#001532] text-center mb-10">
              Frequently Asked Questions
            </h2>
            <FAQAccordion faqs={homeFaqs} />
          </ScrollReveal>
        </div>
      </section>

      <ScrollRegisterPopup city={city} />
    </>
  );
}
