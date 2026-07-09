import type { LPSlug } from "./campaigns";

export interface Variant {
  headline?: string;
  heroImage: string;
  ctaLabel: string;
}

export type VariantId = "a" | "b";

/**
 * A/B variants per LP, selected via ?v=a|b on the URL (defaults to "a").
 * Only headline/hero image/CTA label vary — everything else (facts,
 * projects, FAQ) stays identical between variants.
 */
export const VARIANTS: Record<LPSlug, Record<VariantId, Variant>> = {
  explorers: {
    a: { heroImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80", ctaLabel: "Book a free trial class" },
    b: {
      headline: "Give your 5–7 year old a head start on real coding.",
      heroImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
      ctaLabel: "Claim my free trial class",
    },
  },
  builders: {
    a: { heroImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=900&q=80", ctaLabel: "Book a free trial class" },
    b: {
      headline: "From blank page to a real website your child built.",
      heroImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80",
      ctaLabel: "Claim my free trial class",
    },
  },
  developers: {
    a: { heroImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80", ctaLabel: "Book a free trial class" },
    b: {
      headline: "Your Grade 4–5 coder, solving real problems in JavaScript.",
      heroImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80",
      ctaLabel: "Claim my free trial class",
    },
  },
  engineers: {
    a: { heroImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80", ctaLabel: "Book a free trial class" },
    b: {
      headline: "Python, AI, and cybersecurity — for grades 6–8.",
      heroImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80",
      ctaLabel: "Claim my free trial class",
    },
  },
  "quebec-fr": {
    a: { heroImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80", ctaLabel: "Réservez un cours d'essai gratuit" },
    b: {
      headline: "La première expérience de codage de votre enfant — en français.",
      heroImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
      ctaLabel: "Je réserve mon cours d'essai",
    },
  },
};

export function getVariant(slug: LPSlug, variantId: string | null | undefined): Variant {
  const id: VariantId = variantId === "b" ? "b" : "a";
  return VARIANTS[slug][id];
}
