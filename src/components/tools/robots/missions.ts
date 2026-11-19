/**
 * Robot Lab missions. Each one is a mat (World), a goal the page checks after
 * the run, and starter code. Missions are tagged with the program and
 * semester whose Robot Labs use them (curriculum/robotics in codeship-ops).
 * Project and program names must match the curriculum index exactly.
 */

import type { Trace, World, Zone, Pt } from "./sim";

export type Program = "Explorers" | "Builders" | "Developers" | "Engineers" | "Everyone";
export type Lang = "blocks" | "js" | "py";

export type GoalResult = { ok: boolean; message: string };

/** How the mat is drawn. Decoration only: the simulator never sees it. */
export type Theme =
  | "farm" | "stage" | "ocean" | "snow" | "studio"
  | "disco" | "rail" | "park" | "garden" | "city"
  | "launch" | "beach" | "mars" | "mine" | "museum"
  | "cove" | "factory" | "station" | "volcano" | "solar"
  | "lab";
export type DecorKind =
  | "hen" | "hay" | "fence" | "barn" | "speaker" | "crowd" | "coral" | "seaweed" | "fish" | "chest"
  | "pine" | "snowman" | "penguin" | "easel" | "paint" | "discoball" | "mountain" | "duck" | "bench"
  | "tree" | "bush" | "rock" | "bee" | "hive" | "lamp" | "building" | "hydrant" | "rocket" | "palm"
  | "umbrella" | "friend" | "crater" | "crystal" | "cart" | "painting" | "statue" | "ship" | "barrel"
  | "conveyor" | "window" | "console" | "lava" | "turbine" | "station";
export type ZoneIcon = "basket" | "star" | "igloo" | "house" | "school" | "park" | "bin" | "station" | "deck" | "crate" | "lab" | "door";
export type Scene = {
  theme: Theme;
  decor?: { kind: DecorKind; x: number; y: number; r?: number; w?: number; h?: number; colour?: string }[];
  /** Picture drawn in each zone, by zone id. */
  zoneIcons?: Record<string, ZoneIcon>;
  /** How tape lines look: a road, a railway, a snowy trail or plain tape. */
  path?: "road" | "rail" | "trail" | "tape";
  /** Wall style. */
  wall?: "brick" | "coral" | "building" | "canyon" | "rockface" | "door" | "pond" | "gallery";
  /** A puppy trots behind the robot. */
  follower?: "puppy";
};

export type Semester = "S1" | "S2" | "S3" | "S4" | "Capstone";
export const SEMESTERS: Semester[] = ["S1", "S2", "S3", "S4", "Capstone"];

export type Mission = {
  id: string;
  /** Which block of the program this level belongs to (the sandbox has none). */
  semester?: Semester;
  scene: Scene;
  /** Short skill tags for the mission card. */
  skills: string[];
  title: string;
  program: Program;
  /** Where it fits, e.g. "S1 My Helpful Robot". */
  fits: string;
  goal: string;
  hint: string;
  world: World;
  check: (trace: Trace, world: World) => GoalResult;
  starter: { js: string; py: string };
};

const base = (w: Partial<World> & Pick<World, "w" | "h" | "start" | "robot">): World => ({
  lines: [],
  zones: [],
  walls: [],
  items: [],
  places: [],
  light: 80,
  lightZones: [],
  claps: [],
  distanceNoise: 0,
  grid: true,
  ...w,
});

const inZone = (p: Pt, z: Zone) => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h;
const last = (t: Trace) => t.frames[t.frames.length - 1];

function itemAt(trace: Trace, world: World, id: string): Pt {
  const f = last(trace);
  if (f.items[id]) return f.items[id];
  const it = world.items.find((i) => i.id === id)!;
  return { x: it.x, y: it.y };
}

/** Total angle (degrees) the robot travelled round a centre point. */
function sweptAround(trace: Trace, c: Pt) {
  let total = 0;
  let prev: number | null = null;
  for (const f of trace.frames) {
    const a = Math.atan2(f.y - c.y, f.x - c.x);
    if (prev !== null) {
      let d = a - prev;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      total += d;
    }
    prev = a;
  }
  return Math.abs((total * 180) / Math.PI);
}

const numbersIn = (text: string) => text.split(/[^0-9.]+/).filter(Boolean).map(Number);

const pass = (message: string): GoalResult => ({ ok: true, message });
const notYet = (message: string): GoalResult => ({ ok: false, message });

// ---------------------------------------------------------------- missions
// 20 levels, each in its own world with its own robot job (redesigned 2026-11-19).
// The coding idea for each semester is unchanged.

// ======================= EXPLORERS (K to Gr 1, Blocks)

const eggHunt: Mission = {
  semester: "S1",
  scene: {
    theme: "farm",
    decor: [
      { kind: "fence", x: 0, y: 3, w: 130 },
      { kind: "barn", x: 14, y: 50, r: 7 },
      { kind: "hen", x: 45, y: 14 },
      { kind: "hen", x: 72, y: 48 },
      { kind: "hay", x: 112, y: 52, r: 5 },
      { kind: "hen", x: 104, y: 9 },
    ],
    zoneIcons: { basket: "basket" },
  },
  skills: ["Sequencing", "Counting"],
  id: "egg-hunt",
  title: "Egg hunt",
  program: "Explorers",
  fits: "S1 My Helpful Robot",
  goal: "Help the farmer: drive over all 3 eggs to collect them, stop in the basket, then beep to say you're done.",
  hint: "Count the squares. Each square is 10 cm. The robot collects an egg just by driving over it.",
  world: base({
    w: 130,
    h: 60,
    robot: "scout",
    start: { x: 12, y: 30, heading: 0 },
    collectibles: [
      { id: "e1", x: 35, y: 30, kind: "egg" },
      { id: "e2", x: 55, y: 30, kind: "egg" },
      { id: "e3", x: 75, y: 30, kind: "egg" },
    ],
    zones: [{ id: "basket", x: 95, y: 15, w: 30, h: 30, colour: "yellow", label: "Basket" }],
  }),
  check(trace, world) {
    const eggs = trace.stats.collected.length;
    const basket = world.zones[0];
    if (eggs < 3) return notYet(`${eggs} of 3 eggs collected. Drive further, right over every egg.`);
    if (!inZone(last(trace), basket)) return notYet("All 3 eggs! Now stop inside the basket. Count the squares to it.");
    const arrived = trace.frames.find((f) => inZone(f, basket))!.t;
    if (!trace.sounds.some((s) => s.kind === "beep" && s.t >= arrived)) return notYet("In the basket! Beep to tell the farmer.");
    return pass("3 eggs in the basket. Thank you, helpful robot!");
  },
  starter: { js: "// Egg hunt\nforward(10);\n", py: "# Egg hunt\nforward(10)\n" },
};

