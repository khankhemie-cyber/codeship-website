"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProgramSlug } from "@/data/locations";
import type { LocationSlug } from "@/lib/registration";
import { PROGRAM_PRICING, type CheckoutCurrency } from "@/data/catalog";
import { trackCheckoutClick } from "@/lib/analytics";

interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

interface CheckoutButtonProps {
  program: ProgramSlug;
  programLabel: string;
  location: LocationSlug;
  currency: CheckoutCurrency;
  utm?: Utm;
  /** Path to return to if the shopper cancels checkout — defaults to /programs/:program. */
  returnPath?: string;
  lang?: "en" | "fr";
  /** "card" = full pay panel (summary + checkbox + button); "compact" = button only, no summary/checkbox (paired with a "card" instance elsewhere on the page). */
  variant?: "card" | "compact";
  className?: string;
}

const CURRENCY_SYMBOL: Record<CheckoutCurrency, string> = { cad: "CAD", usd: "USD" };

const COPY = {
  en: {
    perTerm: "per term",
    summaryHeading: "Class minimum & refunds",
    summaryBody:
      "This class runs once it reaches 50% enrollment. If it doesn't, we'll offer a reschedule, transfer, credit, or a full refund — see the ",
    policyLinkLabel: "Class Minimum & Refund Policy",
    consentPrefix: "I have read and agree to the ",
    consentAnd: " and the ",
    termsLinkLabel: "Terms of Service",
    consentSuffix: ".",
    cta: (label: string) => `Register & Pay for ${label}`,
    ctaCompact: "Register & Pay",
    loading: "Redirecting to secure checkout…",
    genericError: "Something went wrong starting checkout. Please try again or contact us.",
  },
  fr: {
    perTerm: "par session",
    summaryHeading: "Minimum de classe et remboursements",
    summaryBody:
      "Ce cours a lieu une fois qu'il atteint 50 % de la capacité. Sinon, nous offrons un report, un transfert, un crédit ou un remboursement complet — voir la ",
    policyLinkLabel: "Politique de remboursement et de minimum de classe",
    consentPrefix: "J'ai lu et j'accepte la ",
    consentAnd: " et les ",
    termsLinkLabel: "conditions d'utilisation",
    consentSuffix: ".",
    cta: (label: string) => `S'inscrire et payer — ${label}`,
    ctaCompact: "S'inscrire et payer",
    loading: "Redirection vers le paiement sécurisé…",
    genericError: "Une erreur est survenue. Veuillez réessayer ou nous contacter.",
  },
};

export default function CheckoutButton({
  program,
  programLabel,
  location,
  currency,
  utm,
  returnPath,
  lang = "en",
  variant = "card",
  className = "",
}: CheckoutButtonProps) {
  const [checked, setChecked] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = COPY[lang];
  const price = PROGRAM_PRICING[program][currency];
  const policyHref = lang === "fr" ? "/politiques/remboursement" : "/policies/refund";
  const termsHref = "/terms";

  const handleCheckChange = (isChecked: boolean) => {
    setChecked(isChecked);
    setAcceptedAt(isChecked ? new Date().toISOString() : null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!checked || !acceptedAt || loading) return;

    trackCheckoutClick({ program, location, currency });
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program,
          location,
          currency,
          policyAcceptedAt: acceptedAt,
          returnPath,
          utm,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "unknown_error");
      }
      window.location.href = data.url;
    } catch {
      setError(t.genericError);
      setLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!checked || loading}
        className={`inline-flex items-center justify-center bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4941f] ${className}`}
      >
        {loading ? t.loading : t.ctaCompact}
      </button>
    );
  }

  return (
    <div className={className}>
      <div className="bg-[#FAF8F4] rounded-xl px-4 py-3 text-xs text-[#001532] mb-3">
        <p className="font-semibold mb-1">{t.summaryHeading}</p>
        <p className="text-gray-600">
          {t.summaryBody}
          <Link href={policyHref} className="text-[#138A9A] font-semibold hover:underline">
            {t.policyLinkLabel}
          </Link>
          .
        </p>
      </div>

      <label className="flex items-start gap-2.5 mb-3 cursor-pointer text-xs text-gray-600">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => handleCheckChange(e.target.checked)}
          className="accent-[#E5A823] w-4 h-4 shrink-0 mt-0.5"
        />
        <span>
          {t.consentPrefix}
          <Link href={policyHref} className="text-[#138A9A] font-semibold hover:underline">
            {t.policyLinkLabel}
          </Link>
          {t.consentAnd}
          <Link href={termsHref} className="text-[#138A9A] font-semibold hover:underline">
            {t.termsLinkLabel}
          </Link>
          {t.consentSuffix}
        </span>
      </label>

      {error && (
        <p role="alert" className="text-red-700 text-xs mb-3">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!checked || loading}
        className="w-full bg-[#E5A823] text-[#001532] font-bold px-6 py-3.5 rounded-xl hover:bg-[#d4941f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 text-center"
      >
        {loading ? t.loading : `${t.cta(programLabel)} — ${CURRENCY_SYMBOL[currency]} $${price} ${t.perTerm}`}
      </button>
    </div>
  );
}
