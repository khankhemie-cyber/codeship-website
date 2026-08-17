import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAMS } from "@/data/programs";
import { CLASS_SCHEDULE } from "@/config/classSchedule";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Weekly Coding Classes for Kids | Ages 5–16",
  description:
    "CODEship Academy's weekly coding and STEM classes for children ages 5–16. Project-based, ongoing, and inclusive. Find classes near you.",
  path: "/programs/weekly-classes",
});

export default function WeeklyClassesPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#E5A823] font-semibold mb-2">Programs</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Weekly Coding &amp; STEM Classes</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Ongoing weekly classes where children build real projects, develop coding skills, and grow their creative
            confidence over time.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">Ages 5–16</span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">60–90 min sessions</span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">All experience levels</span>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#001532] mb-4">What Happens in a Weekly Class?</h2>
              <p className="text-gray-600 mb-4">
                Every CODEship weekly class is structured around project-based learning. Children don&apos;t follow tutorials —
                they bring their own ideas and build them into real digital projects with guidance from our instructors.
              </p>
              <p className="text-gray-600 mb-6">
                Each session begins with a short skill-building activity, then moves into extended project work time.
                Children share progress with each other and receive feedback from instructors in a supportive, encouraging
                environment.
              </p>
              <h3 className="font-bold text-[#001532] mb-3">What Children Build</h3>
              <ul className="space-y-2 mb-6">
                {["Original games and interactive experiences", "Websites and web apps", "Animations and digital stories",
                  "AI projects and experiments", "App prototypes", "Robotics and physical computing projects"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="w-2 h-2 bg-[#138A9A] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#001532] mb-1">Program Levels</h2>
              <p className="text-gray-500 text-sm mb-4">
                The CODEship Journey: four connected levels from K to Grade 8, each 4 semesters + a capstone.
              </p>
              {PROGRAMS.map((prog) => (
                <Link
                  key={prog.slug}
                  href={`/programs/${prog.slug}`}
                  className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 border-l-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: prog.accentColour }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-[#001532]">{prog.level}</h3>
                    <span className="text-xs bg-[#E5A823]/20 text-[#001532] font-semibold px-2 py-0.5 rounded">{prog.gradeBand}</span>
                  </div>
                  <p className="text-[#E5A823] text-xs font-semibold mb-1.5">{prog.codingSpace}</p>
                  <p className="text-gray-600 text-sm mb-3">{prog.outcome}</p>
                  <div className="border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-600">
                    <p>
                      <span className="font-semibold text-[#001532]">In-person (Oshawa):</span>{" "}
                      {CLASS_SCHEDULE[prog.slug].inperson.days}, {CLASS_SCHEDULE[prog.slug].inperson.time}
                    </p>
                    <p>
                      <span className="font-semibold text-[#001532]">Online:</span>{" "}
                      {CLASS_SCHEDULE[prog.slug].online.days}, {CLASS_SCHEDULE[prog.slug].online.time}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#001532] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Enroll?</h2>
          <p className="text-gray-300 mb-6">Find weekly classes near you and secure your child&apos;s spot.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors">
              Register Now
            </Link>
            <Link href="/locations" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-[#001532] transition-colors">
              Find a Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
