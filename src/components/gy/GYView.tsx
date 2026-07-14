"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { GuyanaCampaign } from "@/data/guyanaCampaigns";
import {
  GUYANA_TRUST_LINE,
  GUYANA_OUTCOME_BULLETS,
  GUYANA_PROJECTS_BY_AGE,
  GUYANA_PRICING,
  GUYANA_FAQ,
  GUYANA_NEXT_SEMESTER_START,
} from "@/data/guyanaCampaigns";
import { getGuyanaHeadline } from "@/data/guyanaVariants";
import { buildGuyanaRegistrationUrl } from "@/lib/buildGuyanaRegistrationUrl";
import { trackView, trackRegisterClick, trackPriceView } from "@/lib/analytics";
import FAQAccordion from "@/components/FAQAccordion";
import StickyMobileCTA from "@/components/lp/StickyMobileCTA";
import GYFooter from "./GYFooter";

// A short, easy-to-scan set — the full lists in guyanaCampaigns.ts stay available for future use.
const OUTCOME_HIGHLIGHTS = GUYANA_OUTCOME_BULLETS.slice(0, 5);
const PROJECT_HIGHLIGHTS = GUYANA_PROJECTS_BY_AGE.flatMap((g) => g.projects.slice(0, 2));
const FAQ_HIGHLIGHTS = GUYANA_FAQ.slice(0, 4);

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
      {/* Hero */}
      <section className="bg-[#001532] py-14 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mb-3">Dream. Code. Achieve.</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">{headline}</h1>
          <p className="text-gray-300 text-lg mb-5 leading-relaxed">{campaign.subhead}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-block bg-[#E5A823] text-[#001532] font-bold text-sm px-4 py-1.5 rounded-full">
              GYD $20,000 per semester
            </span>
            <span className="inline-block bg-white/10 text-white text-sm px-4 py-1.5 rounded-full">
              Next semester starts {GUYANA_NEXT_SEMESTER_START}
            </span>
          </div>
          <Link
            href={registrationUrl}
            onClick={handleRegisterClick}
            className="inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-all text-lg shadow-lg"
          >
            Register for Online Classes
          </Link>
          <p className="text-gray-400 text-xs mt-5">{GUYANA_TRUST_LINE}</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* What they'll be able to do */}
        <section aria-labelledby="outcomes-heading">
          <h2 id="outcomes-heading" className="text-2xl font-bold text-[#001532] mb-2 text-center">
            After One Semester, Your Child Will Be Able To:
          </h2>
          <p className="text-gray-500 text-sm text-center mb-5">{campaign.corePromise}</p>
          <ul className="space-y-2.5">
            {OUTCOME_HIGHLIGHTS.map((b) => (
              <li key={b} className="flex items-start gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E5A823] text-[#001532] font-bold text-[10px] shrink-0 mt-0.5">
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

        {/* Real projects */}
        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            What They Might Build
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {PROJECT_HIGHLIGHTS.map((proj) => (
              <div key={proj} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#6E43A8] rounded-full shrink-0" />
                <span className="text-[#001532] text-xs font-medium">{proj}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section aria-labelledby="pricing-heading">
          <h2 id="pricing-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Pricing
          </h2>
          <div className="bg-[#001532] rounded-xl p-6 text-center">
            <h3 className="text-white font-bold text-xl mb-1">{GUYANA_PRICING.semesterFeeLabel}</h3>
            <p className="text-gray-300 text-sm mb-1">{GUYANA_PRICING.includesLine}</p>
            <p className="text-gray-400 text-xs mb-1">{GUYANA_PRICING.perSessionLine}</p>
            <p className="text-[#E5A823] text-xs font-semibold mb-4">Next semester starts {GUYANA_NEXT_SEMESTER_START}</p>
            <Link
              href={registrationUrl}
              onClick={handleRegisterClick}
              className="inline-block bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors"
            >
              {GUYANA_PRICING.ctaLabel}
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Common Questions
          </h2>
          <FAQAccordion faqs={FAQ_HIGHLIGHTS} />
        </section>
      </div>

      {/* Final CTA band */}
      <section className="bg-[#001532] py-14 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Give your child skills they can use in school, online, and in the future.
          </h2>
          <Link
            href={registrationUrl}
            onClick={handleRegisterClick}
            className="inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors text-lg"
          >
            Register for Online Classes
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
