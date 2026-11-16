/**
 * SERVER ONLY: Bot Trainer Rule Writer challenges (levels 6–7, paid program).
 * Imported only by src/app/api/arcade/levels/route.ts. Do not import this from
 * any client component, or these levels become readable in the public bundle.
 */
import { ITEMS, type RuleChallenge } from "../bot";

export const RULE_CHALLENGES_PAID: RuleChallenge[] = [
  {
    id: "sorter-rules",
    title: "Sorting Rules",
    emoji: "♻️",
    concept: "if / elif / else",
    brief:
      "Instead of learning from examples, you can program a bot with rules. Write a Python function that sorts any item. Make every test pass!",
    fnName: "sort_item",
    param: "item",
    fields: [{ key: "material", kind: "text", values: ["food", "paper", "metal", "plastic", "glass", "mixed"] }],
    outputs: ["recycle", "compost", "trash"],
    cases: ["banana", "newspaper", "can", "cup", "jar", "wrapper", "coffee", "sponge"].map((id) => {
      const i = ITEMS[id];
      return { input: { material: i.material }, expect: i.answer, label: `${i.emoji} ${i.name}` };
    }),
    parRules: 2,
    starter: [{ field: "material", op: "==", value: "food", result: "compost" }],
    starterElse: "trash",
  },
  {
    id: "ride-rules",
    title: "Ride Checker",
    emoji: "🎢",
    concept: "Comparisons: >= < ==",
    brief:
      "The Moon Coaster needs a safety bot! Riders 120 cm or taller ride alone. Riders 100–119 cm ride with a grown-up. Anyone shorter can't ride yet.",
    fnName: "check_rider",
    param: "rider",
    fields: [{ key: "height", kind: "number", values: [90, 100, 110, 119, 120, 130] }],
    outputs: ["ride alone", "ride with grown-up", "too short"],
    cases: [
      { input: { height: 135 }, expect: "ride alone", label: "🧒 135 cm" },
      { input: { height: 120 }, expect: "ride alone", label: "👧 120 cm" },
      { input: { height: 119 }, expect: "ride with grown-up", label: "👦 119 cm" },
      { input: { height: 104 }, expect: "ride with grown-up", label: "🧒 104 cm" },
      { input: { height: 100 }, expect: "ride with grown-up", label: "👧 100 cm" },
      { input: { height: 99 }, expect: "too short", label: "👶 99 cm" },
      { input: { height: 85 }, expect: "too short", label: "👶 85 cm" },
    ],
    parRules: 2,
    starter: [{ field: "height", op: ">", value: 130, result: "ride alone" }],
    starterElse: "too short",
  },
];

