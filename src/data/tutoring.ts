import { FLAT_PRICE_CAD } from "@/config/offering";

/**
 * Math & Reading tutoring offerings — complementary to (not a replacement for)
 * the coding/AI programs. Same K–8 range, same 8-week weekly format, same flat
 * price, same in-person (Oshawa) / online choice as the coding programs.
 *
 * Payment links are PLACEHOLDERS until real Stripe Payment Links are provided.
 * Track them in payment-links-todo.md. A placeholder value (not an https URL)
 * makes the checkout CTA fall back to an interest-list lead form; swap in the
 * real link here and the CTA becomes a live Stripe checkout with no other edits.
 */
export const PAYMENT_LINK_MATH_TUTORING = "PAYMENT_LINK_MATH_TUTORING";
export const PAYMENT_LINK_READING_TUTORING = "PAYMENT_LINK_READING_TUTORING";

/** True once a placeholder has been replaced with a real Stripe Payment Link. */
export function isLivePaymentLink(link: string): boolean {
  return link.startsWith("https://");
}

export type TutoringSlug = "math-tutoring" | "reading-tutoring";

export interface TutoringOffering {
  slug: TutoringSlug;
  label: string;
  /** Short label for nav/cards. */
  shortLabel: string;
  subject: string;
  gradeBand: string;
  accentColour: string;
  priceCad: number;
  /** Placeholder or real Stripe Payment Link. */
  paymentLink: string;
  summary: string;
  outcomes: string[];
  /** What tutoring sessions focus on, grade band by grade band. */
  focus: { band: string; detail: string }[];
  faqs: { question: string; answer: string }[];
}

export const TUTORING: TutoringOffering[] = [
  {
    slug: "math-tutoring",
    label: "Math Tutoring",
    shortLabel: "Math Tutoring",
    subject: "Math",
    gradeBand: "K–8",
    accentColour: "#3A5B9E",
    priceCad: FLAT_PRICE_CAD,
    paymentLink: PAYMENT_LINK_MATH_TUTORING,
    summary:
      "One-on-focus math support for K–8 that builds real understanding and confidence — from number sense in the early grades to fractions, algebra, and problem-solving in the middle years, taught the same creative, project-minded way as our coding classes.",
    outcomes: [
      "Close gaps and build a solid foundation, grade by grade",
      "Understand the 'why' behind the math, not just the steps",
      "Grow confidence and a positive relationship with numbers",
      "Practice problem-solving strategies that transfer to school",
    ],
    focus: [
      { band: "K–2", detail: "Number sense, counting, place value, and early addition and subtraction." },
      { band: "3–5", detail: "Multiplication and division fluency, fractions, decimals, and word problems." },
      { band: "6–8", detail: "Ratios and proportions, integers, pre-algebra, equations, and data." },
    ],
    faqs: [
      {
        question: "Do you offer math tutoring alongside coding?",
        answer:
          "Yes. Math Tutoring is one of our academic skill-building offerings for K–8, running the same 8-week weekly format as our coding classes — a flat CAD $129 per semester, in-person in Oshawa or online.",
      },
      {
        question: "Is math tutoring available online?",
        answer:
          "Yes. Math Tutoring is offered both in-person in Oshawa and live online, so families anywhere can join. The price and format are the same for both.",
      },
    ],
  },
  {
    slug: "reading-tutoring",
    label: "English & Reading Tutoring",
    shortLabel: "Reading Tutoring",
    subject: "English & Reading",
    gradeBand: "K–8",
    accentColour: "#6E43A8",
    priceCad: FLAT_PRICE_CAD,
    paymentLink: PAYMENT_LINK_READING_TUTORING,
    summary:
      "Reading and writing support for K–8 that grows strong, confident communicators — from phonics and early reading to comprehension, vocabulary, and clear writing — with the same encouraging, project-based approach as our coding classes.",
    outcomes: [
      "Build reading fluency and comprehension at the right level",
      "Strengthen vocabulary, spelling, and grammar in context",
      "Write with more clarity, structure, and confidence",
      "Develop a genuine enjoyment of reading",
    ],
    focus: [
      { band: "K–2", detail: "Phonics, decoding, sight words, and early reading fluency." },
      { band: "3–5", detail: "Reading comprehension, vocabulary, paragraph and story writing." },
      { band: "6–8", detail: "Analytical reading, essay structure, grammar, and persuasive writing." },
    ],
    faqs: [
      {
        question: "Do you offer reading and English tutoring?",
        answer:
          "Yes. English & Reading Tutoring is one of our K–8 academic skill-building offerings, running the same 8-week weekly format as our coding classes — a flat CAD $129 per semester, in-person in Oshawa or online.",
      },
      {
        question: "Can my child do both coding and reading tutoring?",
        answer:
          "Absolutely — many families pair them. Coding builds logical, creative problem-solving, while reading and math tutoring reinforce core academic skills. Each is a separate flat CAD $129 semester and can be in-person in Oshawa or online.",
      },
    ],
  },
];

export function getTutoring(slug: string): TutoringOffering | undefined {
  return TUTORING.find((t) => t.slug === slug);
}
