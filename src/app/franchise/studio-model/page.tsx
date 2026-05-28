import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Studio Learning Centre Franchise Model | CODEship Academy",
  description:
    "Open a CODEship Academy Studio Learning Centre — a dedicated branded space for coding, AI, and STEM education. Investment $40K–$100K.",
  alternates: { canonical: "https://www.codeshipacademy.com/franchise/studio-model" },
};

export default function StudioModelPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#0A2342] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/franchise" className="text-[#F5A623] text-sm font-semibold hover:underline mb-4 inline-block">
            ← Franchise Overview
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Studio Learning Centre Model</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Your own branded CODEship Academy studio — a dedicated community learning hub for coding, AI, STEM,
            birthday parties, and more.
          </p>
          <div className="mt-6 inline-block bg-[#F5A623] text-[#0A2342] font-bold px-6 py-3 rounded-xl text-xl">
            Investment: $40K–$100K
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#0A2342] mb-4">A Dedicated Home for Your Community</h2>
              <p className="text-gray-600 mb-4">
                The Studio Learning Centre Model gives you a branded, permanent location in your community — a physical
                home for CODEship programs that families can visit, parents can trust, and children can grow in.
              </p>
              <p className="text-gray-600 mb-6">
                A dedicated studio enables a wider range of programs, including birthday parties, drop-in workshops, and
                evening classes that are harder to run in community spaces. It also builds community visibility and
                brand presence in your area.
              </p>
              <h3 className="font-bold text-[#0A2342] mb-3">Programs Available in Studio</h3>
              <ul className="space-y-2 mb-6">
                {["Weekly classes (all levels)", "Summer, March Break & PA Day camps", "Birthday parties", "After-school programs",
                  "AI & Robotics programs", "Evening workshops", "School partnership programs"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="w-2 h-2 bg-[#2ECC71] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Studio Model Features</h2>
              {[
                { title: "Dedicated Branded Space", desc: "A fully branded CODEship Academy studio, designed to create an inspiring learning environment." },
                { title: "Full Program Suite", desc: "Access to the complete CODEship program portfolio including birthday parties and evening events." },
                { title: "Community Hub", desc: "Become a recognized educational hub in your neighbourhood — building lasting community relationships." },
                { title: "Walk-In Visibility", desc: "Street-level presence builds brand awareness organically within your local community." },
                { title: "Comprehensive Support", desc: "Complete franchisor support: curriculum, marketing, training, technology, and ongoing coaching." },
              ].map((feature) => (
                <div key={feature.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#0A2342] mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0A2342] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Explore the Studio Model</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/franchise#kit" className="bg-[#F5A623] text-[#0A2342] font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
              Request Franchise Kit
            </Link>
            <Link href="/franchise" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-[#0A2342] transition-colors">
              Compare Models
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            For informational purposes only. No earnings claims are made or implied.
          </p>
        </div>
      </section>
    </div>
  );
}
