import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mobile Community Franchise Model | CODEship Academy",
  description:
    "The CODEship Mobile Community Model — low-investment, community-based children's coding franchise from $10K–$18K. School-focused delivery.",
  alternates: { canonical: "https://www.codeshipacademy.com/franchise/mobile-model" },
};

export default function MobileModelPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/franchise" className="text-[#E5A823] text-sm font-semibold hover:underline mb-4 inline-block">
            ← Franchise Overview
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Mobile Community Model</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            The lowest-investment path to owning a CODEship Academy franchise — built for community-first entrepreneurs
            who want to reach children where they already are.
          </p>
          <div className="mt-6 inline-block bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl text-xl">
            Investment: $10K–$18K
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#001532] mb-4">How the Mobile Model Works</h2>
              <p className="text-gray-600 mb-4">
                The Mobile Community Model delivers CODEship programs at community centres, libraries, schools,
                recreation facilities, and partner spaces — without requiring a dedicated studio location.
              </p>
              <p className="text-gray-600 mb-6">
                This model is designed for entrepreneurs who are deeply embedded in their local community, have strong
                relationships with schools and community organizations, and want to build a business with lower overhead
                and maximum flexibility.
              </p>
              <h3 className="font-bold text-[#001532] mb-3">Ideal For</h3>
              <ul className="space-y-2 mb-6">
                {["Former educators and school staff", "Community and recreation professionals", "Parents seeking purpose-driven entrepreneurship",
                  "Those wanting to start part-time", "Community organization leaders"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="w-2 h-2 bg-[#138A9A] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#001532] mb-4">Key Features</h2>
              {[
                { title: "Community-Based Delivery", desc: "Operate at schools, community centres, libraries, and partner locations. No studio lease required." },
                { title: "School Partnership Focus", desc: "After-school clubs and workshops at local schools are the primary delivery channel." },
                { title: "Flexible Schedule", desc: "Build your program schedule around your community's needs and your personal capacity." },
                { title: "Low Overhead", desc: "Without a dedicated studio, overhead costs remain minimal — improving financial viability." },
                { title: "Comprehensive Support", desc: "Full curriculum, training, marketing, and operational support from CODEship." },
              ].map((feature) => (
                <div key={feature.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#001532] mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#001532] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Learn More?</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/franchise#kit" className="bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors">
              Request Franchise Kit
            </Link>
            <Link href="/franchise" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-[#001532] transition-colors">
              Compare Models
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            For informational purposes only. No franchise offering is made here. No earnings claims are made or implied.
          </p>
        </div>
      </section>
    </div>
  );
}
