/**
 * Byte Bay: the coding missions and the simulators that run students' code.
 *
 * Pure TypeScript with no browser or Three.js imports, so the same code runs in
 * the game's Web Worker and in the Node tests (scripts/byte-bay/test-missions.mjs).
 *
 * A run works like Robot Lab: the student's program calls the mission's
 * functions (place(), go_to_aisle(2), pick_up()…). Each call updates the
 * simulator and records a step. The game then plays the steps back in 3D.
 * Each mission is checked against several worlds (different customers,
 * different litter), so only code that solves the general problem passes.
 */

export type Lang = "py" | "js";
export type MissionId = "home" | "market" | "beach";

export class BayError extends Error {
  name = "BotError";
}
export class TimeUp extends Error {}

/** Stops a program that runs forever while still calling bot functions. */
const MAX_STEPS = 4000;

// ---------------------------------------------------------------------------
// Home Plot: the Builder Bot

export const PLOT_W = 12;
export const PLOT_D = 10;
export const PLOT_H = 8;
export const HOUSE_W = 6;
export const HOUSE_D = 5;
export const HOUSE_H = 3;

export const BLOCK_COLORS = ["brick", "wood", "stone", "white", "teal", "yellow", "glass"] as const;
export type BlockColor = (typeof BLOCK_COLORS)[number];

export type Block = { x: number; y: number; z: number; c: BlockColor };

/** Every cell of the house walls: the outline of a 6 × 5 rectangle, 3 high. */
export function houseTargets(): { x: number; y: number; z: number }[] {
  const cells: { x: number; y: number; z: number }[] = [];
  for (let y = 0; y < HOUSE_H; y++)
    for (let x = 0; x < HOUSE_W; x++)
      for (let z = 0; z < HOUSE_D; z++)
        if (x === 0 || z === 0 || x === HOUSE_W - 1 || z === HOUSE_D - 1) cells.push({ x, y, z });
  return cells;
}

export type HomeWorld = { blocks: Block[] };
export type HomeStep =
  | { t: "move"; x: number; z: number }
  | { t: "turn"; dir: number }
  | { t: "lift"; y: number }
  | { t: "place"; x: number; y: number; z: number; c: BlockColor }
  | { t: "remove"; x: number; y: number; z: number }
  | { t: "say"; text: string };

/** 0 = east (+x), 1 = south (+z), 2 = west, 3 = north. */
const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const key3 = (x: number, y: number, z: number) => `${x},${y},${z}`;

export function missingWalls(blocks: Block[]) {
  const have = new Set(blocks.map((b) => key3(b.x, b.y, b.z)));
  return houseTargets().filter((c) => !have.has(key3(c.x, c.y, c.z)));
}

// ---------------------------------------------------------------------------
// Fresh Market: the Ladder Bot

export const AISLES: string[][] = [
  ["rice", "beans", "pasta", "flour"],
  ["milk", "cheese", "yogurt", "eggs"],
  ["apples", "bananas", "mangoes", "oranges"],
  ["bread", "cookies", "crackers", "cereal"],
];
export const PRODUCTS = AISLES.flat();

export function shelfOf(product: string): { aisle: number; level: number } | null {
  for (let a = 0; a < AISLES.length; a++) {
    const l = AISLES[a].indexOf(product);
    if (l >= 0) return { aisle: a + 1, level: l + 1 };
  }
  return null;
}

export type MarketWorld = { orders: string[] };
export type MarketStep =
  | { t: "customer"; n: number; want: string }
  | { t: "aisle"; aisle: number }
  | { t: "raise"; level: number }
  | { t: "pick"; product: string; aisle: number; level: number }
  | { t: "deliver"; n: number; product: string; want: string; ok: boolean }
  | { t: "say"; text: string };

// ---------------------------------------------------------------------------
// Beach: the Beach Bot

