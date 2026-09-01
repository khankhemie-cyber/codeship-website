"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Campaign } from "@/data/campaigns";
import { getVariant } from "@/data/variants";
import { IN_PERSON } from "@/data/locations";
import type { LocationSlug } from "@/lib/registration";
import { CLASS_SCHEDULE } from "@/config/classSchedule";
import { PROGRAM_LINKS } from "@/lib/payment-links";
import { trackView, trackSelectLocation, trackRegisterClick } from "@/lib/analytics";
import LocationBar from "./LocationBar";
import StickyMobileCTA from "./StickyMobileCTA";
import FAQAccordion from "@/components/FAQAccordion";
import LPFooter from "./LPFooter";

const VALID_LOCATIONS = new Set<string>([...IN_PERSON.map((c) => c.toLowerCase()), "online"]);

const UI = {
  en: {
    scheduleHeading: "Location & schedule",
    outcomeHeading: "What your child will build",
    proofHeading: "What makes CODEship different",
    diff: [
      { title: "Project-based", desc: "Every session ends with real progress on a real project — not a worksheet." },
      { title: "Capstone-gated", desc: "Each level ends with a capstone project that shows what your child can really do." },
      { title: "Inclusive by design", desc: "Accommodations are built into every class, for a range of learning styles and needs." },
    ],
    buildHeading: "What they'll build",
    offerHeading: "Ready to start?",
    faqHeading: "Common questions",
    finalHeading: "Dream. Code. Achieve.",
    finalSub: "Register today — classes run in 5 Canadian cities and online.",
    complianceNote:
      "Curriculum alignment claims support and align with — not endorsed or approved by — any ministry of education.",
    openingSoon: "Registration opening soon",
  },
  fr: {
    scheduleHeading: "Emplacement et horaire",
    outcomeHeading: "Ce que votre enfant va construire",
    proofHeading: "Ce qui distingue CODEship",
    diff: [
      { title: "Apprentissage par projet", desc: "Chaque cours se termine par un vrai progrès sur un vrai projet — jamais une feuille d'exercices." },
      { title: "Projet final requis", desc: "Chaque niveau se termine par un projet final qui démontre ce que votre enfant peut vraiment faire." },
      { title: "Conçu pour l'inclusion", desc: "Des mesures d'adaptation sont intégrées à chaque cours." },
    ],
    buildHeading: "Ce qu'ils vont construire",
    offerHeading: "Prêt à commencer?",
    faqHeading: "Questions fréquentes",
    finalHeading: "Rêver. Coder. Réussir.",
    finalSub: "Inscrivez-vous dès aujourd'hui — en ligne partout au Québec.",
    complianceNote:
      "Les mentions d'alignement au curriculum appuient et s'alignent avec — sans être endossées ou approuvées par — un ministère de l'Éducation.",
    openingSoon: "Inscription bientôt disponible",
  },
};

const FR_DAYS: Record<string, string> = { Saturdays: "Samedis", Tuesdays: "Mardis", Thursdays: "Jeudis" };

type ScheduleSlot = { days: string; time: string; starts: Record<string, string> };

/**
 * Minimal-effort FR display of the (English-authored) class schedule facts —
 * day names translated, dates/time lightly adapted. Families now pick one of
 * three start months at checkout; this teaser line shows the soonest
 * (September) start's dates.
 */
function localizeSchedule(schedule: ScheduleSlot, lang: "en" | "fr") {
  const dates = schedule.starts.september;
  if (lang === "en") return { days: schedule.days, time: schedule.time, dates };
  return {
    days: FR_DAYS[schedule.days] ?? schedule.days,
    dates: dates.replace("Weekly,", "chaque semaine,").replace("Sep", "sept.").replace("Nov", "nov."),
    time: schedule.time.replace(" AM ET", " HE").replace(" PM ET", " HE"),
  };
}

function toSlug(city: string): LocationSlug {
  return city.toLowerCase() as LocationSlug;
}

