/**
 * Bus Buddies: runs a child's program (or, in cones levels, lets Bina drive
 * herself) and returns every step, so the game can animate it and the tests
 * can check it. Pure: no DOM, no React.
 */
import type { Block, Dir, Item, Level, PassengerId, Program } from "./levels";

export interface Pos {
  x: number;
  y: number;
}

export interface Frame {
  /** Which block made this step: "3" for the 4th block, "2.1" for the 2nd block inside the Repeat at 2. "" in cones levels. */
  path: string;
  block: Block;
  /** Blocks run before this one (each block takes one tick); lights compare against it. */
  tick: number;
  x: number;
  y: number;
  dir: Dir;
  /** Bus angle in degrees, kept continuous so turns never spin the long way round. */
  angle: number;
  boarded?: PassengerId;
  woke?: PassengerId;
  /** Bina tried to drive into this square and stopped. */
  bump?: Pos;
  /** A bridge was laid on this square. */
  bridge?: Pos;
  /** The ferry came to Bina's dock and carried her from `from` to (x, y). */
  ferry?: { from: Pos };
}

export type Outcome =
  | { ok: true }
  | {
      ok: false;
      /** Path of the block to glow, or null when the program just ended too soon. */
      blame: string | null;
      /** voice-script line that explains it. */
      line: string;
    };

export interface RunResult {
  start: { x: number; y: number; dir: Dir; angle: number };
  frames: Frame[];
  outcome: Outcome;
}

export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

/* ---------------- programs ---------------- */

export interface Step {
  block: Block;
  path: string;
}

/** The program as the steps Bina will take, with Repeats unrolled. */
export function flatten(program: Program): Step[] {
  const out: Step[] = [];
  program.forEach((item, i) => {
    if (typeof item === "string") out.push({ block: item, path: `${i}` });
    else for (let r = 0; r < item.repeat; r++) item.body.forEach((b, j) => out.push({ block: b, path: `${i}.${j}` }));
  });
  return out;
}

/** Slots a program uses in the strip: one per block, one per Repeat plus its blocks. */
export function pieces(program: Program): number {
  return program.reduce((n, item) => n + (typeof item === "string" ? 1 : 1 + item.body.length), 0);
}

export const sameItem = (a: Item | undefined, b: Item | undefined) => JSON.stringify(a) === JSON.stringify(b);

/* ---------------- the map ---------------- */

export function cellAt(level: Level, x: number, y: number): string | undefined {
  return level.map[y]?.[x];
}

export function findChar(level: Level, ch: string): Pos | null {
  for (let y = 0; y < level.map.length; y++) {
    const x = level.map[y].indexOf(ch);
    if (x >= 0) return { x, y };
  }
  return null;
}

const key = (x: number, y: number) => `${x},${y}`;

/** Road Bina can drive on (bridges and cones aside). */
export function isRoadChar(level: Level, ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return "#SGk".includes(ch) || level.passengers.some((p) => p.stop === ch) || !!level.lights?.some((l) => l.ch === ch);
}

/** The funny line for driving into a square that isn't road. */
export function bumpLine(ch: string | undefined): string {
  if (ch === undefined) return "common.oops_edge";
  if (ch === "c") return "common.oops_cows";
  if (ch === "f") return "common.oops_flowers";
  if (ch === "w") return "common.oops_water";
  if (ch === "x") return "common.oops_roadwork";
  if (ch === "m") return "common.oops_rocks";
  return "common.oops_grass";
}

export function startState(level: Level) {
  const s = findChar(level, "S");
  if (!s) throw new Error(`Level ${level.id} has no start (S)`);
  return { x: s.x, y: s.y, dir: level.start.dir, angle: level.start.dir * 90 };
}

/** Is this light (or crossing) still red after `tick` blocks? */
export function isRed(level: Level, ch: string | undefined, tick: number) {
  const light = level.lights?.find((l) => l.ch === ch);
  return !!light && tick < light.red;
}

/* ---------------- running a program ---------------- */

