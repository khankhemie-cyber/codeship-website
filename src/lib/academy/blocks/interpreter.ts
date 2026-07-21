/**
 * A small, real interpreter for the Explorers "CODEship Blocks" subset documented
 * in the Explorers Curriculum Guide §2 (trigger/motion/looks/sound/control blocks).
 *
 * This is a simplified pedagogical state model — position, spoken text, visibility,
 * size, sound, page, and whether a trigger has fired — sufficient to verify a
 * student's block program against a goal and to let a solver prove a puzzle's
 * minimum block count (`par`). It is not a claim of pixel-parity with a future
 * drag-and-drop visual editor's rendering.
 */

export interface BlockState {
  x: number;
  y: number;
  said: string | null;
  shown: boolean;
  size: "small" | "normal" | "big";
  soundPlayed: boolean;
  page: string;
  started: boolean;
}

export const INITIAL_STATE: BlockState = {
  x: 0,
  y: 0,
  said: null,
  shown: true,
  size: "normal",
  soundPlayed: false,
  page: "home",
  started: false,
};

/** A concrete block instance in a program — parametrized blocks carry their literal arg. */
export interface BlockInstance {
  block: string;
  arg?: string;
}

const TRIGGER_BLOCKS = new Set(["start_green_flag", "start_tap", "start_bump", "start_message"]);

/** Applies one block instance to a state, returning the next state. Pure — no mutation. */
export function step(state: BlockState, instance: BlockInstance): BlockState {
  const { block, arg } = instance;
  if (TRIGGER_BLOCKS.has(block)) return { ...state, started: true };
  switch (block) {
    case "move_right":
      return { ...state, x: state.x + 1 };
    case "move_left":
      return { ...state, x: state.x - 1 };
    case "move_up":
      return { ...state, y: state.y + 1 };
    case "move_down":
      return { ...state, y: state.y - 1 };
    case "hop":
      return { ...state, x: state.x + 1, y: state.y + 1 };
    case "turn":
      return state; // cosmetic in this simplified model — no tracked heading
    case "say":
      return { ...state, said: arg ?? null };
    case "grow":
      return { ...state, size: "big" };
    case "shrink":
      return { ...state, size: "small" };
    case "hide":
      return { ...state, shown: false };
    case "show":
      return { ...state, shown: true };
    case "pop":
    case "record":
      return { ...state, soundPlayed: true };
    case "go_to_page":
      return { ...state, page: arg ?? state.page };
    case "wait":
    case "repeat":
    case "repeat_forever":
    case "set_speed":
    case "stop":
    case "end":
      return state; // no state effect in this model — timing/looping isn't simulated
    default:
      throw new Error(`Unknown block: ${block}`);
  }
}

export function run(program: BlockInstance[], initial: BlockState = INITIAL_STATE): BlockState {
  return program.reduce(step, initial);
}

/** True if `state` satisfies every key specified in `goalState` (partial match). */
export function matchesGoal(state: BlockState, goalState: Partial<Record<keyof BlockState, unknown>>): boolean {
  return Object.entries(goalState).every(([key, value]) => state[key as keyof BlockState] === value);
}

export interface VerifyResult {
  passed: boolean;
  reason?: string;
}

/** Runs a student's program and checks it against a puzzle's goal, including mustUse blocks. */
export function verify(
  program: BlockInstance[],
  goal: { state: Partial<Record<keyof BlockState, unknown>>; mustUse?: string[] }
): VerifyResult {
  const finalState = run(program);
  if (!matchesGoal(finalState, goal.state)) {
    return { passed: false, reason: "The program doesn't reach the goal yet." };
  }
  const used = new Set(program.map((i) => i.block));
  const missing = (goal.mustUse ?? []).filter((b) => !used.has(b));
  if (missing.length > 0) {
    return { passed: false, reason: `Try using: ${missing.join(", ")}.` };
  }
  return { passed: true };
}
