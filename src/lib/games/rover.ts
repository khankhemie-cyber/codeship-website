/**
 * Rover Rescue — Semester 1 (JavaScript Foundations).
 *
 * `simulateRover` is deliberately self-contained (no imports, no closures over
 * module scope) so it can be stringified into a Web Worker. Student code runs
 * there, away from the page, with a step cap and a hard timeout, so an
 * accidental infinite loop can never freeze the tab.
 */

export type Dir = 0 | 1 | 2 | 3; // up, right, down, left

export interface RoverFrame {
  r: number;
  c: number;
  d: number;
  collected: string[];
  kind: "start" | "move" | "turn" | "collect" | "bonk" | "empty" | "say";
  msg?: string;
}

export interface RoverResult {
  frames: RoverFrame[];
  error: string | null;
  reachedGoal: boolean;
  gemsTotal: number;
  gemsCollected: number;
}

export function simulateRover(code: string, map: string[], startDir: number): RoverResult {
  const grid = map.map((row) => row.split(""));
  let r = 0;
  let c = 0;
  let goalR = -1;
  let goalC = -1;
  const gems: string[] = [];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const ch = grid[i][j];
      if (ch === "R") {
        r = i;
        c = j;
      } else if (ch === "G") {
        goalR = i;
        goalC = j;
      } else if (ch === "*") {
        gems.push(i + "," + j);
      }
    }
  }
  let d = startDir;
  const collected: string[] = [];
  const frames: RoverFrame[] = [{ r, c, d, collected: [], kind: "start" }];
  const DR = [-1, 0, 1, 0];
  const DC = [0, 1, 0, -1];
  const MAX_ACTIONS = 400;
  const MAX_CHECKS = 4000;
  let actions = 0;
  let checks = 0;

  const push = (kind: RoverFrame["kind"], msg?: string) => {
    frames.push({ r, c, d, collected: collected.slice(), kind, msg });
    actions++;
    if (actions > MAX_ACTIONS) throw { __stop: "loop" };
  };
  const check = () => {
    checks++;
    if (checks > MAX_CHECKS) throw { __stop: "loop" };
  };
  const open = (rr: number, cc: number) =>
    rr >= 0 && rr < grid.length && cc >= 0 && cc < grid[rr].length && grid[rr][cc] !== "#";

  const api = {
    move() {
      const nr = r + DR[d];
      const nc = c + DC[d];
      if (!open(nr, nc)) {
        push("bonk", "Bonk! There's a wall in the way.");
        throw { __stop: "bonk" };
      }
      r = nr;
      c = nc;
      push("move");
    },
    turnLeft() {
      d = (d + 3) % 4;
      push("turn");
    },
    turnRight() {
      d = (d + 1) % 4;
      push("turn");
    },
    collect() {
      const k = r + "," + c;
      if (gems.indexOf(k) >= 0 && collected.indexOf(k) < 0) {
        collected.push(k);
        push("collect");
      } else {
        push("empty", "Nothing to collect here!");
        throw { __stop: "empty" };
      }
    },
    pathAhead() {
      check();
      return open(r + DR[d], c + DC[d]);
    },
    gemHere() {
      check();
      const k = r + "," + c;
      return gems.indexOf(k) >= 0 && collected.indexOf(k) < 0;
    },
    atGoal() {
      check();
      return r === goalR && c === goalC;
    },
    say(message: unknown) {
      push("say", String(message).slice(0, 80));
    },
  };

  let error: string | null = null;
  try {
    const names = Object.keys(api);
    // Shadow a few globals so the student sandbox stays focused on the rover.
    const fn = new Function(
      ...names,
      "self",
      "postMessage",
      "fetch",
      "importScripts",
      "globalThis",
      '"use strict";\n' + code
    );
    fn(...names.map((n) => (api as Record<string, unknown>)[n]));
  } catch (e) {
    const err = e as { __stop?: string; message?: string; name?: string };
    if (err && err.__stop === "bonk") error = "Bonk! Your rover hit a wall. Check your turns and how many times you move.";
    else if (err && err.__stop === "empty")
      error = "Oops — there's no gem on that square, so the scoop jammed. Only collect() where a gem is!";
    else if (err && err.__stop === "loop")
      error = "Whoa, too many steps! Your rover might be stuck in a loop that never ends. Check your loop's stop condition.";
    else {
      const msg = String((err && err.message) || e);
      let m = msg.match(/^(\w+) is not defined/);
      if (m) error = `I don't know the command "${m[1]}". Check the spelling — code is case-sensitive (move, not Move).`;
      else if ((m = msg.match(/(\S+) is not a function/)))
        error = `"${m[1]}" isn't a command I know. Did you misspell it or forget the ()?`;
      else if (/Unexpected end of input/.test(msg))
        error = "Something is missing at the end — every { needs a matching } and every ( needs a ).";
      else if (err && err.name === "SyntaxError")
        error = `Syntax hiccup: ${msg}. Look closely at brackets, quotes and semicolons.`;
      else error = msg;
    }
  }

  return {
    frames,
    error,
    reachedGoal: r === goalR && c === goalC,
    gemsTotal: gems.length,
    gemsCollected: collected.length,
  };
}

