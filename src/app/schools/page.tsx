import type { Metadata } from "next";
import FAQAccordion from "@/components/FAQAccordion";
import SchoolContactForm from "@/components/SchoolContactForm";

export const metadata: Metadata = {
  title: "School Partnerships | STEM Programs for Schools",
  description:
    "Partner with CODEship Academy to bring coding, AI, and STEM enrichment to your school. After-school clubs, workshops, and camps for all ages.",
  alternates: { canonical: "https://www.codeshipacademy.com/schools" },
};

const schoolFaqs = [
  {
    question: "What programs are available for schools?",
    answer: "We offer after-school coding clubs, PA Day full-day workshops, March Break camps hosted at your school, in-class STEM enrichment sessions, and summer programs. All can be customized to your school's needs.",
  },
  {
    question: "How much does a school partnership cost?",
    answer: "Costs vary by program format, duration, and number of students. We offer competitive pricing for school partnerships and can work with your school's budget. Contact us for a customized quote.",
  },
  {
    question: "What grade levels do you serve?",
    answer: "We serve Grades 1–12 with age-appropriate programs. Our content is designed specifically for each developmental stage, from visual block coding for younger students to text-based programming for older students.",
  },
  {
    question: "Do you provide all the equipment?",
    answer: "Yes. CODEship brings everything needed for the program — computers or tablets, programming materials, and all curriculum resources. Your school doesn't need to invest in any technology.",
  },
  {
    question: "Are your instructors background-checked?",
    answer: "Absolutely. All CODEship instructors hold current criminal record checks with vulnerable sector screening. We carry comprehensive liability insurance and maintain clear child protection policies.",
  },
  {
    question: "How far in advance should we book?",
    answer: "For the best availability, we recommend booking 4–6 weeks in advance for workshops and 2–3 months for ongoing programs. We will do our best to accommodate shorter timelines when possible.",
  },
];

export default function SchoolsPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#3D4466] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Partner With CODEship Academy
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Bring world-class coding, AI, and STEM education to your school community — with zero setup required from
            your staff.
          </p>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#3D4466] text-center mb-10">School Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              { title: "After-School Coding Club", desc: "Weekly after-school sessions running through the school year. Students build progressive projects in a structured program at your school." },
              { title: "PA Day Workshops", desc: "Full-day or half-day STEM workshops for PA days. Fully managed by CODEship instructors. All materials included." },
              { title: "March Break Camp", desc: "Week-long camps hosted at your school during March Break. A valuable service for your school community." },
              { title: "In-Class STEM Enrichment", desc: "Single or double period workshops that complement your classroom curriculum — curriculum-aligned and instructor-led." },
              { title: "Summer Program", desc: "Summer coding camps hosted at your school, keeping your community connected through the break." },
              { title: "STEM Showcase Days", desc: "Special event programs where students build a project and present it to classmates, teachers, or parents." },
            ].map((prog) => (
              <div key={prog.title} className="bg-white rounded-2xl p-6 shadow-sm flex gap-4 border-l-4 border-[#F5C518]">
                <div>
                  <h3 className="font-bold text-[#3D4466] mb-1">{prog.title}</h3>
                  <p className="text-gray-600 text-sm">{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-[#3D4466] rounded-2xl p-8 text-white mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Benefits for Your School</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "All equipment and materials included — no school investment",
                "Background-checked, trained instructors",
                "Curriculum-aligned content (Science, Math, Technology)",
                "Fully customizable to your grade levels and priorities",
                "Comprehensive liability coverage",
                "Flexible scheduling for your school calendar",
                "Service to working parents during school breaks",
                "Builds school's STEM reputation in the community",
                "After-school revenue opportunity for some partnership models",
              ].map((b) => (
                <div key={b} className="flex items-start gap-2">
                  <span className="text-[#F5C518] font-bold shrink-0">✓</span>
                  <p className="text-gray-300 text-sm">{b}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#3D4466] text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Get in Touch", desc: "Tell us about your school and what you're looking for." },
                { step: "2", title: "We Customize", desc: "We design a program for your grade levels, schedule, and goals." },
                { step: "3", title: "We Deliver", desc: "Our instructors arrive with everything needed — you focus on your school." },
                { step: "4", title: "Kids Create", desc: "Students build real projects and leave with skills, confidence, and pride." },
              ].map((s) => (
                <div key={s.step} className="text-center bg-white rounded-2xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-[#F5C518] text-[#3D4466] rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-[#3D4466] mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#3D4466] mb-6 text-center">Request School Partnership Information</h2>
            <SchoolContactForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#3D4466] text-center mb-8">School FAQ</h2>
          <FAQAccordion faqs={schoolFaqs} />
        </div>
      </section>
    </div>
  );
}
