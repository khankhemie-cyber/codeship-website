import type { Metadata } from "next";
import Link from "next/link";
import FranchiseSelector from "@/components/FranchiseSelector";
import FAQAccordion from "@/components/FAQAccordion";
import FranchiseKitForm from "@/components/FranchiseKitForm";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  description:
    "Build the future in your community with a CODEship Academy franchise. Three flexible models from $10K–$150K+. No tech background required.",
  alternates: { canonical: "https://www.codeshipacademy.com/franchise" },
};

const franchiseFaqs = [
  {
    question: "Do I need a background in coding or technology?",
    answer: "No. CODEship franchisees come from diverse backgrounds — education, business, community work, and more. We provide full curriculum, instructor training, and operational support. Passion for children's education and community matters more than technical expertise.",
  },
  {
    question: "What is the royalty rate?",
    answer: "CODEship charges a 6% royalty on gross revenue, plus a 2% brand marketing fund contribution. These rates are subject to the terms of the Franchise Agreement and Franchise Disclosure Document.",
  },
  {
    question: "What support is included?",
    answer: "All franchisees receive initial training, curriculum access, marketing templates, technology systems, ongoing coaching, and access to the franchisee network. The specific support included varies by franchise model.",
  },
  {
    question: "Can I operate part-time initially?",
    answer: "The Mobile Model is designed to support part-time operation in the early stages. Studio and Regional models typically require more significant time investment.",
  },
  {
    question: "What territories are available?",
    answer: "We are actively expanding across Canada. Contact us to inquire about availability in your area.",
  },
];