const concert: Mission = {
  semester: "S2",
  scene: {
    theme: "stage",
    decor: [
      { kind: "speaker", x: 9, y: 16 },
      { kind: "speaker", x: 111, y: 16 },
      { kind: "crowd", x: 0, y: 54, w: 120 },
    ],
    zoneIcons: { spot: "star" },
  },
  skills: ["Events", "Sound"],
  id: "clap-concert",
  title: "Clap-start concert",
  program: "Explorers",
  fits: "S2 Kindness Cards",
  goal: "Wait for the clap. Then drive into the spotlight and play 3 notes for your friends in the crowd.",
  hint: "Start with wait for a clap. The clap is the event that starts the show. Then forward, then 3 play note blocks.",
  world: base({
    w: 120,
    h: 60,
    robot: "scout",
    start: { x: 20, y: 30, heading: 0 },
    claps: [3],
    zones: [{ id: "spot", x: 60, y: 14, w: 30, h: 30, colour: "yellow", label: "Spotlight" }],
  }),
  check(trace, world) {
    const spot = world.zones[0];
    if (trace.stats.firstMoveAt >= 0 && trace.stats.firstMoveAt < 3) return notYet("The robot started before the clap. Wait for the clap first.");
    if (!trace.frames.some((f) => inZone(f, spot))) return notYet("Drive into the spotlight so everyone can see you.");
    const arrived = trace.frames.find((f) => inZone(f, spot))!.t;
    const notes = trace.stats.notes.filter((n) => n.t >= arrived).length;
    if (notes < 3) return notYet(`${notes} of 3 notes played in the spotlight. Add play note blocks.`);
    return pass("What a show! The clap started it and the crowd loved your song.");
  },
  starter: { js: "// Clap-start concert\nwaitForClap();\n", py: "# Clap-start concert\nwait_for_clap()\n" },
};

const reef: Mission = {
  semester: "S3",
  scene: {
    theme: "ocean",
    wall: "coral",
    decor: [
      { kind: "seaweed", x: 30, y: 52 },
      { kind: "seaweed", x: 66, y: 8 },
      { kind: "seaweed", x: 96, y: 54 },
      { kind: "fish", x: 112, y: 15 },
      { kind: "fish", x: 116, y: 44 },
      { kind: "chest", x: 52, y: 50 },
    ],
  },
  skills: ["Sensors", "Loops"],
  id: "coral-reef",
  title: "Submarine at the reef",
  program: "Explorers",
  fits: "S3 Recycling Sorter",
  goal: "Drive the submarine to the coral reef and stop before you bump it. Then switch on your light so the shy fish can see you.",
  hint: "Use repeat until: keep going forward a little until the sensor sees the reef close by. Then light on.",
  world: base({
    w: 150,
    h: 60,
    robot: "scout",
    start: { x: 12, y: 30, heading: 0 },
    walls: [{ x: 128, y: 4, w: 16, h: 52 }],
  }),
  check(trace) {
    const f = last(trace);
    if (trace.stats.bumps > 0) return notYet("Bump! The submarine touched the coral. Stop when the sensor sees it.");
    if (!f.sensors.obstacle) return notYet("Keep going until the reef is close. Use repeat until.");
    if (f.led === "off") return notYet("You stopped in time. Now switch on your light for the fish.");
    return pass("Stopped safely, and the fish came out to say hello!");
  },
  starter: { js: "// Submarine at the reef\nforward(10);\n", py: "# Submarine at the reef\nforward(10)\n" },
};

const igloo: Mission = {
  semester: "S4",
  scene: {
    theme: "snow",
    path: "trail",
    decor: [
      { kind: "pine", x: 40, y: 45, r: 7 },
      { kind: "pine", x: 28, y: 22, r: 6 },
      { kind: "pine", x: 130, y: 70, r: 6 },
      { kind: "snowman", x: 100, y: 55 },
      { kind: "penguin", x: 84, y: 10 },
      { kind: "penguin", x: 92, y: 14 },
    ],
    zoneIcons: { cabin: "house", igloo: "igloo" },
  },
  skills: ["Sequencing", "Left and right"],
  id: "snowy-igloo",
  title: "Snowy path to the igloo",
  program: "Explorers",
  fits: "S4 My Neighbourhood Map",
  goal: "Follow the snowy path from the cabin to the igloo. Turn left and right at the corners.",
  hint: "Forward, then turn. Count squares for each part of the path. Left and right are the robot's left and right.",
  world: base({
    w: 140,
    h: 100,
    robot: "scout",
    start: { x: 20, y: 80, heading: 0 },
    lines: [{ points: [{ x: 8, y: 80 }, { x: 70, y: 80 }, { x: 70, y: 25 }, { x: 120, y: 25 }], width: 2 }],
    zones: [
      { id: "cabin", x: 5, y: 65, w: 22, h: 30, colour: "orange", label: "Cabin" },
      { id: "igloo", x: 105, y: 8, w: 30, h: 32, colour: "blue", label: "Igloo" },
    ],
  }),
  check(trace, world) {
    const ig = world.zones.find((z) => z.id === "igloo")!;
    return inZone(last(trace), ig) ? pass("Made it to the igloo. Warm and cosy!") : notYet("Not at the igloo yet. Check each part of the path and which way to turn.");
  },
  starter: { js: "// Snowy path to the igloo\nforward(50);\n", py: "# Snowy path to the igloo\nforward(50)\n" },
};

