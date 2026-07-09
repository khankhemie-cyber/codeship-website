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
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#E5A823] font-semibold mb-2">Programs</p>
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
                <h2 className="font-bold text-[#001532] text-xl mb-1">{camp.title}</h2>
                <p className="text-xs text-gray-400 mb-3">{camp.dates} · {camp.duration}</p>
                <p className="text-gray-600 text-sm">{camp.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#001532] mb-6">Camp Themes &amp; Tracks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { theme: "Game Design Studio", desc: "Design, build, and play original games using visual and text-based coding tools.", accent: "border-l-4 border-[#138A9A]" },
                { theme: "Web Creators", desc: "Build and publish real websites using HTML, CSS, and JavaScript.", accent: "border-l-4 border-[#138A9A]" },
                { theme: "AI Explorers", desc: "Discover how AI works and build hands-on AI projects and experiments.", accent: "border-l-4 border-[#138A9A]" },
                { theme: "Robotics Challenge", desc: "Program robots to complete missions and engineering challenges.", accent: "border-l-4 border-[#138A9A]" },
                { theme: "App Builders", desc: "Prototype and build your own mobile app idea from concept to demo.", accent: "border-l-4 border-[#6E43A8]" },
                { theme: "Digital Storytellers", desc: "Create interactive stories, animations, and digital narratives.", accent: "border-l-4 border-[#6E43A8]" },
              ].map((t) => (
                <div key={t.theme} className={`bg-[#FAF8F4] rounded-xl p-4 border border-gray-100 ${t.accent}`}>
                  <h3 className="font-bold text-[#001532] mb-1 text-sm">{t.theme}</h3>
                  <p className="text-gray-500 text-xs">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#E5A823]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#001532] mb-4">Register for a Camp</h2>
          <p className="text-[#001532]/70 mb-6">Find upcoming camp dates in your area and secure your child&apos;s spot.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-[#001532] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#001532] transition-colors">
              Register Now
            </Link>
            <Link href="/locations" className="border-2 border-[#001532] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#001532] hover:text-white transition-colors">
              Find a Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