/** Lines that "count" toward par: ignores blanks, comments, and lone brackets. */
export function countLines(code: string) {
  return code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !/^[{}();\s]*$/.test(l)).length;
}

export function scoreRover(result: RoverResult, lines: number, par: number) {
  if (result.error || !result.reachedGoal) return 0;
  let stars = 1;
  if (result.gemsCollected === result.gemsTotal) stars++;
  if (stars === 2 && lines <= par) stars++;
  return stars;
}

export interface RoverLevel {
  id: string;
  title: string;
  concept: string;
  lesson: string;
  example: string;
  mission: string;
  map: string[];
  dir: Dir;
  starter: string;
  par: number;
  hint: string;
  tools: { label: string; insert: string }[];
}

const MOVE = { label: "move();", insert: "move();\n" };
const LEFT = { label: "turnLeft();", insert: "turnLeft();\n" };
const RIGHT = { label: "turnRight();", insert: "turnRight();\n" };
const COLLECT = { label: "collect();", insert: "collect();\n" };
const FOR = { label: "for loop", insert: "for (let i = 0; i < 3; i++) {\n  move();\n}\n" };
const IF = { label: "if", insert: "if (gemHere()) {\n  collect();\n}\n" };
const WHILE = { label: "while", insert: "while (!atGoal()) {\n  move();\n}\n" };
const FUNC = { label: "function", insert: "function hop() {\n  move();\n}\n" };
const LET = { label: "let", insert: "let steps = 3;\n" };
const SAY = { label: "say()", insert: 'say("Hello!");\n' };

