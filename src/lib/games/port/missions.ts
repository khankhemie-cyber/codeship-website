/**
 * Port CODEship: the coding missions and the simulators that run students' code.
 *
 * Pure TypeScript with no browser or Three.js imports, so the same code runs in
 * the game's Web Worker and in the Node tests (scripts/port-codeship/test-missions.mjs).
 *
 * A run works like Robot Lab: the student's program calls the mission's
 * functions (place(), go_to_aisle(2), pick_up()…). Each call updates the
 * simulator and records a step. The game then plays the steps back in 3D.
 * Each mission is checked against several worlds (different customers,
 * different litter), so only code that solves the general problem passes.
 */

export type Lang = "py" | "js";
export type MissionId = "home" | "market" | "beach" | "security" | "bank" | "library";

export class BotError extends Error {
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
  if (!Number.isInteger(n)) throw new BotError(`${name} needs a whole number, like ${name}(${min}). You gave ${JSON.stringify(v)}.`);
  if (n < min || n > max) throw new BotError(`${name}(${n}) is out of range. Use a number from ${min} to ${max}.`);
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
        throw new BotError(`move(${count}) would drive the Builder Bot off your plot. The plot is ${PLOT_W} blocks wide and ${PLOT_D} deep.`);
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
      if (y >= PLOT_H - 1) throw new BotError(`The Builder Bot can only build ${PLOT_H} blocks high.`);
      y += 1;
      step({ t: "lift", y });
    },
    down() {
      if (y <= 0) throw new BotError("The Builder Bot is already on the ground.");
      y -= 1;
      step({ t: "lift", y });
    },
    set_color(c: unknown) {
      if (!BLOCK_COLORS.includes(c as BlockColor))
        throw new BotError(`set_color(${JSON.stringify(c)}): pick one of ${BLOCK_COLORS.map((b) => `"${b}"`).join(", ")}.`);
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
      if (next >= world.orders.length) throw new BotError("There are no customers waiting. Use has_customer() to check first.");
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
      if (aisle === 0) throw new BotError("Drive the ladder to an aisle first with go_to_aisle().");
      level = n;
      step({ t: "raise", level });
    },
    pick() {
      if (aisle === 0 || level === 0) throw new BotError("The ladder is not at a shelf. Use go_to_aisle() and raise_to() first.");
      if (holding) throw new BotError(`The ladder's basket already holds ${holding}. Deliver it first.`);
      holding = AISLES[aisle - 1][level - 1];
      step({ t: "pick", product: holding, aisle, level });
      return holding;
    },
    deliver() {
      if (!holding) throw new BotError("The basket is empty. pick() something first.");
      if (current === null) throw new BotError("Nobody is waiting. Call next_order() to serve the next customer.");
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
      if (holding) throw new BotError(`The claw is already holding a ${holding.kind}. Use drop_in() first.`);
      const i = nearest();
      if (i < 0) throw new BotError("There is no litter left to pick up. Check has_litter() first.");
      holding = left.splice(i, 1)[0];
      x = holding.x;
      z = holding.z;
      step({ t: "goto", x, z });
      step({ t: "pick", id: holding.id, kind: holding.kind });
    },
    drop_in(bin: unknown) {
      if (!BINS.includes(bin as BinName)) throw new BotError(`drop_in(${JSON.stringify(bin)}): the bins are "recycling", "compost" and "garbage".`);
      if (!holding) throw new BotError("The claw is empty. pick_up() some litter first.");
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

// ---------------------------------------------------------------------------
// Town Hall: the security gate

/** Who is expected today: posted on the board in the Town Hall lobby. */
export const APPOINTMENTS = ["Ms. Rivera", "Mr. Chen", "Dr. Okafor", "Mrs. Singh", "Mr. Baptiste"];
export const WALK_INS = ["Mr. Lopez", "Ms. Kim", "Mr. Grant", "Ms. Haddad"];

export type Visitor = { name: string; id: boolean };
export type SecurityWorld = { visitors: Visitor[] };
export type SecurityStep =
  | { t: "visitor"; n: number; name: string; id: boolean }
  | { t: "in"; name: string; ok: boolean }
  | { t: "desk"; name: string; ok: boolean }
  | { t: "say"; text: string };

/** A visitor may go through the gate only with an appointment AND photo ID. */
export const mayEnter = (v: Visitor) => APPOINTMENTS.includes(v.name) && v.id;

export function securitySim(world: SecurityWorld): Sim {
  const { steps, output, step, print } = base();
  let next = 0;
  let current: Visitor | null = null;
  let handled = 0;
  const mistakes: string[] = [];
  const decide = (letIn: boolean) => {
    if (!current) throw new BotError("Nobody is at the gate. Call next_visitor() first.");
    const ok = mayEnter(current) === letIn;
    if (!ok)
      mistakes.push(
        letIn
          ? `${current.name} was let in, but ${APPOINTMENTS.includes(current.name) ? "had no photo ID" : "has no appointment today"}.`
          : `${current.name} has an appointment and photo ID, but was sent to the desk.`
      );
    step({ t: letIn ? "in" : "desk", name: current.name, ok });
    handled++;
    current = null;
  };
  const api = {
    has_visitor() {
      return next < world.visitors.length || current !== null;
    },
    next_visitor() {
      if (current) throw new BotError(`${current.name} is still waiting. Use let_in() or send_to_desk() first.`);
      if (next >= world.visitors.length) throw new BotError("Nobody is waiting. Check has_visitor() first.");
      current = world.visitors[next++];
      step({ t: "visitor", n: next, name: current.name, id: current.id });
      return current.name;
    },
    has_id() {
      if (!current) throw new BotError("Nobody is at the gate. Call next_visitor() first.");
      return current.id;
    },
    let_in() {
      decide(true);
    },
    send_to_desk() {
      decide(false);
    },
    print,
  };
  return {
    api: api as unknown as Sim["api"],
    steps,
    output,
    check() {
      if (mistakes.length) return { passed: false, message: mistakes[0] };
      if (handled < world.visitors.length) return { passed: false, message: `Only ${handled} of ${world.visitors.length} visitors were helped. Keep going while has_visitor() is true.` };
      return { passed: true, message: `All ${handled} visitors were checked correctly.` };
    },
  };
}

// ---------------------------------------------------------------------------
// Bank: the change machine

export const BILLS = [50, 20, 10, 5, 1];
/** The fewest bills that add up to an amount (biggest first works for these bills). */
export function fewestBills(amount: number) {
  let n = 0;
  for (const b of BILLS) {
    n += Math.floor(amount / b);
    amount %= b;
  }
  return n;
}

export type BankWorld = { amounts: number[] };
export type BankStep =
  | { t: "customer"; n: number; amount: number }
  | { t: "give"; bill: number; left: number }
  | { t: "paid"; n: number; ok: boolean; bills: number; best: number }
  | { t: "say"; text: string };

export function bankSim(world: BankWorld): Sim {
  const { steps, output, step, print } = base();
  let next = 0;
  let left = 0;
  let open = false;
  let used = 0;
  let served = 0;
  const mistakes: string[] = [];
  const close = () => {
    if (!open) return;
    const amount = world.amounts[next - 1];
    if (left > 0) mistakes.push(`Customer ${next} was owed ${amount} but only got ${amount - left}.`);
    const best = fewestBills(amount);
    const ok = left === 0 && used === best;
    if (left === 0 && used > best) mistakes.push(`Customer ${next} got ${amount} in ${used} bills. It can be done with only ${best}.`);
    if (ok) served++;
    step({ t: "paid", n: next, ok, bills: used, best });
    open = false;
  };
  const api = {
    has_customer() {
      return next < world.amounts.length;
    },
    next_customer() {
      close();
      if (next >= world.amounts.length) throw new BotError("Nobody is in line. Check has_customer() first.");
      left = world.amounts[next++];
      used = 0;
      open = true;
      step({ t: "customer", n: next, amount: left });
      return left;
    },
    amount_left() {
      return open ? left : 0;
    },
    give(bill: unknown) {
      const b = Number(bill);
      if (!BILLS.includes(b)) throw new BotError(`give(${JSON.stringify(bill)}): the machine only has ${BILLS.join(", ")} coin bills.`);
      if (!open) throw new BotError("Nobody is being served. Call next_customer() first.");
      if (b > left) throw new BotError(`give(${b}) is too much: only ${left} is left to pay.`);
      left -= b;
      used++;
      step({ t: "give", bill: b, left });
    },
    print,
  };
  return {
    api: api as unknown as Sim["api"],
    steps,
    output,
    check() {
      close();
      if (mistakes.length) return { passed: false, message: mistakes[0] };
      if (served < world.amounts.length) return { passed: false, message: `Only ${served} of ${world.amounts.length} customers were paid. Keep going while has_customer() is true.` };
      return { passed: true, message: `All ${served} customers got the exact amount in the fewest bills.` };
    },
  };
}

// ---------------------------------------------------------------------------
// Library: sort the returned books

export type LibraryWorld = { books: number[] };
export type LibraryStep = { t: "swap"; i: number; j: number } | { t: "say"; text: string };

export function librarySim(world: LibraryWorld): Sim {
  const { steps, output, step, print } = base();
  const shelf = [...world.books];
  const spot = (name: string, v: unknown) => {
    const i = Number(v);
    if (!Number.isInteger(i) || i < 0 || i >= shelf.length)
      throw new BotError(`${name}(${JSON.stringify(v)}): there is no book there. Spots go from 0 to ${shelf.length - 1}.`);
    return i;
  };
  const api = {
    book_count() {
      return shelf.length;
    },
    call_number(i: unknown) {
      return shelf[spot("call_number", i)];
    },
    swap(i: unknown, j: unknown) {
      const a = spot("swap", i);
      const b = spot("swap", j);
      [shelf[a], shelf[b]] = [shelf[b], shelf[a]];
      step({ t: "swap", i: a, j: b });
    },
    print,
  };
  return {
    api: api as unknown as Sim["api"],
    steps,
    output,
    check() {
      for (let i = 0; i + 1 < shelf.length; i++)
        if (shelf[i] > shelf[i + 1]) return { passed: false, message: `Not sorted yet: book ${shelf[i]} is to the left of ${shelf[i + 1]} (spots ${i} and ${i + 1}).` };
      return { passed: true, message: `All ${shelf.length} books are in order.` };
    },
  };
}

export function makeSim(mission: MissionId, world: unknown): Sim {
  if (mission === "home") return homeSim(world as HomeWorld);
  if (mission === "market") return marketSim(world as MarketWorld);
  if (mission === "security") return securitySim(world as SecurityWorld);
  if (mission === "bank") return bankSim(world as BankWorld);
  if (mission === "library") return librarySim(world as LibraryWorld);
  return beachSim(world as BeachWorld);
}

/** The world each challenge is played in when you're standing there. */
export function liveWorld(mission: "security" | "bank" | "library"): unknown {
  if (mission === "security")
    return {
      visitors: [
        { name: "Ms. Rivera", id: true },
        { name: "Mr. Lopez", id: true },
        { name: "Mr. Chen", id: false },
        { name: "Dr. Okafor", id: true },
        { name: "Ms. Kim", id: false },
        { name: "Mrs. Singh", id: true },
      ],
    } satisfies SecurityWorld;
  if (mission === "bank") return { amounts: [87, 23, 4] } satisfies BankWorld;
  return { books: [412, 105, 733, 268, 590, 321, 884, 150] } satisfies LibraryWorld;
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
  if (mission === "security")
    return [
      { visitors: [{ name: "Mr. Baptiste", id: true }, { name: "Ms. Haddad", id: true }, { name: "Mrs. Singh", id: false }, { name: "Mr. Chen", id: true }] },
      { visitors: [{ name: "Mr. Grant", id: false }, { name: "Dr. Okafor", id: true }] },
      { visitors: [] },
    ] satisfies SecurityWorld[];
  if (mission === "bank") return [{ amounts: [99, 50, 7, 136] }, { amounts: [1, 65, 38] }, { amounts: [] }] satisfies BankWorld[];
  if (mission === "library")
    return [
      { books: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
      { books: [100, 200, 300] },
      { books: [530, 112, 530, 87, 941, 300] },
      { books: [42] },
    ] satisfies LibraryWorld[];
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
  security: {
    id: "security",
    bot: "Gate Bot",
    title: "Town Hall security",
    goal: "Program the security gate. Let a visitor in only if they have an appointment today AND show photo ID. Everyone else goes to the front desk. The appointment board is on the lobby wall.",
    api: [
      { sig: "has_visitor()", doc: "True while someone is waiting at the gate." },
      { sig: "next_visitor()", doc: 'The next visitor\'s name, e.g. "Mr. Chen".' },
      { sig: "has_id()", doc: "True if this visitor showed photo ID." },
      { sig: "let_in()", doc: "Open the gate for them." },
      { sig: "send_to_desk()", doc: "Send them to the front desk instead." },
    ],
    starter: {
      py: `# Who is expected today? Read the board in the lobby.
appointments = ["Ms. Rivera", "Mr. Chen"]

while has_visitor():
    name = next_visitor()
    if name in appointments:
        let_in()
    else:
        send_to_desk()
`,
      js: `// Who is expected today? Read the board in the lobby.
const appointments = ["Ms. Rivera", "Mr. Chen"];

while (has_visitor()) {
  const name = next_visitor();
  if (appointments.includes(name)) {
    let_in();
  } else {
    send_to_desk();
  }
}
`,
    },
    hint: "Two things must both be true: the name is on the board, and has_id() is True. In Python use 'and', in JavaScript '&&'. And copy every name from the board.",
  },
  bank: {
    id: "bank",
    bot: "Change Machine",
    title: "Bank change machine",
    goal: "Program the change machine to pay each customer exactly what they're owed, using the fewest bills. Bills come in 50, 20, 10, 5 and 1.",
    api: [
      { sig: "has_customer()", doc: "True while someone is in line." },
      { sig: "next_customer()", doc: "Serve the next customer; returns how much they're owed." },
      { sig: "amount_left()", doc: "How much this customer still needs." },
      { sig: "give(bill)", doc: "Hand over one bill: 50, 20, 10, 5 or 1." },
    ],
    starter: {
      py: `while has_customer():
    amount = next_customer()
    # This pays the right amount... in a LOT of bills.
    while amount_left() >= 1:
        give(1)
`,
      js: `while (has_customer()) {
  const amount = next_customer();
  // This pays the right amount... in a LOT of bills.
  while (amount_left() >= 1) {
    give(1);
  }
}
`,
    },
    hint: "Try the biggest bill first: while amount_left() is at least 50, give(50). Then do the same for 20, 10, 5 and 1. A list of bills and a for loop keeps it short.",
  },
  library: {
    id: "library",
    bot: "Shelf Bot",
    title: "Sort the library books",
    goal: "Program the Shelf Bot to put the returned books in order, smallest call number on the left. Spots are numbered from 0.",
    api: [
      { sig: "book_count()", doc: "How many books are on the shelf." },
      { sig: "call_number(i)", doc: "The number on the book at spot i." },
      { sig: "swap(i, j)", doc: "Swap the books at spots i and j." },
    ],
    starter: {
      py: `n = book_count()

# One pass: swap any neighbours that are the wrong way round.
for i in range(n - 1):
    if call_number(i) > call_number(i + 1):
        swap(i, i + 1)
`,
      js: `const n = book_count();

// One pass: swap any neighbours that are the wrong way round.
for (let i = 0; i < n - 1; i++) {
  if (call_number(i) > call_number(i + 1)) {
    swap(i, i + 1);
  }
}
`,
    },
    hint: "One pass moves the biggest book to the end, but the rest may still be mixed up. Repeat the pass: a loop around your loop (this is called bubble sort).",
  },
};

/** Names students can call in each mission, for highlighting and the worker. */
export const API_NAMES: Record<MissionId, string[]> = {
  home: ["place", "move", "turn_right", "turn_left", "up", "down", "set_color", "remove", "print"],
  market: ["has_customer", "next_order", "go_to_aisle", "raise_to", "pick", "deliver", "print"],
  beach: ["has_litter", "scan", "pick_up", "drop_in", "print"],
  security: ["has_visitor", "next_visitor", "has_id", "let_in", "send_to_desk", "print"],
  bank: ["has_customer", "next_customer", "amount_left", "give", "print"],
  library: ["book_count", "call_number", "swap", "print"],
};
