/**
 * Bus Buddies Road Trip: every chapter and the free levels, as data. Add a
 * level by adding an entry (see the README in src/components/games/bus-buddies/).
 * Nothing in the game code needs to change.
 *
 * Levels 1–10 live here. Levels 11–20 are class levels: they live in
 * src/lib/games/paid/bus.ts and are sent only to a browser holding the
 * Explorers class password (src/app/api/arcade/levels/route.ts).
 *
 * Map key, one character per square (row 0 is the top of the map):
 *   #  road                 S  road where Bina starts      G  destination (road)
 *   k  ferry dock (road)    w  water (a Bridge or the Ferry gets Bina across)
 *   x  road work (closed)   any letter in `passengers`: that friend's stop (road)
 *   any letter in `lights`: a traffic light or duckling crossing (road)
 *   .  grass   t  tree   h  house   f  flowers   c  cow field   m  mountain rocks
 * Every line ID (prompt, lines) is a line in voice-script.json.
 */

/**
 * The first 10 levels (in play order) are free for everyone. The rest unlock
 * with the Explorers (K–Grade 1) class password, like the other Ship It!
 * Arcade games (which give 5 free; see components/games/level-lock.tsx).
 */
export const BUS_FREE_LEVELS = 10;
export const BUS_PROGRAM = "explorers" as const;

export type Block = "forward" | "left" | "right" | "honk" | "wait" | "pickup" | "bridge" | "ferry";
/** A Repeat block: runs its body 2 or 3 times. */
export interface Repeat {
  repeat: 2 | 3;
  body: Block[];
}
export type Item = Block | Repeat;
export type Program = Item[];
/** What can be on a level's block shelf. */
export type PaletteBlock = Block | "repeat";

export type Dir = 0 | 1 | 2 | 3; // 0 north (up), 1 east, 2 south, 3 west
export type AnimalId = "turtle" | "duck" | "owl";
export type ThingId = "basket" | "cake" | "balloons" | "gift" | "flowers" | "hat";
export type PassengerId = AnimalId | ThingId;

export interface Passenger {
  id: PassengerId;
  /** Map character marking this passenger's stop. */
  stop: string;
  /** What gets them on board once Bina is on their stop: arriving is enough, or a Honk (sleepy), or Pick Up. */
  needs: "arrive" | "honk" | "pickup";
  /** Line spoken as they climb aboard. */
  boardLine: string;
  /** Line spoken when the level starts, and when Bina parks there without the right block (e.g. snoring). */
  waitingLine?: string;
}

export interface Light {
  /** Map character for this light. */
  ch: string;
  /** Red until this many blocks have run (each block takes one tick, Wait included). */
  red: number;
  kind: "light" | "ducks";
}

export type GoalArt = "gate" | "picnic" | "flag" | "fountain" | "peak" | "party";

export interface Level {
  id: string;
  chapter: number;
  title: string;
  map: string[];
  start: { dir: Dir };
  /**
   * "program" (default): build a program from blocks.
   * "cones": tap the map to close wrong roads with cones; Bina then drives
   * herself, taking the only open road at every corner.
   */
  mode?: "program" | "cones";
  blocks: PaletteBlock[];
  /** Program mode: slots in the strip (a Repeat counts as one, plus its blocks). */
  maxBlocks: number;
  /** Cones mode: how many cones can be placed. */
  cones?: number;
  /** Most blocks a Repeat can hold. */
  repeatBody?: number;
  lights?: Light[];
  goal?: GoalArt;
  /** Codey's spoken instruction for the level. */
  prompt: string;
  passengers: Passenger[];
  /** Friends already riding from earlier levels (shown in the windows). */
  riding: PassengerId[];
  /** Line played on success, before the sticker. */
  successLine: string;
  sticker: { id: string; art: string; label: string };
  /**
   * One correct answer: the program (program mode) or the cone squares as
   * [x, y] (cones mode). Used by the hint, "add the next block", and the tests.
   */
  solution: Program;
  coneSolution?: [number, number][];
}

export interface Chapter {
  n: number;
  title: string;
  /** Short line for grown-ups: what the child is practising. */
  learns: string;
  grownUp: string;
  intro: string[];
  outro: string[];
  /** Every level in the chapter, in order (class levels included, so locks can show). */
  levelIds: string[];
  /** Each level's sticker picture, in the same order (for the Sticker Book). */
  stickers: string[];
}