export default function LPView({ campaign }: { campaign: Campaign }) {
  const searchParams = useSearchParams();
  const t = UI[campaign.lang];

  const rawLoc = (searchParams.get("utm_content") || searchParams.get("loc") || "").toLowerCase();
  const locationFromUrl = VALID_LOCATIONS.has(rawLoc) ? (rawLoc as LocationSlug) : null;

  const [location, setLocation] = useState<LocationSlug>(locationFromUrl ?? toSlug(IN_PERSON[0]));

  const utmSnapshot = useMemo(
    () => ({
      utm_source: searchParams.get("utm_source") ?? campaign.defaultSource,
      utm_medium: searchParams.get("utm_medium") ?? campaign.defaultMedium,
      utm_campaign: searchParams.get("utm_campaign") ?? undefined,
      utm_content: searchParams.get("utm_content") ?? undefined,
      utm_term: searchParams.get("utm_term") ?? undefined,
    }),
    [searchParams, campaign.defaultSource, campaign.defaultMedium]
  );

  const variantId = searchParams.get("v");
  const variant = getVariant(campaign.slug, variantId);

  useEffect(() => {
    trackView({ program: campaign.program, location, ...utmSnapshot });
    // Fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // The root layout hard-codes <html lang="en"> for the main site; this
    // French LP needs its own page-language attribute for WCAG 3.1.1.
    const previous = document.documentElement.lang;
    document.documentElement.lang = campaign.lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [campaign.lang]);

  const mode = location === "online" ? "online" : "inperson";
  const modeSchedule = localizeSchedule(CLASS_SCHEDULE[campaign.program][mode], campaign.lang);
  const scheduleLine =
    campaign.lang === "fr"
      ? `Prochain cours : ${modeSchedule.days}, ${modeSchedule.dates} · ${modeSchedule.time}`
      : `Next class: ${modeSchedule.days}, ${modeSchedule.dates} · ${modeSchedule.time}`;

  // Checkout is a Stripe Payment Link per program — location is informational only.
  const registrationUrl = PROGRAM_LINKS[campaign.program].url;

  const secondaryUrl = campaign.secondaryLink ? PROGRAM_LINKS[campaign.secondaryLink.program].url : null;

  const handleLocationChange = (value: LocationSlug) => {
    setLocation(value);
    trackSelectLocation({ program: campaign.program, location: value });
  };

  const handleRegisterClick = () => {
    trackRegisterClick({ program: campaign.program, location, ...utmSnapshot });
  };

  const headline = variant.headline ?? campaign.adHeadline;
  const ctaLabel = variant.ctaLabel;

  // Stripe checkout is always available — no "opening soon" disabled state.
  const ctaClasses = (base: string) => base;

  const ctaProps = {
    href: registrationUrl,
    target: "_blank" as const,
    rel: "noopener noreferrer" as const,
    onClick: handleRegisterClick,
  };

  return (
    <div className="bg-[#FAF8F4]">
      {/* 1. Hero */}
      <section className="bg-[#001532] py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mb-3">
            {campaign.lang === "fr" ? "Rêver. Coder. Réussir." : "Dream. Code. Achieve."}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">{headline}</h1>
          <p className="text-gray-300 text-lg mb-7 leading-relaxed">{campaign.subhead}</p>
          <a
            {...ctaProps}
            className={ctaClasses(
              "inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-all text-lg shadow-lg"
            )}
          >
            {ctaLabel}
          </a>
          <p className="text-gray-400 text-xs mt-5">{campaign.trustLine}</p>
          <div className="relative w-full max-w-md mx-auto aspect-video rounded-2xl overflow-hidden mt-8 ring-2 ring-[#E5A823]/20">
            <Image
              src={variant.heroImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 448px"
              priority
            />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        {/* 2. Location/schedule bar */}
        <LocationBar
          program={campaign.program}
          value={location}
          onChange={handleLocationChange}
          defaulted={locationFromUrl !== null}
          lang={campaign.lang}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {/* 3. Outcome bullets */}
        <section aria-labelledby="outcomes-heading">
          <h2 id="outcomes-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            {t.outcomeHeading}
          </h2>
          <ul className="space-y-3">
            {campaign.outcomeBullets.map((b) => (
              <li key={b} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E5A823] text-[#001532] font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-[#001532] text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Proof */}
        <section aria-labelledby="proof-heading">
          <h2 id="proof-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            {t.proofHeading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {t.diff.map((d) => (
              <div key={d.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#001532] text-sm mb-1">{d.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. The build */}
        <section aria-labelledby="build-heading">
          <h2 id="build-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            {t.buildHeading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campaign.projects.map((proj) => (
              <div key={proj} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <span className="w-2 h-2 bg-[#138A9A] rounded-full shrink-0" />
                <span className="text-[#001532] text-sm font-medium">{proj}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Offer */}
        <section aria-labelledby="offer-heading">
          <h2 id="offer-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            {t.offerHeading}
          </h2>
          <div className="bg-[#001532] rounded-xl p-6 text-center mb-4">
            <h3 className="text-white font-bold text-lg mb-1">{campaign.offerHeadline}</h3>
            <p className="text-gray-300 text-sm mb-1">{campaign.offerBody}</p>
            <p className="text-[#E5A823] text-xs font-semibold mb-4">{scheduleLine}</p>
            <a
              {...ctaProps}
              className={ctaClasses("inline-block bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors")}
            >
              {ctaLabel}
            </a>
          </div>
          {campaign.secondaryLink && secondaryUrl && (
            <p className="text-center text-sm mt-4">
              <Link href={secondaryUrl} target="_blank" rel="noopener noreferrer" className="text-[#E5A823] font-semibold hover:underline">
                {campaign.secondaryLink.label}
              </Link>
            </p>
          )}
        </section>

        {/* 7. FAQ */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-[#001532] mb-5 text-center">
            {t.faqHeading}
          </h2>
          <FAQAccordion faqs={campaign.faq} />
        </section>
      </div>

      {/* 8. Final CTA band */}
      <section className="bg-[#001532] py-14 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t.finalHeading}</h2>
          <p className="text-gray-300 mb-6 text-sm">{t.finalSub}</p>
          <a
            {...ctaProps}
            className={ctaClasses("inline-block bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors text-lg")}
          >
            {ctaLabel}
          </a>
        </div>
      </section>

      {/* 9. Compliance note */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-gray-400 text-xs text-center">{t.complianceNote}</p>
      </div>

      <LPFooter lang={campaign.lang} />

      <StickyMobileCTA href={registrationUrl} label={ctaLabel} onClick={handleRegisterClick} />

      {/* Spacer so the sticky bar never covers content on mobile */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