export const LITTER_KINDS = {
  bottle: "recycling",
  can: "recycling",
  newspaper: "recycling",
  "apple core": "compost",
  "banana peel": "compost",
  "chip bag": "garbage",
  straw: "garbage",
} as const;
export type LitterKind = keyof typeof LITTER_KINDS;
export type BinName = "recycling" | "compost" | "garbage";
export const BINS: BinName[] = ["recycling", "compost", "garbage"];
/** Bin positions in beach coordinates (metres from the bot's dock). */
export const BIN_POS: Record<BinName, { x: number; z: number }> = {
  recycling: { x: -4, z: 0 },
  compost: { x: 0, z: 0 },
  garbage: { x: 4, z: 0 },
};

export type Litter = { id: number; kind: LitterKind; x: number; z: number };
export type BeachWorld = { litter: Litter[] };
export type BeachStep =
  | { t: "goto"; x: number; z: number }
  | { t: "pick"; id: number; kind: LitterKind }
  | { t: "drop"; id: number; bin: BinName; ok: boolean }
  | { t: "say"; text: string };

/** Small seeded random generator so test beaches are the same every run. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function makeLitter(count: number, seed: number, startId = 1): Litter[] {
  const r = rng(seed);
  const kinds = Object.keys(LITTER_KINDS) as LitterKind[];
  const out: Litter[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: startId + i,
      kind: kinds[Math.floor(r() * kinds.length)],
      // The beach runs 100 m along the shore and 22 m from the boardwalk to the water.
      x: Math.round((r() * 96 - 48) * 10) / 10,
      z: Math.round((4 + r() * 18) * 10) / 10,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Running a program

export type Check = { passed: boolean; message: string };
export type SimResult = { steps: unknown[]; output: string[]; check: Check; stopped: string | null };

/** One simulator per world: `api` is what the student's code can call. */
export interface Sim {
  api: Record<string, (...args: never[]) => unknown>;
  steps: unknown[];
  output: string[];
  check(): Check;
}

function base() {
  const steps: unknown[] = [];
  const output: string[] = [];
  const step = (s: unknown) => {
    if (steps.length >= MAX_STEPS) throw new TimeUp("Your program made over 4,000 moves, so it was stopped. Is a loop running forever?");
    steps.push(s);
  };
  const print = (...args: unknown[]) => {
    const text = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
    output.push(text);
    step({ t: "say", text });
  };
  return { steps, output, step, print };
}

function int(name: string, v: unknown, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isInteger(n)) throw new BayError(`${name} needs a whole number, like ${name}(${min}). You gave ${JSON.stringify(v)}.`);
  if (n < min || n > max) throw new BayError(`${name}(${n}) is out of range. Use a number from ${min} to ${max}.`);
  return n;
}

export function homeSim(world: HomeWorld): Sim {
  const { steps, output, step, print } = base();
  const blocks = new Map<string, Block>();
  for (const b of world.blocks) blocks.set(key3(b.x, b.y, b.z), b);
  let x = 0;
  let z = 0;
  let y = 0;
  let dir = 0;
  let color: BlockColor = "brick";

  const api = {
    move(n: unknown = 1) {
      const count = int("move", n, -PLOT_W, PLOT_W);
      const [dx, dz] = DIRS[dir];
      const nx = x + dx * count;
      const nz = z + dz * count;
      if (nx < 0 || nz < 0 || nx >= PLOT_W || nz >= PLOT_D)
        throw new BayError(`move(${count}) would drive the Builder Bot off your plot. The plot is ${PLOT_W} blocks wide and ${PLOT_D} deep.`);
      x = nx;
      z = nz;
      step({ t: "move", x, z });
    },
    turn_right() {
      dir = (dir + 1) % 4;
      step({ t: "turn", dir });
    },
    turn_left() {
      dir = (dir + 3) % 4;
      step({ t: "turn", dir });
    },
    up() {
      if (y >= PLOT_H - 1) throw new BayError(`The Builder Bot can only build ${PLOT_H} blocks high.`);
      y += 1;
      step({ t: "lift", y });
    },
    down() {
      if (y <= 0) throw new BayError("The Builder Bot is already on the ground.");
      y -= 1;
      step({ t: "lift", y });
    },
    set_color(c: unknown) {
      if (!BLOCK_COLORS.includes(c as BlockColor))
        throw new BayError(`set_color(${JSON.stringify(c)}): pick one of ${BLOCK_COLORS.map((b) => `"${b}"`).join(", ")}.`);
      color = c as BlockColor;
    },
    place() {
      const k = key3(x, y, z);
      if (!blocks.has(k)) {
        const b = { x, y, z, c: color };
        blocks.set(k, b);
        step({ t: "place", ...b });
      }
    },
    remove() {
      const k = key3(x, y, z);
      if (blocks.delete(k)) step({ t: "remove", x, y, z });
    },
    print,
  };

  return {
    api: api as unknown as Sim["api"],
    steps,
    output,
    check() {
      const missing = missingWalls([...blocks.values()]);
      if (missing.length === 0) return { passed: true, message: "All 54 wall blocks are in place. Your house is built!" };
      const low = missing[0];
      return {
        passed: false,
        message: `${missing.length} wall block${missing.length === 1 ? " is" : "s are"} still missing. The first gap is at x=${low.x}, z=${low.z}, layer ${low.y + 1}.`,
      };
    },
  };
}

