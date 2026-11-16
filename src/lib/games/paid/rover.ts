/**
 * SERVER ONLY: Rover Rescue missions 6–10 (paid program).
 * Imported only by src/app/api/arcade/levels/route.ts. Do not import this from
 * any client component, or these levels become readable in the public bundle.
 */
import { COLLECT, FOR, FUNC, IF, LEFT, LET, MOVE, RIGHT, WHILE, type RoverLevel } from "../rover";

export const ROVER_PAID_LEVELS: RoverLevel[] = [
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
