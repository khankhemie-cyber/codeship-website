import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI & Robotics Programs for Kids | Ages 8–16",
  description:
    "CODEship Academy's AI and robotics programs for children ages 8–16. Hands-on AI model building, robot programming, and real project creation.",
  alternates: { canonical: "https://www.codeshipacademy.com/programs/ai-robotics" },
};

export default function AIRoboticsPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#0A2342] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#F5A623] font-semibold mb-2">Programs</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            🤖 AI &amp; Robotics Programs
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Hands-on exploration of artificial intelligence and physical robotics through real project building, not
            passive learning.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">Ages 8–16</span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">Weekly or intensive</span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">No prior experience needed</span>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            <div>
              <h2 className="text-2xl font-bold text-[#0A2342] mb-4">The AI Curriculum</h2>
              <p className="text-gray-600 mb-4">
                Our AI program teaches children how artificial intelligence actually works — through hands-on projects
                they build themselves. From training simple image recognition models to building AI-powered applications,
                students develop genuine AI literacy, not just surface familiarity.
              </p>
              <ul className="space-y-2">
                {["How machines learn from data", "Building image and sound classifiers", "Natural language and chatbot basics",
                  "AI ethics, bias, and critical thinking", "AI-powered creative projects (art, music, games)",
                  "Introduction to machine learning concepts"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="w-2 h-2 bg-[#F5A623] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A2342] mb-4">The Robotics Curriculum</h2>
              <p className="text-gray-600 mb-4">
                Robotics at CODEship combines physical engineering with programming. Children assemble, program, and
                test robots through progressively challenging missions that develop both technical skill and creative
                problem-solving.
              </p>
              <ul className="space-y-2">
                {["Robot assembly and design principles", "Sensor integration and control logic", "Mission-based programming challenges",
                  "Teamwork and collaborative engineering", "Iterative design and testing", "Physical computing and electronics basics"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="w-2 h-2 bg-[#2ECC71] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#0A2342] rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Why AI Literacy Matters Now</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Children who understand AI are better equipped to use it critically, create with it confidently, and
              navigate a world increasingly shaped by intelligent systems. CODEship&apos;s AI programs develop both
              technical understanding and ethical thinking — preparing children to be creators, not just consumers, of AI.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F5A623] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0A2342] mb-4">Enroll in AI &amp; Robotics</h2>
          <p className="text-[#0A2342]/70 mb-6">Find AI &amp; Robotics programs in your area.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/locations" className="bg-[#0A2342] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors">
              Find a Location
            </Link>
            <Link href="/contact" className="border-2 border-[#0A2342] text-[#0A2342] font-bold px-6 py-3 rounded-xl hover:bg-[#0A2342] hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
