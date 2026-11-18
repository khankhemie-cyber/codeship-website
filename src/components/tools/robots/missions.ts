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

export type Mission = {
  id: string;
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
    if (trace.stats.pickUps === 0) return notYet("The robot never picked up the toy. Drive closer, then pick up.");
    return inZone(toy, bin) ? pass("The toy is in the bin. Helpful robot!") : notYet("The toy was dropped outside the bin. Try a different distance.");
  },
  starter: {
    js: "// Toy to the bin\nforward(10);\n",
    py: "# Toy to the bin\nforward(10)\n",
  },
};

const kindness: Mission = {
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

export const MISSIONS: Mission[] = [toyBin, kindness, binStop, neighbourhood, dayNight, pollinator, wallStop, delivery, colourSort, survey, sandbox];

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
