import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Birthday Parties | CODEship Academy",
  description:
    "Unique coding birthday parties for kids ages 6–14. Everyone builds a real game or animation together. Book a CODEship party today.",
  path: "/programs/birthday-parties",
});

export default function BirthdayPartiesPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#E5A823] font-semibold mb-2">Programs</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Coding Birthday Parties
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            An unforgettable birthday experience where every child builds their own game, animation, or digital creation —
            guided by our instructors from start to finish.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">Ages 6–14</span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">2 hours</span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">Up to 12 participants</span>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-bold text-[#001532] mb-4">How It Works</h2>
              <div className="space-y-5">
                {[
                  { step: "1", title: "Choose a Theme", desc: "Pick a coding theme — Game Design, Animation, AI Art, or Web Design." },
                  { step: "2", title: "Everyone Gets Building", desc: "Our instructors guide every child through creating their own unique project in 90 minutes." },
                  { step: "3", title: "Share & Celebrate", desc: "The last 30 minutes is for showing off creations, celebrating the birthday, and digital takeaways." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#E5A823] text-[#001532] rounded-full flex items-center justify-center font-bold shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#001532]">{s.title}</h3>
                      <p className="text-gray-600 text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-[#001532] mb-4">What&apos;s Included</h2>
              <ul className="space-y-3">
                {[
                  "2 hours with a dedicated CODEship instructor",
                  "All equipment and materials provided",
                  "Each child builds their own digital project",
                  "Digital copy of all creations to take home",
                  "Up to 12 party participants",
                  "Choose from available party themes",
                  "Suitable for all experience levels — no experience needed",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="text-[#6E43A8] font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Game Design", bg: "bg-[#001532]" },
              { label: "Animation", bg: "bg-[#6E43A8]" },
              { label: "AI Art", bg: "bg-[#138A9A]" },
              { label: "Web Design", bg: "bg-[#E57A1F]" },
            ].map((theme) => (
              <div key={theme.label} className={`${theme.bg} text-white rounded-xl p-4 text-center font-semibold text-sm`}>
                {theme.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#E5A823] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#001532] mb-4">Book a Birthday Party</h2>
          <p className="text-[#001532]/70 mb-6">Contact us to check availability and book your CODEship birthday party.</p>
          <Link href="/register" className="bg-[#001532] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#001532] transition-colors inline-block">
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
}
