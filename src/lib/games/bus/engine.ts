/**
 * Bus Buddies: runs a child's program on a level and returns every step, so
 * the game can animate it and the tests can check it. Pure: no DOM, no React.
 */
import type { Block, Dir, Level, PassengerId } from "./levels";

export interface Pos {
  x: number;
  y: number;
}

export interface Frame {
  /** Which block in the program this step comes from. */
  index: number;
  block: Block;
  x: number;
  y: number;
  dir: Dir;
  /** Bus angle in degrees, kept continuous so turns never spin the long way round. */
  angle: number;
  boarded?: PassengerId;
  woke?: PassengerId;
  /** Bina tried to drive into this square and stopped. */
  bump?: Pos;
}

export type Outcome =
  | { ok: true }
  | {
      ok: false;
      /** Program index of the block to glow, or null when the program just ended too soon. */
      blame: number | null;
      /** voice-script line Bina says. */
      line: string;
    };

export interface RunResult {
  start: { x: number; y: number; dir: Dir; angle: number };
  frames: Frame[];
  outcome: Outcome;
}

export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

const ROAD = new Set(["#", "S", "G"]);

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

function isRoad(level: Level, ch: string | undefined) {
  if (ch === undefined) return false;
  return ROAD.has(ch) || level.passengers.some((p) => p.stop === ch);
}

/** The funny line for driving into a square that isn't road. */
export function bumpLine(ch: string | undefined): string {
  if (ch === undefined) return "common.oops_edge";
  if (ch === "c") return "common.oops_cows";
  if (ch === "f") return "common.oops_flowers";
  return "common.oops_grass";
}

export function startState(level: Level) {
  const s = findChar(level, "S");
  if (!s) throw new Error(`Level ${level.id} has no start (S)`);
  return { x: s.x, y: s.y, dir: level.start.dir, angle: level.start.dir * 90 };
}

export function run(level: Level, program: Block[]): RunResult {
  const start = startState(level);
  let { x, y, dir, angle } = start;
  const frames: Frame[] = [];
  const aboard = new Set<PassengerId>();
  const woken = new Set<PassengerId>();
  /** Where each passenger's stop is, and the last block index at which Bina left it without them. */
  const stops = level.passengers.map((p) => ({ p, at: findChar(level, p.stop)! }));
  let leftBehind: { id: PassengerId; index: number } | null = null;

  const here = () => stops.find((s) => s.at.x === x && s.at.y === y && !aboard.has(s.p.id));

  for (let index = 0; index < program.length; index++) {
    const block = program[index];
    const frame: Frame = { index, block, x, y, dir, angle };
    if (block === "forward") {
      const nx = x + DX[dir];
      const ny = y + DY[dir];
      const ch = cellAt(level, nx, ny);
      if (!isRoad(level, ch)) {
        frames.push({ ...frame, bump: { x: nx, y: ny } });
        return { start, frames, outcome: { ok: false, blame: index, line: bumpLine(ch) } };
      }
      const waiting = here();
      if (waiting) leftBehind = { id: waiting.p.id, index };
      x = nx;
      y = ny;
      frame.x = x;
      frame.y = y;
      const stop = here();
      if (stop && stop.p.needs === "arrive") {
        aboard.add(stop.p.id);
        frame.boarded = stop.p.id;
      }
    } else if (block === "left" || block === "right") {
      const turn = block === "left" ? -1 : 1;
      dir = (((dir + turn) % 4) + 4) % 4 as Dir;
      angle += turn * 90;
      frame.dir = dir;
      frame.angle = angle;
    } else if (block === "honk") {
      const stop = here();
      if (stop && stop.p.needs === "honk") {
        woken.add(stop.p.id);
        aboard.add(stop.p.id);
        frame.woke = stop.p.id;
        frame.boarded = stop.p.id;
      }
    } else if (block === "pickup") {
      const stop = here();
      if (stop && stop.p.needs === "pickup") {
        aboard.add(stop.p.id);
        frame.boarded = stop.p.id;
      }
    }
    frames.push(frame);
  }

  const missing = level.passengers.filter((p) => !aboard.has(p.id));
  if (missing.length) {
    // Drove past someone who needed a honk or a pick-up: glow the block where Bina left them.
    if (leftBehind && missing.some((p) => p.id === leftBehind!.id)) {
      return { start, frames, outcome: { ok: false, blame: leftBehind.index, line: "common.oops_missed" } };
    }
    // Parked at a friend's stop but they still need a honk or a pick-up.
    const parked = stops.find((s) => s.at.x === x && s.at.y === y && !aboard.has(s.p.id));
    if (parked) {
      return { start, frames, outcome: { ok: false, blame: null, line: parked.p.waitingLine ?? "common.too_short" } };
    }
    return { start, frames, outcome: { ok: false, blame: null, line: "common.too_short" } };
  }
  const goal = findChar(level, "G");
  if (goal && (goal.x !== x || goal.y !== y)) {
    return { start, frames, outcome: { ok: false, blame: null, line: "common.too_short" } };
  }
  return { start, frames, outcome: { ok: true } };
}

/**
 * Where the child's program first leaves the level's solution: the next
 * correct block goes at this index. Used for the hint arrow and "add the next block".
 */
export function nextCorrect(level: Level, program: Block[]): { index: number; block: Block } | null {
  let i = 0;
  while (i < program.length && i < level.solution.length && program[i] === level.solution[i]) i++;
  if (i >= level.solution.length) return null;
  return { index: i, block: level.solution[i] };
}

/** Bus position after the first `count` blocks of the solution (where the hint arrow is drawn). */
export function stateAfter(level: Level, program: Block[]) {
  const r = run(level, program);
  const last = r.frames[r.frames.length - 1];
  return last ? { x: last.x, y: last.y, dir: last.dir, angle: last.angle } : r.start;
}
