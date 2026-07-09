"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { GuyanaCampaign } from "@/data/guyanaCampaigns";
import {
  GUYANA_TRUST_LINE,
  GUYANA_PARENT_PROBLEMS,
  GUYANA_LEARN_AREAS,
  GUYANA_OUTCOME_BULLETS,
  GUYANA_PROGRAM_STRUCTURE_BULLETS,
  GUYANA_CURRICULUM_INTRO,
  GUYANA_CURRICULUM_PILLARS,
  GUYANA_PROJECTS_BY_AGE,
  GUYANA_WHY_CHOOSE,
  GUYANA_PRICING,
  GUYANA_FAQ,
  GUYANA_FINAL_CTA,
} from "@/data/guyanaCampaigns";
import { getGuyanaHeadline } from "@/data/guyanaVariants";
import { buildGuyanaRegistrationUrl } from "@/lib/buildGuyanaRegistrationUrl";
import { trackView, trackRegisterClick, trackPriceView } from "@/lib/analytics";
import FAQAccordion from "@/components/FAQAccordion";
import GuyanaLeadForm from "./GuyanaLeadForm";
import StickyMobileCTA from "@/components/lp/StickyMobileCTA";
import GYFooter from "./GYFooter";

export default function GYView({ campaign }: { campaign: GuyanaCampaign }) {
  const searchParams = useSearchParams();

  const utmSource = searchParams.get("utm_source") ?? undefined;
  const utmMedium = searchParams.get("utm_medium") ?? undefined;
  const utmCampaign = searchParams.get("utm_campaign") ?? undefined;
  const utmContent = searchParams.get("utm_content") ?? undefined;
  const utmTerm = searchParams.get("utm_term") ?? undefined;
  const variantParam = searchParams.get("v");

  const utmSnapshot = useMemo(
    () => ({ utm_source: utmSource, utm_medium: utmMedium, utm_campaign: utmCampaign, utm_content: utmContent, utm_term: utmTerm }),
    [utmSource, utmMedium, utmCampaign, utmContent, utmTerm]
  );

  const eventBase = { page: campaign.slug, country: "guyana" as const, location: "online" as const, ...utmSnapshot };

  useEffect(() => {
    trackView(eventBase);
    trackPriceView(eventBase);
    // Fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registrationUrl = buildGuyanaRegistrationUrl({
    page: campaign.slug,
    source: utmSource,
    medium: utmMedium,
    campaign: utmCampaign,
    content: utmContent,
    term: utmTerm,
  });

  const handleRegisterClick = () => trackRegisterClick(eventBase);

  const headline = getGuyanaHeadline(campaign.slug, variantParam);

  return (
    <div className="bg-[#FAF8F4]">
      {/* 1. Hero */}
      <section className="bg-[#001532] py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mb-3">Dream. Code. Achieve.</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">{headline}</h1>
          <p className="text-gray-300 text-lg mb-5 leading-relaxed">{campaign.subhead}</p>
          <p className="inline-block bg-[#E5A823] text-[#001532] font-bold text-sm px-4 py-1.5 rounded-full mb-6">
            GYD $20,000 per semester
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={registrationUrl}
              onClick={handleRegisterClick}
              className="inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-all text-lg shadow-lg"
            >
              Register for Online Classes
            </Link>
            <a
              href="#program-details"
              className="inline-block border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-[#001532] transition-all text-lg"
            >
              Get the Program Details
            </a>
          </div>
          <p className="text-gray-400 text-xs mt-5">{GUYANA_TRUST_LINE}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {/* 2. Parent problem section */}
        <section aria-labelledby="problems-heading">
          <h2 id="problems-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Sound familiar?
          </h2>
          <ul className="space-y-2">
            {GUYANA_PARENT_PROBLEMS.map((p) => (
              <li key={p} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#138A9A] shrink-0 mt-2" />
                <span className="text-[#001532] text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. What your child will learn */}
        <section aria-labelledby="learn-heading">
          <h2 id="learn-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            What Your Child Will Learn
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GUYANA_LEARN_AREAS.map((a) => (
              <div key={a} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                <span className="text-[#001532] text-xs font-semibold">{a}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Semester outcomes */}
        <section aria-labelledby="outcomes-heading">
          <h2 id="outcomes-heading" className="text-2xl font-bold text-[#001532] mb-2 text-center">
            By the End of the Semester, Your Child Will Be Able To:
          </h2>
          <p className="text-gray-500 text-sm text-center mb-5">{campaign.corePromise}</p>
          <ul className="space-y-3">
            {GUYANA_OUTCOME_BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5A823] text-[#001532] font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-[#001532] text-sm">{b}</span>
              </li>
            ))}
          </ul>
          {campaign.complianceNote && (
            <p className="text-gray-500 text-xs mt-4 bg-white border border-dashed border-gray-300 rounded-lg p-3">
              {campaign.complianceNote}
            </p>
          )}
        </section>

        {/* 5. Program structure */}
        <section aria-labelledby="structure-heading">
          <h2 id="structure-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Program Structure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GUYANA_PROGRAM_STRUCTURE_BULLETS.map((s) => (
              <div key={s} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <span className="w-2 h-2 bg-[#138A9A] rounded-full shrink-0" />
                <span className="text-[#001532] text-sm font-medium">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Curriculum support */}
        <section aria-labelledby="curriculum-heading">
          <h2 id="curriculum-heading" className="text-2xl font-bold text-[#001532] mb-3 text-center">
            More Than Just Coding
          </h2>
          <p className="text-gray-600 text-sm text-center mb-6 max-w-xl mx-auto">{GUYANA_CURRICULUM_INTRO}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GUYANA_CURRICULUM_PILLARS.map((p) => (
              <div key={p.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#001532] text-sm mb-1">{p.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Projects */}
        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            What They Might Build
          </h2>
          <div className="space-y-5">
            {GUYANA_PROJECTS_BY_AGE.map((group) => (
              <div key={group.group}>
                <h3 className="font-semibold text-[#001532] text-sm mb-2">{group.group}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.projects.map((proj) => (
                    <div key={proj} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#6E43A8] rounded-full shrink-0" />
                      <span className="text-[#001532] text-xs font-medium">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Why parents choose CODEship */}
        <section aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Why Parents Choose CODEship
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GUYANA_WHY_CHOOSE.map((w) => (
              <li key={w} className="flex items-start gap-2.5 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#138A9A] text-white font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-[#001532] text-sm">{w}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. Pricing + lead capture */}
        <section id="program-details" aria-labelledby="pricing-heading" className="scroll-mt-20">
          <h2 id="pricing-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Pricing
          </h2>
          <div className="bg-[#001532] rounded-xl p-6 text-center mb-4">
            <h3 className="text-white font-bold text-xl mb-1">{GUYANA_PRICING.semesterFeeLabel}</h3>
            <p className="text-gray-300 text-sm mb-1">{GUYANA_PRICING.includesLine}</p>
            <p className="text-gray-400 text-xs mb-4">{GUYANA_PRICING.perSessionLine}</p>
            <Link
              href={registrationUrl}
              onClick={handleRegisterClick}
              className="inline-block bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors"
            >
              {GUYANA_PRICING.ctaLabel}
            </Link>
          </div>
          <p className="text-center text-gray-400 text-xs mb-4 uppercase tracking-widest">or</p>
          <GuyanaLeadForm page={campaign.slug} utm={utmSnapshot} />
        </section>

        {/* 10. FAQ */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Common Questions
          </h2>
          <FAQAccordion faqs={GUYANA_FAQ} />
        </section>
      </div>

      {/* 11. Final CTA band */}
      <section className="bg-[#001532] py-14 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{GUYANA_FINAL_CTA.headline}</h2>
          <Link
            href={registrationUrl}
            onClick={handleRegisterClick}
            className="inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors text-lg"
          >
            {GUYANA_FINAL_CTA.ctaLabel}
          </Link>
          <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mt-6">Dream. Code. Achieve.</p>
        </div>
      </section>

      <GYFooter />

      <StickyMobileCTA href={registrationUrl} label="Register for Online Classes" onClick={handleRegisterClick} />
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
