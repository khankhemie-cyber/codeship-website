"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { TrinidadCampaign } from "@/data/trinidadCampaigns";
import {
  TRINIDAD_TRUST_LINE,
  TRINIDAD_HOW_IT_WORKS,
  TRINIDAD_PRICING,
  TRINIDAD_FAQ,
  TRINIDAD_PROGRAMME_FEE,
  TRINIDAD_NEXT_COHORT_START,
  TRINIDAD_LEAD_SUBMITTED_MESSAGE,
  TRINIDAD_STRIPE_LINKS,
} from "@/data/trinidadCampaigns";
import type { ProgramLevel } from "@/lib/payment-links";
import { getTrinidadHeadline } from "@/data/trinidadVariants";
import { trackView, trackRegisterClick, trackPriceView } from "@/lib/analytics";
import FAQAccordion from "@/components/FAQAccordion";
import TTFooter from "./TTFooter";

export default function TTView({ campaign }: { campaign: TrinidadCampaign }) {
  const searchParams = useSearchParams();

  const utmSource = searchParams.get("utm_source") ?? undefined;
  const utmMedium = searchParams.get("utm_medium") ?? undefined;
  const utmCampaign = searchParams.get("utm_campaign") ?? undefined;
  const utmContent = searchParams.get("utm_content") ?? undefined;
  const utmTerm = searchParams.get("utm_term") ?? undefined;
  const variantParam = searchParams.get("v");
  // Paid Meta Instant Form leads land here with ?lead_submitted=1 — they've
  // already registered, so the page confirms instead of asking again.
  const leadSubmitted = searchParams.get("lead_submitted") === "1";

  const eventBase = {
    page: campaign.slug,
    country: "trinidad-tobago" as const,
    location: "online" as const,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
  };

  useEffect(() => {
    trackView(eventBase);
    trackPriceView(eventBase);
    // Fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Registration is a per-level Stripe checkout (see TRINIDAD_STRIPE_LINKS).
  // The hero and final CTAs scroll to the #register block where the parent
  // picks their child's level; each level button links straight to its TT
  // Stripe Payment Link. register_click fires with the chosen level.
  const handleRegisterClick = (level: ProgramLevel) => () =>
    trackRegisterClick({ ...eventBase, program: level });

  const headline = getTrinidadHeadline(campaign.slug, variantParam);

  return (
    <div className="bg-[#FAF8F4]">
      {leadSubmitted && (
        <div role="status" className="bg-[#138A9A] px-4 py-3">
          <p className="max-w-2xl mx-auto text-white text-sm text-center font-medium">
            <span aria-hidden="true" className="mr-1.5">✓</span>
            {TRINIDAD_LEAD_SUBMITTED_MESSAGE}
          </p>
        </div>
      )}

      {/* Hero */}
      <section className="bg-[#001532] py-14 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mb-3">Dream. Code. Achieve.</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">{headline}</h1>
          <p className="text-gray-300 text-lg mb-5 leading-relaxed">{campaign.subhead}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-block bg-[#E5A823] text-[#001532] font-bold text-sm px-4 py-1.5 rounded-full">
              {TRINIDAD_PROGRAMME_FEE} · Four-week programme
            </span>
            <span className="inline-block bg-white/10 text-white text-sm px-4 py-1.5 rounded-full">
              Next online cohort begins {TRINIDAD_NEXT_COHORT_START}
            </span>
          </div>
          {leadSubmitted ? (
            <a
              href="#how-it-works"
              className="inline-block bg-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all text-lg border border-white/30"
            >
              View Programme Details
            </a>
          ) : (
            <a
              href="#register"
              className="inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-all text-lg shadow-lg"
            >
              Register for the Next Online Cohort
            </a>
          )}
          <p className="text-gray-400 text-xs mt-5">{TRINIDAD_TRUST_LINE}</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Page-specific outcomes */}
        <section aria-labelledby="outcomes-heading">
          <h2 id="outcomes-heading" className="text-2xl font-bold text-[#001532] mb-2 text-center">
            After Four Weeks, Your Child Should Be Able To:
          </h2>
          <p className="text-gray-500 text-sm text-center mb-5">{campaign.corePromise}</p>
          <ul className="space-y-2.5">
            {campaign.outcomeBullets.map((b) => (
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

        {/* Page-specific project examples */}
        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Age-Appropriate Projects They Might Build
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {campaign.projectExamples.map((proj) => (
              <div key={proj} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#138A9A] rounded-full shrink-0" />
                <span className="text-[#001532] text-xs font-medium">{proj}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" aria-labelledby="how-it-works-heading" className="scroll-mt-6">
          <h2 id="how-it-works-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            How It Works
          </h2>
          <ol className="space-y-2.5">
            {TRINIDAD_HOW_IT_WORKS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#001532] text-white font-bold text-xs shrink-0">
                  {i + 1}
                </span>
                <span className="text-[#001532] text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Pricing & registration */}
        <section id="register" aria-labelledby="pricing-heading" className="scroll-mt-6">
          <h2 id="pricing-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            {TRINIDAD_PRICING.heading}
          </h2>
          <div className="bg-[#001532] rounded-xl p-6 text-center">
            <p className="text-white font-extrabold text-4xl mb-1">{TRINIDAD_PRICING.primaryPrice}</p>
            <p className="text-gray-300 text-sm mb-4">{TRINIDAD_PRICING.supportingPrice}</p>
            <ul className="text-left max-w-xs mx-auto space-y-1.5 mb-4">
              {TRINIDAD_PRICING.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span aria-hidden="true" className="text-[#E5A823] shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[#E5A823] text-xs font-semibold mb-4">{TRINIDAD_PRICING.startDateLine}</p>
            {leadSubmitted ? (
              <p className="text-gray-300 text-sm bg-white/10 rounded-xl px-4 py-3">
                Your registration request has already been received — no further sign-up is needed.
              </p>
            ) : (
              <>
                <p className="text-white text-sm font-semibold mb-1">Choose your child&apos;s level to register</p>
                <p className="text-gray-400 text-xs mb-4">
                  Same {TRINIDAD_PROGRAMME_FEE} four-week programme — pick the grade band that fits your child to complete
                  registration and secure their place.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                  {TRINIDAD_STRIPE_LINKS.map((opt) => (
                    <a
                      key={opt.level}
                      href={opt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleRegisterClick(opt.level)}
                      className="flex flex-col items-center justify-center rounded-xl bg-[#E5A823] px-4 py-3 text-[#001532] font-bold hover:bg-[#d4941f] transition-colors"
                    >
                      <span className="text-base leading-tight">{opt.label}</span>
                      <span className="text-[11px] font-semibold opacity-75">
                        {opt.grades} · {opt.ages}
                      </span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            Common Questions
          </h2>
          <FAQAccordion faqs={TRINIDAD_FAQ} />
        </section>
      </div>

      {/* Final CTA band */}
      <section className="bg-[#001532] py-14 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Give your child skills they can use in school, online and in the future.
          </h2>
          {leadSubmitted ? (
            <p className="text-gray-300 text-base bg-white/10 rounded-xl px-6 py-4 max-w-md mx-auto">
              {TRINIDAD_LEAD_SUBMITTED_MESSAGE}
            </p>
          ) : (
            <a
              href="#register"
              className="inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors text-lg"
            >
              Register for the Next Online Cohort
            </a>
          )}
          <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mt-6">Dream. Code. Achieve.</p>
        </div>
      </section>

      <TTFooter />

      {leadSubmitted ? (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
          <a
            href="#how-it-works"
            className="block w-full bg-[#001532] text-white font-bold px-6 py-3 rounded-xl text-center hover:bg-[#2a3052] transition-colors"
          >
            View Programme Details
          </a>
        </div>
      ) : (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
          <a
            href="#register"
            className="block w-full bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl text-center hover:bg-[#d4941f] transition-colors"
          >
            Register for the Next Online Cohort
          </a>
        </div>
      )}
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
