import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "School STEM Workshops | Coding Programs for Schools",
  description:
    "CODEship Academy brings coding, AI, and STEM workshops to schools. After-school clubs, PA Day programs, and in-class enrichment across Canada.",
  alternates: { canonical: "https://www.codeshipacademy.com/programs/school-workshops" },
};

export default function SchoolWorkshopsPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#3D4466] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#F5C518] font-semibold mb-2">Programs</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">School Workshops &amp; Partnerships</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            CODEship Academy brings curriculum-aligned coding, AI, and STEM programs directly to your school —
            no setup required.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { title: "After-School Coding Club", desc: "A weekly after-school program running through the school year. Children build progressive projects in a structured, fun environment at your school." },
              { title: "PA Day Workshops", desc: "Full-day or half-day STEM workshops for students on professional activity days. All materials provided, curriculum-aligned, and managed entirely by CODEship instructors." },
              { title: "In-Class STEM Enrichment", desc: "Single-period or double-period in-class workshops that complement existing curriculum. Ideal for Science, Math, and Technology classes." },
              { title: "March Break & Summer Programs", desc: "Hosted at your school during school breaks — a fantastic resource for your school community and a service to working parents." },
            ].map((prog) => (
              <div key={prog.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#3D4466] text-lg mb-2">{prog.title}</h2>
                <p className="text-gray-600 text-sm">{prog.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#3D4466] rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Why Schools Partner with CODEship</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "All equipment and materials provided — no school investment required",
                "Curriculum-aligned content across Science, Math, and Technology outcomes",
                "All instructors background-checked and trained for school environments",
                "Programs customized to your grade levels and educational priorities",
                "Comprehensive liability insurance and safety protocols",
                "Flexible scheduling to fit your school calendar",
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#F5C518] rounded-full mt-1.5 shrink-0" />
                  <p className="text-gray-300 text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F5C518] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3D4466] mb-4">Bring CODEship to Your School</h2>
          <p className="text-[#3D4466]/70 mb-6">We&apos;ll reach out to discuss the right program for your school community.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="bg-[#3D4466] text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-900 transition-colors inline-block">
              Register Now
            </Link>
            <Link href="/schools" className="border-2 border-[#3D4466] text-[#3D4466] font-bold px-6 py-3 rounded-xl hover:bg-[#3D4466] hover:text-white transition-colors inline-block">
              School Partnership Info
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