const painting: Mission = {
  semester: "Capstone",
  scene: {
    theme: "studio",
    decor: [
      { kind: "easel", x: 106, y: 18 },
      { kind: "paint", x: 10, y: 10, colour: "#E53935" },
      { kind: "paint", x: 20, y: 8, colour: "#1E88E5" },
      { kind: "paint", x: 14, y: 70, colour: "#FDD835" },
      { kind: "paint", x: 108, y: 66, colour: "#43A047" },
    ],
  },
  skills: ["Sequencing", "Repeat", "Show and tell"],
  id: "paint-a-square",
  title: "Paint a picture",
  program: "Explorers",
  fits: "Capstone Show-and-Tell App",
  goal: "Put the pen down and paint a square picture: forward and turn, 4 times. Then beep to show it to everyone.",
  hint: "A square has 4 sides the same length and 4 quarter turns (90). Pen down first, then repeat 4 times: forward 30, turn left 90.",
  world: base({ w: 120, h: 80, robot: "scout", start: { x: 40, y: 58, heading: 0 }, grid: true }),
  check(trace) {
    const st = trace.stats;
    if (!st.penStart) return notYet("Put the pen down first, so the robot paints as it drives.");
    if (st.inked < 90) return notYet(`You painted ${Math.round(st.inked)} cm. A square needs 4 long sides.`);
    if (st.turned < 265) return notYet("Turn at each corner. A square has 4 quarter turns.");
    const f = last(trace);
    if (Math.hypot(f.x - st.penStart.x, f.y - st.penStart.y) > 6) return notYet("Almost! Finish back where you started so the square closes.");
    if (!trace.sounds.some((s) => s.kind === "beep" && s.t > st.firstMoveAt)) return notYet("What a picture! Beep to show it to everyone.");
    return pass("A square painting, ready for show-and-tell. You're an artist and a coder!");
  },
  starter: { js: '// Paint a picture\npenDown("red");\nforward(30);\n', py: '# Paint a picture\npen_down("red")\nforward(30)\n' },
};

// ======================= BUILDERS (Gr 2 to 3, Blocks)

const disco: Mission = {
  semester: "S1",
  scene: { theme: "disco", decor: [{ kind: "discoball", x: 50, y: 7 }, { kind: "speaker", x: 8, y: 50 }, { kind: "speaker", x: 92, y: 50 }] },
  skills: ["Sequencing", "Outputs"],
  id: "dance-party",
  title: "Dance party hello",
  program: "Builders",
  fits: "S1 All About Me Page",
  goal: "Introduce your robot at the dance party: show its name on the screen, flash 2 different light colours, beep, and spin all the way round.",
  hint: "A full spin is 360. The dance floor glows the colour of your robot's light, so try a few colours.",
  world: base({ w: 100, h: 60, robot: "scout", start: { x: 50, y: 32, heading: 90 }, grid: false }),
  check(trace) {
    const colours = new Set(trace.frames.map((f) => f.led).filter((c) => c !== "off"));
    if (!trace.frames.some((f) => f.display)) return notYet("Show your robot's name on its screen.");
    if (colours.size < 2) return notYet(`Flash 2 different light colours. You used ${colours.size}.`);
    if (trace.stats.beeps < 1) return notYet("Beep to say hello.");
    if (trace.stats.turned < 355) return notYet(`Spin all the way round. You turned ${Math.round(trace.stats.turned)} degrees; a full spin is 360.`);
    return pass("Nice moves! That's an All About Me in code.");
  },
  starter: { js: '// Dance party hello\ndisplay("Hi!");\n', py: '# Dance party hello\ndisplay("Hi!")\n' },
};

const TUNNELS = [
  { x: 50, y: 0, w: 30, h: 50, level: 10, label: "Tunnel" },
  { x: 110, y: 0, w: 30, h: 50, level: 10, label: "Tunnel" },
];
const nightTrain: Mission = {
  semester: "S2",
  scene: {
    theme: "rail",
    path: "rail",
    decor: [
      { kind: "tree", x: 20, y: 8, r: 5 },
      { kind: "bush", x: 34, y: 44, r: 3 },
      { kind: "tree", x: 96, y: 42, r: 5 },
      { kind: "station", x: 160, y: 10 },
    ],
  },
  skills: ["If / else", "Light sensor"],
  id: "night-train",
  title: "Train through the tunnels",
  program: "Builders",
  fits: "S2 Weather Helper",
  goal: "Drive the train to the station. If it's dark (a tunnel), turn the headlight on. If it's bright, turn it off.",
  hint: "Same idea as the Weather Helper: if the light is low, then do one thing; else do another. Check the light after every small step.",
  world: base({
    w: 170,
    h: 50,
    robot: "scout",
    start: { x: 10, y: 25, heading: 0 },
    light: 85,
    lightZones: TUNNELS,
    lines: [{ points: [{ x: 0, y: 25 }, { x: 170, y: 25 }], width: 2 }],
    places: [{ x: 152, y: 6, label: "Station", kind: "flag" }],
  }),
  check(trace) {
    const f = last(trace);
    if (f.x < 148) return notYet("Keep driving all the way to the station.");
    let good = 0;
    let counted = 0;
    for (const fr of trace.frames) {
      const inside = TUNNELS.some((z) => fr.x > z.x + 6 && fr.x < z.x + z.w - 1);
      const outside = TUNNELS.every((z) => fr.x < z.x - 1 || fr.x > z.x + z.w + 6);
      if (inside || outside) {
        counted++;
        if (inside === (fr.led !== "off")) good++;
      }
    }
    return counted > 0 && good / counted >= 0.9
      ? pass("Headlight on in both tunnels, off in the sunshine. All aboard!")
      : notYet("The headlight didn't match the tunnels. Check the light after each step and use if / else.");
  },
  starter: {
    js: "// Train through the tunnels\nfor (let i = 0; i < 10; i++) {\n  forward(2);\n}\n",
    py: "# Train through the tunnels\nfor i in range(10):\n    forward(2)\n",
  },
};

