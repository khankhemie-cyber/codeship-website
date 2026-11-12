/**
 * Rover Roads (CODEship Adventure, chapter 1): lay road pieces so the rover
 * drives itself from its launch pad to the base, over every fuel crystal.
 * The rover follows the road it's given and stops where the road stops:
 * planning the whole route before pressing Go is the lesson.
 *
 * Maps are 7 x 5 text grids:
 *   .  empty ground      S  rover's launch pad     B  base
 *   #  rock              c  fuel crystal
 *   -  |  L  J  F  7     road already laid (see PIECES)
 *
 * Every level has a reference solution in scripts/playground/test-playground.mjs.
 * Erasable TypeScript only: the tests import this file into Node.
 */

export const COLS = 7;
export const ROWS = 5;

export type Dir = "up" | "down" | "left" | "right";
export type Piece = "-" | "|" | "L" | "J" | "F" | "7";
export type Pos = { x: number; y: number };

/** The two sides each piece opens onto. L J F 7 are the corners, named for their shape. */
export const PIECES: Record<Piece, [Dir, Dir]> = {
  "-": ["left", "right"],
  "|": ["up", "down"],
  L: ["up", "right"],
  J: ["up", "left"],
  F: ["down", "right"],
  "7": ["down", "left"],
};
export const PIECE_LIST = Object.keys(PIECES) as Piece[];

export const DELTA: Record<Dir, Pos> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
export const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

export type RoadLevel = {
  map: string[];
  /** Which way the rover faces on its launch pad. */
  start: Dir;
  /** Most road pieces the child may add. */
  budget?: number;
  /** "fix" levels open with a scrambled road the child repairs. */
  kind: "build" | "fix";
};

/** Placed road: "x,y" -> piece. */
export type Road = Record<string, Piece>;
export const key = (x: number, y: number) => `${x},${y}`;

export type Outcome = "win" | "crash" | "noRoad" | "missed" | "loop";
export type Drive = { path: Pos[]; dirs: Dir[]; collected: string[]; outcome: Outcome };

export function cellAt(level: RoadLevel, x: number, y: number) {
  return level.map[y]?.[x];
}

export function find(level: RoadLevel, ch: string): Pos[] {
  const out: Pos[] = [];
  level.map.forEach((row, y) => [...row].forEach((c, x) => c === ch && out.push({ x, y })));
  return out;
}

/** The road a level opens with. */
export function givenRoad(level: RoadLevel): Road {
  const road: Road = {};
  level.map.forEach((row, y) => [...row].forEach((c, x) => c in PIECES && (road[key(x, y)] = c as Piece)));
  return road;
}

/** Can a piece go on this square? Ground and crystals yes; rocks, the pad and the base no. */
export function buildable(level: RoadLevel, x: number, y: number) {
  const c = cellAt(level, x, y);
  return c === "." || c === "c" || (c !== undefined && c in PIECES);
}

/** Pieces the child has added or changed (what counts against the budget). */
export function piecesUsed(level: RoadLevel, road: Road) {
  const given = givenRoad(level);
  return Object.entries(road).filter(([k, p]) => given[k] !== p).length;
}

export function drive(level: RoadLevel, road: Road): Drive {
  let pos = find(level, "S")[0];
  let dir = level.start;
  const crystals = find(level, "c").map((p) => key(p.x, p.y));
  const path: Pos[] = [pos];
  const dirs: Dir[] = [dir];
  const collected: string[] = [];
  for (let step = 0; step < COLS * ROWS * 2; step++) {
    const n = { x: pos.x + DELTA[dir].x, y: pos.y + DELTA[dir].y };
    const c = cellAt(level, n.x, n.y);
    if (c === undefined || c === "#") return { path, dirs, collected, outcome: "crash" };
    if (c === "B") {
      path.push(n);
      dirs.push(dir);
      return { path, dirs, collected, outcome: collected.length === crystals.length ? "win" : "missed" };
    }
    const piece = road[key(n.x, n.y)];
    if (!piece) return { path, dirs, collected, outcome: "noRoad" };
    const [a, b] = PIECES[piece];
    const from = OPPOSITE[dir];
    if (a !== from && b !== from) return { path, dirs, collected, outcome: "noRoad" };
    dir = a === from ? b : a;
    pos = n;
    path.push(pos);
    dirs.push(dir);
    const k = key(pos.x, pos.y);
    if (crystals.includes(k) && !collected.includes(k)) collected.push(k);
  }
  return { path, dirs, collected, outcome: "loop" };
}

export const LEVELS: RoadLevel[] = [
  // 1-2: straight roads
  { kind: "build", start: "right", map: [".......", ".......", ".S..B..", ".......", "......."] },
  { kind: "build", start: "up", map: [".......", "...B...", ".......", ".......", "...S..."] },
  // 3-4: corners
  { kind: "build", start: "right", map: [".......", "....B..", ".......", ".S.....", "......."] },
  { kind: "build", start: "right", map: [".......", "S......", ".......", "......B", "......."] },
  // 5: crystals
  { kind: "build", start: "right", map: ["...c...", ".......", "S.....B", ".......", "......."] },
  // 6: rocks
  { kind: "build", start: "up", map: [".....B.", ".......", ".####..", ".......", ".S....."] },
  // 7: a piece budget that only the shortest crystal route fits
  { kind: "build", start: "right", budget: 9, map: ["S......", "....#..", "...c...", "......#", "......B"] },
  // 8-9: the storm scrambled the road
  { kind: "fix", start: "right", map: [".......", "S--L...", "...|...", "...L--B", "......."] },
  { kind: "fix", start: "up", map: [".....B.", ".....|.", ".####|.", ".----7.", ".S....."] },
  // 10: the long way home
  { kind: "build", start: "down", budget: 14, map: ["S..#..B", "...#...", ".c.#.c.", "...#...", "......."] },
];
