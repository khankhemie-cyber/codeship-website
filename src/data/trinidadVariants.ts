import type { TrinidadPageSlug } from "./trinidadCampaigns";

/**
 * 3 approved headline variants per program, selected via ?v=1|2|3 (defaults to
 * 1 — the campaign's own headline). Only the headline changes between variants;
 * price, programme length and outcomes stay identical.
 */
export const TRINIDAD_HEADLINE_VARIANTS: Record<TrinidadPageSlug, [string, string, string]> = {
  explorers: [
    "Explorers: Online Coding for Ages 4–6 in Trinidad and Tobago",
    "Your Child's First Real Coding Class — Ages 4–6",
    "Turn Screen Time Into Real Technology Skills",
  ],
  builders: [
    "Builders: Coding & Web Projects for Ages 7–9 in Trinidad and Tobago",
    "Your Child Builds Their First Real Website — Ages 7–9",
    "Coding, Web Building and Problem-Solving for Kids",
  ],
  developers: [
    "Developers: Real Code for Ages 9–11 in Trinidad and Tobago",
    "Real Code That Solves Real Problems — Ages 9–11",
    "JavaScript, Python and the Foundations of AI",
  ],
  engineers: [
    "Engineers: Build AI Responsibly, Ages 12–16 in Trinidad and Tobago",
    "Your Teen Can Build AI — Responsibly, Ages 12–16",
    "Advanced Coding, App Building and AI for Teens",
  ],
};

export function getTrinidadHeadline(slug: TrinidadPageSlug, variantParam: string | null | undefined): string {
  const variants = TRINIDAD_HEADLINE_VARIANTS[slug];
  const index = variantParam === "2" ? 1 : variantParam === "3" ? 2 : 0;
  return variants[index];
}