const POND = { x: 33, y: 28, w: 34, h: 34 };
const puppy: Mission = {
  semester: "S3",
  scene: {
    theme: "park",
    wall: "pond",
    follower: "puppy",
    decor: [
      { kind: "duck", x: 44, y: 40 },
      { kind: "duck", x: 55, y: 50 },
      { kind: "tree", x: 92, y: 88, r: 6 },
      { kind: "tree", x: 6, y: 92, r: 5 },
      { kind: "bench", x: 50, y: 92 },
      { kind: "bush", x: 94, y: 4, r: 3 },
    ],
  },
  skills: ["Loops", "Routines"],
  id: "puppy-walk",
  title: "Walk the puppy",
  program: "Builders",
  fits: "S3 Class Pet Care Guide",
  goal: "The class puppy needs its walk: go all the way round the pond 2 times and finish back where you started. Use a repeat loop.",
  hint: "One lap is 4 sides and 4 left turns. Put forward 70 and turn left 90 inside repeat 4, then repeat that 2 times (or repeat 8).",
  world: base({
    w: 100,
    h: 96,
    robot: "scout",
    start: { x: 15, y: 80, heading: 0 },
    walls: [POND],
  }),
  check(trace, world) {
    if (trace.stats.bumps > 0) return notYet("Splash! Don't walk into the pond. Go round it.");
    const laps = sweptAround(trace, { x: POND.x + POND.w / 2, y: POND.y + POND.h / 2 }) / 360;
    if (laps < 1.9) return notYet(`${Math.floor(laps + 0.05)} of 2 laps round the pond. Repeat the lap.`);
    const f = last(trace);
    if (Math.hypot(f.x - world.start.x, f.y - world.start.y) > 8) return notYet("2 laps! Now finish back at the start.");
    return pass("2 laps round the pond. A happy, tired puppy!");
  },
  starter: { js: "// Walk the puppy\nforward(70);\nturnLeft(90);\n", py: "# Walk the puppy\nforward(70)\nturn_left(90)\n" },
};

const FLOWERS = [
  { id: "f1", x: 40, y: 60 },
  { id: "f2", x: 40, y: 25 },
  { id: "f3", x: 90, y: 25 },
  { id: "f4", x: 140, y: 60 },
];
const garden: Mission = {
  semester: "S4",
  scene: {
    theme: "garden",
    decor: [
      { kind: "hive", x: 150, y: 12 },
      { kind: "bee", x: 132, y: 22 },
      { kind: "bush", x: 70, y: 74, r: 4 },
      { kind: "bush", x: 10, y: 10, r: 4 },
      { kind: "fence", x: 0, y: 77, w: 160 },
    ],
  },
  skills: ["Sequencing", "Timing"],
  id: "bloom-garden",
  title: "Make the garden bloom",
  program: "Builders",
  fits: "S4 Save the Bees Awareness Site",
  goal: "Water the 4 flower buds: stop on each one for 1 second and it blooms. The bees will come back!",
  hint: "Forward to a bud, wait 1, then on to the next. Plan the turns: left, right, right, left.",
  world: base({
    w: 160,
    h: 80,
    robot: "scout",
    start: { x: 10, y: 60, heading: 0 },
    places: FLOWERS.map((p) => ({ ...p, label: "Bud", kind: "flower" as const, hold: 1 })),
  }),
  check(trace) {
    const done = new Set(last(trace).done);
    const bloomed = FLOWERS.filter((p) => done.has(p.id)).length;
    return bloomed === 4
      ? pass("All 4 flowers are blooming and the bees are back. Save the bees!")
      : notYet(`${bloomed} of 4 flowers bloomed. Stop right on each bud and wait 1 second.`);
  },
  starter: { js: "// Make the garden bloom\nforward(30);\nwait(1);\n", py: "# Make the garden bloom\nforward(30)\nwait(1)\n" },
};

const fireRescue: Mission = {
  semester: "Capstone",
  scene: {
    theme: "city",
    path: "road",
    wall: "building",
    decor: [
      { kind: "building", x: 8, y: 6, w: 26, h: 24, colour: "#7E57C2" },
      { kind: "building", x: 40, y: 6, w: 30, h: 30, colour: "#26A69A" },
      { kind: "building", x: 120, y: 40, w: 24, h: 26, colour: "#5C6BC0" },
      { kind: "tree", x: 50, y: 56, r: 5 },
      { kind: "tree", x: 75, y: 56, r: 5 },
      { kind: "hydrant", x: 110, y: 76 },
      { kind: "lamp", x: 30, y: 74 },
    ],
    zoneIcons: { station: "station" },
  },
  skills: ["Planning", "Sequencing"],
  id: "fire-rescue",
  title: "Fire rescue",
  program: "Builders",
  fits: "Capstone Community Helper Website",
  goal: "Be a community helper: sound the siren (beep), drive the fire truck along the roads to the burning building, and spray water to put the fire out.",
  hint: "Plan the route first: how far along the road, which way to turn, how far up. Stop a little before the building, then spray.",
  world: base({
    w: 150,
    h: 100,
    robot: "scout",
    start: { x: 15, y: 85, heading: 0 },
    lines: [{ points: [{ x: 4, y: 85 }, { x: 146, y: 85 }] }, { points: [{ x: 100, y: 85 }, { x: 100, y: 30 }] }],
    walls: [{ x: 84, y: 4, w: 32, h: 23 }],
    targets: [{ id: "fire", x: 100, y: 26, kind: "fire" }],
    zones: [{ id: "station", x: 2, y: 70, w: 24, h: 28, colour: "red", label: "Fire station" }],
  }),
  check(trace) {
    if (trace.stats.beeps === 0) return notYet("Sound the siren first: beep!");
    if (trace.stats.bumps > 0) return notYet("Careful! The truck bumped the building. Stop a little before it.");
    if (!trace.stats.sprayed.length) return notYet(trace.stats.distance > 0 ? "Get close and face the fire, then spray. The hose reaches about 3 squares." : "Drive to the burning building.");
    return pass("Fire out! The whole street says thank you, community helper.");
  },
  starter: { js: "// Fire rescue\nbeep();\nforward(10);\n", py: "# Fire rescue\nbeep()\nforward(10)\n" },
};

// ======================= DEVELOPERS (Gr 4 to 5, JavaScript)