export function marketSim(world: MarketWorld): Sim {
  const { steps, output, step, print } = base();
  let next = 0;
  let current: string | null = null;
  let aisle = 0;
  let level = 0;
  let holding: string | null = null;
  let served = 0;
  const mistakes: string[] = [];

  const api = {
    has_customer() {
      return next < world.orders.length || current !== null;
    },
    next_order() {
      if (current !== null) return current;
      if (next >= world.orders.length) throw new BayError("There are no customers waiting. Use has_customer() to check first.");
      current = world.orders[next++];
      step({ t: "customer", n: next, want: current });
      return current;
    },
    go_to_aisle(a: unknown) {
      const n = int("go_to_aisle", a, 1, AISLES.length);
      if (level > 0) {
        level = 0;
        step({ t: "raise", level: 0 });
      }
      aisle = n;
      step({ t: "aisle", aisle });
    },
    raise_to(l: unknown) {
      const n = int("raise_to", l, 1, 4);
      if (aisle === 0) throw new BayError("Drive the ladder to an aisle first with go_to_aisle().");
      level = n;
      step({ t: "raise", level });
    },
    pick() {
      if (aisle === 0 || level === 0) throw new BayError("The ladder is not at a shelf. Use go_to_aisle() and raise_to() first.");
      if (holding) throw new BayError(`The ladder's basket already holds ${holding}. Deliver it first.`);
      holding = AISLES[aisle - 1][level - 1];
      step({ t: "pick", product: holding, aisle, level });
      return holding;
    },
    deliver() {
      if (!holding) throw new BayError("The basket is empty. pick() something first.");
      if (current === null) throw new BayError("Nobody is waiting. Call next_order() to serve the next customer.");
      const ok = holding === current;
      if (!ok) mistakes.push(`Customer ${next} asked for ${current} but got ${holding}.`);
      else served++;
      step({ t: "deliver", n: next, product: holding, want: current, ok });
      holding = null;
      current = null;
      aisle = 0;
      level = 0;
    },
    print,
  };

  return {
    api: api as unknown as Sim["api"],
    steps,
    output,
    check() {
      if (mistakes.length) return { passed: false, message: mistakes[0] };
      if (served < world.orders.length)
        return { passed: false, message: `Only ${served} of ${world.orders.length} customers got their shopping. Keep serving while has_customer() is true.` };
      return { passed: true, message: `All ${served} customers got the right product.` };
    },
  };
}

