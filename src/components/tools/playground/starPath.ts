/**
 * Star Path: tap-the-arrows puzzles for the youngest coders (ages 4–7).
 * No reading needed: a child builds a row of arrows, presses Go, and the
 * robot walks it, picking up every star. Later levels add a Repeat block
 * (with a block budget so it is worth using) and "fix the bug" levels that
 * open with a broken program.
 *
 * Bumping a rock or the edge just stops the robot. Nothing helps: the
 * debugging is the lesson, as in CODEship Blocks.
 *
 * Maps are 7 x 5 text grids:  .  empty   R  robot   *  star   #  rock
 *
 * Every level has a reference solution in scripts/playground/test-playground.mjs.
 * Erasable TypeScript only: the tests import this file into Node.
 */

export const COLS = 7;
export const ROWS = 5;

export type Dir = "up" | "down" | "left" | "right";
export type Move = { t: "move"; d: Dir };
export type Repeat = { t: "repeat"; n: number; body: Move[] };
export type Cmd = Move | Repeat;
export type Program = Cmd[];

export type Kind = "sequence" | "loop" | "debug";

export type PathLevel = {
  kind: Kind;
  map: string[];
  /** Block budget (each arrow and each Repeat counts as one). */
  maxBlocks?: number;
  allowRepeat: boolean;
  /** A debug level opens with this (broken) program. */
  starter?: Program;
};

export type Pos = { x: number; y: number };
export type Outcome = "win" | "bump" | "short" | "tooMany";
export type RunResult = { steps: Pos[]; collected: number[]; outcome: Outcome; bumpDir?: Dir };

export const DELTA: Record<Dir, Pos> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
export const REPEAT_COUNTS = [2, 3, 4, 5];

const m = (d: Dir): Move => ({ t: "move", d });
const rep = (n: number, ...body: Dir[]): Repeat => ({ t: "repeat", n, body: body.map(m) });

/** Parse a compact program string for levels and tests: "R R U 3(R) 2(U R)". */
export function parseProgram(src: string): Program {
  const letter: Record<string, Dir> = { U: "up", D: "down", L: "left", R: "right" };
  const out: Program = [];
  const re = /(\d)\(([UDLR ]*)\)|([UDLR])/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(src))) {
    if (match[3]) out.push(m(letter[match[3]]));
    else out.push(rep(Number(match[1]), ...(match[2].trim().split(/\s+/).filter(Boolean).map((c) => letter[c]))));
  }
  return out;
}

export function blockCount(p: Program): number {
  return p.reduce((n, c) => n + (c.t === "repeat" ? 1 + c.body.length : 1), 0);
}

export function flatten(p: Program): Dir[] {
  const out: Dir[] = [];
  for (const c of p) {
    if (c.t === "move") out.push(c.d);
    else for (let i = 0; i < c.n; i++) for (const b of c.body) out.push(b.d);
  }
  return out;
}

export function find(level: PathLevel, ch: string): Pos[] {
  const out: Pos[] = [];
  level.map.forEach((row, y) => [...row].forEach((c, x) => c === ch && out.push({ x, y })));
  return out;
}

export const isRock = (level: PathLevel, x: number, y: number) => level.map[y]?.[x] === "#";

/**
 * Run a program. `steps[0]` is the start; each move that happens adds a step.
 * The robot wins the moment the last star is picked up, so a few extra arrows
 * after that don't spoil a solution.
 */
export function run(level: PathLevel, p: Program): RunResult {
  const start = find(level, "R")[0];
  const stars = find(level, "*");
  const steps: Pos[] = [start];
  const collected: number[] = [];
  if (level.maxBlocks && blockCount(p) > level.maxBlocks) return { steps, collected, outcome: "tooMany" };
  let { x, y } = start;
  for (const d of flatten(p)) {
    const nx = x + DELTA[d].x;
    const ny = y + DELTA[d].y;
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || isRock(level, nx, ny)) return { steps, collected, outcome: "bump", bumpDir: d };
    x = nx;
    y = ny;
    steps.push({ x, y });
    const i = stars.findIndex((s) => s.x === x && s.y === y);
    if (i >= 0 && !collected.includes(i)) collected.push(i);
    if (collected.length === stars.length) return { steps, collected, outcome: "win" };
  }
  return { steps, collected, outcome: "short" };
}

export const LEVELS: PathLevel[] = [
  // ── Sequencing: one direction, then turns, then around rocks ──
  { kind: "sequence", allowRepeat: false, map: [".......", ".......", ".R..*..", ".......", "......."] },
  { kind: "sequence", allowRepeat: false, map: [".......", "...*...", ".......", "...R...", "......."] },
  { kind: "sequence", allowRepeat: false, map: [".......", ".R.....", ".......", ".......", "...*..."] },
  { kind: "sequence", allowRepeat: false, map: [".......", "..*....", ".......", ".R..*..", "......."] },
  { kind: "sequence", allowRepeat: false, map: [".......", ".......", ".R.#.*.", "...#...", "......."] },
  { kind: "sequence", allowRepeat: false, map: [".......", ".###...", ".#*#.R.", ".#.#...", "......."] },
  // ── Loops: a budget too small for plain arrows ──
  { kind: "loop", allowRepeat: true, maxBlocks: 2, map: [".......", ".......", ".R....*", ".......", "......."] },
  { kind: "loop", allowRepeat: true, maxBlocks: 2, map: ["...*...", ".......", ".......", ".......", "...R..."] },
  { kind: "loop", allowRepeat: true, maxBlocks: 3, map: [".......", "....*..", "...*...", "..*....", ".R....."] },
  { kind: "loop", allowRepeat: true, maxBlocks: 4, map: ["R...*..", ".......", ".......", ".......", "....*.."] },
  { kind: "loop", allowRepeat: true, maxBlocks: 4, map: [".......", "......*", "....*..", "..*....", "R......"] },
  // ── Fix the bug: the program is nearly right ──
  { kind: "debug", allowRepeat: false, starter: parseProgram("R U R"), map: [".......", ".......", ".R.*...", ".......", "......."] },
  { kind: "debug", allowRepeat: false, starter: parseProgram("R R R D D"), map: [".......", ".R.....", ".......", "...*...", "......."] },
  { kind: "debug", allowRepeat: true, maxBlocks: 2, starter: parseProgram("4(R)"), map: [".......", ".......", "R....*.", ".......", "......."] },
  { kind: "debug", allowRepeat: true, maxBlocks: 3, starter: parseProgram("2(U R)"), map: ["...*...", "..*....", ".*.....", "R......", "......."] },
];