const rocket: Mission = {
  semester: "S1",
  scene: { theme: "launch", decor: [{ kind: "rocket", x: 100, y: 30 }, { kind: "lamp", x: 70, y: 6 }, { kind: "lamp", x: 70, y: 54 }], zoneIcons: { deck: "deck" } },
  skills: ["Variables", "Functions"],
  id: "rocket-countdown",
  title: "Rocket countdown",
  program: "Developers",
  fits: "S1 Homework Timer & Focus Tool",
  goal: "Count down 5, 4, 3, 2, 1 on the robot's screen, one number per second. Then launch() the rocket and reverse onto the viewing deck.",
  hint: "Store the time in a variable. Write a function that shows it, waits 1 second and subtracts 1. Call it while the time is above 0.",
  world: base({
    w: 140,
    h: 60,
    robot: "racer",
    start: { x: 58, y: 30, heading: 0 },
    zones: [{ id: "deck", x: 4, y: 12, w: 34, h: 36, colour: "blue", label: "Viewing deck" }],
  }),
  check(trace, world) {
    const at = trace.stats.launches[0] ?? Infinity;
    const shown = trace.frames.filter((f) => f.t <= at && /^\d+$/.test(f.display));
    const set = new Set(shown.map((f) => f.display));
    if (["5", "4", "3", "2", "1"].some((n) => !set.has(n))) return notYet("Show every number from 5 down to 1 on the screen before the launch.");
    if (!Number.isFinite(at)) return notYet("Countdown done! Now call launch().");
    const first = shown.find((f) => f.display === "5")!.t;
    if (at - first < 4.9) return notYet("Wait 1 second on each number. The rocket launched too early.");
    if (trace.stats.firstMoveAt >= 0 && trace.stats.firstMoveAt < at) return notYet("Stay still until the rocket has launched.");
    if (!inZone(last(trace), world.zones[0])) return notYet("Liftoff! Now reverse onto the viewing deck.");
    return pass("5, 4, 3, 2, 1, liftoff! That's a working timer.");
  },
  starter: { js: "// Rocket countdown\nlet time = 5;\ndisplay(time);\n", py: "# Rocket countdown\ntime = 5\ndisplay(time)\n" },
};

const TOWEL = 22;
const TOSS_FROM = 22; // the robot's front edge
const FRIEND = { x: TOSS_FROM + TOWEL * 4, y: 30 };
const beachToss: Mission = {
  semester: "S2",
  scene: {
    theme: "beach",
    decor: [
      { kind: "friend", x: FRIEND.x + 4, y: FRIEND.y },
      { kind: "umbrella", x: 150, y: 12 },
      { kind: "palm", x: 160, y: 50 },
      { kind: "palm", x: 6, y: 8 },
    ],
  },
  skills: ["Operators", "Input and output"],
  id: "beach-toss",
  title: "Beach snack toss",
  program: "Developers",
  fits: "S2 Healthy Snack Calculator",
  goal: `Your friend is 4 beach towels away and each towel is ${TOWEL} cm long. Calculate the distance in your code, print it, then toss() the snack so it lands in their hands (within 4 cm).`,
  hint: "Use variables for the number of towels and their length, multiply them, print the answer, then toss(distance). The robot doesn't need to move.",
  world: base({
    w: 170,
    h: 60,
    robot: "racer",
    start: { x: 15, y: 30, heading: 0 },
    grid: false,
    zones: [
      { x: TOSS_FROM, y: 20, w: TOWEL, h: 20, colour: "pink" },
      { x: TOSS_FROM + TOWEL, y: 20, w: TOWEL, h: 20, colour: "blue" },
      { x: TOSS_FROM + TOWEL * 2, y: 20, w: TOWEL, h: 20, colour: "yellow" },
      { x: TOSS_FROM + TOWEL * 3, y: 20, w: TOWEL, h: 20, colour: "green" },
    ],
  }),
  check(trace) {
    const d = TOWEL * 4;
    const printed = trace.log.some((l) => numbersIn(l.text).includes(d));
    if (!printed) return notYet("Print the distance you calculated, so you can check it.");
    if (trace.stats.firstMoveAt >= 0) return notYet("No need to drive: toss from where you are.");
    const toss = trace.stats.tosses[trace.stats.tosses.length - 1];
    if (!toss) return notYet("Now toss() the snack that far.");
    const off = Math.abs(toss.x - FRIEND.x);
    if (off > 4) return notYet(`The snack landed ${Math.round(off)} cm ${toss.x < FRIEND.x ? "short" : "too far"}. Check your calculation.`);
    return pass(`${4} × ${TOWEL} = ${d} cm. Caught it! Snack time.`);
  },
  starter: { js: "// Beach snack toss\nconst towels = 4;\n", py: "# Beach snack toss\ntowels = 4\n" },
};

const marsEdge: Mission = {
  semester: "S3",
  scene: {
    theme: "mars",
    wall: "canyon",
    decor: [
      { kind: "crater", x: 40, y: 10, r: 6 },
      { kind: "crater", x: 110, y: 42, r: 5 },
      { kind: "rock", x: 75, y: 8, r: 3 },
      { kind: "rock", x: 140, y: 44, r: 2.5 },
    ],
  },
  skills: ["if / else", "Checking data"],
  id: "mars-flag",
  title: "Plant the flag on Mars",
  program: "Developers",
  fits: "S3 Fact or Fake? Media-Literacy Quiz",
  goal: "Drive the rover to the canyon wall and stop 5 to 20 cm away without touching it, then drop() the flag. A dust storm makes the distance sensor wobble by a few cm.",
  hint: "One reading can be wrong. Take three readings and use the smallest (or the average) before you decide, just like checking a source.",
  world: base({
    w: 200,
    h: 50,
    robot: "racer",
    start: { x: 15, y: 25, heading: 0 },
    walls: [{ x: 172, y: 0, w: 28, h: 50 }],
    items: [{ id: "flag", x: 21, y: 25, colour: "red", kind: "flag", label: "Flag" }],
    startCarrying: "flag",
    distanceNoise: 4,
  }),
  check(trace) {
    const f = last(trace);
    const d = f.sensors.distance;
    if (trace.stats.bumps > 0) return notYet("Bump. The rover touched the canyon wall.");
    if (f.carrying === "flag") return d <= 20 && d >= 5 ? notYet("Good stop! Now drop() the flag.") : notYet(`Stopped ${d} cm away. Aim for 5 to 20 cm, then drop the flag.`);
    if (d > 20) return notYet(`Flag planted ${d} cm from the wall. That's too far: aim for 5 to 20 cm.`);
    if (d < 5) return notYet(`Stopped ${d} cm away. That's too close.`);
    return pass(`Flag planted ${d} cm from the canyon. Checked, not guessed.`);
  },
  starter: { js: "// Plant the flag on Mars\nconsole.log(distance());\n", py: "# Plant the flag on Mars\nprint(distance())\n" },
};

