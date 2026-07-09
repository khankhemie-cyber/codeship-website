import type { GuyanaPageSlug } from "./guyanaCampaigns";

/** 3 headline variants per page, selected via ?v=1|2|3 (defaults to 1 — the campaign's own headline). */
export const GUYANA_HEADLINE_VARIANTS: Record<GuyanaPageSlug, [string, string, string]> = {
  "online-coding-classes": [
    "Online Coding Classes for Kids in Guyana",
    "Help Your Child Learn Coding From Home",
    "Give Your Child a Strong Start in Coding and Computer Skills",
  ],
  "math-english-coding": [
    "Math, English, Writing, and Coding Support for Kids in Guyana",
    "Help Your Child Build Stronger School and Digital Skills",
    "Online Learning Support for Math, English, Writing, and Coding",
  ],
  "ngsa-digital-skills": [
    "Build Stronger Thinking Skills Before Secondary School",
    "Support Your Child's Math, English, Writing, and Computer Skills",
    "Online Skill-Building for Primary School Children in Guyana",
  ],
  "computer-classes-for-kids": [
    "Computer Classes for Children in Guyana",
    "Help Your Child Become More Confident With Computers",
    "Practical Computer and Coding Skills for Kids",
  ],
  "online-stem-classes": [
    "Online STEM Classes for Kids in Guyana",
    "Help Your Child Build Skills for a Digital Future",
    "Coding, Math, Writing, and Problem-Solving for Kids",
  ],
};

export function getGuyanaHeadline(slug: GuyanaPageSlug, variantParam: string | null | undefined): string {
  const variants = GUYANA_HEADLINE_VARIANTS[slug];
  const index = variantParam === "2" ? 1 : variantParam === "3" ? 2 : 0;
  return variants[index];
}