export function beachSim(world: BeachWorld): Sim {
  const { steps, output, step, print } = base();
  const left = world.litter.map((l) => ({ ...l }));
  let x = 0;
  let z = 0;
  let holding: Litter | null = null;
  let correct = 0;
  const wrong: string[] = [];

  const nearest = () => {
    let best = -1;
    let bestD = Infinity;
    left.forEach((l, i) => {
      const d = (l.x - x) ** 2 + (l.z - z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const api = {
    has_litter() {
      return left.length > 0;
    },
    scan() {
      const i = nearest();
      return i < 0 ? null : left[i].kind;
    },
    pick_up() {
      if (holding) throw new BayError(`The claw is already holding a ${holding.kind}. Use drop_in() first.`);
      const i = nearest();
      if (i < 0) throw new BayError("There is no litter left to pick up. Check has_litter() first.");
      holding = left.splice(i, 1)[0];
      x = holding.x;
      z = holding.z;
      step({ t: "goto", x, z });
      step({ t: "pick", id: holding.id, kind: holding.kind });
    },
    drop_in(bin: unknown) {
      if (!BINS.includes(bin as BinName)) throw new BayError(`drop_in(${JSON.stringify(bin)}): the bins are "recycling", "compost" and "garbage".`);
      if (!holding) throw new BayError("The claw is empty. pick_up() some litter first.");
      const p = BIN_POS[bin as BinName];
      x = p.x;
      z = p.z;
      step({ t: "goto", x, z });
      const ok = LITTER_KINDS[holding.kind] === bin;
      if (ok) correct++;
      else wrong.push(`A ${holding.kind} went in ${bin}, but it belongs in ${LITTER_KINDS[holding.kind]}.`);
      step({ t: "drop", id: holding.id, bin, ok });
      holding = null;
    },
    print,
  };

  return {
    api: api as unknown as Sim["api"],
    steps,
    output,
    check() {
      if (wrong.length) return { passed: false, message: wrong[0] };
      if (left.length || holding) return { passed: false, message: `${left.length + (holding ? 1 : 0)} pieces of litter are still on the beach.` };
      return { passed: true, message: `All ${correct} pieces cleaned up and sorted correctly.` };
    },
  };
}

export function makeSim(mission: MissionId, world: unknown): Sim {
  if (mission === "home") return homeSim(world as HomeWorld);
  if (mission === "market") return marketSim(world as MarketWorld);
  return beachSim(world as BeachWorld);
}

/** The hidden worlds every solution must also pass, after the live one. */
export function testWorlds(mission: MissionId): unknown[] {
  if (mission === "home") return [{ blocks: [] } satisfies HomeWorld];
  if (mission === "market")
    return [
      { orders: ["eggs", "rice", "oranges", "cookies"] },
      { orders: ["flour", "cereal", "milk"] },
      { orders: ["mangoes"] },
    ] satisfies MarketWorld[];
  return [{ litter: makeLitter(9, 7) }, { litter: makeLitter(14, 42) }, { litter: [] }] satisfies BeachWorld[];
}

// ---------------------------------------------------------------------------
// What the code panel shows

export type MissionInfo = {
  id: MissionId;
  bot: string;
  title: string;
  goal: string;
  api: { sig: string; doc: string }[];
  starter: Record<Lang, string>;
  hint: string;
};

export const MISSIONS: Record<MissionId, MissionInfo> = {
  home: {
    id: "home",
    bot: "Builder Bot",
    title: "Build your house",
    goal: "Build the walls of your house: a 6 × 5 outline, 3 blocks high (54 blocks). The bot starts in the corner of your plot, facing east.",
    api: [
      { sig: "place()", doc: "Put a block where the bot is." },
      { sig: "move(n)", doc: "Drive n blocks forward." },
      { sig: "turn_right() / turn_left()", doc: "Turn 90°." },
      { sig: "up() / down()", doc: "Go up or down one layer." },
      { sig: 'set_color("wood")', doc: "brick, wood, stone, white, teal, yellow, glass" },
      { sig: "remove()", doc: "Take away the block where the bot is." },
    ],
    starter: {
      py: `# Builder Bot: build one wall, then turn the corner.
# Your job: finish all 4 walls, 3 layers high.
# Hint: a loop can repeat a wall, and another loop can repeat a layer.

set_color("brick")

for step in range(5):
    place()
    move(1)
turn_right()
`,
      js: `// Builder Bot: build one wall, then turn the corner.
// Your job: finish all 4 walls, 3 layers high.
// Hint: a loop can repeat a wall, and another loop can repeat a layer.

set_color("brick");

for (let step = 0; step < 5; step++) {
  place();
  move(1);
}
turn_right();
`,
    },
    hint: "The long walls need 5 place-and-move steps, the short walls 4. After 4 walls the bot is back at the corner: call up() and do it again.",
  },
  market: {
    id: "market",
    bot: "Ladder Bot",
    title: "Help at the Fresh Market",
    goal: "Program the Ladder Bot to serve every customer: find their product's aisle and shelf, pick it, and deliver it. Read the aisle signs in the market to finish shelf_map.",
    api: [
      { sig: "has_customer()", doc: "True while someone is waiting." },
      { sig: "next_order()", doc: 'The product the customer wants, e.g. "cereal".' },
      { sig: "go_to_aisle(n)", doc: "Drive to aisle 1–4." },
      { sig: "raise_to(level)", doc: "Raise the ladder to shelf 1 (bottom) to 4 (top)." },
      { sig: "pick()", doc: "Take the product on this shelf." },
      { sig: "deliver()", doc: "Bring it to the customer at the counter." },
    ],
    starter: {
      py: `# Where is everything? [aisle, shelf]
# Walk the aisles and read the signs to fill in the rest.
shelf_map = {
    "rice": [1, 1],
    "cereal": [4, 4],
}

while has_customer():
    product = next_order()
    aisle, level = shelf_map[product]
    go_to_aisle(aisle)
    raise_to(level)
    pick()
    deliver()
`,
      js: `// Where is everything? [aisle, shelf]
// Walk the aisles and read the signs to fill in the rest.
const shelf_map = {
  "rice": [1, 1],
  "cereal": [4, 4],
};

while (has_customer()) {
  const product = next_order();
  const [aisle, level] = shelf_map[product];
  go_to_aisle(aisle);
  raise_to(level);
  pick();
  deliver();
}
`,
    },
    hint: "Each aisle sign lists its 4 shelves from bottom (1) to top (4). There are 16 products in all, and the bot is tested on new customers.",
  },
  beach: {
    id: "beach",
    bot: "Beach Bot",
    title: "Clean up the beach",
    goal: "Program the Beach Bot to pick up every piece of litter and sort it into the right bin. It runs again every time the tide brings more.",
    api: [
      { sig: "has_litter()", doc: "True while litter is left on the beach." },
      { sig: "scan()", doc: 'What the nearest litter is, e.g. "can".' },
      { sig: "pick_up()", doc: "Drive to the nearest litter and grab it." },
      { sig: 'drop_in("recycling")', doc: "Drive to a bin and drop it: recycling, compost or garbage." },
    ],
    starter: {
      py: `# Recycling: bottle, can, newspaper
# Compost:   apple core, banana peel
# Garbage:   chip bag, straw

while has_litter():
    item = scan()
    pick_up()
    if item == "can":
        drop_in("recycling")
    else:
        drop_in("garbage")
`,
      js: `// Recycling: bottle, can, newspaper
// Compost:   apple core, banana peel
// Garbage:   chip bag, straw

while (has_litter()) {
  const item = scan();
  pick_up();
  if (item === "can") {
    drop_in("recycling");
  } else {
    drop_in("garbage");
  }
}
`,
    },
    hint: "Use elif (Python) or else if (JavaScript) for each bin, or make a dictionary that maps each item to its bin.",
  },
};

/** Names students can call in each mission, for highlighting and the worker. */
export const API_NAMES: Record<MissionId, string[]> = {
  home: ["place", "move", "turn_right", "turn_left", "up", "down", "set_color", "remove", "print"],
  market: ["has_customer", "next_order", "go_to_aisle", "raise_to", "pick", "deliver", "print"],
  beach: ["has_litter", "scan", "pick_up", "drop_in", "print"],
};
