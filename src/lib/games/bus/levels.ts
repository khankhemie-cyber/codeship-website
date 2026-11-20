/**
 * Bus Buddies Road Trip: every chapter and level, as data. Add a level by
 * adding an entry here (see the README in src/components/games/bus-buddies/).
 * Nothing in the game code needs to change.
 *
 * Map key, one character per square (row 0 is the top of the map):
 *   #  road               S  road where Bina starts
 *   G  destination (road) T D O  bus stop for Tuck, Dot, Olive (road)
 *   .  grass   t  tree   h  house   f  flowers   c  cow field   w  water
 * Every line ID (prompt, lines) is a line in voice-script.json.
 */

/**
 * The first 10 levels (in play order) are free for everyone. The rest unlock
 * with the Explorers (K–Grade 1) class password, like the other Ship It!
 * Arcade games (which give 5 free; see components/games/level-lock.tsx).
 */
export const BUS_FREE_LEVELS = 10;
export const BUS_PROGRAM = "explorers" as const;

export type Block = "forward" | "left" | "right" | "honk" | "wait" | "pickup";
export type Dir = 0 | 1 | 2 | 3; // 0 north (up), 1 east, 2 south, 3 west
export type PassengerId = "turtle" | "duck" | "owl";

export interface Passenger {
  id: PassengerId;
  /** Map character marking this passenger's stop. */
  stop: string;
  /** What gets them on board once Bina is on their stop: arriving is enough, or a Honk (sleepy), or Pick Up. */
  needs: "arrive" | "honk" | "pickup";
  /** Line spoken as they climb aboard. */
  boardLine: string;
  /** Line spoken when the level starts (e.g. snoring). */
  waitingLine?: string;
}

export interface Level {
  id: string;
  chapter: number;
  title: string;
  map: string[];
  start: { dir: Dir };
  blocks: Block[];
  maxBlocks: number;
  /** Codey's spoken instruction for the level. */
  prompt: string;
  passengers: Passenger[];
  /** Passengers already riding from earlier levels (shown in the windows). */
  riding: PassengerId[];
  /** Line played on success, before the sticker. */
  successLine: string;
  sticker: { id: string; art: string; label: string };
  /** One correct program. Used by the hint arrow, "add the next block", and the tests. */
  solution: Block[];
}

export interface Chapter {
  n: number;
  title: string;
  /** Short line for grown-ups: what the child is practising. */
  learns: string;
  grownUp: string;
  intro: string[];
  outro: string[];
  ready: boolean;
}

export const TURTLE: Passenger = { id: "turtle", stop: "T", needs: "arrive", boardLine: "ch1.turtle.join" };
export const DUCK: Passenger = { id: "duck", stop: "D", needs: "arrive", boardLine: "ch1.duck.join" };
export const SLEEPY_OWL: Passenger = { id: "owl", stop: "O", needs: "honk", boardLine: "ch1.owl.join", waitingLine: "ch1.owl.sleep" };

export const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: "Morning Pickup",
    learns: "Sequencing",
    grownUp:
      "Your child puts steps in order to make a plan, then watches the plan run one step at a time. This is sequencing, the first idea in coding. Turning left and right from the bus's point of view also builds spatial thinking. When the bus stops, the block that caused the problem glows, so fixing it is a first taste of debugging.",
    intro: ["ch1.intro.1", "ch1.intro.2", "ch1.intro.3", "ch1.intro.4"],
    outro: ["ch1.reward.1", "ch1.reward.2"],
    ready: true,
  },
  {
    n: 2,
    title: "The Big Lake",
    learns: "Sequencing and choices",
    grownUp: "The road ends at a lake. Children choose a tool, a bridge or the ferry, and work out where it fits in their plan. Calling the ferry means waiting for it to arrive, an early look at timing.",
    intro: [],
    outro: [],
    ready: false,
  },
  {
    n: 3,
    title: "Road Work Ahead",
    learns: "Planning a route",
    grownUp: "Children close wrong turns with cones, then plan a route around the construction. They think ahead about a whole path before pressing GO.",
    intro: [],
    outro: [],
    ready: false,
  },
  {
    n: 4,
    title: "Traffic Light Town",
    learns: "Waiting and if-then",
    grownUp: "The Wait block holds Bina until the light turns green: a gentle first look at conditions (if the light is red, then wait).",
    intro: [],
    outro: [],
    ready: false,
  },
  {
    n: 5,
    title: "Mountain Loop",
    learns: "Loops",
    grownUp: "A road that repeats. The Repeat block (x2, x3) makes a long program short. This is a loop, one of the big ideas in coding.",
    intro: [],
    outro: [],
    ready: false,
  },
  {
    n: 6,
    title: "Birthday Party",
    learns: "Putting it all together",
    grownUp: "The final trip uses everything: order, waiting, tools and loops. The passengers sing at the party and the Sticker Book is complete.",
    intro: [],
    outro: [],
    ready: false,
  },
];

export const LEVELS: Level[] = [
  {
    id: "1-1",
    chapter: 1,
    title: "Tuck's stop",
    map: [
      ".t..h",
      "..f..",
      "S#T..",
      ".....",
      "h.t.c",
    ],
    start: { dir: 1 },
    blocks: ["forward"],
    maxBlocks: 4,
    prompt: "ch1.l1.prompt",
    passengers: [TURTLE],
    riding: [],
    successLine: "ch1.turtle.thanks",
    sticker: { id: "tuck", art: "turtle", label: "Tuck" },
    solution: ["forward", "forward"],
  },
  {
    id: "1-2",
    chapter: 1,
    title: "Around the corner",
    map: [
      "t.h.c",
      "..D.c",
      "..#..",
      ".S#f.",
      "h..t.",
    ],
    start: { dir: 1 },
    blocks: ["forward", "left", "right"],
    maxBlocks: 6,
    prompt: "ch1.l2.prompt",
    passengers: [DUCK],
    riding: ["turtle"],
    successLine: "ch1.duck.cheer",
    sticker: { id: "dot", art: "duck", label: "Dot" },
    solution: ["forward", "left", "forward", "forward"],
  },
  {
    id: "1-3",
    chapter: 1,
    title: "Wake up, Olive!",
    map: [
      "h..t.",
      ".S#f.",
      "..#.h",
      "t.O..",
      "c.c..",
    ],
    start: { dir: 1 },
    blocks: ["forward", "left", "right", "honk"],
    maxBlocks: 7,
    prompt: "ch1.l3.prompt",
    passengers: [SLEEPY_OWL],
    riding: ["turtle", "duck"],
    successLine: "common.happy",
    sticker: { id: "olive", art: "owl", label: "Olive" },
    solution: ["forward", "right", "forward", "forward", "honk"],
  },
  {
    id: "1-4",
    chapter: 1,
    title: "To the park gate",
    map: [
      "tc..h",
      ".#G.c",
      ".#f..",
      "S#..t",
      "..h..",
    ],
    start: { dir: 1 },
    blocks: ["forward", "left", "right", "honk"],
    maxBlocks: 8,
    prompt: "ch1.l4.prompt",
    passengers: [],
    riding: ["turtle", "duck", "owl"],
    successLine: "common.happy",
    sticker: { id: "park", art: "park", label: "Park" },
    solution: ["forward", "left", "forward", "forward", "right", "forward"],
  },
];

export const levelsIn = (chapter: number) => LEVELS.filter((l) => l.chapter === chapter);
export const levelById = (id: string) => LEVELS.find((l) => l.id === id);
