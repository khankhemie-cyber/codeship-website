import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import GradeCards from "@/components/booking/GradeCards";
import Hero from "@/components/home/Hero";
import { Section, SectionHeader, BookingBand, ButtonLink } from "@/components/ui/Page";
import { websiteSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Classes in Oshawa — Saturdays at Core21 | CODEship Academy",
  description:
    "Saturday coding, AI & STEM classes for kids in K–Grade 8 at Core21, 21 Simcoe St South, Oshawa. Booking October & November semesters. CAD $129 for 8 weekly classes.",
  path: "/",
});

const homeFaqs = [
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

export default function HomePage() {
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
        className="block bg-[#F4D734] text-[#001532] text-center text-base font-bold px-4 py-3 hover:bg-[#E6C51E] transition-colors"
      >
        Now booking October &amp; November semesters · In person &amp; online →
      </Link>

      <Hero />

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
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 text-lg font-bold text-[#001532] hover:border-[#F4D734] hover:shadow-md transition-all"
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
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4D734] text-[#001532] font-extrabold">
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

      <BookingBand href="#book" detail="October and November semesters are open, in person and online." />
    </>
  );
}