const MINE_BUDGET = 180;
const mine: Mission = {
  semester: "S4",
  scene: {
    theme: "mine",
    path: "rail",
    wall: "rockface",
    decor: [
      { kind: "crystal", x: 12, y: 12, colour: "#7E57C2" },
      { kind: "crystal", x: 150, y: 100, colour: "#26C6DA" },
      { kind: "lamp", x: 40, y: 72 },
      { kind: "lamp", x: 112, y: 70 },
    ],
    zoneIcons: { cart: "crate" },
  },
  skills: ["Arrays", "Loops", "Budget math"],
  id: "crystal-mine",
  title: "Crystal mine",
  program: "Developers",
  fits: "S4 Budget Buddy",
  goal: `Collect all 3 crystals and park at the mine cart. The battery only lasts ${MINE_BUDGET} cm of driving, so print your total cost too.`,
  hint: "Store your route in an array, loop through it, and add up the cost of each forward move. Print the total.",
  world: base({
    w: 160,
    h: 110,
    robot: "racer",
    start: { x: 20, y: 95, heading: 0 },
    walls: [{ x: 75, y: 64, w: 30, h: 46 }],
    collectibles: [
      { id: "g1", x: 60, y: 95, kind: "gem" },
      { id: "g2", x: 60, y: 45, kind: "gem" },
      { id: "g3", x: 115, y: 45, kind: "gem" },
    ],
    lines: [{ points: [{ x: 120, y: 45 }, { x: 158, y: 45 }] }],
    zones: [{ id: "cart", x: 130, y: 30, w: 26, h: 30, colour: "orange", label: "Mine cart" }],
  }),
  check(trace, world) {
    const got = trace.stats.collected.length;
    const used = Math.round(trace.stats.distance);
    if (got < 3) return notYet(`${got} of 3 crystals collected.`);
    if (!inZone(last(trace), world.zones[0])) return notYet("All 3 crystals! Now park at the mine cart.");
    if (used > MINE_BUDGET) return notYet(`You drove ${used} cm. The battery lasts ${MINE_BUDGET} cm. Find a shorter route.`);
    const printed = trace.log.some((l) => numbersIn(l.text).some((n) => Math.abs(n - used) <= 1));
    if (!printed) return notYet(`Done in ${used} cm. Now print the total cost from your loop.`);
    return pass(`3 crystals for ${used} of ${MINE_BUDGET} cm. Under budget!`);
  },
  starter: {
    js: `// Crystal mine\nconst route = [["forward", 10]];\nlet cost = 0;\nfor (const [move, amount] of route) {\n  if (move === "forward") { forward(amount); cost += amount; }\n  if (move === "left") turnLeft(amount);\n  if (move === "right") turnRight(amount);\n}\nconsole.log("Cost:", cost);\n`,
    py: `# Crystal mine\nroute = [("forward", 10)]\ncost = 0\nfor move, amount in route:\n    if move == "forward":\n        forward(amount)\n        cost += amount\n    elif move == "left":\n        turn_left(amount)\n    elif move == "right":\n        turn_right(amount)\nprint("Cost:", cost)\n`,
  },
};

const DARK_ROOMS = [
  { x: 55, y: 75, w: 55, h: 35, level: 12, label: "Dark gallery" },
  { x: 120, y: 30, w: 40, h: 35, level: 12, label: "Dark hall" },
];
const MASTERPIECE = { id: "exit", x: 122, y: 0, w: 38, h: 28, colour: "yellow" as const, label: "Masterpiece room" };
const museum: Mission = {
  semester: "Capstone",
  scene: {
    theme: "museum",
    wall: "gallery",
    decor: [
      { kind: "statue", x: 30, y: 95 },
      { kind: "statue", x: 150, y: 80 },
    ],
    zoneIcons: { exit: "star" },
  },
  skills: ["Sensors", "if / else", "Loops"],
  id: "museum-night",
  title: "Night at the museum",
  program: "Developers",
  fits: "Capstone Problem-Solver App",
  goal: "Solve a real problem: guide the night guard robot through the museum to the Masterpiece room. Turn left when a wall is ahead, light the way in the dark rooms (off where it's bright), then take a photo() of the masterpiece.",
  hint: "One loop does it all: check the light, then if obstacle() turn left, else step forward. Count your turns so you know when you've arrived.",
  world: base({
    w: 160,
    h: 110,
    robot: "racer",
    start: { x: 15, y: 95, heading: 0 },
    light: 85,
    lightZones: DARK_ROOMS,
    walls: [{ x: 0, y: 0, w: 120, h: 75 }],
    zones: [MASTERPIECE],
  }),
  check(trace, world) {
    const f = last(trace);
    const room = world.zones[0];
    if (trace.stats.bumps > 0) return notYet("Bump! Turn before you touch a wall. Check obstacle() every step.");
    if (!inZone(f, room)) return notYet(trace.stats.turned > 45 ? "Keep going until you reach the Masterpiece room." : "A wall is ahead at the corner. If obstacle(), turn left.");
    let good = 0;
    let counted = 0;
    for (const fr of trace.frames) {
      const inside = DARK_ROOMS.some((z) => fr.x > z.x + 4 && fr.x < z.x + z.w - 4 && fr.y > z.y + 4 && fr.y < z.y + z.h - 4);
      const outside = DARK_ROOMS.every((z) => fr.x < z.x - 4 || fr.x > z.x + z.w + 4 || fr.y < z.y - 4 || fr.y > z.y + z.h + 4);
      if (inside || outside) {
        counted++;
        if (inside === (fr.led !== "off")) good++;
      }
    }
    if (!counted || good / counted < 0.85) return notYet("Light on in the dark rooms, off where it's bright.");
    const arrived = trace.frames.find((fr) => inZone(fr, room))!.t;
    if (!trace.stats.photos.some((t) => t >= arrived)) return notYet("You made it! Now take a photo() of the masterpiece.");
    return pass("Through the dark museum, round the corner, and a photo of the masterpiece. Problem solved!");
  },
  starter: { js: "// Night at the museum\nforward(10);\n", py: "# Night at the museum\nforward(10)\n" },
};

// ======================= ENGINEERS (Gr 6 to 8, Python)