export default function FranchisePage() {
  return (
    <div className="bg-[#FAF8F4]">
      {/* Hero */}
      <section className="bg-[#071B3B] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Build the Future in Your Community
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-6">
            More than coding. More than robotics. CODEship Academy is a mission-driven children&apos;s education franchise
            building the next generation of creators, thinkers, and innovators.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="#kit" className="bg-[#E5A823] text-[#071B3B] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors">
              Request Franchise Kit
            </Link>
            <Link href="#selector" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-[#071B3B] transition-colors">
              Find Your Model
            </Link>
          </div>
        </div>
      </section>

      {/* Why CODEship */}
      <section className="py-20 bg-[#F1EEE8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#071B3B] mb-4">Why CODEship Academy?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A franchise opportunity built on a curriculum that children love, a model that serves communities, and a
              support structure designed to help you succeed.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Growing Market", desc: "Parent demand for coding, AI, and STEM education for children is growing rapidly across Canada.", dot: "bg-[#E57A1F]" },
              { title: "Mission-Driven", desc: "Build a business that genuinely serves your community and shapes the next generation of creators.", dot: "bg-[#071B3B]" },
              { title: "Flexible Models", desc: "Three franchise models from mobile community delivery to dedicated studio locations and regional operations.", dot: "bg-[#138A9A]" },
              { title: "School Partnerships", desc: "Our school partnership model provides a built-in channel to your community's families.", dot: "bg-[#138A9A]" },
              { title: "No Tech Required", desc: "No coding background needed. CODEship provides all curriculum, training, and instructor support.", dot: "bg-[#6E43A8]" },
              { title: "Full System Support", desc: "Curriculum, marketing, technology, training, and ongoing coaching — we support your success.", dot: "bg-[#E5A823]" },
            ].map((w) => (
              <div key={w.title} className="bg-[#FAF8F4] rounded-2xl p-6">
                <div className={`w-3 h-3 ${w.dot} rounded-full mb-4`} />
                <h3 className="font-bold text-[#071B3B] mb-2">{w.title}</h3>
                <p className="text-gray-600 text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Models */}
      <section className="py-20 bg-[#FAF8F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#071B3B] text-center mb-10">Three Franchise Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Mobile Community Model",
                investment: "$10K–$18K",
                schedule: "Part-time to full-time",
                best: "Community-focused entrepreneurs",
                href: "/franchise/mobile-model",
                features: ["Community-based delivery", "No dedicated studio needed", "School partnerships", "Lowest entry investment", "Flexible schedule"],
                topBorder: "border-t-4 border-[#138A9A]",
              },
              {
                title: "Studio Learning Centre",
                investment: "$60K–$100K",
                schedule: "Full-time operation",
                best: "Education entrepreneurs building a hub",
                href: "/franchise/studio-model",
                features: ["Branded dedicated studio", "Full program suite", "Birthday parties", "Community hub model", "Walk-in visibility"],
                featured: true,
                topBorder: "border-t-4 border-[#E5A823]",
              },
              {
                title: "Regional Multi-Territory",
                investment: "$100K–$150K+",
                schedule: "Full-time, multi-location",
                best: "Regional builders and investors",
                href: "/franchise/regional-model",
                features: ["Regional development rights", "Multiple territories", "Sub-franchisee support", "Strongest market position", "Scalable model"],
                topBorder: "border-t-4 border-[#E57A1F]",
              },
            ].map((model) => (
              <div
                key={model.title}
                className={`rounded-2xl p-6 ${model.featured ? "bg-[#071B3B] text-white shadow-xl scale-105" : "bg-white shadow-md"} ${model.topBorder}`}
              >
                {model.featured && (
                  <div className="text-[#E5A823] text-xs font-bold uppercase tracking-wide mb-2">Most Popular</div>
                )}
                <h3 className={`font-bold text-xl mb-1 ${model.featured ? "text-white" : "text-[#071B3B]"}`}>{model.title}</h3>
                <p className={`text-2xl font-bold mb-1 ${model.featured ? "text-[#E5A823]" : "text-[#E5A823]"}`}>{model.investment}</p>
                <p className={`text-xs mb-4 ${model.featured ? "text-gray-400" : "text-gray-500"}`}>{model.schedule}</p>
                <ul className="space-y-2 mb-6">
                  {model.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${model.featured ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="w-1.5 h-1.5 bg-[#138A9A] rounded-full shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={model.href}
                  className={`block text-center font-bold px-4 py-3 rounded-xl transition-colors ${
                    model.featured
                      ? "bg-[#E5A823] text-[#071B3B] hover:bg-[#d4941f]"
                      : "border-2 border-[#071B3B] text-[#071B3B] hover:bg-[#071B3B] hover:text-white"
                  }`}
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#071B3B] text-white">
                <tr>
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center">Mobile</th>
                  <th className="p-4 text-center">Studio</th>
                  <th className="p-4 text-center">Regional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Investment Range", "$10K–$18K", "$60K–$100K", "$100K–$150K+"],
                  ["Dedicated Studio", "No", "Yes", "Yes"],
                  ["School Partnerships", "Primary", "Yes", "Yes"],
                  ["Birthday Parties", "Limited", "Yes", "Yes"],
                  ["Royalty", "6%", "6%", "6%"],
                  ["Brand Marketing", "2%", "2%", "2%"],
                  ["Part-Time Viable", "Yes", "Possible", "No"],
                  ["Sub-Franchisees", "No", "No", "Yes"],
                ].map(([feature, mobile, studio, regional]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-[#071B3B]">{feature}</td>
                    <td className="p-4 text-center text-gray-600">{mobile}</td>
                    <td className="p-4 text-center text-gray-600 bg-[#FAF8F4]">{studio}</td>
                    <td className="p-4 text-center text-gray-600">{regional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ideal Partners */}
      <section className="py-20 bg-[#F1EEE8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#071B3B] text-center mb-10">Ideal Franchise Partners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Former or current educators and school staff",
              "Parents passionate about children's education",
              "Community and recreation professionals",
              "Entrepreneurs seeking purposeful businesses",
              "Business owners expanding into education",
              "Professionals making a career transition to purpose-driven work",
            ].map((partner) => (
              <div key={partner} className="bg-[#FAF8F4] rounded-xl p-4 flex items-start gap-3">
                <span className="text-[#E57A1F] font-bold">✓</span>
                <p className="text-gray-700 text-sm">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 bg-[#FAF8F4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#071B3B] text-center mb-10">What&apos;s Included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Full Curriculum", desc: "Complete, age-graded curriculum across all programs." },
              { title: "Initial Training", desc: "Comprehensive training on curriculum, operations, and business." },
              { title: "Marketing Support", desc: "Templates, brand assets, and digital marketing resources." },
              { title: "Technology Systems", desc: "Booking, operations, and communication platforms." },
              { title: "Instructor Training", desc: "Training and quality standards for your teaching team." },
              { title: "Ongoing Coaching", desc: "Regular support calls, field visits, and performance reviews." },
              { title: "Franchisee Network", desc: "Community of fellow franchisees for peer support and sharing." },
              { title: "Curriculum Updates", desc: "Regular curriculum updates to stay current with technology trends." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#E5A823]">
                <h3 className="font-bold text-[#071B3B] mb-1 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Streams */}
      <section className="py-16 bg-[#F1EEE8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#071B3B] text-center mb-4">Revenue Streams</h2>
          <p className="text-gray-500 text-center text-sm mb-8">
            CODEship Academy franchisees can access multiple revenue streams across the business. No projections or
            earnings representations are made or implied.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Weekly Classes", "Summer Camps", "March Break Camps", "PA Day Workshops", "School Partnerships", "Birthday Parties", "After-School Clubs", "AI & Robotics Programs", "Holiday Programs"].map((stream) => (
              <div key={stream} className="bg-[#FAF8F4] rounded-xl p-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-[#E57A1F] rounded-full" />
                <span className="text-gray-700 text-sm font-medium">{stream}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise Selector */}
      <section className="py-20 bg-[#FAF8F4]" id="selector">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#071B3B] text-center mb-4">Find Your Franchise Model</h2>
          <p className="text-gray-600 text-center mb-8">Answer 4 questions to get a personalized recommendation.</p>
          <FranchiseSelector />
        </div>
      </section>

      {/* Franchise Kit Form */}
      <section className="py-20 bg-[#071B3B]" id="kit">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Request Your Franchise Kit</h2>
          <p className="text-gray-300 text-center mb-8">
            Complete the form below and we&apos;ll send you our franchise information package within 1–2 business days.
          </p>
          <FranchiseKitForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#FAF8F4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#071B3B] text-center mb-8">Franchise FAQ</h2>
          <FAQAccordion faqs={franchiseFaqs} />
          <p className="text-xs text-gray-400 text-center mt-6">
            This page is for informational purposes only and does not constitute a franchise offering. Franchise
            offerings are made only through a Franchise Disclosure Document where required by law. No earnings
            claims are made or implied.
          </p>
        </div>
      </section>
    </div>
  );
}
