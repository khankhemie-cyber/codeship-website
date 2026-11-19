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
export type Scene = {
  ground: "rug" | "grass" | "tiles" | "concrete";
  /** Draw tape lines as roads (grey band under the black tape). */
  roads?: boolean;
  decor?: { kind: "tree" | "bush" | "ball" | "rock" | "bee"; x: number; y: number; r?: number }[];
  /** Picture drawn in each zone, by zone id. */
  zoneIcons?: Record<string, "toybox" | "heart" | "house" | "school" | "park" | "bin">;
  /** Wall style. */
  wall?: "bin" | "brick";
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

/** Did the robot stay still for at least `seconds` within `radius` cm of p? */
function pausedNear(trace: Trace, p: Pt, radius: number, seconds: number) {
  let since: number | null = null;
  let prev: { x: number; y: number } | null = null;
  for (const f of trace.frames) {
    const near = Math.hypot(f.x - p.x, f.y - p.y) <= radius;
    const still = prev !== null && Math.hypot(f.x - prev.x, f.y - prev.y) < 0.01;
    if (near && still) {
      if (since === null) since = prev ? f.t : f.t;
      if (f.t - since >= seconds - 0.05) return true;
    } else {
      since = near ? f.t : null;
    }
    prev = f;
  }
  return false;
}

const pass = (message: string): GoalResult => ({ ok: true, message });
const notYet = (message: string): GoalResult => ({ ok: false, message });

// ---------------------------------------------------------------- missions

const toyBin: Mission = {
  semester: "S1",
  scene: { ground: "rug", decor: [{ kind: "ball", x: 30, y: 10, r: 3 }, { kind: "ball", x: 75, y: 52, r: 2.5 }], zoneIcons: { bin: "toybox" } },
  skills: ["Sequencing", "Counting"],
  id: "toy-bin",
  title: "Toy to the bin",
  program: "Explorers",
  fits: "S1 My Helpful Robot",
  goal: "Drive to the yellow toy, pick it up, and drop it in the green toy bin.",
  hint: "Count the squares. Each square is 10 cm. Drive until the toy is right in front, pick it up, then keep going.",
  world: base({
    w: 120,
    h: 60,
    robot: "scout",
    start: { x: 15, y: 30, heading: 0 },
    items: [{ id: "toy", x: 55, y: 30, colour: "yellow", label: "Toy" }],
    zones: [{ id: "bin", x: 90, y: 15, w: 25, h: 30, colour: "green", label: "Toy bin" }],
  }),
  check(trace, world) {
    const bin = world.zones[0];
    const toy = itemAt(trace, world, "toy");
    if (last(trace).carrying === "toy") return notYet("The robot is still holding the toy. Add a drop.");
    if (trace.stats.pickUps === 0)
      return notYet(trace.stats.missedPickUps ? "The robot tried to pick up, but the toy wasn't in front of it. Change the forward number so the robot stops right at the toy." : "The robot never picked up the toy. Drive to it, then pick up.");
    return inZone(toy, bin) ? pass("The toy is in the bin. Helpful robot!") : notYet("The toy was dropped outside the bin. Try a different distance.");
  },
  starter: {
    js: "// Toy to the bin\nforward(10);\n",
    py: "# Toy to the bin\nforward(10)\n",
  },
};

const kindness: Mission = {
  semester: "S2",
  scene: { ground: "rug", decor: [{ kind: "ball", x: 50, y: 8, r: 2.5 }], zoneIcons: { friend: "heart" } },
  skills: ["Events", "Sound"],
  id: "kindness-delivery",
  title: "Kindness delivery",
  program: "Explorers",
  fits: "S2 Kindness Cards",
  goal: "Wait for the clap, then deliver your kindness card to your friend and beep hello.",
  hint: "Start with wait for clap. A real robot can't see the clap coming, so it has to listen first.",
  world: base({
    w: 120,
    h: 60,
    robot: "scout",
    start: { x: 15, y: 30, heading: 0 },
    claps: [2],
    zones: [{ id: "friend", x: 85, y: 15, w: 30, h: 30, colour: "pink", label: "Friend" }],
  }),
  check(trace, world) {
    const f = last(trace);
    if (trace.stats.firstMoveAt >= 0 && trace.stats.firstMoveAt < 1.95) return notYet("The robot left before the clap. Wait for the clap first.");
    if (!inZone(f, world.zones[0])) return notYet("The card didn't reach your friend. Drive a bit further.");
    if (trace.stats.beeps === 0) return notYet("You arrived. Now say hello with a beep.");
    return pass("Delivered with a beep. Kindness sent!");
  },
  starter: {
    js: "// Kindness delivery\nwaitForClap();\n",
    py: "# Kindness delivery\nwait_for_clap()\n",
  },
};

const binStop: Mission = {
  semester: "S3",
  scene: { ground: "tiles", wall: "bin" },
  skills: ["Sensors", "Loops"],
  id: "bin-stop",
  title: "Stop at the bin",
  program: "Explorers",
  fits: "S3 Recycling Sorter",
  goal: "Drive to the recycling bin and stop before you bump it. Then beep.",
  hint: "Repeat a small step forward until the obstacle sensor sees the bin.",
  world: base({
    w: 140,
    h: 50,
    robot: "scout",
    start: { x: 15, y: 25, heading: 0 },
    walls: [{ x: 120, y: 10, w: 12, h: 30 }],
    places: [{ x: 126, y: 6, label: "Recycling", kind: "flag" }],
  }),
  check(trace) {
    const f = last(trace);
    if (trace.stats.bumps > 0) return notYet("Bump! The robot hit the bin. Use the obstacle sensor to stop in time.");
    if (!f.sensors.obstacle) return notYet("The robot stopped too far from the bin. Keep going until the sensor sees it.");
    if (trace.stats.beeps === 0) return notYet("You stopped in time. Now beep.");
    return pass("Stopped right at the bin, no bump. Nice sensing!");
  },
  starter: {
    js: "// Stop at the bin\nwhile (!obstacle()) {\n  forward(2);\n}\n",
    py: "# Stop at the bin\nwhile not obstacle():\n    forward(2)\n",
  },
};

const neighbourhood: Mission = {
  semester: "S4",
  scene: {
    ground: "grass",
    roads: true,
    decor: [{ kind: "tree", x: 45, y: 40, r: 7 }, { kind: "tree", x: 30, y: 25, r: 6 }, { kind: "bush", x: 95, y: 92, r: 4 }, { kind: "tree", x: 130, y: 70, r: 6 }, { kind: "rock", x: 85, y: 10, r: 3 }],
    zoneIcons: { home: "house", school: "school", park: "park" },
  },
  skills: ["Sequencing", "Left and right"],
  id: "neighbourhood",
  title: "Drive my street",
  program: "Explorers",
  fits: "S4 My Neighbourhood Map",
  goal: "Follow the roads from Home to the Park.",
  hint: "Forward, then turn. Count squares for each road. Left and right are the robot's left and right.",
  world: base({
    w: 140,
    h: 100,
    robot: "scout",
    start: { x: 20, y: 80, heading: 0 },
    lines: [{ points: [{ x: 8, y: 80 }, { x: 70, y: 80 }, { x: 70, y: 25 }, { x: 120, y: 25 }] }],
    zones: [
      { id: "home", x: 5, y: 65, w: 22, h: 30, colour: "grey", label: "Home" },
      { id: "school", x: 78, y: 55, w: 35, h: 25, colour: "blue", label: "School" },
      { id: "park", x: 105, y: 10, w: 30, h: 30, colour: "green", label: "Park" },
    ],
  }),
  check(trace, world) {
    const park = world.zones.find((z) => z.id === "park")!;
    return inZone(last(trace), park) ? pass("You made it to the Park!") : notYet("Not at the Park yet. Check each road's length and which way to turn.");
  },
  starter: {
    js: "// Drive my street\nforward(50);\n",
    py: "# Drive my street\nforward(50)\n",
  },
};

const tunnel = { x: 60, y: 0, w: 40, h: 50, level: 10, label: "Tunnel" };
const dayNight: Mission = {
  semester: "S2",
  scene: { ground: "grass", decor: [{ kind: "bush", x: 25, y: 8, r: 4 }, { kind: "tree", x: 125, y: 42, r: 5 }, { kind: "bush", x: 140, y: 8, r: 3 }] },
  skills: ["If / else", "Light sensor"],
  id: "day-night",
  title: "Lights in the tunnel",
  program: "Builders",
  fits: "S2 Weather Helper",
  goal: "Drive to the end of the mat. If it's dark, turn your light on. If it's bright, turn it off.",
  hint: "Same idea as the Weather Helper: if the light is low, then do one thing; else do another. Check the light after every small step.",
  world: base({
    w: 160,
    h: 50,
    robot: "scout",
    start: { x: 10, y: 25, heading: 0 },
    light: 85,
    lightZones: [tunnel],
    places: [{ x: 150, y: 10, label: "End", kind: "flag" }],
  }),
  check(trace) {
    const f = last(trace);
    if (f.x < 140) return notYet("Keep driving to the end of the mat.");
    let good = 0;
    let counted = 0;
    for (const fr of trace.frames) {
      const inside = fr.x > tunnel.x + 6 && fr.x < tunnel.x + tunnel.w - 1;
      const outside = fr.x < tunnel.x - 1 || fr.x > tunnel.x + tunnel.w + 6;
      if (inside) {
        counted++;
        if (fr.led !== "off") good++;
      } else if (outside) {
        counted++;
        if (fr.led === "off") good++;
      }
    }
    return counted > 0 && good / counted >= 0.9
      ? pass("Light on in the dark, off in the bright. Just like a real headlight sensor.")
      : notYet("The light didn't match the tunnel. Check the light level after each step and use if / else.");
  },
  starter: {
    js: "// Lights in the tunnel\nfor (let i = 0; i < 10; i++) {\n  forward(2);\n}\n",
    py: "# Lights in the tunnel\nfor i in range(10):\n    forward(2)\n",
  },
};

const flowers: Pt[] = [
  { x: 35, y: 60 },
  { x: 80, y: 25 },
  { x: 110, y: 45 },
  { x: 140, y: 60 },
];
const pollinator: Mission = {
  semester: "S4",
  scene: { ground: "grass", decor: [{ kind: "bee", x: 70, y: 50 }, { kind: "bee", x: 128, y: 30 }, { kind: "bush", x: 20, y: 20, r: 5 }, { kind: "tree", x: 80, y: 62, r: 8 }] },
  skills: ["Sequencing", "Timing"],
  id: "pollinator",
  title: "Pollinator path",
  program: "Builders",
  fits: "S4 Save the Bees Awareness Site",
  goal: "Follow the path and stop for 1 second at each of the 4 flowers, like a bee.",
  hint: "Forward to a flower, wait 1, then on to the next. The path turns three times.",
  world: base({
    w: 160,
    h: 80,
    robot: "scout",
    start: { x: 10, y: 60, heading: 0 },
    lines: [{ points: [{ x: 4, y: 60 }, { x: 50, y: 60 }, { x: 50, y: 25 }, { x: 110, y: 25 }, { x: 110, y: 60 }, { x: 156, y: 60 }] }],
    places: flowers.map((p) => ({ ...p, label: "Flower", kind: "flower" as const })),
  }),
  check(trace) {
    const visited = flowers.filter((p) => pausedNear(trace, p, 6, 1)).length;
    return visited === 4 ? pass("All 4 flowers visited. A real bee would visit hundreds in a day.") : notYet(`${visited} of 4 flowers visited. Stop (wait 1) right on each flower.`);
  },
  starter: {
    js: "// Pollinator path\nforward(25);\nwait(1);\n",
    py: "# Pollinator path\nforward(25)\nwait(1)\n",
  },
};

const wallStop: Mission = {
  semester: "S3",
  scene: { ground: "tiles", wall: "brick" },
  skills: ["if / else", "Checking data"],
  id: "wall-stop",
  title: "Can you trust the sensor?",
  program: "Developers",
  fits: "S3 Fact or Fake? Media-Literacy Quiz",
  goal: "Stop between 5 and 20 cm from the wall without touching it. This distance sensor wobbles by a few cm, like a real one.",
  hint: "One reading can be wrong. Try taking three readings and using the smallest, or the average, before you decide.",
  world: base({
    w: 200,
    h: 50,
    robot: "racer",
    start: { x: 15, y: 25, heading: 0 },
    walls: [{ x: 170, y: 5, w: 10, h: 40 }],
    distanceNoise: 4,
  }),
  check(trace) {
    const d = last(trace).sensors.distance;
    if (trace.stats.bumps > 0) return notYet("Bump. The robot touched the wall.");
    if (d > 20) return notYet(`Stopped ${d} cm away. That's too far: aim for 5 to 20 cm.`);
    if (d < 5) return notYet(`Stopped ${d} cm away. That's too close.`);
    return pass(`Stopped ${d} cm from the wall. Checked, not guessed.`);
  },
  starter: {
    js: "// Can you trust the sensor?\nconsole.log(distance());\n",
    py: "# Can you trust the sensor?\nprint(distance())\n",
  },
};

const BUDGET = 170;
const delivery: Mission = {
  semester: "S4",
  scene: {
    ground: "grass",
    roads: true,
    decor: [{ kind: "tree", x: 50, y: 70, r: 6 }, { kind: "tree", x: 100, y: 72, r: 6 }, { kind: "bush", x: 145, y: 60, r: 4 }, { kind: "tree", x: 145, y: 15, r: 5 }],
    zoneIcons: { h1: "house", h2: "house", h3: "house" },
  },
  skills: ["Arrays", "Loops", "Budget math"],
  id: "delivery",
  title: "Delivery on a budget",
  program: "Developers",
  fits: "S4 Budget Buddy",
  goal: `Pick up the package and deliver it to House 3. Your battery budget is ${BUDGET} cm of driving.`,
  hint: "Store your route in an array, loop through it, and add up the cost of each move before you drive.",
  world: base({
    w: 160,
    h: 120,
    robot: "racer",
    start: { x: 20, y: 100, heading: 0 },
    items: [{ id: "package", x: 30, y: 100, colour: "orange", label: "Package" }],
    lines: [
      { points: [{ x: 6, y: 100 }, { x: 154, y: 100 }] },
      { points: [{ x: 25, y: 100 }, { x: 25, y: 48 }] },
      { points: [{ x: 75, y: 100 }, { x: 75, y: 48 }] },
      { points: [{ x: 120, y: 100 }, { x: 120, y: 48 }] },
    ],
    zones: [
      { id: "h1", x: 10, y: 15, w: 30, h: 32, colour: "blue", label: "House 1" },
      { id: "h2", x: 60, y: 15, w: 30, h: 32, colour: "purple", label: "House 2" },
      { id: "h3", x: 105, y: 15, w: 30, h: 32, colour: "red", label: "House 3" },
    ],
  }),
  check(trace, world) {
    const house = world.zones.find((z) => z.id === "h3")!;
    const pkg = itemAt(trace, world, "package");
    const used = Math.round(trace.stats.distance);
    if (!inZone(pkg, house)) return notYet("The package isn't at House 3 yet.");
    if (last(trace).carrying) return notYet("Drop the package at House 3.");
    if (used > BUDGET) return notYet(`Delivered, but you drove ${used} cm. The budget is ${BUDGET} cm. Find a shorter route.`);
    return pass(`Delivered using ${used} of ${BUDGET} cm. Under budget!`);
  },
  starter: {
    js: `// Delivery on a budget\nconst route = [["forward", 10]];\nlet cost = 0;\nfor (const [move, amount] of route) {\n  if (move === "forward") { forward(amount); cost += amount; }\n  if (move === "left") turnLeft(amount);\n  if (move === "right") turnRight(amount);\n}\nconsole.log("Cost:", cost);\n`,
    py: `# Delivery on a budget\nroute = [("forward", 10)]\ncost = 0\nfor move, amount in route:\n    if move == "forward":\n        forward(amount)\n        cost += amount\n    elif move == "left":\n        turn_left(amount)\n    elif move == "right":\n        turn_right(amount)\nprint("Cost:", cost)\n`,
  },
};

const sortZones: Zone[] = [
  { id: "red", x: 120, y: 5, w: 35, h: 28, colour: "red", label: "Red" },
  { id: "blue", x: 120, y: 36, w: 35, h: 28, colour: "blue", label: "Blue" },
  { id: "yellow", x: 120, y: 67, w: 35, h: 28, colour: "yellow", label: "Yellow" },
];
const colourSort: Mission = {
  semester: "S2",
  scene: { ground: "concrete", zoneIcons: { red: "bin", blue: "bin", yellow: "bin" } },
  skills: ["Dictionaries", "Functions", "Classifying"],
  id: "colour-sort",
  title: "Sorting robot",
  program: "Engineers",
  fits: "S2 Smart Sorting AI",
  goal: "Pick up each block, check its colour with item_colour(), and drop it in the matching zone.",
  hint: "Use a dictionary to look up where each colour goes. Write a go_to(x, y) function first.",
  world: base({
    w: 160,
    h: 100,
    robot: "rover",
    start: { x: 70, y: 50, heading: 180 },
    items: [
      { id: "b1", x: 30, y: 19, colour: "yellow" },
      { id: "b2", x: 30, y: 50, colour: "red" },
      { id: "b3", x: 30, y: 81, colour: "blue" },
    ],
    zones: sortZones,
  }),
  check(trace, world) {
    let right = 0;
    for (const it of world.items) {
      const z = sortZones.find((s) => s.colour === it.colour)!;
      if (inZone(itemAt(trace, world, it.id), z)) right++;
    }
    return right === 3 ? pass("All 3 blocks sorted correctly.") : notYet(`${right} of 3 blocks in the right zone.`);
  },
  starter: {
    js: "// Sorting robot\nconsole.log(itemColour());\n",
    py: "# Sorting robot\nprint(item_colour())\n",
  },
};

const survey: Mission = {
  semester: "S4",
  scene: { ground: "grass", decor: [{ kind: "tree", x: 88, y: 12, r: 7 }, { kind: "tree", x: 108, y: 50, r: 7 }, { kind: "tree", x: 95, y: 32, r: 5 }, { kind: "rock", x: 175, y: 12, r: 4 }, { kind: "bush", x: 55, y: 50, r: 4 }] },
  skills: ["Lists", "Statistics", "Data"],
  id: "survey",
  title: "Survey robot",
  program: "Engineers",
  fits: "S4 Data Detective",
  goal: "Drive the length of the field and record at least 10 light readings. Then open the Data tab and find the darkest stretch.",
  hint: "In a loop: forward a little, then record(\"light\", light()). Download the CSV and work out the mean, max and min.",
  world: base({
    w: 200,
    h: 60,
    robot: "rover",
    start: { x: 12, y: 30, heading: 0 },
    grid: true,
    light: 90,
    lightZones: [
      { x: 40, y: 0, w: 40, h: 60, level: 60, label: "Shade" },
      { x: 80, y: 0, w: 40, h: 60, level: 25, label: "Trees" },
      { x: 120, y: 0, w: 40, h: 60, level: 70, label: "Clearing" },
      { x: 160, y: 0, w: 40, h: 60, level: 40, label: "Hill" },
    ],
  }),
  check(trace) {
    const readings = trace.data.length;
    if (readings < 10) return notYet(`${readings} readings recorded. Record at least 10.`);
    if (trace.stats.distance < 150) return notYet("Drive further so your readings cover the whole field.");
    return pass(`${readings} readings recorded. Open the Data tab to analyse them.`);
  },
  starter: {
    js: '// Survey robot\nrecord("light", light());\n',
    py: '# Survey robot\nrecord("light", light())\n',
  },
};

const oval: Pt[] = [];
for (let i = 0; i <= 48; i++) {
  const a = (i / 48) * Math.PI * 2;
  oval.push({ x: Math.round((80 + Math.cos(a) * 55) * 10) / 10, y: Math.round((55 + Math.sin(a) * 32) * 10) / 10 });
}
const sandbox: Mission = {
  scene: { ground: "tiles", wall: "brick" },
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


// ---------------------------------------------------------------- levels added 2026-11-18 (one per semester and capstone)

const showTell: Mission = {
  semester: "Capstone",
  scene: { ground: "rug", decor: [{ kind: "ball", x: 60, y: 10, r: 3 }], zoneIcons: { stage: "heart", home: "house" } },
  skills: ["Sequencing", "Events", "Sound"],
  id: "show-and-tell",
  title: "Show-and-tell tour",
  program: "Explorers",
  fits: "Capstone Show-and-Tell App",
  goal: "Drive to the show-and-tell spot, turn your light on and beep to say hello, then drive back home.",
  hint: "Four parts: go there, light on, beep, come back. To come back, turn all the way round first (180).",
  world: base({
    w: 140,
    h: 70,
    robot: "scout",
    start: { x: 15, y: 35, heading: 0 },
    zones: [
      { id: "home", x: 2, y: 20, w: 26, h: 30, colour: "grey", label: "Home" },
      { id: "stage", x: 95, y: 20, w: 30, h: 30, colour: "purple", label: "Show-and-tell" },
    ],
  }),
  check(trace, world) {
    const stage = world.zones.find((z) => z.id === "stage")!;
    const home = world.zones.find((z) => z.id === "home")!;
    if (!trace.frames.some((f) => inZone(f, stage))) return notYet("Drive all the way to the show-and-tell spot first.");
    if (!trace.frames.some((f) => inZone(f, stage) && f.led !== "off")) return notYet("At the spot, turn your light on so everyone can see you.");
    if (trace.stats.beeps === 0) return notYet("Say hello with a beep.");
    if (!inZone(last(trace), home)) return notYet("Great show! Now drive back home.");
    return pass("Show-and-tell done, and home again. You're a coder now!");
  },
  starter: { js: "// Show-and-tell tour\nforward(10);\n", py: "# Show-and-tell tour\nforward(10)\n" },
};

const meetRobot: Mission = {
  semester: "S1",
  scene: { ground: "tiles" },
  skills: ["Sequencing", "Outputs"],
  id: "meet-my-robot",
  title: "Meet my robot",
  program: "Builders",
  fits: "S1 All About Me Page",
  goal: "Make your robot introduce itself: show a hello on its screen, light up, beep twice, and spin all the way round.",
  hint: "A full spin is 360. Your hello can be your robot's name. Keep it short so it fits the screen.",
  world: base({ w: 100, h: 60, robot: "scout", start: { x: 50, y: 30, heading: 90 } }),
  check(trace) {
    if (!trace.frames.some((f) => f.display)) return notYet("Show a hello on the robot's screen.");
    if (!trace.frames.some((f) => f.led !== "off")) return notYet("Light up in your favourite colour.");
    if (trace.stats.beeps < 2) return notYet(`Beep twice. You beeped ${trace.stats.beeps} time${trace.stats.beeps === 1 ? "" : "s"}.`);
    if (trace.stats.turned < 355) return notYet(`Spin all the way round. You turned ${Math.round(trace.stats.turned)} degrees; a full spin is 360.`);
    return pass("Nice to meet you, robot! That's an About Me in code.");
  },
  starter: { js: '// Meet my robot\ndisplay("Hi!");\n', py: '# Meet my robot\ndisplay("Hi!")\n' },
};

const petRoutine: Mission = {
  semester: "S3",
  scene: { ground: "rug", zoneIcons: { bowl: "toybox", bed: "heart" } },
  skills: ["Loops", "Routines"],
  id: "pet-routine",
  title: "Robot pet routine",
  program: "Builders",
  fits: "S3 Class Pet Care Guide",
  goal: "Your robot pet needs its routine twice: go to the food bowl, then go to its bed. Use a repeat loop.",
  hint: "Write the routine once (bowl, turn round, bed, turn round), then put it inside repeat 2 times.",
  world: base({
    w: 120,
    h: 70,
    robot: "scout",
    start: { x: 60, y: 35, heading: 0 },
    zones: [
      { id: "bowl", x: 95, y: 22, w: 20, h: 26, colour: "orange", label: "Food bowl" },
      { id: "bed", x: 5, y: 22, w: 20, h: 26, colour: "purple", label: "Bed" },
    ],
  }),
  check(trace, world) {
    const bowl = world.zones.find((z) => z.id === "bowl")!;
    const bed = world.zones.find((z) => z.id === "bed")!;
    const visits = { bowl: 0, bed: 0 };
    let where: "bowl" | "bed" | null = null;
    for (const f of trace.frames) {
      const now = inZone(f, bowl) ? "bowl" : inZone(f, bed) ? "bed" : null;
      if (now && now !== where) visits[now]++;
      if (now) where = now;
    }
    if (visits.bowl < 2 || visits.bed < 2) return notYet(`Food bowl ${visits.bowl} of 2, bed ${visits.bed} of 2. Repeat the routine twice.`);
    return pass("Fed and rested, twice. A happy robot pet!");
  },
  starter: { js: "// Robot pet routine\nforward(45);\n", py: "# Robot pet routine\nforward(45)\n" },
};

const helper: Mission = {
  semester: "Capstone",
  scene: {
    ground: "grass",
    roads: true,
    decor: [{ kind: "tree", x: 40, y: 30, r: 7 }, { kind: "tree", x: 130, y: 40, r: 6 }, { kind: "bush", x: 60, y: 85, r: 4 }],
    zoneIcons: { bank: "house", centre: "school" },
  },
  skills: ["Planning", "Sequencing"],
  id: "community-helper",
  title: "Community helper",
  program: "Builders",
  fits: "Capstone Community Helper Website",
  goal: "Be a community helper: pick up the supplies at the Food bank, deliver them to the Community centre, and beep when you arrive.",
  hint: "Plan the route first: how far along the road, which way to turn, how far up. Then pick up, drive, drop, beep.",
  world: base({
    w: 150,
    h: 90,
    robot: "scout",
    start: { x: 20, y: 70, heading: 0 },
    items: [{ id: "supplies", x: 28, y: 70, colour: "green", label: "Supplies" }],
    lines: [{ points: [{ x: 8, y: 70 }, { x: 140, y: 70 }] }, { points: [{ x: 100, y: 70 }, { x: 100, y: 32 }] }],
    zones: [
      { id: "bank", x: 3, y: 50, w: 22, h: 35, colour: "orange", label: "Food bank" },
      { id: "centre", x: 85, y: 5, w: 30, h: 25, colour: "blue", label: "Community centre" },
    ],
  }),
  check(trace, world) {
    const centre = world.zones.find((z) => z.id === "centre")!;
    if (trace.stats.pickUps === 0) return notYet("Pick up the supplies first. They're right in front of you.");
    if (last(trace).carrying) return notYet("Drop the supplies at the Community centre.");
    if (!inZone(itemAt(trace, world, "supplies"), centre)) return notYet("The supplies didn't land in the Community centre. Check your distances.");
    if (trace.stats.beeps === 0) return notYet("Delivered! Now beep to let them know you're here.");
    return pass("Supplies delivered. Thank you, community helper!");
  },
  starter: { js: "// Community helper\npickUp();\n", py: "# Community helper\npick_up()\n" },
};

const focusTimer: Mission = {
  semester: "S1",
  scene: { ground: "tiles", zoneIcons: { break: "park" } },
  skills: ["Variables", "Functions"],
  id: "focus-timer",
  title: "Focus timer",
  program: "Developers",
  fits: "S1 Homework Timer & Focus Tool",
  goal: "Count down 5, 4, 3, 2, 1 on the robot's screen, one number per second. Then beep and drive to Break time.",
  hint: "Store the time in a variable. Write a function that shows it, waits 1 second and subtracts 1. Call it while the time is above 0.",
  world: base({
    w: 140,
    h: 50,
    robot: "racer",
    start: { x: 15, y: 25, heading: 0 },
    zones: [{ id: "break", x: 100, y: 10, w: 35, h: 30, colour: "green", label: "Break time" }],
  }),
  check(trace, world) {
    const moveAt = trace.stats.firstMoveAt < 0 ? Infinity : trace.stats.firstMoveAt;
    const shown = new Set(trace.frames.filter((f) => f.t <= moveAt && /^\d+$/.test(f.display)).map((f) => f.display));
    if (["5", "4", "3", "2", "1"].some((n) => !shown.has(n))) return notYet("Show every number from 5 down to 1 on the screen before the robot moves.");
    if (moveAt < 4.9) return notYet("Wait 1 second on each number. The robot left too early.");
    if (trace.stats.beeps === 0) return notYet("Beep when the timer ends.");
    if (!inZone(last(trace), world.zones[0])) return notYet("Time's up! Now drive to Break time.");
    return pass("Focused for 5 seconds, then off to a break. That's a working timer.");
  },
  starter: { js: "// Focus timer\nlet time = 5;\ndisplay(time);\n", py: "# Focus timer\ntime = 5\ndisplay(time)\n" },
};

const STONE = 22;
const snack: Mission = {
  semester: "S2",
  scene: { ground: "grass", zoneIcons: { stand: "toybox" }, decor: [{ kind: "tree", x: 140, y: 12, r: 6 }, { kind: "bush", x: 40, y: 8, r: 3 }] },
  skills: ["Operators", "Input and output"],
  id: "snack-stand",
  title: "Snack stand",
  program: "Developers",
  fits: "S2 Healthy Snack Calculator",
  goal: `The snack stand is 4 paving stones away and each stone is ${STONE} cm. Calculate the distance in your code, print it, then stop right at the stand (within 2 cm).`,
  hint: "Use variables for the number of stones and their size, multiply them, print the answer, then drive that far.",
  world: base({
    w: 160,
    h: 50,
    robot: "racer",
    start: { x: 10, y: 25, heading: 0 },
    grid: false,
    zones: [
      { x: 10, y: 15, w: STONE, h: 20, colour: "grey" },
      { x: 10 + STONE, y: 15, w: STONE, h: 20, colour: "white" },
      { x: 10 + STONE * 2, y: 15, w: STONE, h: 20, colour: "grey" },
      { x: 10 + STONE * 3, y: 15, w: STONE, h: 20, colour: "white" },
      { id: "stand", x: 10 + STONE * 4, y: 5, w: 26, h: 40, colour: "orange", label: "Snack stand" },
    ],
  }),
  check(trace) {
    const target = 10 + STONE * 4;
    const x = last(trace).x;
    const printed = trace.log.some((l) => l.text.split(/[^0-9.]+/).includes(String(STONE * 4)));
    if (!printed) return notYet("Print the distance you calculated, so you can check it.");
    if (Math.abs(x - target) > 2) return notYet(`The robot stopped ${Math.abs(Math.round(x - target))} cm from the stand. Check your calculation.`);
    return pass(`Calculated ${STONE * 4} cm and stopped right at the stand. Snack time!`);
  },
  starter: { js: "// Snack stand\nconst stones = 4;\n", py: "# Snack stand\nstones = 4\n" },
};

const hallway: Mission = {
  semester: "Capstone",
  scene: { ground: "tiles", wall: "brick" },
  skills: ["Sensors", "if / else", "Loops"],
  id: "hallway-helper",
  title: "Hallway helper",
  program: "Developers",
  fits: "Capstone Problem-Solver App",
  goal: "Solve a real problem: guide a visitor down the hallway to the classroom door. Light the way in the dark part, switch off in the bright part, and stop before the door without touching it.",
  hint: "One loop does it all: step forward, check the light, check for the door. Use distance() or obstacle() to stop.",
  world: base({
    w: 200,
    h: 50,
    robot: "racer",
    start: { x: 12, y: 25, heading: 0 },
    light: 85,
    lightZones: [{ x: 70, y: 0, w: 50, h: 50, level: 15, label: "Dark hallway" }],
    walls: [{ x: 185, y: 5, w: 10, h: 40 }],
    places: [{ x: 172, y: 4, label: "Classroom", kind: "flag" }],
  }),
  check(trace) {
    const f = last(trace);
    if (trace.stats.bumps > 0) return notYet("Bump! Stop before the classroom door.");
    if (!f.sensors.obstacle) return notYet("Keep going until you reach the classroom door.");
    let good = 0;
    let counted = 0;
    for (const fr of trace.frames) {
      const inside = fr.x > 76 && fr.x < 119;
      const outside = fr.x < 69 || (fr.x > 127 && fr.x < 170);
      if (inside || outside) {
        counted++;
        if (inside === (fr.led !== "off")) good++;
      }
    }
    if (!counted || good / counted < 0.85) return notYet("Light on in the dark hallway, off where it's bright.");
    return pass("Visitor delivered safely to the classroom. Problem solved!");
  },
  starter: { js: "// Hallway helper\nforward(10);\n", py: "# Hallway helper\nforward(10)\n" },
};

const lockRobot: Mission = {
  semester: "S1",
  scene: { ground: "concrete", zoneIcons: { vault: "bin" } },
  skills: ["Functions", "if / elif / else", "Cybersecurity"],
  id: "lock-the-robot",
  title: "Lock the robot",
  program: "Engineers",
  fits: "S1 Password Strength Checker",
  goal: "Visitors type passcodes. Read each with next_code(), beep to reject weak ones, and only drive into the Vault after a strong one (12 or more characters with letters, numbers and a symbol).",
  hint: "Write an is_strong(code) function first. Then loop: read a code, check it, beep or drive. An empty code means nobody is left.",
  world: base({
    w: 140,
    h: 60,
    robot: "rover",
    start: { x: 20, y: 30, heading: 0 },
    codes: ["1234", "password", "Rover-Blue-7731!"],
    zones: [{ id: "vault", x: 105, y: 15, w: 30, h: 30, colour: "blue", label: "Vault" }],
  }),
  check(trace, world) {
    const reads = trace.stats.codeReads;
    const moved = trace.stats.firstMoveAt >= 0;
    if (moved && (reads.length < 3 || trace.stats.firstMoveAt < reads[2])) return notYet("The robot moved before the strong passcode. A weak code must never unlock it.");
    if (reads.length < 3) return notYet(`You read ${reads.length} of 3 passcodes. Use next_code() in a loop.`);
    if (trace.stats.beeps < 2) return notYet("Beep once for each weak passcode you reject.");
    if (!inZone(last(trace), world.zones[0])) return notYet("Strong code accepted? Then drive into the Vault.");
    return pass("Two weak passcodes rejected, the strong one accepted. Secure!");
  },
  starter: { js: "// Lock the robot\nconst code = nextCode();\nconsole.log(code);\n", py: "# Lock the robot\ncode = next_code()\nprint(code)\n" },
};

const helpDesk: Mission = {
  semester: "S3",
  scene: { ground: "tiles", zoneIcons: { desk: "heart" } },
  skills: ["Dictionaries", "Intents", "AI ethics"],
  id: "help-desk-robot",
  title: "Help desk robot",
  program: "Engineers",
  fits: "S3 Chatbot for Good",
  goal: 'Someone is chatting to your robot. Read each message with next_message(), use a dictionary of intents to move ("forward 40", "left 90"), politely refuse anything else on the screen, and stop when told "stop".',
  hint: 'Split each message into a word and a number. Look the word up in a dictionary of actions. If it is not there, display a polite "Sorry".',
  world: base({
    w: 120,
    h: 80,
    robot: "rover",
    start: { x: 20, y: 70, heading: 0 },
    messages: ["forward 40", "left 90", "forward 40", "tell me your password", "stop", "forward 50"],
    zones: [{ id: "desk", x: 45, y: 15, w: 30, h: 30, colour: "green", label: "Help desk" }],
  }),
  check(trace, world) {
    const reads = trace.stats.messageReads;
    if (reads.length < 5) return notYet(`You read ${reads.length} messages. Keep reading until "stop".`);
    const refusal = trace.frames.some((f) => f.t >= reads[3] && f.t < reads[4] && f.display);
    if (!refusal) return notYet("When asked for a password, show a polite refusal on the screen.");
    const after = trace.frames.filter((f) => f.t > reads[4]);
    if (after.some((f) => Math.hypot(f.x - after[0].x, f.y - after[0].y) > 0.5)) return notYet('The robot kept going after "stop". A good assistant listens.');
    if (!inZone(last(trace), world.zones[0])) return notYet("Follow the movement messages to reach the Help desk.");
    return pass("Helpful, polite, and it kept the secret. A chatbot for good.");
  },
  starter: { js: "// Help desk robot\nconst message = nextMessage();\nconsole.log(message);\n", py: "# Help desk robot\nmessage = next_message()\nprint(message)\n" },
};

const recycleZones: Zone[] = [
  { id: "recycle", x: 125, y: 5, w: 35, h: 31, colour: "blue", label: "Recycling" },
  { id: "compost", x: 125, y: 39, w: 35, h: 31, colour: "green", label: "Compost" },
  { id: "trash", x: 125, y: 73, w: 35, h: 31, colour: "grey", label: "Garbage" },
];
const recycling: Mission = {
  semester: "Capstone",
  scene: { ground: "concrete", zoneIcons: { recycle: "bin", compost: "bin", trash: "bin" } },
  skills: ["Design thinking", "Data", "Sustainability"],
  id: "recycling-helper",
  title: "Recycling helper",
  program: "Engineers",
  fits: "Capstone Innovation Challenge",
  goal: "Prototype a fix for a real problem: sort all 4 items (blue = recycling, green = compost, grey = garbage), then record how many went into each bin for your pitch.",
  hint: "Reuse your go_to() from Sorting robot. Keep a dictionary of counts, then record() each one at the end.",
  world: base({
    w: 170,
    h: 110,
    robot: "rover",
    start: { x: 70, y: 55, heading: 180 },
    items: [
      { id: "r1", x: 30, y: 18, colour: "blue" },
      { id: "r2", x: 30, y: 42, colour: "green" },
      { id: "r3", x: 30, y: 66, colour: "grey" },
      { id: "r4", x: 30, y: 90, colour: "blue" },
    ],
    zones: recycleZones,
  }),
  check(trace, world) {
    let right = 0;
    for (const it of world.items) {
      const z = recycleZones.find((s) => s.colour === it.colour)!;
      if (inZone(itemAt(trace, world, it.id), z)) right++;
    }
    if (right < 4) return notYet(`${right} of 4 items in the right bin.`);
    const names = new Set(trace.data.map((d) => d.name));
    if (names.size < 3) return notYet("All sorted! Now record() the count for each of the 3 bins.");
    return pass("Everything sorted and counted. Ready to pitch your prototype.");
  },
  starter: { js: "// Recycling helper\nconsole.log(itemColour());\n", py: "# Recycling helper\nprint(item_colour())\n" },
};

export const MISSIONS: Mission[] = [
  toyBin, kindness, binStop, neighbourhood, showTell,
  meetRobot, dayNight, petRoutine, pollinator, helper,
  focusTimer, snack, wallStop, delivery, hallway,
  lockRobot, colourSort, helpDesk, survey, recycling,
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
