import Image from "next/image";
import type { Metadata } from "next";
import { PageHero, Section, SectionHeader, ButtonLink } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { MARCH_BREAK_CAMP as CAMP } from "@/config/camps";
import { IN_PERSON_VENUE } from "@/data/locations";
import { breadcrumbSchema, campEventSchema, faqSchema, speakableSchema } from "@/lib/schema";
import FAQAccordion from "@/components/FAQAccordion";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Camps in Oshawa | Summer, March Break & PA Day",
  description:
    "March Break 2027 coding camp in Oshawa, March 15–19, 9 AM–4 PM, ages 6–14. Sign up now. Summer camps and PA Day workshops too.",
  path: "/programs/camps",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
  { name: "Camps", href: "/programs/camps" },
];

const camps = [
  { title: "Summer camp", when: "July to August", length: "Monday to Friday", desc: "A week of building that ends with a project showcase." },
  { title: "PA Day workshops", when: "School PA days", length: "Full or half day", desc: "One focused day of building on a day off school." },
];

const campFaqs = [
  {
    question: "When is the CODEship March Break camp?",
    answer: `${CAMP.days}, ${CAMP.dates}, ${CAMP.hours}, at Core21, 21 Simcoe St South, Oshawa.`,
  },
  {
    question: "How much does March Break camp cost?",
    answer: `${CAMP.priceLabel} for the full week (5 days). Sign up and pay online; your child's spot is secured once payment is complete.`,
  },
  {
    question: "What ages is the March Break camp for?",
    answer: "Ages 6 to 14. No coding experience is needed.",
  },
  {
    question: "What will kids do at March Break camp?",
    answer: "Kids spend five days on coding, AI and robotics projects, building something new each day, and show off what they built on Friday.",
  },
  {
    question: "How many spots are there?",
    answer: `${CAMP.spots} spots for the week. Sign-up closes when the camp is full.`,
  },
];

const tracks = ["Game design", "Websites", "AI projects", "Robotics", "App prototypes", "Animation"];

export default function CampsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            campEventSchema({
              name: `CODEship ${CAMP.title} 2027 (Oshawa)`,
              description: "Five days of coding, AI and robotics projects for ages 6 to 14 at Core21 in Oshawa.",
              startDate: CAMP.startISO,
              endDate: CAMP.endISO,
              price: CAMP.priceCad,
              url: CAMP.url,
              pageUrl: "https://www.codeshipacademy.com/programs/camps",
              image: CAMP.image,
              ages: CAMP.ageRange,
            }),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(campFaqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema()) }} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Camps"
        title="Coding camps for school breaks"
        lead="Kids spend the day building a real project. They finish by showing it off."
      >
        <ButtonLink href="#march-break">March Break sign-up is open</ButtonLink>
      </PageHero>

      {/* ── March Break 2027: open for sign-up ── */}
      <Section id="march-break" tone="white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative overflow-hidden rounded-3xl aspect-[4/3] bg-[#FFF4C7]">
            <Image src={CAMP.image} alt="Kids gathered around a 3D printer at camp" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <span className="absolute left-4 top-4 rounded-full bg-[#F4D734] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#001532]">
              Sign-up open
            </span>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">March Break 2027</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#001532] mt-2">{CAMP.title}</h2>
            <p className="text-lg text-gray-600 mt-4">
              Five full days of coding, AI and robotics. Kids pick up new skills every day and show off what they built on Friday.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              {[
                ["Dates", `${CAMP.days}, ${CAMP.dates}`],
                ["Hours", CAMP.hours],
                ["Ages", CAMP.ages],
                ["Price", `${CAMP.priceLabel} for the week`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-[#FAF8F4] p-4">
                  <dt className="text-sm font-bold uppercase tracking-wider text-gray-500">{k}</dt>
                  <dd className="text-lg font-bold text-[#001532] mt-1">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-base text-gray-600 mt-4">
              In person at {IN_PERSON_VENUE.building}, {IN_PERSON_VENUE.street}, {IN_PERSON_VENUE.city}. {CAMP.spots} spots.
            </p>
            <a
              href={CAMP.url}
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[#F4D734] px-8 py-4 text-lg font-bold text-[#001532] shadow-lg hover:bg-[#E6C51E] transition-colors"
            >
              Sign up for March Break camp →
            </a>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader center title="More camps" lead="Dates for these are coming soon." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {camps.map((c) => (
            <div key={c.title} className="bg-white shadow-sm p-7">
              <h2 className="text-2xl font-extrabold text-[#001532]">{c.title}</h2>
              <p className="text-base font-semibold text-[#0F6F7C] mt-2">
                {c.when} · {c.length}
              </p>
              <p className="text-lg text-gray-600 mt-3">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <SectionHeader center title="Camp tracks" lead="Each camp focuses on one track." />
        <div className="flex flex-wrap justify-center gap-3">
          {tracks.map((t) => (
            <span key={t} className="bg-[#FAF8F4] border border-gray-200 text-[#001532] text-lg font-semibold px-5 py-3">
              {t}
            </span>
          ))}
        </div>
      </Section>

      <Section narrow tone="cream">
        <SectionHeader center title="March Break camp questions" />
        <FAQAccordion faqs={campFaqs} />
      </Section>

      <section className="bg-[#001532]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Get upcoming camp dates</h2>
          <p className="text-lg text-gray-200 mt-4">Send us a note and we will share the next camp dates.</p>
          <div className="mt-8">
            <ButtonLink href="/contact">Ask About Camps</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
