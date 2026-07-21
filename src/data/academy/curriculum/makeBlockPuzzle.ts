import type { BlockInstance } from "@/lib/academy/blocks/interpreter";
import { solve } from "@/lib/academy/blocks/solver";
import type { BlockGoal, BlockPuzzle } from "./types";

/**
 * Builds a BlockPuzzle with a solver-computed `par` — every puzzle in the
 * curriculum data files is defined through this helper so `par` is always a
 * proven minimum (BFS-verified at module load), never hand-typed arithmetic.
 * Throws at build time if a puzzle is accidentally unsolvable with its own
 * block set, which is exactly the failure mode we want to catch early.
 */
export function makeBlockPuzzle(
  id: string,
  lessonId: string,
  blockSet: BlockInstance[],
  goal: BlockGoal,
  starter?: BlockInstance[]
): BlockPuzzle {
  const result = solve(blockSet, goal);
  if (!result) {
    throw new Error(`Block puzzle "${id}" is not solvable with its own block set — fix the goal or block set.`);
  }
  return { id, lessonId, blockSet, goal, par: result.par, starter };
}
