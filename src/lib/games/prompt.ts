/**
 * Prompt Pilot: AI skills for ages 7–10 (Builders + Developers).
 *
 * Kids practise talking to an AI copilot, "Astro": asking clear questions,
 * asking for sources, catching AI mistakes, growing their own ideas and
 * challenging them. Astro is scripted (no real AI and no network calls):
 * children's words never leave the page.
 *
 * Missions 1–5 are free and live here. Missions 6+ are part of the paid
 * programs: they live only on the server (src/lib/games/paid/prompt.ts) and
 * are sent by /api/arcade/levels after a Builders or Developers class password.
 */

export interface ChoiceOption {
  text: string;
  good: boolean;
  /** What Astro says after this pick (praise, or a gentle hint). */
  why: string;
}

export type PromptStep =
  | {
      kind: "choose";
      /** Optional thing Astro says before the question. */
      astro?: string;
      ask: string;
      options: ChoiceOption[];
    }
  | {
      kind: "build";
      ask: string;
      /** Each slot: first option is the vague one; the others are specific. */
      slots: { label: string; emoji: string; options: { text: string; good: boolean }[] }[];
      /** Astro's answer for 0, 1, 2 … specific pieces (index = count). */
      answers: string[];
    }
  | {
      kind: "sort";
      ask: string;
      bins: [string, string];
      items: { text: string; bin: 0 | 1; why: string }[];
    }
  | {
      kind: "spot";
      ask: string;
      /** Astro's message, one sentence per entry. */
      astro: string[];
      wrong: number;
      /** The "fact book" clue kids can check. */
      check: string;
      why: string;
    };

export interface PromptLevel {
  id: string;
  title: string;
  emoji: string;
  skill: string;
  /** One-line tip shown as the mission's "Pilot tip". */
  tip: string;
  steps: PromptStep[];
}

