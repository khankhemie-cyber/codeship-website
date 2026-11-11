/**
 * Star Stitch (CODEship Adventure, chapter 2): join the stars with one
 * stretchy line, without lifting, to rebuild a constellation.
 *
 * - "trace" levels show the picture faintly. The line only stretches along
 *   the picture and never over a line already drawn, so the puzzle is the
 *   order: start in the wrong place and you get stuck (one-stroke drawing).
 * - "code" levels hide the picture and give a code card: a row of star
 *   badges to visit in order. Following the code reveals the picture.
 *
 * Board coordinates run 0..5 across and 0..4 down.
 * Every level is checked for a solution in scripts/playground/test-playground.mjs.
 * Erasable TypeScript only.
 */

export type StitchLevel = {
  name: { en: string; fr: string };
  mode: "trace" | "code";
  pegs: [number, number][];
  edges: [number, number][];
  /** Code levels: the order to visit the stars (peg indexes). */
  code?: number[];
};

export type State = { current: number | null; drawn: string[]; codeIndex: number };
export type StepResult = { ok: true; state: State; done: boolean } | { ok: false; reason: "notALine" | "alreadyDrawn" | "wrongStar" };

export const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
export const emptyState = (): State => ({ current: null, drawn: [], codeIndex: 0 });

export function step(level: StitchLevel, s: State, peg: number): StepResult {
  if (level.mode === "code") {
    if (level.code![s.codeIndex] !== peg) return { ok: false, reason: "wrongStar" };
  }
  if (s.current === null) return { ok: true, state: { current: peg, drawn: [], codeIndex: s.codeIndex + 1 }, done: false };
  if (peg === s.current) return { ok: false, reason: "notALine" };
  const k = edgeKey(s.current, peg);
  if (!level.edges.some(([a, b]) => edgeKey(a, b) === k)) return { ok: false, reason: "notALine" };
  if (s.drawn.includes(k)) return { ok: false, reason: "alreadyDrawn" };
  const drawn = [...s.drawn, k];
  return { ok: true, state: { current: peg, drawn, codeIndex: s.codeIndex + 1 }, done: drawn.length === level.edges.length };
}

/** True when no undrawn line leaves the current star (and the picture isn't finished). */
export function stuck(level: StitchLevel, s: State) {
  if (s.current === null || s.drawn.length === level.edges.length) return false;
  return !level.edges.some(([a, b]) => (a === s.current || b === s.current) && !s.drawn.includes(edgeKey(a, b)));
}

export const degree = (level: StitchLevel, peg: number) => level.edges.filter(([a, b]) => a === peg || b === peg).length;

const lvl = (en: string, fr: string, mode: StitchLevel["mode"], pegs: [number, number][], edges: [number, number][], code?: number[]): StitchLevel => ({ name: { en, fr }, mode, pegs, edges, code });

export const LEVELS: StitchLevel[] = [
  lvl("Mountain", "Montagne", "trace", [[1, 4], [2.5, 1], [4, 4]], [[0, 1], [1, 2], [2, 0]]),
  lvl("Window", "Fenêtre", "trace", [[1, 1], [4, 1], [4, 4], [1, 4]], [[0, 1], [1, 2], [2, 3], [3, 0]]),
  lvl("Fish", "Poisson", "trace", [[4.5, 2], [3, 1], [3, 3], [1.6, 2], [0.5, 1], [0.5, 3]], [[0, 1], [1, 3], [3, 2], [2, 0], [3, 4], [4, 5], [5, 3]]),
  // Start matters: only the two bottom corners work.
  lvl("Envelope house", "Maison-enveloppe", "trace", [[1, 4], [4, 4], [4, 2], [1, 2], [2.5, 0.4]], [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 2], [0, 2], [1, 3]]),
  lvl("Kite", "Cerf-volant", "trace", [[2.5, 0.2], [1, 1.6], [4, 1.6], [2.5, 4]], [[0, 1], [1, 3], [3, 2], [2, 0], [0, 3]]),
  lvl("Sailboat", "Voilier", "code", [[0.5, 2.8], [4.5, 2.8], [3.7, 4], [1.3, 4], [2.5, 0.3], [2.5, 2.8], [4, 2.3]], [[3, 0], [0, 5], [5, 4], [4, 6], [6, 5], [5, 1], [1, 2], [2, 3]], [3, 0, 5, 4, 6, 5, 1, 2, 3]),
  lvl("Shining star", "Étoile brillante", "code", [[2.5, 0], [4.6, 1.5], [3.8, 4], [1.2, 4], [0.4, 1.5]], [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]], [0, 2, 4, 1, 3, 0]),
  lvl("Rocket", "Fusée", "trace", [[2.5, 0], [3.3, 1.2], [3.3, 3], [1.7, 3], [1.7, 1.2], [4.3, 4], [0.7, 4], [2.5, 4]], [[0, 1], [1, 5], [5, 2], [2, 3], [3, 6], [6, 4], [4, 0], [2, 7], [7, 3]]),
  lvl("Bow tie", "Nœud papillon", "trace", [[0.5, 0.5], [4.5, 0.5], [2.5, 2], [0.5, 3.5], [4.5, 3.5]], [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2], [0, 3]]),
  lvl("The CODEship", "Le CODEship", "code", [[5, 2], [3.5, 1], [1, 1], [0, 0.2], [0.5, 2], [0, 3.8], [1, 3], [3.5, 3]], [[2, 3], [3, 4], [4, 5], [5, 6], [6, 2], [2, 1], [1, 0], [0, 7], [7, 6]], [2, 3, 4, 5, 6, 2, 1, 0, 7, 6]),
];

/** Star badges, so pre-readers can follow a code card: one colour and shape per star. */
export const BADGES = [
  { colour: "#EF5350", shape: "circle" },
  { colour: "#42A5F5", shape: "square" },
  { colour: "#FFCA28", shape: "star" },
  { colour: "#66BB6A", shape: "triangle" },
  { colour: "#AB47BC", shape: "heart" },
  { colour: "#FF7043", shape: "diamond" },
  { colour: "#EC407A", shape: "moon" },
  { colour: "#26C6DA", shape: "hexagon" },
] as const;