const vault: Mission = {
  semester: "S1",
  scene: {
    theme: "cove",
    decor: [{ kind: "ship", x: 20, y: 8 }, { kind: "barrel", x: 46, y: 60 }, { kind: "barrel", x: 54, y: 63 }, { kind: "palm", x: 66, y: 8 }],
  },
  skills: ["Functions", "if / elif / else", "Cybersecurity"],
  id: "treasure-vault",
  title: "Treasure vault",
  program: "Engineers",
  fits: "S1 Password Strength Checker",
  goal: "Pirates are trying passcodes on the vault. Read each with next_code(), beep to reject weak ones, and only unlock() after a strong one (12 or more characters with letters, numbers and a symbol). Then drive in and grab the treasure.",
  hint: "Write an is_strong(code) function first. Then loop: read a code, check it, beep or unlock. An empty code means nobody is left.",
  world: base({
    w: 140,
    h: 70,
    robot: "rover",
    start: { x: 20, y: 35, heading: 0 },
    codes: ["1234", "password", "Rover-Blue-7731!"],
    doors: [{ x: 82, y: 4, w: 7, h: 62 }],
    walls: [
      { x: 82, y: 0, w: 58, h: 4 },
      { x: 82, y: 66, w: 58, h: 4 },
    ],
    collectibles: [{ id: "treasure", x: 118, y: 35, kind: "treasure" }],
  }),
  check(trace) {
    const reads = trace.stats.codeReads;
    const un = trace.stats.unlocks;
    if (un.some((u) => u.codesRead < 3)) return notYet("The vault opened for a weak passcode! Only unlock() after the strong one.");
    if (reads.length < 3) return notYet(`You read ${reads.length} of 3 passcodes. Use next_code() in a loop.`);
    if (trace.sounds.filter((s) => s.kind === "beep" && s.t < reads[2]).length < 2) return notYet("Beep once for each weak passcode you reject.");
    if (!un.length) return notYet("The third passcode is strong. unlock() the vault.");
    if (!trace.stats.collected.length) return notYet("The vault is open. Drive in and grab the treasure.");
    return pass("Two weak passcodes rejected, the strong one accepted, treasure safe. Secure!");
  },
  starter: { js: "// Treasure vault\nconst code = nextCode();\nconsole.log(code);\n", py: "# Treasure vault\ncode = next_code()\nprint(code)\n" },
};

const crateZones: Zone[] = [
  { id: "apples", x: 120, y: 5, w: 35, h: 28, colour: "red", label: "Apples" },
  { id: "oranges", x: 120, y: 36, w: 35, h: 28, colour: "orange", label: "Oranges" },
  { id: "bananas", x: 120, y: 67, w: 35, h: 28, colour: "yellow", label: "Bananas" },
];
const factory: Mission = {
  semester: "S2",
  scene: { theme: "factory", decor: [{ kind: "conveyor", x: 22, y: 6, h: 88 }], zoneIcons: { apples: "crate", oranges: "crate", bananas: "crate" } },
  skills: ["Dictionaries", "Functions", "Classifying"],
  id: "fruit-factory",
  title: "Fruit packing factory",
  program: "Engineers",
  fits: "S2 Smart Sorting AI",
  goal: "Pick up each fruit from the conveyor, check its colour with item_colour(), and pack it in the matching crate.",
  hint: "Use a dictionary to look up which crate each colour goes to. Write a go_to(x, y) function first.",
  world: base({
    w: 160,
    h: 100,
    robot: "rover",
    start: { x: 70, y: 50, heading: 180 },
    items: [
      { id: "b1", x: 30, y: 19, colour: "yellow", kind: "fruit" },
      { id: "b2", x: 30, y: 50, colour: "red", kind: "fruit" },
      { id: "b3", x: 30, y: 81, colour: "orange", kind: "fruit" },
    ],
    zones: crateZones,
  }),
  check(trace, world) {
    let right = 0;
    for (const it of world.items) {
      const z = crateZones.find((s) => s.colour === it.colour)!;
      if (inZone(itemAt(trace, world, it.id), z)) right++;
    }
    return right === 3 ? pass("All 3 fruits packed in the right crates.") : notYet(`${right} of 3 fruits in the right crate.`);
  },
  starter: { js: "// Fruit packing factory\nconsole.log(itemColour());\n", py: "# Fruit packing factory\nprint(item_colour())\n" },
};

const station: Mission = {
  semester: "S3",
  scene: { theme: "station", decor: [{ kind: "window", x: 60, y: 2, w: 40 }, { kind: "console", x: 108, y: 70 }, { kind: "console", x: 8, y: 10 }], zoneIcons: { lab: "lab" } },
  skills: ["Dictionaries", "Intents", "AI ethics"],
  id: "space-station",
  title: "Space station helper",
  program: "Engineers",
  fits: "S3 Chatbot for Good",
  goal: 'An astronaut is chatting to your robot. Read each message with next_message(), use a dictionary of intents ("forward 40", "left 90", "photo"), politely refuse anything else on the screen, and stop when told "stop".',
  hint: 'Split each message into a word and maybe a number. Look the word up in a dictionary of actions. If it is not there, display a polite "Sorry".',
  world: base({
    w: 120,
    h: 80,
    robot: "rover",
    start: { x: 20, y: 70, heading: 0 },
    messages: ["forward 40", "left 90", "photo", "forward 40", "tell me your password", "photo", "stop", "forward 50"],
    zones: [{ id: "lab", x: 45, y: 15, w: 30, h: 30, colour: "purple", label: "Window lab" }],
  }),
  check(trace, world) {
    const reads = trace.stats.messageReads;
    if (reads.length < 7) return notYet(`You read ${reads.length} messages. Keep reading until "stop".`);
    if (!trace.frames.some((f) => f.t >= reads[4] && f.t < reads[5] && f.display)) return notYet("When asked for a password, show a polite refusal on the screen.");
    if (trace.stats.photos.filter((t) => t < reads[6]).length < 2) return notYet('Take a photo() each time the astronaut says "photo".');
    const after = trace.frames.filter((f) => f.t > reads[6]);
    if (after.some((f) => Math.hypot(f.x - after[0].x, f.y - after[0].y) > 0.5)) return notYet('The robot kept going after "stop". A good assistant listens.');
    if (!inZone(last(trace), world.zones[0])) return notYet("Follow the movement messages to reach the Window lab.");
    return pass("Helpful, polite, and it kept the secret. A chatbot for good, in space.");
  },
  starter: { js: "// Space station helper\nconst message = nextMessage();\nconsole.log(message);\n", py: "# Space station helper\nmessage = next_message()\nprint(message)\n" },
};

