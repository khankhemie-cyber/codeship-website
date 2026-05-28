import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regional Multi-Territory Franchise Model | CODEship Academy",
  description:
    "Own and develop a regional CODEship Academy territory. Multi-territory rights for regional operators. Investment $100K–$150K+.",
  alternates: { canonical: "https://www.codeshipacademy.com/franchise/regional-model" },
};

export default function RegionalModelPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#0A2342] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/franchise" className="text-[#F5A623] text-sm font-semibold hover:underline mb-4 inline-block">
            ← Franchise Overview
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Regional Multi-Territory Model</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Own and develop an entire region. The Regional Model gives you the rights to build multiple CODEship
            Academy locations and support sub-franchisees across your territory.
          </p>
          <div className="mt-6 inline-block bg-[#F5A623] text-[#0A2342] font-bold px-6 py-3 rounded-xl text-xl">
            Investment: $100K–$150K+
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Regional Development Rights</h2>
              <p className="text-gray-600 mb-4">
                The Regional Model is designed for experienced operators or investors who want to build CODEship Academy
                at scale in their region. As a Regional Developer, you have the rights to open multiple locations,
                recruit and support sub-franchisees, and become the cornerstone of CODEship&apos;s growth in your area.
              </p>
              <p className="text-gray-600 mb-6">
                Regional Developers benefit from multiple revenue streams: their own direct operations, participation
                in sub-franchisee royalties, and the growing brand equity of building a regional education network.
              </p>
              <h3 className="font-bold text-[#0A2342] mb-3">Ideal For</h3>
              <ul className="space-y-2 mb-6">
                {["Experienced operators and business builders", "Education sector investors", "Multi-location business developers",
                  "Those with strong regional networks", "Entrepreneurs with a long-term regional vision"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="w-2 h-2 bg-[#2ECC71] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Regional Model Features</h2>
              {[
                { title: "Regional Development Rights", desc: "Exclusive rights to open and develop multiple CODEship locations within your defined region." },
                { title: "Sub-Franchisee Recruitment", desc: "Recruit and support sub-franchisees, building your regional network with CODEship support." },
                { title: "Multiple Revenue Streams", desc: "Own and operate direct locations while participating in sub-franchisee activity in your region." },
                { title: "Strongest Market Position", desc: "Establish CODEship as the dominant children's coding and STEM brand in your entire region." },
                { title: "Premium Franchisor Support", desc: "Enhanced support, dedicated account management, and priority access to new curriculum and programs." },
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
          <h2 className="text-3xl font-bold text-white mb-4">Explore Regional Development</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/franchise#kit" className="bg-[#F5A623] text-[#0A2342] font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
              Request Franchise Kit
            </Link>
            <Link href="/contact" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-[#0A2342] transition-colors">
              Request a Discovery Call
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
