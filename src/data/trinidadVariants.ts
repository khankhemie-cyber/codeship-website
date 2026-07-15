import type { TrinidadPageSlug } from "./trinidadCampaigns";

/**
 * 3 approved headline variants per page, selected via ?v=1|2|3 (defaults to
 * 1 — the campaign's own headline). Only the headline changes between
 * variants; price, programme length and outcomes stay identical.
 */
export const TRINIDAD_HEADLINE_VARIANTS: Record<TrinidadPageSlug, [string, string, string]> = {
  "online-coding-classes": [
    "Online Coding Classes for Kids in Trinidad and Tobago",
    "Help Your Child Learn Coding From Home",
    "Turn Screen Time Into Real Technology Skills",
  ],
  "math-language-arts-coding": [
    "Mathematics, Language Arts, Creative Writing and Coding for Kids",
    "Build Stronger School and Digital Skills",
    "School Skills Meet Technology Skills",
  ],
  "sea-digital-skills": [
    "Build Stronger Thinking Skills Before Secondary School",
    "Support Mathematics, Language Arts, Writing and Digital Confidence",
    "Online Skill-Building for Primary-School Children",
  ],
  "computer-classes-for-kids": [
    "Computer Classes for Children in Trinidad and Tobago",
    "Help Your Child Become More Confident With Computers",
    "Practical Computer and Coding Skills for Kids",
  ],
  "online-stem-classes": [
    "Online STEM Classes for Kids in Trinidad and Tobago",
    "Help Your Child Build Skills for a Digital Future",
    "Build, Solve, Explain and Create",
  ],
};

export function getTrinidadHeadline(slug: TrinidadPageSlug, variantParam: string | null | undefined): string {
  const variants = TRINIDAD_HEADLINE_VARIANTS[slug];
  const index = variantParam === "2" ? 1 : variantParam === "3" ? 2 : 0;
  return variants[index];
}
