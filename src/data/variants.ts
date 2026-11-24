import type { LPSlug } from "./campaigns";

export interface Variant {
  headline?: string;
  heroImage: string;
  ctaLabel: string;
}

export type VariantId = "a" | "b";

/**
 * A/B variants per LP, selected via ?v=a|b on the URL (defaults to "a").
 * Only headline/hero image/CTA label vary, everything else (facts,
 * projects, FAQ) stays identical between variants.
 */
export const VARIANTS: Record<LPSlug, Record<VariantId, Variant>> = {
  explorers: {
    a: { heroImage: "/images/kids-building.jpg", ctaLabel: "Register Now" },
    b: {
      headline: "Give your 5–7 year old a head start on real coding.",
      heroImage: "/images/lego.jpg",
      ctaLabel: "Reserve My Child's Spot",
    },
  },
  builders: {
    a: { heroImage: "/images/kid-laptop.jpg", ctaLabel: "Register Now" },
    b: {
      headline: "From blank page to a real website your child built.",
      heroImage: "/images/girl-coding.jpg",
      ctaLabel: "Reserve My Child's Spot",
    },
  },
  developers: {
    a: { heroImage: "/images/girl-headphones.jpg", ctaLabel: "Register Now" },
    b: {
      headline: "Your Grade 4–5 coder, solving real problems in JavaScript.",
      heroImage: "/images/robots-tablet.jpg",
      ctaLabel: "Reserve My Child's Spot",
    },
  },
  engineers: {
    a: { heroImage: "/images/robots-tablet.jpg", ctaLabel: "Register Now" },
    b: {
      headline: "Python, AI, and cybersecurity, for grades 6–8.",
      heroImage: "/images/girl-headphones.jpg",
      ctaLabel: "Reserve My Child's Spot",
    },
  },
  "quebec-fr": {
    a: { heroImage: "/images/kids-building.jpg", ctaLabel: "Inscrivez-vous maintenant" },
    b: {
      headline: "La première expérience de codage de votre enfant: en français.",
      heroImage: "/images/lego.jpg",
      ctaLabel: "Réservez la place de mon enfant",
    },
  },
};

export function getVariant(slug: LPSlug, variantId: string | null | undefined): Variant {
  const id: VariantId = variantId === "b" ? "b" : "a";
  return VARIANTS[slug][id];
}