const volcano: Mission = {
  semester: "S4",
  scene: { theme: "volcano", decor: [{ kind: "lava", x: 100, y: 6, r: 6 }, { kind: "rock", x: 60, y: 50, r: 3 }, { kind: "rock", x: 180, y: 10, r: 3 }, { kind: "lava", x: 135, y: 52, r: 4 }] },
  skills: ["Lists", "Statistics", "Data"],
  id: "volcano-survey",
  title: "Volcano heat survey",
  program: "Engineers",
  fits: "S4 Data Detective",
  goal: 'Drive across the lava field and record at least 10 temperature readings with record("temp", temperature()). Then open the Data tab and find the hottest stretch.',
  hint: 'In a loop: forward a little, then record("temp", temperature()). Download the CSV and work out the mean, max and min.',
  world: base({
    w: 200,
    h: 60,
    robot: "rover",
    start: { x: 12, y: 30, heading: 0 },
    temp: 25,
    heatZones: [
      { x: 40, y: 0, w: 40, h: 60, temp: 60 },
      { x: 80, y: 0, w: 40, h: 60, temp: 180 },
      { x: 120, y: 0, w: 40, h: 60, temp: 95 },
      { x: 160, y: 0, w: 40, h: 60, temp: 40 },
    ],
  }),
  check(trace) {
    const temps = trace.data.filter((d) => typeof d.value === "number");
    if (temps.length < 10) return notYet(`${temps.length} readings recorded. Record at least 10.`);
    if (new Set(temps.map((d) => d.value)).size < 3) return notYet("Your readings are all the same. Record temperature() as you drive.");
    if (trace.stats.distance < 150) return notYet("Drive further so your readings cover the whole lava field.");
    return pass(`${temps.length} readings recorded. Open the Data tab to find the hottest stretch.`);
  },
  starter: { js: '// Volcano heat survey\nrecord("temp", temperature());\n', py: '# Volcano heat survey\nrecord("temp", temperature())\n' },
};

const PANELS = [
  { id: "p1", x: 45, y: 20 },
  { id: "p2", x: 85, y: 20 },
  { id: "p3", x: 125, y: 20 },
  { id: "p4", x: 45, y: 75 },
  { id: "p5", x: 85, y: 75 },
  { id: "p6", x: 125, y: 75 },
];
const solar: Mission = {
  semester: "Capstone",
  scene: { theme: "solar", decor: [{ kind: "turbine", x: 160, y: 48 }, { kind: "turbine", x: 8, y: 50 }, { kind: "bush", x: 100, y: 48, r: 3 }] },
  skills: ["Design thinking", "Data", "Sustainability"],
  id: "solar-farm",
  title: "Solar farm clean-up",
  program: "Engineers",
  fits: "Capstone Innovation Challenge",
  goal: 'Prototype a fix for a real problem (SDG 7, clean energy): dusty panels make less power. Record power() before you start, drive over all 6 panels to clean them, then record power() again for your pitch.',
  hint: "Drive along the top row, turn, and come back along the bottom row. Use record(\"power\", power()) at the start and at the end.",
  world: base({
    w: 170,
    h: 100,
    robot: "rover",
    start: { x: 15, y: 20, heading: 0 },
    collectibles: PANELS.map((p) => ({ ...p, kind: "panel" as const })),
  }),
  check(trace) {
    const cleaned = trace.stats.collected.length;
    if (cleaned < 6) return notYet(`${cleaned} of 6 panels cleaned. Drive over every panel.`);
    const power = trace.data.filter((d) => /power/i.test(d.name) && typeof d.value === "number").map((d) => d.value as number);
    if (power.length < 2) return notYet('All clean! Record power() before and after with record("power", power()).');
    if (power[power.length - 1] <= power[0]) return notYet("Record power() once before cleaning and once after, so your data shows the change.");
    return pass(`Power went from ${power[0]} W to ${power[power.length - 1]} W. That's evidence for your pitch.`);
  },
  starter: { js: '// Solar farm clean-up\nrecord("power", power());\n', py: '# Solar farm clean-up\nrecord("power", power())\n' },
};

const oval: Pt[] = [];
for (let i = 0; i <= 48; i++) {
  const a = (i / 48) * Math.PI * 2;
  oval.push({ x: Math.round((80 + Math.cos(a) * 55) * 10) / 10, y: Math.round((55 + Math.sin(a) * 32) * 10) / 10 });
}
const sandbox: Mission = {
  scene: { theme: "lab", wall: "brick" },
  skills: ["Anything goes"],
  id: "sandbox",
  title: "Free build",
  program: "Everyone",
  fits: "Any Robot Lab",
  goal: "No goal: try anything. There's a line track, a wall, coloured zones and blocks to move.",
  hint: "Try a line follower: if the left sensor sees the line, turn left a little and creep forward; if the right one does, turn right and creep forward; otherwise go forward.",
  world: base({
    w: 160,
    h: 110,
    robot: "racer",
    start: { x: 135, y: 55, heading: 90 },
    lines: [{ points: oval }],
    walls: [{ x: 70, y: 48, w: 20, h: 14 }],
    zones: [
      { x: 5, y: 5, w: 22, h: 22, colour: "red", label: "Red" },
      { x: 133, y: 83, w: 22, h: 22, colour: "blue", label: "Blue" },
    ],
    items: [
      { id: "s1", x: 45, y: 55, colour: "yellow" },
      { id: "s2", x: 115, y: 30, colour: "green" },
    ],
  }),
  check: () => ({ ok: true, message: "" }),
  starter: {
    js: "// Free build\nforward(20);\nturnLeft(90);\n",
    py: "# Free build\nforward(20)\nturn_left(90)\n",
  },
};



export const MISSIONS: Mission[] = [
  eggHunt, concert, reef, igloo, painting,
  disco, nightTrain, puppy, garden, fireRescue,
  rocket, beachToss, marsEdge, mine, museum,
  vault, factory, station, volcano, solar,
  sandbox,
];

/** "Level 3 · S3" for a mission, from its place in its program. */
export function levelOf(m: Mission): number {
  return m.semester ? SEMESTERS.indexOf(m.semester) + 1 : 0;
}

export const DEFAULT_LANG: Record<Program, Lang> = {
  Explorers: "blocks",
  Builders: "blocks",
  Developers: "js",
  Engineers: "py",
  Everyone: "blocks",
};

export function missionById(id: string | null | undefined): Mission {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0];
}