export function run(level: Level, program: Program): RunResult {
  const start = startState(level);
  let { x, y, dir, angle } = start;
  const frames: Frame[] = [];
  const aboard = new Set<PassengerId>();
  const bridges = new Set<string>();
  const stops = level.passengers.map((p) => ({ p, at: findChar(level, p.stop)! }));
  let leftBehind: { id: PassengerId; path: string } | null = null;
  const drivable = (nx: number, ny: number) => bridges.has(key(nx, ny)) || isRoadChar(level, cellAt(level, nx, ny));
  const here = () => stops.find((s) => s.at.x === x && s.at.y === y && !aboard.has(s.p.id));
  const fail = (frame: Frame, blame: string | null, line: string): RunResult => {
    frames.push(frame);
    return { start, frames, outcome: { ok: false, blame, line } };
  };

  const steps = flatten(program);
  for (let tick = 0; tick < steps.length; tick++) {
    const { block, path } = steps[tick];
    const frame: Frame = { path, block, tick, x, y, dir, angle };
    const ax = x + DX[dir];
    const ay = y + DY[dir];
    const ahead = cellAt(level, ax, ay);

    if (block === "forward") {
      if (!drivable(ax, ay)) return fail({ ...frame, bump: { x: ax, y: ay } }, path, bumpLine(ahead));
      if (isRed(level, ahead, tick)) {
        const kind = level.lights!.find((l) => l.ch === ahead)!.kind;
        return fail({ ...frame, bump: { x: ax, y: ay } }, path, kind === "ducks" ? "common.oops_ducks" : "common.oops_red");
      }
      const waiting = here();
      if (waiting) leftBehind = { id: waiting.p.id, path };
      x = ax;
      y = ay;
      frame.x = x;
      frame.y = y;
      const stop = here();
      if (stop && stop.p.needs === "arrive") {
        aboard.add(stop.p.id);
        frame.boarded = stop.p.id;
      }
    } else if (block === "left" || block === "right") {
      const turn = block === "left" ? -1 : 1;
      dir = ((((dir + turn) % 4) + 4) % 4) as Dir;
      angle += turn * 90;
      frame.dir = dir;
      frame.angle = angle;
    } else if (block === "honk" || block === "pickup") {
      const stop = here();
      if (stop && stop.p.needs === block) {
        aboard.add(stop.p.id);
        frame.boarded = stop.p.id;
        if (block === "honk") frame.woke = stop.p.id;
      }
    } else if (block === "bridge") {
      // A bridge covers one square of water, with road on the far side.
      if (ahead === "w" && !bridges.has(key(ax, ay))) {
        const bx = ax + DX[dir];
        const by = ay + DY[dir];
        if (!isRoadChar(level, cellAt(level, bx, by))) return fail(frame, path, "common.bridge_too_long");
        bridges.add(key(ax, ay));
        frame.bridge = { x: ax, y: ay };
      }
    } else if (block === "ferry") {
      // The ferry only stops at a dock, and crosses the water straight ahead to the next dock.
      if (cellAt(level, x, y) !== "k" || ahead !== "w") return fail(frame, path, "common.ferry_dock");
      let lx = ax;
      let ly = ay;
      while (cellAt(level, lx, ly) === "w") {
        lx += DX[dir];
        ly += DY[dir];
      }
      if (cellAt(level, lx, ly) !== "k") return fail(frame, path, "common.ferry_dock");
      frame.ferry = { from: { x, y } };
      x = lx;
      y = ly;
      frame.x = x;
      frame.y = y;
    }
    // "wait" just lets a tick go by.
    frames.push(frame);
  }
  return { start, frames, outcome: finish(level, x, y, aboard, stops, leftBehind) };
}

function finish(
  level: Level,
  x: number,
  y: number,
  aboard: Set<PassengerId>,
  stops: { p: Level["passengers"][number]; at: Pos }[],
  leftBehind: { id: PassengerId; path: string } | null,
): Outcome {
  const missing = level.passengers.filter((p) => !aboard.has(p.id));
  if (missing.length) {
    // Parked at a friend's stop, but they still need a honk or a pick-up.
    const parked = stops.find((s) => s.at.x === x && s.at.y === y && !aboard.has(s.p.id));
    if (parked) return { ok: false, blame: null, line: parked.p.waitingLine ?? "common.too_short" };
    // Drove past someone who needed a honk or a pick-up: glow the block where Bina left them.
    if (leftBehind && missing.some((p) => p.id === leftBehind.id)) return { ok: false, blame: leftBehind.path, line: "common.oops_missed" };
    return { ok: false, blame: null, line: "common.too_short" };
  }
  const goal = findChar(level, "G");
  if (goal && (goal.x !== x || goal.y !== y)) return { ok: false, blame: null, line: "common.too_short" };
  return { ok: true };
}

/* ---------------- cones levels: Bina drives herself ---------------- */

