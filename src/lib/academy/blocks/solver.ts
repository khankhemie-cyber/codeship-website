import { type BlockInstance, type BlockState, INITIAL_STATE, matchesGoal, step } from "./interpreter";

export interface SolvableGoal {
  state: Partial<Record<keyof BlockState, unknown>>;
  mustUse?: string[];
}

/** Bounds the search space so a mistaken puzzle definition can't hang the solver/build. */
const MAX_DEPTH = 8;
const POSITION_BOUND = 6;

function stateKey(state: BlockState, used: Set<string>): string {
  return JSON.stringify(state) + "|" + Array.from(used).sort().join(",");
}

function inBounds(state: BlockState): boolean {
  return Math.abs(state.x) <= POSITION_BOUND && Math.abs(state.y) <= POSITION_BOUND;
}

/**
 * Breadth-first search over sequences of the puzzle's available block instances.
 * BFS explores in increasing program length, so the first goal state found is
 * provably minimal — this is what makes a puzzle's `par` a proven fact rather
 * than an estimate.
 */
export function solve(
  blockSet: BlockInstance[],
  goal: SolvableGoal,
  initial: BlockState = INITIAL_STATE
): { par: number; solution: BlockInstance[] } | null {
  const mustUse = goal.mustUse ?? [];
  type Node = { state: BlockState; used: Set<string>; path: BlockInstance[] };
  const start: Node = { state: initial, used: new Set(), path: [] };
  const seen = new Set<string>([stateKey(start.state, start.used)]);
  let frontier: Node[] = [start];

  for (let depth = 0; depth <= MAX_DEPTH; depth++) {
    for (const node of frontier) {
      const usesAllRequired = mustUse.every((b) => node.used.has(b));
      if (usesAllRequired && matchesGoal(node.state, goal.state)) {
        return { par: node.path.length, solution: node.path };
      }
    }
    if (depth === MAX_DEPTH) break;

    const next: Node[] = [];
    for (const node of frontier) {
      for (const instance of blockSet) {
        const nextState = step(node.state, instance);
        if (!inBounds(nextState)) continue;
        const nextUsed = new Set(node.used);
        nextUsed.add(instance.block);
        const key = stateKey(nextState, nextUsed);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push({ state: nextState, used: nextUsed, path: [...node.path, instance] });
      }
    }
    frontier = next;
  }
  return null;
}
