import type { Metadata } from "next";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import ABAPartnerForm from "@/components/ABAPartnerForm";
import { PageHero, Section, SectionHeader, CheckList, ButtonLink } from "@/components/ui/Page";
import { pageMetadata, BASE_URL } from "@/lib/pageMetadata";
import { faqSchema, breadcrumbSchema, speakableSchema } from "@/lib/schema";

const PATH = "/partners/aba-clinics";

export const metadata: Metadata = pageMetadata({
  title: "Coding & Robotics for ABA Clinics | Partner With CODEship Academy",
  description:
    "Add coding, AI and robotics to your ABA clinic. Small-group sessions co-designed with your BCBA, built on task analysis and visual block coding. In clinic, in Oshawa or online across Canada.",
  path: PATH,
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "For ABA clinics", href: PATH },
];

const stats = [
  { value: "1 in 44", label: "Canadian children and youth are autistic (PHAC, 2025)" },
  { value: "g = 0.51", label: "Moderate gain in social–emotional skills from robot-assisted sessions (2025 meta-analysis, 20 trials)" },
  { value: "~23%", label: "of children registered in the Ontario Autism Program were in core clinical services (March 2026)" },
];

const models = [
  { title: "In-clinic groups", desc: "Weekly small-group coding and robotics at your clinic. Your staff support and collect data." },
  { title: "Social skills groups", desc: "Robotics missions and pair programming become the activity inside your social skills group." },
  { title: "Bridge to classes", desc: "Clients practise in clinic, then join a regular CODEship class with support that fades over time." },
  { title: "Online sessions", desc: "Live small-group classes for rural or waitlisted clients, with a parent or RBT beside the child." },
];

const howWeWork = [
  { name: "Planning call", text: "We meet your BCBA, learn about your clients and pick a model." },
  { name: "Co-design", text: "We turn projects into task analyses that carry your targets, prompting and reinforcement." },
  { name: "Pilot", text: "We run an 8- to 12-week pilot with notes shared after each session." },
  { name: "Review", text: "Your BCBA and our instructor review the data together and plan next steps." },
];

const clinicGets = [
  "Sessions co-designed with your BCBA",
  "Visual, block-based coding and hands-on robots",
  "Short, structured projects written as task analyses",
  "Session notes your team can use for data",
  "We bring devices and materials",
  "Instructors with current vulnerable sector checks",
  "Fully insured",
  "A clear K–Grade 8 pathway for each child",
];

const faqs = [
  {
    question: "What does a coding partnership with an ABA clinic look like?",
    answer:
      "CODEship runs small-group coding and robotics sessions at your clinic, inside a social skills group, or online. Your BCBA sets the goals; our instructor delivers projects written as task analyses, and we share notes after each session.",
  },
  {
    question: "Does coding replace ABA therapy?",
    answer:
      "No. Coding and robotics give children a motivating place to practise goals from their treatment plan, such as following directions, turn-taking, requesting help and frustration tolerance.",
  },
  {
    question: "Is there research on robots and coding for autistic children?",
    answer:
      "Yes. A 2025 meta-analysis of 20 trials and 532 autistic children found robot-assisted interventions improved social–emotional skills (g = 0.51). A 2025 randomized trial that built ABA principles into robot-assisted training improved social cognition.",
  },
  {
    question: "Which ages do you work with?",
    answer: "Our coding journey covers Kindergarten to Grade 8, starting with picture-based blocks and moving to web pages, JavaScript and Python.",
  },
  {
    question: "Where do you offer clinic partnerships?",
    answer:
      "In person in Oshawa and Durham Region, and online across Canada. Contact us about in-person sessions in other areas.",
  },
  {
    question: "How much does a clinic partnership cost?",
    answer: "Pricing depends on the model, group size and number of weeks. Send an inquiry and we will send a quote after a planning call.",
  },
  {
    question: "Do we need to buy equipment?",
    answer: "No. We bring devices, robots and materials. You need a room with power, Wi-Fi and a quiet corner.",
  },
];