export const TURTLE: Passenger = { id: "turtle", stop: "T", needs: "arrive", boardLine: "ch1.turtle.join" };
export const DUCK: Passenger = { id: "duck", stop: "D", needs: "arrive", boardLine: "ch1.duck.join" };
export const SLEEPY_OWL: Passenger = { id: "owl", stop: "O", needs: "honk", boardLine: "ch1.owl.join", waitingLine: "ch1.owl.sleep" };
export const ALL_FRIENDS: PassengerId[] = ["turtle", "duck", "owl"];

export const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: "Morning Pickup",
    learns: "Sequencing",
    grownUp:
      "Your child puts steps in order to make a plan, then watches the plan run one step at a time. This is sequencing, the first idea in coding. Turning left and right from the bus's point of view also builds spatial thinking. When the bus stops, the block that caused the problem glows, so fixing it is a first taste of debugging.",
    intro: ["ch1.intro.1", "ch1.intro.2", "ch1.intro.3", "ch1.intro.4"],
    outro: ["ch1.reward.1", "ch1.reward.2"],
    levelIds: ["1-1", "1-2", "1-3", "1-4"],
    stickers: ["turtle", "duck", "owl", "park"],
  },
  {
    n: 2,
    title: "The Big Lake",
    learns: "Sequencing with tools",
    grownUp:
      "The road ends at water. Children pick the right tool: a Bridge for a narrow stream, or the Ferry for a wide lake (Bina waits at the dock while it comes). Choosing a tool and putting it in the right place in the plan is still sequencing, with a decision added. The Pick Up block appears here too.",
    intro: ["ch2.intro.1", "ch2.intro.2", "ch2.intro.3", "ch2.intro.4"],
    outro: ["ch2.reward.1", "ch2.reward.2"],
    levelIds: ["2-1", "2-2", "2-3", "2-4"],
    stickers: ["bridge", "ferry", "lake", "basket"],
  },
  {
    n: 3,
    title: "Road Work Ahead",
    learns: "Planning a route",
    grownUp:
      "First, Bina drives by herself and takes whichever road is open, so children place cones to close the wrong turns. They have to look at the whole route before pressing GO. Then they plan a path around the construction with blocks.",
    intro: ["ch3.intro.1", "ch3.intro.2", "ch3.intro.3", "ch3.intro.4"],
    outro: ["ch3.reward.1", "ch3.reward.2"],
    levelIds: ["3-1", "3-2", "3-3"],
    stickers: ["cone", "digger", "hat"],
  },
  {
    n: 4,
    title: "Traffic Light Town",
    learns: "Waiting and if-then",
    grownUp:
      "Lights and duckling crossings are red for a short time. The Wait block holds Bina for one step, so children count how long to wait: a gentle first look at conditions (if the light is red, then wait) and at timing.",
    intro: ["ch4.intro.1", "ch4.intro.2", "ch4.intro.3", "ch4.intro.4"],
    outro: ["ch4.reward.1", "ch4.reward.2"],
    levelIds: ["4-1", "4-2", "4-3"],
    stickers: ["light", "fountain", "ducklings"],
  },
  {
    n: 5,
    title: "Mountain Loop",
    learns: "Loops",
    grownUp:
      "The mountain road repeats. There are not enough slots to write every step, so children spot the pattern and put it inside a Repeat block (x2 or x3). This is a loop, one of the big ideas in coding.",
    intro: ["ch5.intro.1", "ch5.intro.2", "ch5.intro.3", "ch5.intro.4"],
    outro: ["ch5.reward.1", "ch5.reward.2"],
    levelIds: ["5-1", "5-2", "5-3"],
    stickers: ["loop", "mountain", "gift"],
  },
  {
    n: 6,
    title: "Birthday Party",
    learns: "Putting it all together",
    grownUp:
      "The last trip combines everything: order, tools, waiting and loops, on the way to a surprise birthday party for Bina. The friends sing a song and the Sticker Book is complete.",
    intro: ["ch6.intro.1", "ch6.intro.2", "ch6.intro.3", "ch6.intro.4"],
    outro: ["ch6.party.1", "ch6.party.2", "ch6.song.1", "ch6.song.2", "ch6.song.3", "ch6.song.4", "ch6.party.3"],
    levelIds: ["6-1", "6-2", "6-3"],
    stickers: ["cake", "hat-party", "party"],
  },
];

/** Every level, in play order. */
export const BUS_LEVEL_IDS = CHAPTERS.flatMap((c) => c.levelIds);