export const PROMPT_FREE_LEVELS: PromptLevel[] = [
  {
    id: "hello-astro",
    title: "Hello, Astro!",
    emoji: "👋",
    skill: "Ask clear questions",
    tip: "AI works best when you say exactly what you want.",
    steps: [
      {
        kind: "choose",
        astro: "Hi! I’m Astro, your AI copilot. I can help you learn, but I need clear questions!",
        ask: "You are writing a report about octopuses. Which question is the clearest?",
        options: [
          { text: "Tell me stuff.", good: false, why: "Hmm, what stuff? I can’t tell what you want. Try again!" },
          { text: "What are 3 cool facts about octopuses?", good: true, why: "Super clear! You told me the topic AND how many facts." },
          { text: "Octopus???", good: false, why: "One word is hard for me to understand. Try a full question!" },
        ],
      },
      {
        kind: "choose",
        ask: "Which question will get an answer that’s easy for YOU to read?",
        options: [
          { text: "Explain how octopuses change colour, for an 8-year-old.", good: true, why: "Great! Saying who it’s for helps me use easy words." },
          { text: "Explain cephalopod chromatophore physiology.", good: false, why: "Whoa, that would give a long, grown-up answer! Try another." },
          { text: "Colours?", good: false, why: "Too short! I don’t know what you’re asking." },
        ],
      },
    ],
  },
  {
    id: "prompt-builder",
    title: "Prompt Builder",
    emoji: "🧱",
    skill: "Add details",
    tip: "Good prompts say WHAT you want, WHO it’s for, and HOW it should look.",
    steps: [
      {
        kind: "build",
        ask: "Build a prompt to get a space poem. Pick one piece from each row.",
        slots: [
          {
            label: "What",
            emoji: "🎯",
            options: [
              { text: "Write something", good: false },
              { text: "Write a poem about the Moon", good: true },
              { text: "Write a poem about rockets", good: true },
            ],
          },
          {
            label: "Who",
            emoji: "🧒",
            options: [
              { text: "for anyone", good: false },
              { text: "for kids in my class", good: true },
              { text: "for my little brother", good: true },
            ],
          },
          {
            label: "How",
            emoji: "📏",
            options: [
              { text: "any way you want.", good: false },
              { text: "with 4 short lines.", good: true },
              { text: "that rhymes.", good: true },
            ],
          },
        ],
        answers: [
          "Umm… here are some words? I wasn’t sure what you wanted. 🤷",
          "Here’s a poem! It’s okay, but I had to guess a lot.",
          "Here’s a poem that’s pretty close to what you wanted!",
          "Here’s a poem made just for you! You told me everything I needed. 🌙✨",
        ],
      },
    ],
  },
  {
    id: "where-from",
    title: "Where Did You Learn That?",
    emoji: "🔎",
    skill: "Ask for sources",
    tip: "Smart thinkers ask: “Where did that fact come from?”",
    steps: [
      {
        kind: "choose",
        astro: "Fun fact: octopuses have three hearts!",
        ask: "What is the smartest thing to say next?",
        options: [
          { text: "Where did you learn that? Can you show me a source?", good: true, why: "Yes! I learned it from an aquarium’s website. Always ask where facts come from." },
          { text: "Cool, I’ll copy that into my report.", good: false, why: "Wait! Check where a fact comes from before you use it." },
          { text: "Tell me a joke instead.", good: false, why: "Ha! But first, let’s find out if that fact is true." },
        ],
      },
      {
        kind: "sort",
        ask: "Which places can you trust more? Sort each one.",
        bins: ["Trust more ✅", "Check again 🤔"],
        items: [
          { text: "An aquarium’s website", bin: 0, why: "Aquariums have real animal experts." },
          { text: "A science book from the library", bin: 0, why: "Library books are checked by editors." },
          { text: "A random comment online", bin: 1, why: "Anyone can write a comment, true or not." },
          { text: "A video called “100% TRUE!!! SHOCKING!”", bin: 1, why: "Shouting titles try to grab you. Check them!" },
        ],
      },
    ],
  },
  {
    id: "oops-astro",
    title: "Oops, Astro!",
    emoji: "🙈",
    skill: "Catch AI mistakes",
    tip: "AI can sound sure and still be wrong. Double-check!",
    steps: [
      {
        kind: "spot",
        ask: "Astro made ONE mistake. Check the fact book, then tap the wrong sentence.",
        astro: ["Octopuses live in the ocean.", "They have eight arms.", "Octopuses have two hearts.", "They can squirt ink to hide."],
        wrong: 2,
        check: "📘 Fact book: Octopuses have THREE hearts.",
        why: "You caught it! Even smart AI makes mistakes.",
      },
      {
        kind: "choose",
        ask: "What should you say to Astro?",
        options: [
          { text: "You made a mistake. Octopuses have 3 hearts. Can you check again?", good: true, why: "Thank you! You’re right, I fixed it. Good pilots check their copilot." },
          { text: "You’re a computer, so you’re always right!", good: false, why: "Not true! Computers can be wrong too. Try again." },
          { text: "Say nothing.", good: false, why: "If you don’t tell me, the mistake stays in your report!" },
        ],
      },
    ],
  },
  {
    id: "grow-my-idea",
    title: "Grow My Idea",
    emoji: "🌱",
    skill: "Grow your own ideas",
    tip: "Use AI to make YOUR idea bigger, not to do it for you.",
    steps: [
      {
        kind: "choose",
        astro: "What are you inventing today?",
        ask: "Your idea: a robot that waters plants. 🤖🪴 Which prompt helps YOUR idea grow?",
        options: [
          { text: "Give me 3 ways to make my plant robot even better.", good: true, why: "Great prompt! It’s still your idea, and now it can grow." },
          { text: "Invent a robot for me.", good: false, why: "Then it would be MY idea, not yours! Try again." },
          { text: "Is my idea good? Yes or no.", good: false, why: "Yes or no doesn’t help an idea grow. Ask for ways to improve it!" },
        ],
      },
      {
        kind: "choose",
        astro: "Here are 3 ideas: 1) Add a sensor that checks if the soil is dry. 2) Collect rainwater. 3) Play music for the plants.",
        ask: "Which one will YOU try? (Any choice is OK. You’re the inventor!)",
        options: [
          { text: "A sensor for dry soil", good: true, why: "Smart! Your robot will know when plants are thirsty." },
          { text: "Collect rainwater", good: true, why: "Awesome! Your robot saves water too." },
          { text: "Music for the plants", good: true, why: "Fun! You could even test if plants like it. 🎶" },
        ],
      },
    ],
  },
];

/** Every mission in play order: titles only, for the mission map. */
export const PROMPT_CATALOG: { id: string; title: string; emoji: string; skill: string }[] = [
  ...PROMPT_FREE_LEVELS.map(({ id, title, emoji, skill }) => ({ id, title, emoji, skill })),
  { id: "what-could-go-wrong", title: "What Could Go Wrong?", emoji: "🧐", skill: "Challenge your idea" },
  { id: "find-the-gap", title: "Find the Gap", emoji: "🧩", skill: "Spot missing steps" },
  { id: "fact-or-opinion", title: "Fact or Opinion?", emoji: "⚖️", skill: "Facts vs opinions" },
  { id: "both-sides", title: "Both Sides", emoji: "🔁", skill: "Hear both sides" },
  { id: "super-prompter", title: "Super Prompter", emoji: "🚀", skill: "Put it all together" },
];

/** Stars from mistakes: 0 → 3★, 1–2 → 2★, more → 1★. */
export function promptStars(mistakes: number) {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
}