/** Squares where a cone may go: plain road (not the start, the goal, a stop, a dock or a light). */
export function coneSpot(level: Level, x: number, y: number) {
  return cellAt(level, x, y) === "#";
}

/**
 * Bina drives on her own: at every square she takes the only open road ahead,
 * left or right (never back). Two open roads and she doesn't know which way;
 * none and it's a dead end. Cones close roads.
 */
export function autopilot(level: Level, cones: Pos[]): RunResult {
  const start = startState(level);
  let { x, y, dir, angle } = start;
  const coned = new Set(cones.map((c) => key(c.x, c.y)));
  const frames: Frame[] = [];
  const aboard = new Set<PassengerId>();
  const stops = level.passengers.map((p) => ({ p, at: findChar(level, p.stop)! }));
  const goal = findChar(level, "G");
  const open = (nx: number, ny: number) => isRoadChar(level, cellAt(level, nx, ny)) && !coned.has(key(nx, ny));
  let tick = 0;
  const end = (outcome: Outcome): RunResult => ({ start, frames, outcome });

  for (let guard = 0; guard < 60; guard++) {
    if (goal && goal.x === x && goal.y === y) return end(finish(level, x, y, aboard, stops, null));
    const choices = ([0, -1, 1] as const).filter((t) => {
      const d = (dir + t + 4) % 4;
      return open(x + DX[d], y + DY[d]);
    });
    if (choices.length === 0) {
      if (!goal) return end(finish(level, x, y, aboard, stops, null));
      return end({ ok: false, blame: null, line: "common.dead_end" });
    }
    if (choices.length > 1) return end({ ok: false, blame: null, line: "common.which_way" });
    const t = choices[0];
    if (t !== 0) {
      dir = ((dir + t + 4) % 4) as Dir;
      angle += t * 90;
      frames.push({ path: "", block: t < 0 ? "left" : "right", tick: tick++, x, y, dir, angle });
    }
    x += DX[dir];
    y += DY[dir];
    const frame: Frame = { path: "", block: "forward", tick: tick++, x, y, dir, angle };
    const stop = stops.find((s) => s.at.x === x && s.at.y === y && !aboard.has(s.p.id));
    if (stop) {
      aboard.add(stop.p.id);
      frame.boarded = stop.p.id;
    }
    frames.push(frame);
  }
  return end({ ok: false, blame: null, line: "common.dead_end" });
}

/* ---------------- hints ---------------- */

/**
 * Where the child's program first leaves the level's solution: the next
 * correct item goes at this index. Used for the hint arrow and "add the next block".
 */
export function nextCorrect(level: Level, program: Program): { index: number; item: Item } | null {
  let i = 0;
  while (i < program.length && i < level.solution.length && sameItem(program[i], level.solution[i])) i++;
  if (i >= level.solution.length) return null;
  return { index: i, item: level.solution[i] };
}

/** The first move an item makes (a Repeat's first block). */
export const firstBlock = (item: Item): Block | null => (typeof item === "string" ? item : (item.body[0] ?? null));

/** Where Bina is after running `program` (where the hint arrow is drawn). */
export function stateAfter(level: Level, program: Program) {
  const r = run(level, program);
  const last = r.frames[r.frames.length - 1];
  return last ? { x: last.x, y: last.y, dir: last.dir, angle: last.angle } : r.start;
}

/** The next cone the hint suggests, or null when every cone in the answer is placed. */
export function nextCone(level: Level, cones: Pos[]): Pos | null {
  const c = level.coneSolution?.find(([x, y]) => !cones.some((p) => p.x === x && p.y === y));
  return c ? { x: c[0], y: c[1] } : null;
}

/**
 * The way Bina faces when each step runs, plus (last) the way she faces
 * after the whole program: what the block pictures are drawn with. Counted
 * in quarter turns clockwise from up, without wrapping (so -1 is left and 5
 * is right), so a picture never spins the long way round. Keys are paths.
 */
export function headings(level: Level, program: Program): { byPath: Record<string, number>; end: number } {
  let turns: number = level.start.dir;
  const byPath: Record<string, number> = {};
  for (const s of flatten(program)) {
    if (!(s.path in byPath)) byPath[s.path] = turns;
    if (s.block === "left") turns--;
    if (s.block === "right") turns++;
  }
  // Blocks inside a Repeat that has not run yet still need a heading.
  program.forEach((item, i) => {
    if (typeof item !== "string") item.body.forEach((_, j) => (byPath[`${i}.${j}`] ??= turns));
  });
  return { byPath, end: turns };
}
