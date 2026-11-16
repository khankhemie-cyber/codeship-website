/**
 * Bot Trainer — Semester 2 (Python, Data & AI Foundations).
 */

/* ------------------------------------------------------------------ */
/* Python warm-ups                                                      */
/* ------------------------------------------------------------------ */

export interface PyPuzzle {
  code: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface PyRound {
  id: string;
  title: string;
  concept: string;
  emoji: string;
  puzzles: PyPuzzle[];
}

export const PY_ROUNDS: PyRound[] = [
  {
    id: "py-basics",
    title: "Python Basics",
    concept: "print, variables & strings",
    emoji: "🐣",
    puzzles: [
      {
        code: 'name = "Pixel"\nprint("Hi, " + name)',
        question: "What does this print?",
        options: ["Hi, name", "Hi, Pixel", 'Hi, "Pixel"', "Error"],
        answer: 1,
        explain: "name is a variable holding \"Pixel\". + joins (concatenates) the two strings.",
      },
      {
        code: "coins = 5\ncoins = coins + 3\nprint(coins)",
        question: "What does this print?",
        options: ["5", "3", "8", "53"],
        answer: 2,
        explain: "coins starts at 5, then we store 5 + 3 back into it. Variables can change!",
      },
      {
        code: 'print(3 * "ha")',
        question: "What does this print?",
        options: ["3ha", "hahaha", "ha ha ha", "Error"],
        answer: 1,
        explain: "Multiplying a string repeats it. 3 * \"ha\" → \"hahaha\".",
      },
      {
        code: 'age = 10\nprint(f"Next year I\'ll be {age + 1}")',
        question: "What does this f-string print?",
        options: ["Next year I'll be {age + 1}", "Next year I'll be 101", "Next year I'll be 11", "Error"],
        answer: 2,
        explain: "In an f-string, code inside { } is calculated and placed into the text.",
      },
      {
        code: 'x = "7"\ny = 7\nprint(x == y)',
        question: "What does this print?",
        options: ["True", "False", "7", "Error"],
        answer: 1,
        explain: "\"7\" is text (a string) and 7 is a number. Different types aren't equal!",
      },
    ],
  },
  {
    id: "py-lists",
    title: "Lists & Loops",
    concept: "lists, indexes, for & range",
    emoji: "🔁",
    puzzles: [
      {
        code: 'snacks = ["apple", "taco", "kiwi"]\nprint(snacks[1])',
        question: "What does this print?",
        options: ["apple", "taco", "kiwi", "Error"],
        answer: 1,
        explain: "Python counts list positions from 0. snacks[0] is apple, snacks[1] is taco.",
      },
      {
        code: 'pets = ["cat", "dog"]\npets.append("frog")\nprint(len(pets))',
        question: "What does this print?",
        options: ["2", "3", "frog", "Error"],
        answer: 1,
        explain: ".append() adds an item to the end. Now there are 3 pets.",
      },
      {
        code: "total = 0\nfor n in [2, 4, 6]:\n    total = total + n\nprint(total)",
        question: "What does this print?",
        options: ["6", "12", "246", "0"],
        answer: 1,
        explain: "The loop visits 2, then 4, then 6, adding each to total: 0+2+4+6 = 12.",
      },
      {
        code: "for i in range(3):\n    print(i)",
        question: "Which numbers get printed?",
        options: ["1 2 3", "0 1 2", "0 1 2 3", "3"],
        answer: 1,
        explain: "range(3) counts 0, 1, 2 — it stops before 3.",
      },
      {
        code: "scores = [7, 3, 9]\nprint(max(scores) - min(scores))",
        question: "What does this print?",
        options: ["4", "6", "9", "19"],
        answer: 1,
        explain: "max is 9, min is 3, and 9 - 3 = 6. Python has handy built-in tools for data!",
      },
    ],
  },
  {
    id: "py-logic",
    title: "Decisions & Dictionaries",
    concept: "if / elif / else, dicts, functions",
    emoji: "🧠",
    puzzles: [
      {
        code: 'temp = 25\nif temp > 30:\n    print("hot")\nelif temp > 20:\n    print("warm")\nelse:\n    print("cold")',
        question: "What does this print?",
        options: ["hot", "warm", "cold", "warm cold"],
        answer: 1,
        explain: "25 > 30 is False, so Python checks elif: 25 > 20 is True → warm. It stops there.",
      },
      {
        code: 'robot = {"name": "Pixel", "battery": 80}\nprint(robot["battery"])',
        question: "What does this print?",
        options: ["battery", "Pixel", "80", "Error"],
        answer: 2,
        explain: "A dictionary stores key → value pairs. The key \"battery\" unlocks the value 80.",
      },
      {
        code: "def double(n):\n    return n * 2\n\nprint(double(double(3)))",
        question: "What does this print?",
        options: ["6", "9", "12", "Error"],
        answer: 2,
        explain: "double(3) is 6, then double(6) is 12. Functions can be used inside each other!",
      },
      {
        code: 'item = {"type": "can"}\nif item["type"] == "can":\n    print("♻️ recycle")\nelse:\n    print("🗑️ trash")',
        question: "What does this print?",
        options: ["🗑️ trash", "♻️ recycle", "can", "Both"],
        answer: 1,
        explain: "This is a tiny AI rule! The bot checks the item's type and decides. You'll write rules like this soon.",
      },
      {
        code: "lives = 3\nwhile lives > 0:\n    lives = lives - 1\nprint(lives)",
        question: "What does this print?",
        options: ["3", "1", "0", "-1"],
        answer: 2,
        explain: "The loop repeats while lives > 0: 3 → 2 → 1 → 0. Then the question is False, so it stops.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Training data                                                        */
/* ------------------------------------------------------------------ */

export type Bin = "recycle" | "compost" | "trash";
export type Material = "food" | "paper" | "metal" | "plastic" | "glass" | "mixed";

export const BINS: { id: Bin; label: string; emoji: string; tone: string }[] = [
  { id: "recycle", label: "Recycle", emoji: "♻️", tone: "from-sky-500/30 to-sky-500/5 border-sky-400/50" },
  { id: "compost", label: "Compost", emoji: "🌱", tone: "from-emerald-500/30 to-emerald-500/5 border-emerald-400/50" },
  { id: "trash", label: "Trash", emoji: "🗑️", tone: "from-slate-400/30 to-slate-400/5 border-slate-300/50" },
];

export const MATERIALS: Record<Material, { label: string; emoji: string }> = {
  food: { label: "food / plant", emoji: "🌿" },
  paper: { label: "paper", emoji: "📄" },
  metal: { label: "metal", emoji: "🔩" },
  plastic: { label: "plastic", emoji: "🧪" },
  glass: { label: "glass", emoji: "🔷" },
  mixed: { label: "mixed / dirty", emoji: "🧩" },
};

export interface Item {
  id: string;
  name: string;
  emoji: string;
  material: Material;
  answer: Bin;
}

const it = (id: string, name: string, emoji: string, material: Material): Item => ({
  id,
  name,
  emoji,
  material,
  answer: material === "food" ? "compost" : material === "mixed" ? "trash" : "recycle",
});

export const ITEMS: Record<string, Item> = Object.fromEntries(
  [
    it("banana", "Banana peel", "🍌", "food"),
    it("apple", "Apple core", "🍎", "food"),
    it("leaves", "Dry leaves", "🍂", "food"),
    it("coffee", "Coffee grounds", "☕", "food"),
    it("carrot", "Carrot tops", "🥕", "food"),
    it("eggshell", "Eggshells", "🥚", "food"),
    it("bread", "Stale bread", "🍞", "food"),
    it("melon", "Melon rind", "🍉", "food"),
    it("newspaper", "Newspaper", "📰", "paper"),
    it("box", "Cardboard box", "📦", "paper"),
    it("notebook", "Notebook paper", "📄", "paper"),
    it("envelope", "Envelope", "✉️", "paper"),
    it("can", "Soup can", "🥫", "metal"),
    it("clips", "Paper clips", "📎", "metal"),
    it("shampoo", "Shampoo bottle", "🧴", "plastic"),
    it("cup", "Plastic cup", "🥤", "plastic"),
    it("pail", "Plastic pail", "🪣", "plastic"),
    it("jar", "Glass jar", "🫙", "glass"),
    it("bottle", "Glass bottle", "🍾", "glass"),
    it("wrapper", "Candy wrapper", "🍬", "mixed"),
    it("sponge", "Old sponge", "🧽", "mixed"),
    it("bandage", "Used bandage", "🩹", "mixed"),
    it("crayon", "Broken crayon", "🖍️", "mixed"),
  ].map((i) => [i.id, i])
);

export interface TrainRound {
  id: string;
  title: string;
  emoji: string;
  concept: string;
  brief: string;
  /** "label": the player sorts every item themselves. "budget": labels are given; pick which to teach. */
  mode: "label" | "budget";
  pool: string[];
  budget?: number;
  test: string[];
  lesson: string;
}

export const TRAIN_ROUNDS: TrainRound[] = [
  {
    id: "teach",
    title: "Teach the Bot",
    emoji: "🏷️",
    concept: "Labels, training & testing",
    brief:
      "Sortie the sorting bot has never seen garbage before. Sort these 8 items into bins — that's your training data. Then we'll test Sortie on 6 items it has never seen!",
    mode: "label",
    pool: ["banana", "can", "newspaper", "shampoo", "wrapper", "jar", "leaves", "box"],
    test: ["carrot", "envelope", "clips", "cup", "sponge", "bottle"],
    lesson:
      "AI learns from examples that humans label. If the labels are wrong, the AI learns the wrong thing — developers call this “garbage in, garbage out.”",
  },
  {
    id: "budget",
    title: "Smart Data",
    emoji: "🎯",
    concept: "Diverse data & bias",
    brief:
      "Teaching takes time! You can only show Sortie 6 examples from this pile. Choose wisely — Sortie will be tested on 8 brand-new items.",
    mode: "budget",
    pool: ["apple", "coffee", "bread", "eggshell", "notebook", "box", "can", "shampoo", "pail", "jar", "sponge", "crayon"],
    budget: 6,
    test: ["melon", "leaves", "envelope", "clips", "bottle", "cup", "bandage", "wrapper"],
    lesson:
      "If training data only shows a few kinds of things, the AI is biased — it guesses badly on everything else. Good data covers every kind of example.",
  },
];

export interface Prediction {
  item: Item;
  guess: Bin | null;
  because: Item | null;
  correct: boolean;
}

/**
 * Nearest-neighbour "AI": the bot compares what each new item is made of to
 * the examples it was taught, and copies the label of the closest match. If
 * nothing matches at all, it honestly says it doesn't know.
 */
export function predict(training: { item: Item; label: Bin }[], test: Item[]): Prediction[] {
  return test.map((item) => {
    const match = training.find((t) => t.item.material === item.material) ?? null;
    const guess = match ? match.label : null;
    return { item, guess, because: match?.item ?? null, correct: guess === item.answer };
  });
}

/* ------------------------------------------------------------------ */
/* Rule Writer                                                          */
/* ------------------------------------------------------------------ */

export interface RuleField {
  key: string;
  kind: "text" | "number";
  values: (string | number)[];
}

export interface RuleChallenge {
  id: string;
  title: string;
  emoji: string;
  concept: string;
  brief: string;
  fnName: string;
  param: string;
  fields: RuleField[];
  outputs: string[];
  cases: { input: Record<string, string | number>; expect: string; label: string }[];
  /** Fewest rules (if/elif lines) for the 3rd star. */
  parRules: number;
  starter: Rule[];
  starterElse: string;
}

export interface Rule {
  field: string;
  op: string;
  value: string | number;
  result: string;
}

export const TEXT_OPS = ["==", "!="];
export const NUM_OPS = [">=", ">", "<", "<=", "=="];

export const RULE_CHALLENGES: RuleChallenge[] = [
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

export function compare(a: string | number, op: string, b: string | number) {
  switch (op) {
    case "==":
      return a === b;
    case "!=":
      return a !== b;
    case ">=":
      return Number(a) >= Number(b);
    case ">":
      return Number(a) > Number(b);
    case "<":
      return Number(a) < Number(b);
    case "<=":
      return Number(a) <= Number(b);
    default:
      return false;
  }
}

export function runRules(rules: Rule[], elseResult: string, input: Record<string, string | number>) {
  for (const r of rules) {
    if (compare(input[r.field], r.op, r.value)) return r.result;
  }
  return elseResult;
}