export const ROVER_LEVELS: RoverLevel[] = [
  {
    id: "first-steps",
    title: "First Steps",
    concept: "Sequencing",
    lesson:
      "A program is a list of instructions the computer follows in order, top to bottom. Each line is one step.",
    example: "move();\nmove();",
    mission: "Drive the rover to the glowing beacon.",
    map: ["#######", "#R...G#", "#######"],
    dir: 1,
    starter: "move();\n",
    par: 4,
    hint: "The beacon is 4 squares away. How many move(); lines do you need?",
    tools: [MOVE, SAY],
  },
  {
    id: "corner",
    title: "Corner Turn",
    concept: "Direction",
    lesson:
      "turnLeft() and turnRight() spin the rover in place — they don't move it. Turn first, then move.",
    example: "move();\nturnRight();\nmove();",
    mission: "Turn the corner and reach the beacon.",
    map: ["######", "#R..##", "###.##", "###.##", "###G##", "######"],
    dir: 1,
    starter: "move();\nmove();\n",
    par: 6,
    hint: "Move 2, turn right (to face down), then move 3.",
    tools: [MOVE, LEFT, RIGHT],
  },
  {
    id: "gem-grab",
    title: "Gem Grab",
    concept: "Commands",
    lesson: "collect() picks up a gem on the square you're standing on. Collect every gem for an extra star!",
    example: "move();\ncollect();",
    mission: "Grab the gem on the way to the beacon.",
    map: ["#######", "#R.*..#", "#####.#", "#####G#", "#######"],
    dir: 1,
    starter: "",
    par: 8,
    hint: "Move 2, collect, move 2, turn right, move 2.",
    tools: [MOVE, LEFT, RIGHT, COLLECT],
  },
  {
    id: "loop-the-loop",
    title: "Loop the Loop",
    concept: "For loops",
    lesson:
      "A for loop repeats the code inside { } a set number of times. Instead of writing the same lines 7 times, write them once!",
    example: "for (let i = 0; i < 5; i++) {\n  move();\n}",
    mission: "Collect all 7 gems — in 4 lines of code or fewer.",
    map: ["###########", "#R*******G#", "###########"],
    dir: 1,
    starter: "for (let i = 0; i < 1; i++) {\n  \n}\n",
    par: 4,
    hint: "Inside the loop: move(); then collect();. Repeat it 7 times, then one last move();",
    tools: [MOVE, COLLECT, FOR],
  },
  {
    id: "staircase",
    title: "Staircase",
    concept: "Loop patterns",
    lesson: "Spot the pattern! If the same group of steps repeats, put the whole group inside a loop.",
    example: "for (let i = 0; i < 4; i++) {\n  move();\n  turnRight();\n}",
    mission: "Climb down the stairs, grabbing a gem on each step.",
    map: ["#######", "#R*####", "##.*###", "###.*##", "####.*#", "#####G#", "#######"],
    dir: 1,
    starter: "",
    par: 6,
    hint: "One step = move, collect, turnRight, move, turnLeft. Repeat it 4 times.",
    tools: [MOVE, LEFT, RIGHT, COLLECT, FOR],
  },
  {
    id: "functions",
    title: "Jump Function",
    concept: "Functions",
    lesson:
      "A function is a new command you invent. Give a group of steps a name, then use that name as many times as you like.",
    example: "function spin() {\n  turnLeft();\n  turnLeft();\n}\n\nspin();",
    mission: "Hop over 3 walls and grab the gems on top. Make a jump() function!",
    map: ["###########", "#..*.*.*..#", "#R.#.#.#.G#", "###########"],
    dir: 1,
    starter: "function jump() {\n  turnLeft();\n  move();\n  \n}\n\nmove();\njump();\n",
    par: 15,
    hint: "jump(): turnLeft, move, turnRight, move, collect, move, turnRight, move, turnLeft.",
    tools: [MOVE, LEFT, RIGHT, COLLECT, FUNC, FOR],
  },
  {
    id: "if-gem",
    title: "Gem Detector",
    concept: "Conditionals (if)",
    lesson:
      "An if statement asks a yes/no question. The code inside only runs when the answer is yes. Use gemHere() to check for a gem.",
    example: "if (gemHere()) {\n  collect();\n}",
    mission: "Gems are scattered along the track. Only collect where a gem is — 4 lines or fewer.",
    map: ["############", "#R.*..**.*G#", "############"],
    dir: 1,
    starter: "for (let i = 0; i < 9; i++) {\n  move();\n  \n}\n",
    par: 4,
    hint: "Inside the loop, after move(); add: if (gemHere()) { collect(); }",
    tools: [MOVE, COLLECT, FOR, IF],
  },
  {
    id: "while-spiral",
    title: "Spiral Maze",
    concept: "While loops",
    lesson:
      "A while loop keeps going as long as its question is true. You don't need to know how many steps — the rover figures it out!",
    example: "while (!atGoal()) {\n  move();\n}",
    mission: "Escape the spiral using a while loop and pathAhead().",
    map: ["#########", "#R......#", "#######.#", "#...G##.#", "#.#####.#", "#.......#", "#########"],
    dir: 1,
    starter: "while (!atGoal()) {\n  \n}\n",
    par: 5,
    hint: "If pathAhead() is true, move(). Otherwise (else), turnRight().",
    tools: [MOVE, RIGHT, WHILE, { label: "if / else", insert: "if (pathAhead()) {\n  move();\n} else {\n  turnRight();\n}\n" }],
  },
  {
    id: "variables",
    title: "Shrinking Spiral",
    concept: "Variables",
    lesson:
      "A variable is a labelled box that stores a value. You can change what's inside: steps = steps - 1 makes it one smaller.",
    example: "let steps = 6;\nsteps = steps - 1; // now 5",
    mission: "Follow the dotted trail: 6 steps, then 5, then 4... Use a variable!",
    map: ["#########", "#Roooooo#", "#......o#", "#..ooo.o#", "#..o.G.o#", "#..o...o#", "#..ooooo#", "#########"],
    dir: 1,
    starter: "let steps = 6;\n\nwhile (steps > 0) {\n  \n  steps = steps - 1;\n}\n",
    par: 6,
    hint: "Inside the while: a for loop that moves `steps` times, then turnRight().",
    tools: [MOVE, RIGHT, LET, FOR, WHILE],
  },
  {
    id: "bug-hunt",
    title: "Bug Hunt",
    concept: "Debugging",
    lesson:
      "Real developers spend lots of time debugging — finding and fixing mistakes. Run the code, read the error, fix one bug at a time.",
    example: "// Tip: run it, see where it breaks,\n// then fix that line.",
    mission: "This code has 3 bugs. Squash them all!",
    map: ["#########", "#R.*.*.*#", "#######.#", "#######.#", "#######G#", "#########"],
    dir: 1,
    starter:
      "// 🐞 This code has 3 bugs. Find and fix them!\nfor (let i = 0; i < 2; i++) {\n  move();\n  Move();\n  collect();\n}\nturnLeft();\nmove();\nmove();\nmove();\n",
    par: 8,
    hint: "Check the capital letters, how many times the loop runs, and which way the rover should turn.",
    tools: [MOVE, LEFT, RIGHT, COLLECT, FOR],
  },
];
