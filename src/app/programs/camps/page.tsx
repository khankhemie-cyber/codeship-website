import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kids Coding Camps | Summer, March Break & PA Day",
  description:
    "CODEship Academy coding and STEM camps for kids — summer camps, March Break camps, and PA Day workshops. Hands-on project-based learning.",
  alternates: { canonical: "https://www.codeshipacademy.com/programs/camps" },
};

export default function CampsPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#0A2342] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#F5A623] font-semibold mb-2">Programs</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Coding Camps &amp; Holiday Programs
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Immersive multi-day camp experiences where children build real projects, explore new technologies, and
            discover what they can create.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { title: "Summer Camp", icon: "☀️", dates: "July – August", duration: "Full week (Mon–Fri)", desc: "Week-long immersive camps with themed project tracks. Children build ambitious projects over 5 days and present their work at a final showcase." },
              { title: "March Break Camp", icon: "🌱", dates: "March break week", duration: "Full or half week", desc: "Make the most of the break with an intensive coding and STEM experience. Choose from game design, web development, AI, or robotics tracks." },
              { title: "PA Day Workshops", icon: "📚", dates: "School PA days", duration: "Full or half day", desc: "One-day deep-dive workshops timed to your school board's PA days. A perfect way to spend a day off building something real." },
            ].map((camp) => (
              <div key={camp.title} className="bg-white rounded-2xl shadow-md p-6">
                <div className="text-4xl mb-3">{camp.icon}</div>
                <h2 className="font-bold text-[#0A2342] text-xl mb-1">{camp.title}</h2>
                <p className="text-xs text-gray-400 mb-3">{camp.dates} · {camp.duration}</p>
                <p className="text-gray-600 text-sm">{camp.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#0A2342] mb-6">Camp Themes &amp; Tracks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { theme: "Game Design Studio", desc: "Design, build, and play original games using visual and text-based coding tools." },
                { theme: "Web Creators", desc: "Build and publish real websites using HTML, CSS, and JavaScript." },
                { theme: "AI Explorers", desc: "Discover how AI works and build hands-on AI projects and experiments." },
                { theme: "Robotics Challenge", desc: "Program robots to complete missions and engineering challenges." },
                { theme: "App Builders", desc: "Prototype and build your own mobile app idea from concept to demo." },
                { theme: "Digital Storytellers", desc: "Create interactive stories, animations, and digital narratives." },
              ].map((t) => (
                <div key={t.theme} className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-[#0A2342] mb-1 text-sm">{t.theme}</h3>
                  <p className="text-gray-500 text-xs">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F5A623]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#0A2342] mb-4">Register for a Camp</h2>
          <p className="text-[#0A2342]/70 mb-6">Find upcoming camp dates in your area and secure your child&apos;s spot.</p>
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
