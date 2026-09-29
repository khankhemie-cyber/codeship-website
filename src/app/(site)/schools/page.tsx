import type { Metadata } from "next";
import FAQAccordion from "@/components/FAQAccordion";
import SchoolContactForm from "@/components/SchoolContactForm";
import { PageHero, Section, SectionHeader, CheckList } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Coding Programs for Schools | Clubs & Workshops | CODEship Academy",
  description:
    "After-school coding clubs, PA Day workshops and in-class STEM sessions for schools in Durham Region and across Canada. We bring the instructors and equipment.",
  path: "/schools",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "For schools", href: "/schools" },
];

const schoolFaqs = [
  {
    question: "What programs can schools book?",
    answer: "After-school clubs, PA Day workshops, in-class sessions and break-time camps. Each one can be tailored to your school.",
  },
  {
    question: "How much does it cost?",
    answer: "Pricing depends on the format, length and number of students. Contact us for a quote.",
  },
  {
    question: "Which grades do you teach?",
    answer: "Our core programs cover Kindergarten to Grade 8. Ask us about older grades.",
  },
  {
    question: "Do you bring the equipment?",
    answer: "Yes. We bring devices and all materials. Your school does not need to buy anything.",
  },
  {
    question: "Are instructors background-checked?",
    answer: "Yes. Every instructor has a current vulnerable sector check. We also carry liability insurance.",
  },
  {
    question: "How far ahead should we book?",
    answer: "Book workshops 4–6 weeks ahead. Book ongoing clubs 2–3 months ahead.",
  },
];

const formats = [
  { title: "After-school club", desc: "Weekly sessions through the school year." },
  { title: "PA Day workshop", desc: "A full or half day of building." },
  { title: "In-class session", desc: "One or two periods that support your lessons." },
  { title: "Break camps", desc: "March Break or summer camps at your school." },
];

const benefits = [
  "We bring all devices and materials",
  "Background-checked instructors",
  "Fully insured",
  "Tailored to your grades and schedule",
];

export default function SchoolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(schoolFaqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <PageHero
        crumbs={crumbs}
        eyebrow="For schools"
        title="Coding programs we bring to your school"
        lead="Clubs, workshops and camps for K–Grade 8. We handle everything. Your staff do not need to set anything up."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <SectionHeader title="Choose a format" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formats.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-[#001532]">{f.title}</h3>
                  <p className="text-base text-gray-600 mt-2">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#001532] rounded-2xl p-8">
            <h2 className="text-2xl font-extrabold text-white mb-6">What schools get</h2>
            <CheckList items={benefits} dark />
          </div>
        </div>
      </Section>

      <Section tone="white" narrow id="request">
        <SectionHeader center title="Request information" lead="Tell us about your school. We reply within 2 business days." />
        <div className="bg-[#FAF8F4] rounded-2xl p-6 sm:p-8">
          <SchoolContactForm />
        </div>
      </Section>

      <Section narrow>
        <SectionHeader center title="School questions" />
        <FAQAccordion faqs={schoolFaqs} />
      </Section>
    </>
  );
}
