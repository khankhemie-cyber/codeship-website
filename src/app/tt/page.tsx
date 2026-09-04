import type { Metadata } from "next";
import Link from "next/link";
import {
  TRINIDAD_CAMPAIGNS,
  TRINIDAD_PROGRAMME_FEE,
  TRINIDAD_PER_CLASS_FEE,
  TRINIDAD_NEXT_COHORT_START,
  TRINIDAD_TRUST_LINE,
} from "@/data/trinidadCampaigns";
import TTFooter from "@/components/tt/TTFooter";

const url = "https://www.codeshipacademy.com/tt";

export const metadata: Metadata = {
  title: { absolute: "Online Coding & STEM Programs for Kids in Trinidad and Tobago | CODEship" },
  description:
    "Live online coding and STEM programs for children across Trinidad and Tobago, grouped by grade band — Explorers (K–1), Builders (2–3), Developers (4–5) and Engineers (6–8). Four weeks for TT$600.",
  alternates: { canonical: url },
  openGraph: {
    title: "Online Coding & STEM Programs for Kids in Trinidad and Tobago | CODEship",
    description:
      "Live online coding and STEM programs for children across Trinidad and Tobago. Choose your child's grade band and register online.",
    url,
    siteName: "CODEship Academy",
    locale: "en_TT",
    images: [{ url: "/logo-banner.png", width: 1200, height: 630, alt: "CODEship Academy Trinidad and Tobago" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Coding & STEM Programs for Kids in Trinidad and Tobago | CODEship",
    description:
      "Live online coding and STEM programs for children across Trinidad and Tobago. Choose your child's grade band and register online.",
    images: ["/logo-banner.png"],
  },
};

export default function TrinidadProgramsIndex() {
  return (
    <div className="bg-[#FAF8F4]">
      {/* Hero */}
      <section className="bg-[#001532] py-14 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mb-3">Dream. Code. Achieve.</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Online Coding &amp; STEM Programs for Kids in Trinidad and Tobago
          </h1>
          <p className="text-gray-300 text-lg mb-5 leading-relaxed">
            Live, beginner-friendly online classes that help your child move from simply using technology to building with
            it. Choose the program that matches your child&apos;s grade to see the schedule and register.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-block bg-[#E5A823] text-[#001532] font-bold text-sm px-4 py-1.5 rounded-full">
              {TRINIDAD_PROGRAMME_FEE} · Four-week programme
            </span>
            <span className="inline-block bg-white/10 text-white text-sm px-4 py-1.5 rounded-full">
              Begins {TRINIDAD_NEXT_COHORT_START}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-5">{TRINIDAD_TRUST_LINE}</p>
        </div>
      </section>

      {/* Program chooser */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold text-[#001532] mb-2 text-center">Choose Your Child&apos;s Program</h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Grouped by grade band. Each program is {TRINIDAD_PROGRAMME_FEE} for four live weekly classes
          ({TRINIDAD_PER_CLASS_FEE} per class).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TRINIDAD_CAMPAIGNS.map((c) => (
            <Link
              key={c.slug}
              href={`/tt/${c.slug}`}
              className="group block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-[#E5A823] hover:shadow-md transition-all"
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-lg font-bold text-[#001532]">{c.label}</span>
                <span className="text-xs font-semibold text-[#138A9A]">{c.grades} · {c.ages}</span>
              </div>
              <p className="text-gray-500 text-sm mb-3 leading-relaxed">{c.subhead}</p>
              <p className="text-[#001532] text-xs font-semibold">{c.days} · {c.time}</p>
              <p className="text-gray-500 text-xs mb-3">{c.dates}</p>
              <span className="inline-block bg-[#E5A823] text-[#001532] font-bold text-sm px-5 py-2 rounded-lg group-hover:bg-[#d4941f] transition-colors">
                View schedule &amp; register &rarr;
              </span>
            </Link>
          ))}
        </div>
        <p className="text-gray-400 text-[11px] text-center mt-6">
          Not sure which program fits? Email{" "}
          <a href="mailto:admin@codeshipacademy.com" className="text-[#138A9A]">admin@codeshipacademy.com</a> and our team
          will help you choose.
        </p>
      </div>

      <TTFooter />
    </div>
  );
}