const resources = [
  { href: "/resources/aba-and-coding-robotics-research-2026", title: "ABA and coding: how behaviour analysis and robotics work together", tag: "Research + chart" },
  { href: "/resources/autism-in-canada-2026-data-inclusive-coding", title: "Autism in Canada: 2025–2026 data and why every child needs access to coding", tag: "Canadian data + charts" },
  { href: "/resources/aba-clinic-coding-robotics-partnership-checklist", title: "How ABA clinics can add coding and robotics: a partnership checklist", tag: "Checklists + plan" },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Coding, AI and robotics programs for ABA clinics",
  serviceType: "Inclusive coding and robotics education partnership",
  description:
    "Small-group coding, AI and robotics sessions for autistic children, co-designed with the clinic's BCBA and delivered in clinic, in Oshawa or online across Canada.",
  url: `${BASE_URL}${PATH}`,
  provider: { "@type": "EducationalOrganization", name: "CODEship Academy", url: BASE_URL },
  areaServed: { "@type": "Country", name: "Canada" },
  audience: { "@type": "Audience", audienceType: "ABA clinics, BCBAs and autism service providers" },
};

export default function ABAClinicsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema([".faq-answer"])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <PageHero
        crumbs={crumbs}
        eyebrow="For ABA clinics"
        title="Coding and robotics, built for your ABA program"
        lead="We partner with ABA clinics to bring structured, fun coding and robotics to autistic children. Your BCBA sets the goals. We bring the projects, robots and instructors."
      >
        <ButtonLink href="#inquire">Inquire about a partnership</ButtonLink>
      </PageHero>

      <Section tone="white">
        <SectionHeader title="Why clinics are adding coding" lead="Coding and ABA share the same building blocks: small steps, instant feedback and reinforcement." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.value} className="bg-[#FAF8F4] p-7 border-t-4 border-[#F4D734]">
              <p className="font-display text-4xl font-extrabold text-[#001532]">{s.value}</p>
              <p className="text-base text-gray-700 mt-3">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-base text-gray-600 mt-6">
          Sources and charts: <Link href="/resources/autism-in-canada-2026-data-inclusive-coding" className="text-[#0f6f7c] underline">Autism in Canada data</Link> ·{" "}
          <Link href="/resources/aba-and-coding-robotics-research-2026" className="text-[#0f6f7c] underline">ABA and coding research</Link>
        </p>
      </Section>

      <Section>
        <SectionHeader title="Four ways to partner" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {models.map((m) => (
            <div key={m.title} className="bg-white shadow-sm p-6">
              <h3 className="text-xl font-bold text-[#001532]">{m.title}</h3>
              <p className="text-base text-gray-600 mt-2">{m.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <SectionHeader title="How we work with your team" />
            <ol className="space-y-6">
              {howWeWork.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span className="flex-none w-10 h-10 rounded-full bg-[#001532] text-[#F4D734] font-bold flex items-center justify-center">{i + 1}</span>
                  <span>
                    <strong className="block text-lg text-[#001532]">{s.name}</strong>
                    <span className="text-base text-gray-700">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-[#001532] p-8">
            <h2 className="text-2xl font-extrabold text-white mb-6">What your clinic gets</h2>
            <CheckList items={clinicGets} dark />
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader title="Free resources for clinics" lead="Research summaries, Canadian data, charts and checklists you can use with your team." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((r) => (
            <Link key={r.href} href={r.href} className="group bg-white shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-7 flex flex-col">
              <p className="text-sm font-bold uppercase tracking-widest text-[#0f6f7c]">{r.tag}</p>
              <h3 className="text-xl font-bold text-[#001532] mt-3 leading-snug group-hover:text-[#138A9A] transition-colors flex-1">{r.title}</h3>
              <span className="text-base font-bold text-[#001532] mt-5">Read →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="white" narrow id="inquire">
        <SectionHeader center title="Inquire about a partnership" lead="Tell us about your clinic and clients. We reply within 2 business days." />
        <div className="bg-[#FAF8F4] p-6 sm:p-8">
          <ABAPartnerForm />
        </div>
      </Section>

      <Section narrow>
        <SectionHeader center title="Clinic questions" />
        <FAQAccordion faqs={faqs} />
      </Section>
    </>
  );
}
