import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import GradeCards from "@/components/booking/GradeCards";
import CSB100Callout from "@/components/home/CSB100Callout";
import Hero from "@/components/home/Hero";
import Semesters from "@/components/home/Semesters";
import ToolPreviews from "@/components/home/ToolPreviews";
import FreeTrial from "@/components/trial/FreeTrial";
import { Section, SectionHeader, BookingBand } from "@/components/ui/Page";
import { CampPriceText, CampSignupButton, EarlyBirdNote } from "@/components/camps/CampPrice";
import { IMAGES } from "@/config/images";
import { MARCH_BREAK_CAMP as CAMP } from "@/config/camps";
import { websiteSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";
import { startDates } from "@/lib/booking";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Classes in Oshawa: Saturdays at Core21 | CODEship Academy",
  description:
    "Try a free coding class this November. Saturday coding, AI & STEM classes for kids in K–Grade 8 at Core21, 21 Simcoe St South, Oshawa, or live online. CAD $129 for 8 weekly classes.",
  path: "/",
});

const homeFaqs = [
  {
    question: "How does the free trial class work?",
    answer:
      "Book one free trial class for your child any time up to November 30, 2026, and take the class in November. It works for in-person classes in Oshawa and live online classes. There is one free trial class per student, in one program.",
  },
  {
    question: "What are the Saturday class times?",
    answer:
      "Explorers (K–Grade 1) and Builders (Grades 2–3) run 9:00–10:00 AM. Developers (Grades 4–5) and Engineers (Grades 6–8) run 11:30 AM–12:30 PM. Engineers can also pick a 12:30–1:30 PM class.",
  },
  {
    question: "Which semesters can I book?",
    answer:
      "The January semester runs Jan 16 to Mar 6, 2027 in person (Saturdays). Online, it starts Jan 12 (Tuesdays) or Jan 14 (Thursdays). It has 8 weekly classes. The November semester is already underway.",
  },
  {
    question: "How much does it cost?",
    answer: "Every level costs CAD $129 per semester. That covers 8 weekly classes.",
  },
  {
    question: "Do you run a March Break camp?",
    answer:
      "Yes. March Break camp runs Monday to Friday, March 15 to 19, 2027, 9:00 AM to 4:00 PM at Core21 in Oshawa. It is for ages 7 to 12 and costs CAD $450 for the week, or CAD $400 with early bird pricing until December 31, 2026. Single days are CAD $125 each. Sign-up is open now.",
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
  { label: "Explore", desc: "A short, hands-on lesson introduces one new idea.", image: IMAGES.blockCode },
  { label: "Create", desc: "Kids build their own project with an instructor right there.", image: IMAGES.robotsTablet },
  { label: "Share", desc: "Each child shows what they made. Confidence grows every week.", image: IMAGES.camp },
];

const STEP_COLORS = ["#138A9A", "#6E43A8", "#001532"];

const reasons = [
  { title: "Small groups", desc: "Every child gets real attention from the instructor." },
  { title: "Real projects", desc: "Kids build their own games, websites, robots and AI tools." },
  { title: "Beginner friendly", desc: "No experience needed. Every level starts from the basics." },
  { title: "A clear path", desc: "Four levels take your child from Kindergarten to Grade 8." },
];

const moreWays = [
  { label: "March Break camp", desc: `${CAMP.shortDates} · ${CAMP.ages}`, href: "/programs/camps#march-break", image: IMAGES.camp, tag: "Sign-up open" },
  { label: "Live online classes", desc: "Same curriculum, from home", href: "/register", image: IMAGES.girlHeadphones },
  { label: "Birthday parties", desc: "Every guest builds a game", href: "/programs/birthday-parties", image: IMAGES.robotBubbles },
  { label: "For schools", desc: "Clubs and workshops", href: "/schools", image: IMAGES.lego },
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

      <Hero />

      <CSB100Callout />

      <FreeTrial />

      {/* ── Programs by grade ── */}
      <Section id="book" tone="white">
        <SectionHeader
          center
          eyebrow="January registration open"
          title="Find your child's level"
          lead={`Pick by school grade. ${PRICE_LABEL} per semester · ${SEMESTER_SHAPE_LABEL}.`}
        />
        <GradeCards />
        <Semesters />
      </Section>

      {/* ── March Break camp ── */}
      <section className="relative overflow-hidden bg-[#0F6F7C] py-16 sm:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#6E43A8]/40" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-8 border-white/20">
            <Image src={CAMP.image} alt={IMAGES.camp.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="text-white">
            <p className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-[#0F6F7C]">
              Sign-up open
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold mt-4 leading-tight">March Break camp</h2>
            <p className="text-lg sm:text-xl text-white mt-4">
              Five days of coding, AI and robotics. Kids build something new every day and show it off on Friday.
            </p>
            <EarlyBirdNote className="mt-4 inline-block rounded-full bg-[#F4D734] px-4 py-2 text-base font-bold text-[#001532]" />
            <ul className="mt-6 flex flex-wrap gap-2">
              {[`${CAMP.days}, ${CAMP.dates}`, CAMP.hours, CAMP.ages, <CampPriceText key="price" />].map((t, i) => (
                <li key={i} className="rounded-full bg-[#001532]/35 px-4 py-2 text-base font-semibold">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <CampSignupButton source="home_camp_band" tone="light">
                Sign up for camp
              </CampSignupButton>
              <Link
                href="/programs/camps#march-break"
                className="inline-flex items-center rounded-full border-2 border-white px-7 py-[14px] text-lg font-bold text-white hover:bg-white hover:text-[#0F6F7C] transition-colors"
              >
                Camp details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How a class works ── */}
      <Section tone="cream">
        <SectionHeader center eyebrow="Every class" title="How a class works" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.label} className="text-center">
              <div className="relative mx-auto aspect-square w-full max-w-xs">
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: STEP_COLORS[i] }} aria-hidden="true" />
                <div className="absolute inset-4 overflow-hidden rounded-full border-[6px] border-white shadow-lg">
                  <Image src={s.image.src} alt={s.image.alt} fill className="object-cover" sizes="(max-width: 768px) 80vw, 320px" />
                </div>
                <span className="absolute right-4 top-2 flex h-14 w-14 items-center justify-center rounded-full bg-white font-display text-2xl font-extrabold text-[#001532] shadow-lg" aria-hidden="true">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold text-[#001532] mt-6">{s.label}</h3>
              <p className="text-lg text-gray-600 mt-2 max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <ToolPreviews />

      {/* ── Why parents choose us ── */}
      <Section tone="white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -left-4 -bottom-4 h-full w-full rounded-[2.5rem] bg-[#6E43A8] -rotate-2" aria-hidden="true" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border-8 border-white shadow-xl">
              <Image src={IMAGES.kidsBuilding.src} alt={IMAGES.kidsBuilding.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeader eyebrow="Why CODEship" title="Built for kids. Clear for parents." />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 -mt-4">
              {reasons.map((r) => (
                <li key={r.title} className="rounded-2xl bg-[#FAF8F4] p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#138A9A] text-white" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#001532] mt-3">{r.title}</h3>
                  <p className="text-base text-gray-600 mt-1">{r.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <TestimonialMarquee />

      {/* ── More ways to learn ── */}
      <Section tone="white">
        <SectionHeader center eyebrow="More ways to learn" title="Camps, parties and more" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {moreWays.map((w) => (
            <Link key={w.label} href={w.href} className="group overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl transition-shadow">
              <div className="relative h-44 overflow-hidden">
                <Image src={w.image.src} alt={w.image.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 25vw" />
                {w.tag && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#6E43A8] px-3 py-1 text-sm font-bold text-white">{w.tag}</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-bold text-[#001532]">{w.label} →</h3>
                <p className="text-base text-gray-600 mt-1">{w.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section narrow id="faq" tone="cream">
        <SectionHeader center eyebrow="Questions" title="Questions parents ask" />
        <FAQAccordion faqs={homeFaqs} />
      </Section>

      <BookingBand href="#book" detail={`January registration is open. The January semester starts ${startDates("inperson", "january")} in person and ${startDates("online", "january")} online.`} />
    </>
  );
}