export const FREE_LEVELS: Level[] = [
  /* ---------------- Chapter 1: Morning Pickup ---------------- */
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
    goal: "gate",
    prompt: "ch1.l4.prompt",
    passengers: [],
    riding: ALL_FRIENDS,
    successLine: "common.happy",
    sticker: { id: "park", art: "park", label: "Park" },
    solution: ["forward", "left", "forward", "forward", "right", "forward"],
  },

  /* ---------------- Chapter 2: The Big Lake ---------------- */
  {
    id: "2-1",
    chapter: 2,
    title: "Little stream",
    map: [
      ".tw.h",
      "..w..",
      "S#w#G",
      "..w.f",
      "h.w.t",
    ],
    start: { dir: 1 },
    blocks: ["forward", "left", "right", "bridge"],
    maxBlocks: 7,
    goal: "picnic",
    prompt: "ch2.l1.prompt",
    passengers: [],
    riding: ALL_FRIENDS,
    successLine: "ch2.bridge.yay",
    sticker: { id: "bridge", art: "bridge", label: "Bridge" },
    solution: ["forward", "bridge", "forward", "forward", "forward"],
  },
  {
    id: "2-2",
    chapter: 2,
    title: "The Big Lake",
    map: [
      ".twww.h",
      ".wwwww.",
      "S#kwwkG",
      ".wwwww.",
      "h.www.t",
    ],
    start: { dir: 1 },
    blocks: ["forward", "left", "right", "bridge", "ferry"],
    maxBlocks: 6,
    goal: "picnic",
    prompt: "ch2.l2.prompt",
    passengers: [],
    riding: ALL_FRIENDS,
    successLine: "ch2.ferry.yay",
    sticker: { id: "ferry", art: "ferry", label: "Ferry" },
    solution: ["forward", "forward", "ferry", "forward"],
  },
  {
    id: "2-3",
    chapter: 2,
    title: "Bridge or ferry?",
    map: [
      "t.w.h",
      ".Swk.",
      "c.ww.",
      "..ww.",
      "..wkG",
    ],
    start: { dir: 1 },
    blocks: ["forward", "left", "right", "bridge", "ferry"],
    maxBlocks: 9,
    goal: "picnic",
    prompt: "ch2.l3.prompt",
    passengers: [],
    riding: ALL_FRIENDS,
    successLine: "ch1.duck.cheer",
    sticker: { id: "lake", art: "lake", label: "Lake" },
    solution: ["bridge", "forward", "forward", "right", "ferry", "left", "forward"],
  },
  {
    id: "2-4",
    chapter: 2,
    title: "Picnic basket",
    map: [
      "t.wB.",
      "..w#h",
      ".Sw#t",
      "..w.c",
      "f.w..",
    ],
    start: { dir: 1 },
    blocks: ["forward", "left", "right", "bridge", "ferry", "pickup"],
    maxBlocks: 9,
    prompt: "ch2.l4.prompt",
    passengers: [{ id: "basket", stop: "B", needs: "pickup", boardLine: "ch2.basket.got", waitingLine: "common.pickup_hint" }],
    riding: ALL_FRIENDS,
    successLine: "ch2.picnic.yay",
    sticker: { id: "basket", art: "basket", label: "Picnic" },
    solution: ["bridge", "forward", "forward", "left", "forward", "forward", "pickup"],
  },

  /* ---------------- Chapter 3: Road Work Ahead (free part) ---------------- */
  {
    id: "3-1",
    chapter: 3,
    title: "One cone",
    mode: "cones",
    map: [
      "h.G.t",
      "..#..",
      "S###x",
      "..t.c",
      "f...h",
    ],
    start: { dir: 1 },
    blocks: [],
    maxBlocks: 0,
    cones: 1,
    goal: "flag",
    prompt: "ch3.l1.prompt",
    passengers: [],
    riding: ALL_FRIENDS,
    successLine: "ch3.cones.yay",
    sticker: { id: "cone", art: "cone", label: "Cone" },
    solution: [],
    coneSolution: [[3, 2]],
  },
  {
    id: "3-2",
    chapter: 3,
    title: "Two cones",
    mode: "cones",
    map: [
      "G#..h",
      "t#..c",
      "S###.",
      ".#.#.",
      "h#x#f",
    ],
    start: { dir: 1 },
    blocks: [],
    maxBlocks: 0,
    cones: 2,
    goal: "flag",
    prompt: "ch3.l2.prompt",
    passengers: [],
    riding: ALL_FRIENDS,
    successLine: "ch3.cones.yay",
    sticker: { id: "digger", art: "digger", label: "Digger" },
    solution: [],
    coneSolution: [
      [2, 2],
      [1, 3],
    ],
  },
];
