import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import GradeCards from "@/components/booking/GradeCards";
import NowBookingCard from "@/components/booking/NowBookingCard";
import { Section, SectionHeader, BookingBand, ButtonLink } from "@/components/ui/Page";
import { websiteSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import { getVisitorGeo } from "@/lib/geo";
import { IN_PERSON_VENUE } from "@/data/locations";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";

// Reading Cloudflare geo headers for the city callout opts this route into
// dynamic rendering; next-on-pages requires an explicit edge runtime for that.
export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Classes in Oshawa — Saturdays at Core21 | CODEship Academy",
  description:
    "Saturday coding, AI & STEM classes for kids in K–Grade 8 at Core21, 21 Simcoe St South, Oshawa. Booking October & November semesters. CAD $129 for 8 weekly classes.",
  path: "/",
});

const homeFaqs = [
  {
    question: "Where are the classes?",
    answer:
      "Classes are at Core21, 21 Simcoe St South, Oshawa. Families come from across Durham Region, including Whitby, Courtice, Bowmanville and Clarington.",
  },
  {
    question: "What are the Saturday class times?",
    answer:
      "Explorers (K–Grade 1) and Builders (Grades 2–3) run 9:00–10:00 AM. Developers (Grades 4–5) and Engineers (Grades 6–8) run 11:30 AM–12:30 PM.",
  },
  {
    question: "Which semesters can I book?",
    answer:
      "The October semester runs Oct 3 – Nov 28, 2026. The November semester runs Nov 7, 2026 – Jan 9, 2027. Each has 8 weekly classes.",
  },
  {
    question: "How much does it cost?",
    answer: "Every level costs CAD $129 per semester. That covers 8 weekly classes.",
  },
  {
    question: "Does my child need coding experience?",
    answer: "No. Every level starts from the basics. Beginners are welcome.",
  },
  {
    question: "Which level is right for my child?",
    answer:
      "Choose by school grade. Explorers is K–Grade 1. Builders is Grades 2–3. Developers is Grades 4–5. Engineers is Grades 6–8.",
  },
  {
    question: "Do you offer online classes?",
    answer:
      "Yes. Live online classes run on weekday evenings. They follow the same curriculum and cost the same.",
  },
];

const steps = [
  {
    label: "Explore",
    desc: "A short lesson introduces one new idea.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    alt: "Children learning a new coding idea together",
  },
  {
    label: "Create",
    desc: "Kids build their own project with an instructor nearby.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    alt: "Students building a project on laptops",
  },
  {
    label: "Present",
    desc: "Each child shows what they made. Confidence grows every week.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    alt: "A child presenting a finished project",
  },
];

const reasons = [
  { title: "Small groups", desc: "Every child gets real attention from the instructor." },
  { title: "Real projects", desc: "Kids build their own games, websites and AI tools." },
  { title: "Beginner friendly", desc: "No experience needed. Every level starts from the basics." },
  { title: "A clear path", desc: "Four levels take your child from Kindergarten to Grade 8." },
];

export default async function HomePage() {
  const { city } = await getVisitorGeo();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(homeFaqs)) }}
      />

      {/* Booking callout */}
      <Link
        href="#book"
        className="block bg-[#E5A823] text-[#001532] text-center text-base font-bold px-4 py-3 hover:bg-[#d4941f] transition-colors"
      >
        Now booking October &amp; November semesters
        <span className="hidden sm:inline">
          {city && city !== "Oshawa" ? ` · Online classes open in ${city}` : ` · Saturdays at ${IN_PERSON_VENUE.building}, Oshawa`}
        </span>{" "}
        →
      </Link>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#001532]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source
            src="https://videos.pexels.com/video-files/7868164/7868164-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Darken only behind the words so the video stays visible */}
        <div className="absolute inset-0 bg-[#001532]/65 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#001532]/90 lg:via-[#001532]/45 lg:to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-center">
            <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
              <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-4">
                Coding, AI &amp; STEM · K–Grade 8
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
                Saturday coding classes in <span className="text-[#E5A823]">Oshawa</span>
              </h1>

              <a
                href={IN_PERSON_VENUE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 bg-[#001532]/70 backdrop-blur-sm border border-white/20 rounded-2xl p-4 pr-6 hover:bg-[#001532]/85 transition-colors"
              >
                <span className="shrink-0 w-11 h-11 rounded-full bg-[#E5A823] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#001532]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-white text-lg font-bold">
                    {IN_PERSON_VENUE.street}, {IN_PERSON_VENUE.city}
                  </span>
                  <span className="block text-gray-200 text-base">
                    {IN_PERSON_VENUE.building} building ·{" "}
                    <span className="text-[#E5A823] font-semibold group-hover:underline">Directions →</span>
                  </span>
                </span>
              </a>
            </div>

            <NowBookingCard className="lg:col-start-2 lg:row-start-1 lg:row-span-2" />

            <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
              <p className="text-lg sm:text-xl text-white mb-6 leading-relaxed [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
                Kids build real games, websites and AI projects. No experience needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <ButtonLink href="#book">Book a Semester</ButtonLink>
                <ButtonLink href="/program-finder" variant="outline">
                  Which level fits?
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Book by grade ── */}
      <Section id="book">
        <SectionHeader
          center
          eyebrow="Book in 3 minutes"
          title="Pick your child's grade"
          lead={`${PRICE_LABEL} per semester · ${SEMESTER_SHAPE_LABEL}`}
        />
        <GradeCards />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Online classes", href: "/register" },
            { label: "Camps", href: "/programs/camps" },
            { label: "Birthday parties", href: "/programs/birthday-parties" },
            { label: "For schools", href: "/schools" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 text-lg font-bold text-[#001532] hover:border-[#E5A823] hover:shadow-md transition-all"
            >
              {item.label} →
            </Link>
          ))}
        </div>
      </Section>

      {/* ── How a class works ── */}
      <Section tone="white">
        <SectionHeader center eyebrow="Every Saturday" title="How a class works" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.label} className="rounded-2xl overflow-hidden bg-[#FAF8F4]">
              <div className="relative h-52">
                <Image src={s.image} alt={s.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-6">
                <p className="text-sm font-bold uppercase tracking-widest text-[#138A9A]">Step {i + 1}</p>
                <h3 className="text-2xl font-extrabold text-[#001532] mt-1">{s.label}</h3>
                <p className="text-lg text-gray-600 mt-2">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Why parents choose us ── */}
      <Section tone="navy">
        <SectionHeader center dark eyebrow="Why CODEship" title="Built for kids. Clear for parents." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <div key={r.title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5A823] text-[#001532] font-extrabold">
                {i + 1}
              </span>
              <h3 className="text-xl font-bold text-white mt-4">{r.title}</h3>
              <p className="text-lg text-gray-300 mt-2">{r.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <TestimonialMarquee />

      {/* ── FAQ ── */}
      <Section narrow>
        <SectionHeader center title="Questions parents ask" />
        <FAQAccordion faqs={homeFaqs} />
      </Section>

      {/* ── Schools ── */}
      <section className="bg-[#F1EEE8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xl font-bold text-[#001532] text-center sm:text-left">
            Teacher or principal? We run clubs and workshops in schools.
          </p>
          <ButtonLink href="/schools" variant="outlineDark">
            For Schools
          </ButtonLink>
        </div>
      </section>

      <BookingBand href="#book" />
    </>
  );
}
