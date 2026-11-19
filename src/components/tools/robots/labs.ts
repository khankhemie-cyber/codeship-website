/**
 * The Robot Lab classes that lead up to each semester's full challenge.
 * Explorers and Builders: labs 1 to 3 here, lab 4 is the full level in
 * missions.ts. Developers and Engineers: labs 1 to 5 here, lab 6 is the full
 * level. Each semester keeps its world; each lab adds one new idea.
 */

import type { Trace, World, Zone } from "./kit";
import { base, inZone, itemAt, last, notYet, numbersIn, pass, sweptAround, type Mission, type Program, type Scene, type Semester } from "./kit";

type LabSpec = Omit<Mission, "program" | "semester" | "fits" | "skills" | "scene" | "lab"> & { scene?: Scene; skills?: string[] };

function semester(program: Program, sem: Semester, fits: string, skills: string[], scene: Scene) {
  return (lab: number, spec: LabSpec): Mission => ({ ...spec, program, semester: sem, fits, skills: spec.skills ?? skills, scene: spec.scene ?? scene, lab });
}

const starter = (title: string, js: string, py = js) => ({ js: `// ${title}\n${js}`, py: `# ${title}\n${py}` });

/** Degrees turned left and right, from the frames. */
function turnSplit(trace: Trace) {
  let left = 0;
  let right = 0;
  for (let i = 1; i < trace.frames.length; i++) {
    let d = trace.frames[i].heading - trace.frames[i - 1].heading;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if (d > 0) left += d;
    else right -= d;
  }
  return { left, right };
}

const firstSoundAt = (trace: Trace) => {
  const s = trace.sounds.find((x) => x.kind === "beep" || x.kind === "note");
  return s ? s.t : Infinity;
};

/** Share of frames where the light matches the dark (on) and bright (off) places. */
function lightMatch(trace: Trace, world: World) {
  let good = 0;
  let counted = 0;
  for (const f of trace.frames) {
    let level = world.light;
    let edge = false;
    for (const z of world.lightZones) {
      const inside = f.x >= z.x && f.x <= z.x + z.w && f.y >= z.y && f.y <= z.y + z.h;
      const near = f.x >= z.x - 6 && f.x <= z.x + z.w + 6 && f.y >= z.y - 6 && f.y <= z.y + z.h + 6;
      if (inside) level = z.level;
      if (near && !(f.x >= z.x + 6 && f.x <= z.x + z.w - 6)) edge = true;
    }
    if (edge) continue;
    counted++;
    if ((level < 30) === (f.led !== "off")) good++;
  }
  return counted ? good / counted : 0;
}

// ============================================================ EXPLORERS

const farmScene: Scene = {
  theme: "farm",
  decor: [
    { kind: "fence", x: 0, y: 3, w: 140 },
    { kind: "hen", x: 30, y: 44 },
    { kind: "hen", x: 88, y: 10 },
  ],
  zoneIcons: { hay: "basket", nest: "basket", barn: "house" },
};
const ES1 = semester("Explorers", "S1", "S1 My Helpful Robot", ["Sequencing", "Counting"], farmScene);

const stageScene: Scene = { theme: "stage", decor: [{ kind: "speaker", x: 9, y: 16 }, { kind: "speaker", x: 91, y: 16 }, { kind: "crowd", x: 0, y: 46, w: 100 }] };
const ES2 = semester("Explorers", "S2", "S2 Kindness Cards", ["Events", "Sound"], stageScene);

const oceanScene: Scene = { theme: "ocean", wall: "coral", decor: [{ kind: "seaweed", x: 30, y: 52 }, { kind: "seaweed", x: 70, y: 8 }, { kind: "fish", x: 100, y: 48 }] };
const ES3 = semester("Explorers", "S3", "S3 Recycling Sorter", ["Sensors", "Loops"], oceanScene);

const snowScene: Scene = { theme: "snow", path: "trail", decor: [{ kind: "pine", x: 70, y: 66, r: 6 }, { kind: "penguin", x: 8, y: 8 }, { kind: "snowman", x: 90, y: 14 }], zoneIcons: { igloo: "igloo", snowman: "igloo" } };
const ES4 = semester("Explorers", "S4", "S4 My Neighbourhood Map", ["Sequencing", "Left and right"], snowScene);

const studioScene: Scene = { theme: "studio", decor: [{ kind: "easel", x: 106, y: 18 }, { kind: "paint", x: 14, y: 70, colour: "#FDD835" }, { kind: "paint", x: 20, y: 9, colour: "#1E88E5" }] };
const EC = semester("Explorers", "Capstone", "Capstone Show-and-Tell App", ["Sequencing", "Repeat", "Show and tell"], studioScene);

const penCheck = (minInk: number, minTurn: number, closed: boolean, what: string) => (trace: Trace) => {
  const st = trace.stats;
  if (!st.penStart) return notYet("Put the pen down first, so the robot paints as it drives.");
  if (st.inked < minInk) return notYet(`You painted ${Math.round(st.inked)} cm. Make the lines longer.`);
  if (st.turned < minTurn) return notYet("Turn at each corner.");
  const f = last(trace);
  if (closed && Math.hypot(f.x - st.penStart.x, f.y - st.penStart.y) > 6) return notYet("Almost! Finish back where you started so the shape closes.");
  return pass(what);
};

export const EXPLORER_LABS: Mission[] = [
  ES1(1, {
    id: "farm-hello",
    title: "Hello, farm",
    goal: "Drive 3 squares to the hay bale and stop on it.",
    hint: "Each square is 10 cm. 3 squares is forward 30.",
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 12, y: 25, heading: 0 }, zones: [{ id: "hay", x: 32, y: 12, w: 22, h: 26, colour: "yellow", label: "Hay bale" }] }),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("You made it to the hay bale. Good counting!") : notYet("Not on the hay bale yet. Count the squares and try again.")),
    starter: starter("Hello, farm", "forward(10);\n", "forward(10)\n"),
  }),
  ES1(2, {
    id: "farm-first-egg",
    title: "The first egg",
    goal: "Drive over the egg to collect it, then stop in the nest.",
    hint: "The robot collects the egg just by driving over it. Then keep going to the nest.",
    world: base({
      w: 110,
      h: 50,
      robot: "scout",
      start: { x: 12, y: 25, heading: 0 },
      collectibles: [{ id: "e1", x: 40, y: 25, kind: "egg" }],
      zones: [{ id: "nest", x: 60, y: 12, w: 24, h: 26, colour: "yellow", label: "Nest" }],
    }),
    check(trace, world) {
      if (!trace.stats.collected.length) return notYet("Drive right over the egg to collect it.");
      return inZone(last(trace), world.zones[0]) ? pass("Egg collected and back in the nest!") : notYet("Got the egg! Now stop in the nest.");
    },
    starter: starter("The first egg", "forward(10);\n", "forward(10)\n"),
  }),
  ES1(3, {
    id: "farm-backward",
    title: "Back to the barn",
    goal: "The egg and the barn are behind the robot. Drive backward to collect the egg and park in the barn.",
    hint: "Use backward. Count the squares from the robot to the barn.",
    world: base({
      w: 110,
      h: 50,
      robot: "scout",
      start: { x: 70, y: 25, heading: 0 },
      collectibles: [{ id: "e1", x: 45, y: 25, kind: "egg" }],
      zones: [{ id: "barn", x: 4, y: 10, w: 26, h: 30, colour: "red", label: "Barn" }],
    }),
    check(trace, world) {
      if (!trace.stats.collected.length) return notYet("The egg is behind you. Drive backward over it.");
      return inZone(last(trace), world.zones[0]) ? pass("Backward and parked in the barn. Nice driving!") : notYet("Got the egg! Keep going backward into the barn.");
    },
    starter: starter("Back to the barn", "forward(10);\n", "forward(10)\n"),
  }),

  ES2(1, {
    id: "stage-warmup",
    title: "Warm-up notes",
    goal: "Warm up for the show: play 3 notes, and use at least 2 different notes.",
    hint: "Use the play note block 3 times. Pick a different note in each one.",
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 50, y: 25, heading: 90 } }),
    check(trace) {
      const n = trace.stats.notes;
      if (n.length < 3) return notYet(`${n.length} of 3 notes played. Add more play note blocks.`);
      if (new Set(n.map((x) => x.note)).size < 2) return notYet("Try at least 2 different notes.");
      return pass("Lovely warm-up. The crowd is ready!");
    },
    starter: starter("Warm-up notes", 'play("C");\n'),
  }),
  ES2(2, {
    id: "stage-clap",
    title: "Wait for the clap",
    goal: "Wait for the clap, then beep. Nothing before the clap!",
    hint: "The wait for a clap block goes first. The clap is the event that starts everything.",
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 50, y: 25, heading: 90 }, claps: [2] }),
    check(trace) {
      if (firstSoundAt(trace) < 1.99 || (trace.stats.firstMoveAt >= 0 && trace.stats.firstMoveAt < 1.99)) return notYet("The robot did something before the clap. Wait for the clap first.");
      if (firstSoundAt(trace) === Infinity) return notYet("After the clap, beep!");
      return pass("You waited for the clap. That's an event!");
    },
    starter: starter("Wait for the clap", "beep();\n"),
  }),
  ES2(3, {
    id: "stage-lights",
    title: "Clap light show",
    goal: "When you hear the clap, put on a light show: 2 light colours and 2 notes.",
    hint: "Wait for a clap, then light, play note, light, play note.",
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 50, y: 25, heading: 90 }, claps: [2.5] }),
    check(trace) {
      const clap = 2.5;
      if (trace.frames.some((f) => f.t < clap - 0.01 && f.led !== "off") || firstSoundAt(trace) < clap - 0.01) return notYet("The show started before the clap. Wait for the clap first.");
      const colours = new Set(trace.frames.filter((f) => f.t >= clap && f.led !== "off").map((f) => f.led));
      if (colours.size < 2) return notYet(`Use 2 light colours. You used ${colours.size}.`);
      if (trace.stats.notes.length < 2) return notYet("Add 2 notes to your show.");
      return pass("What a light show! It all started with a clap.");
    },
    starter: starter("Clap light show", "waitForClap();\n", "wait_for_clap()\n"),
  }),

  ES3(1, {
    id: "reef-loop",
    title: "Swim with a loop",
    goal: "Swim to the kelp forest using a repeat loop: repeat 4 times, forward 10.",
    hint: "One forward 10 block inside a repeat 4 times block.",
    world: base({ w: 120, h: 60, robot: "scout", start: { x: 12, y: 30, heading: 0 }, zones: [{ id: "kelp", x: 44, y: 15, w: 22, h: 30, colour: "green", label: "Kelp forest" }] }),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("4 times forward 10 is 40 cm. You're in the kelp forest!") : notYet("Not in the kelp forest yet. Repeat forward 10 four times.")),
    starter: starter("Swim with a loop", "forward(10);\n", "forward(10)\n"),
  }),
  ES3(2, {
    id: "reef-rock",
    title: "Stop at the rock",
    goal: "Keep swimming until the sensor sees the rock, then stop. Don't bump it!",
    hint: "Use repeat until obstacle ahead, with a small forward step inside.",
    world: base({ w: 110, h: 60, robot: "scout", start: { x: 12, y: 30, heading: 0 }, walls: [{ x: 82, y: 14, w: 14, h: 32 }] }),
    check(trace) {
      if (trace.stats.bumps > 0) return notYet("Bump! Stop when the sensor sees the rock.");
      return last(trace).sensors.obstacle ? pass("Stopped safely. Your sensor did the looking!") : notYet("Keep going until the rock is close. Use repeat until.");
    },
    starter: starter("Stop at the rock", "forward(10);\n", "forward(10)\n"),
  }),
  ES3(3, {
    id: "reef-corner",
    title: "Round the reef",
    goal: "Swim until the reef is close, turn left, then swim until the coral at the top is close. No bumps!",
    hint: "Repeat until obstacle, turn left 90, then repeat until obstacle again.",
    world: base({
      w: 130,
      h: 80,
      robot: "scout",
      start: { x: 12, y: 62, heading: 0 },
      walls: [
        { x: 105, y: 32, w: 20, h: 48 },
        { x: 0, y: 0, w: 130, h: 8 },
      ],
    }),
    check(trace) {
      const f = last(trace);
      if (trace.stats.bumps > 0) return notYet("Bump! Let the sensor tell you when to stop.");
      if (trace.stats.turned < 85) return notYet("At the reef, turn left.");
      if (!f.sensors.obstacle || f.y > 40) return notYet("Keep swimming up until the coral at the top is close.");
      return pass("Round the reef with your sensor. Great swimming!");
    },
    starter: starter("Round the reef", "forward(10);\n", "forward(10)\n"),
  }),

  ES4(1, {
    id: "snow-left",
    title: "Turn left",
    goal: "The snowman is to the robot's left. Turn left, then drive to the snowman.",
    hint: "Turn left 90 first. Then count the squares up to the snowman.",
    world: base({ w: 80, h: 80, robot: "scout", start: { x: 30, y: 65, heading: 0 }, zones: [{ id: "snowman", x: 19, y: 5, w: 22, h: 22, colour: "blue", label: "Snowman" }] }),
    check(trace, world) {
      if (trace.stats.turned < 85) return notYet("Turn left first.");
      return inZone(last(trace), world.zones[0]) ? pass("Left turn, then forward. You found the snowman!") : notYet("Turned! Now count the squares to the snowman.");
    },
    starter: starter("Turn left", "forward(10);\n", "forward(10)\n"),
  }),
  ES4(2, {
    id: "snow-right",
    title: "Turn right",
    goal: "Follow the trail: forward, then turn right at the corner, then on to the igloo.",
    hint: "Forward 40, turn right 90, forward 40.",
    world: base({
      w: 100,
      h: 80,
      robot: "scout",
      start: { x: 15, y: 15, heading: 0 },
      lines: [{ points: [{ x: 5, y: 15 }, { x: 55, y: 15 }, { x: 55, y: 55 }] }],
      zones: [{ id: "igloo", x: 43, y: 44, w: 24, h: 24, colour: "blue", label: "Igloo" }],
    }),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("Right at the corner, and home to the igloo!") : notYet("Not at the igloo yet. Which way is right for the robot?")),
    starter: starter("Turn right", "forward(40);\n", "forward(40)\n"),
  }),
  ES4(3, {
    id: "snow-zigzag",
    title: "Zig-zag trail",
    goal: "Follow the zig-zag trail: turn left at the first corner and right at the second.",
    hint: "Forward 30, turn left, forward 30, turn right, forward 30.",
    world: base({
      w: 110,
      h: 80,
      robot: "scout",
      start: { x: 15, y: 68, heading: 0 },
      lines: [{ points: [{ x: 5, y: 68 }, { x: 45, y: 68 }, { x: 45, y: 38 }, { x: 80, y: 38 }] }],
      zones: [{ id: "igloo", x: 64, y: 26, w: 26, h: 24, colour: "blue", label: "Igloo" }],
    }),
    check(trace, world) {
      if (!inZone(last(trace), world.zones[0])) return notYet("Not at the igloo yet. Left at the first corner, right at the second.");
      return trace.stats.turned >= 170 ? pass("Zig, zag, igloo! Great turning.") : notYet("Follow the trail's two corners.");
    },
    starter: starter("Zig-zag trail", "forward(30);\n", "forward(30)\n"),
  }),

  EC(1, {
    id: "paint-line",
    title: "Paint a line",
    goal: "Put the pen down and paint a long line: 5 squares.",
    hint: "Pen down first, then forward 50.",
    world: base({ w: 120, h: 80, robot: "scout", start: { x: 25, y: 40, heading: 0 } }),
    check: penCheck(45, 0, false, "A beautiful straight line. Every picture starts somewhere!"),
    starter: starter("Paint a line", "forward(50);\n", "forward(50)\n"),
  }),
  EC(2, {
    id: "paint-corner",
    title: "Paint a corner",
    goal: "Paint a corner shape: a line, a left turn, and another line.",
    hint: "Pen down, forward 30, turn left 90, forward 30.",
    world: base({ w: 120, h: 80, robot: "scout", start: { x: 30, y: 60, heading: 0 } }),
    check: penCheck(55, 85, false, "A perfect corner. Two sides of a square!"),
    starter: starter("Paint a corner", 'penDown("green");\nforward(30);\n', 'pen_down("green")\nforward(30)\n'),
  }),
  EC(3, {
    id: "paint-three-sides",
    title: "Three sides",
    goal: "Paint 3 sides of a square with a repeat loop: forward 30, turn left 90, three times.",
    hint: "Pen down, then repeat 3 times: forward 30, turn left 90.",
    world: base({ w: 120, h: 80, robot: "scout", start: { x: 40, y: 60, heading: 0 } }),
    check: penCheck(85, 265, false, "3 sides painted with a loop. One more and it's a square!"),
    starter: starter("Three sides", 'penDown("purple");\nforward(30);\n', 'pen_down("purple")\nforward(30)\n'),
  }),
];

// ============================================================ BUILDERS

const discoScene: Scene = { theme: "disco", decor: [{ kind: "discoball", x: 50, y: 7 }, { kind: "speaker", x: 8, y: 50 }, { kind: "speaker", x: 92, y: 50 }] };
const BS1 = semester("Builders", "S1", "S1 All About Me Page", ["Sequencing", "Outputs"], discoScene);
const discoWorld = () => base({ w: 100, h: 60, robot: "scout", start: { x: 50, y: 32, heading: 90 }, grid: false });

const railScene: Scene = { theme: "rail", path: "rail", decor: [{ kind: "tree", x: 20, y: 8, r: 5 }, { kind: "bush", x: 34, y: 44, r: 3 }, { kind: "station", x: 130, y: 10 }] };
const BS2 = semester("Builders", "S2", "S2 Weather Helper", ["If / else", "Light sensor"], railScene);
const track = (w: number) => [{ points: [{ x: 0, y: 25 }, { x: w, y: 25 }], width: 2 }];

const parkScene: Scene = { theme: "park", wall: "pond", follower: "puppy", decor: [{ kind: "tree", x: 92, y: 8, r: 5 }, { kind: "bench", x: 30, y: 6 }, { kind: "bush", x: 6, y: 50, r: 3 }] };
const BS3 = semester("Builders", "S3", "S3 Class Pet Care Guide", ["Loops", "Routines"], parkScene);

const gardenScene: Scene = { theme: "garden", decor: [{ kind: "hive", x: 128, y: 10 }, { kind: "bush", x: 10, y: 8, r: 4 }, { kind: "fence", x: 0, y: 47, w: 160 }] };
const BS4 = semester("Builders", "S4", "S4 Save the Bees Awareness Site", ["Sequencing", "Timing"], gardenScene);
const bloomCheck = (n: number) => (trace: Trace, world: World) => {
  const done = new Set(last(trace).done);
  const flowers = world.places.filter((p) => p.id);
  const bloomed = flowers.filter((p) => done.has(p.id!)).length;
  return bloomed === n ? pass(n === 1 ? "It bloomed! Plants need care and time." : `All ${n} flowers are blooming!`) : notYet(`${bloomed} of ${n} flowers bloomed. Stop right on each one and wait long enough.`);
};

const cityScene: Scene = {
  theme: "city",
  path: "road",
  wall: "building",
  decor: [{ kind: "lamp", x: 20, y: 10 }, { kind: "hydrant", x: 60, y: 8 }, { kind: "tree", x: 40, y: 44, r: 4 }],
  zoneIcons: { station: "station" },
};
const BC = semester("Builders", "Capstone", "Capstone Community Helper Website", ["Planning", "Sequencing"], cityScene);

export const BUILDER_LABS: Mission[] = [
  BS1(1, {
    id: "disco-name",
    title: "Name tag",
    goal: "Show your robot's name on its screen so everyone at the party knows who it is.",
    hint: "Use the show block. Type a name, like Bolt or Pixel.",
    world: discoWorld(),
    check: (trace) => (trace.frames.some((f) => f.display.trim().length >= 2) ? pass("Nice to meet you! That's your robot's name tag.") : notYet("Show your robot's name on its screen.")),
    starter: starter("Name tag", 'led("blue");\n'),
  }),
  BS1(2, {
    id: "disco-colours",
    title: "Three colours",
    goal: "Light up the dance floor with 3 different light colours.",
    hint: "Use the light block 3 times with a different colour each time. A short wait between them helps everyone see.",
    world: discoWorld(),
    check(trace) {
      const c = new Set(trace.frames.map((f) => f.led).filter((x) => x !== "off"));
      return c.size >= 3 ? pass("3 colours on the dance floor. What a show!") : notYet(`Use 3 different light colours. You used ${c.size}.`);
    },
    starter: starter("Three colours", 'led("red");\n'),
  }),
  BS1(3, {
    id: "disco-spin",
    title: "Spin both ways",
    goal: "Dance move: spin all the way round to the left, then all the way round to the right, then beep.",
    hint: "A full spin is 360. Turn left 360, turn right 360, beep.",
    world: discoWorld(),
    check(trace) {
      const { left, right } = turnSplit(trace);
      if (left < 355) return notYet(`Spin left all the way round. You turned ${Math.round(left)} degrees left.`);
      if (right < 355) return notYet(`Now spin right all the way round. You turned ${Math.round(right)} degrees right.`);
      if (trace.stats.beeps < 1) return notYet("Finish with a beep.");
      return pass("Left spin, right spin, beep. Great dance move!");
    },
    starter: starter("Spin both ways", "turnLeft(90);\n", "turn_left(90)\n"),
  }),

  BS2(1, {
    id: "train-into",
    title: "Into the tunnel",
    goal: "Drive the train into the tunnel and stop inside it. Then turn the headlight on.",
    hint: "Count the squares to the middle of the tunnel, then use the light block.",
    world: base({ w: 120, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, light: 85, lightZones: [{ x: 60, y: 0, w: 40, h: 50, level: 10, label: "Tunnel" }], lines: track(120) }),
    check(trace) {
      const f = last(trace);
      if (!(f.x > 62 && f.x < 98)) return notYet("Stop inside the tunnel.");
      return f.led !== "off" ? pass("Headlight on in the dark tunnel. Safe driving!") : notYet("It's dark in here. Turn the headlight on.");
    },
    starter: starter("Into the tunnel", "forward(10);\n", "forward(10)\n"),
  }),
  BS2(2, {
    id: "train-if",
    title: "If it's dark",
    goal: "Drive to the end of the track. If it's dark, turn the headlight on.",
    hint: "Inside a repeat: forward a little, then if it is dark, light on.",
    world: base({ w: 140, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, light: 85, lightZones: [{ x: 50, y: 0, w: 40, h: 50, level: 10, label: "Tunnel" }], lines: track(140), places: [{ x: 122, y: 6, label: "End", kind: "flag" }] }),
    check(trace) {
      if (last(trace).x < 118) return notYet("Keep driving to the end of the track.");
      const inside = trace.frames.filter((f) => f.x > 56 && f.x < 89);
      const lit = inside.filter((f) => f.led !== "off").length;
      return inside.length && lit / inside.length >= 0.9 ? pass("If it's dark, then light on. Your train checked the light!") : notYet("The headlight wasn't on in the tunnel. Check the light after each step.");
    },
    starter: starter("If it's dark", "forward(10);\n", "forward(10)\n"),
  }),
  BS2(3, {
    id: "train-night",
    title: "Night train",
    goal: "It's night-time! Headlight on in the dark, but off at the bright station platform. Drive to the end of the track.",
    hint: "If it is dark, light on; else, light off. Check after every small step.",
    world: base({ w: 160, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, light: 10, lightZones: [{ x: 60, y: 0, w: 40, h: 50, level: 90, label: "Platform" }], lines: track(160) }),
    check(trace, world) {
      if (last(trace).x < 138) return notYet("Keep driving to the end of the track.");
      return lightMatch(trace, world) >= 0.9 ? pass("Light on in the dark, off on the bright platform. Your if / else works both ways!") : notYet("Light on in the dark, off on the bright platform. Use if / else.");
    },
    starter: starter("Night train", "forward(10);\n", "forward(10)\n"),
  }),

  BS3(1, {
    id: "puppy-tree",
    title: "Walk to the tree",
    goal: "Walk the puppy to the big tree using a repeat loop: repeat 3 times, forward 20.",
    hint: "One forward 20 block inside a repeat 3 times block.",
    world: base({ w: 100, h: 60, robot: "scout", start: { x: 12, y: 30, heading: 0 }, zones: [{ id: "tree", x: 60, y: 15, w: 25, h: 30, colour: "green", label: "Big tree" }] }),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("3 times 20 is 60. The puppy loves this tree!") : notYet("Not at the tree yet. Repeat forward 20 three times.")),
    starter: starter("Walk to the tree", "forward(20);\n", "forward(20)\n"),
  }),
  BS3(2, {
    id: "puppy-square",
    title: "One lap",
    goal: "Walk the puppy once round the little pond and finish where you started.",
    hint: "A lap is 4 sides: repeat 4 times, forward 50, turn left 90.",
    world: base({ w: 90, h: 90, robot: "scout", start: { x: 15, y: 75, heading: 0 }, walls: [{ x: 28, y: 38, w: 24, h: 24 }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Splash! Go round the pond, not into it.");
      if (sweptAround(trace, { x: 40, y: 50 }) < 350) return notYet("Go all the way round the pond. Repeat the side 4 times.");
      const f = last(trace);
      return Math.hypot(f.x - world.start.x, f.y - world.start.y) <= 8 ? pass("One lap with a repeat loop. Good walk!") : notYet("Finish back where you started.");
    },
    starter: starter("One lap", "forward(50);\nturnLeft(90);\n", "forward(50)\nturn_left(90)\n"),
  }),
  BS3(3, {
    id: "puppy-stairs",
    title: "Staircase fetch",
    goal: "The ball rolled up the hill. Climb the staircase path to fetch it: up, over, up, over, 3 times.",
    hint: "Repeat 3 times: forward 20, turn left 90, forward 20, turn right 90.",
    world: base({ w: 110, h: 90, robot: "scout", start: { x: 12, y: 78, heading: 0 }, zones: [{ id: "ball", x: 62, y: 6, w: 26, h: 26, colour: "red", label: "Ball" }] }),
    check(trace, world) {
      if (!inZone(last(trace), world.zones[0])) return notYet("Not at the ball yet. Repeat the step pattern 3 times.");
      return trace.stats.turned >= 500 ? pass("Up the stairs and fetched! Loops make patterns easy.") : notYet("Follow the staircase: up, over, up, over.");
    },
    starter: starter("Staircase fetch", "forward(20);\nturnLeft(90);\n", "forward(20)\nturn_left(90)\n"),
  }),

  BS4(1, {
    id: "garden-one",
    title: "First bloom",
    goal: "Drive to the flower bud and stop on it for 1 second. Watch it bloom!",
    hint: "Forward to the bud, then wait 1.",
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, places: [{ id: "f1", x: 50, y: 25, label: "Bud", kind: "flower", hold: 1 }] }),
    check: bloomCheck(1),
    starter: starter("First bloom", "forward(40);\n", "forward(40)\n"),
  }),
  BS4(2, {
    id: "garden-two",
    title: "Two in a row",
    goal: "Two buds in a row. Stop on each one for 1 second.",
    hint: "Forward, wait 1, forward, wait 1.",
    world: base({ w: 140, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, places: [{ id: "f1", x: 45, y: 25, label: "Bud", kind: "flower", hold: 1 }, { id: "f2", x: 95, y: 25, label: "Bud", kind: "flower", hold: 1 }] }),
    check: bloomCheck(2),
    starter: starter("Two in a row", "forward(35);\nwait(1);\n", "forward(35)\nwait(1)\n"),
  }),
  BS4(3, {
    id: "garden-sunflower",
    title: "Sunflower",
    goal: "The first bud is a sunflower: it needs 3 seconds. The second bud needs 1 second.",
    hint: "Forward, wait 3, forward, wait 1.",
    world: base({ w: 140, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, places: [{ id: "f1", x: 60, y: 25, label: "Sunflower", kind: "flower", hold: 3 }, { id: "f2", x: 110, y: 25, label: "Bud", kind: "flower", hold: 1 }] }),
    check: bloomCheck(2),
    starter: starter("Sunflower", "forward(50);\nwait(1);\n", "forward(50)\nwait(1)\n"),
  }),

  BC(1, {
    id: "fire-siren",
    title: "Siren check",
    goal: "Test the fire truck before the call: flash red and blue lights and beep the siren twice.",
    hint: "Light red, beep, light blue, beep.",
    world: base({ w: 100, h: 60, robot: "scout", start: { x: 30, y: 40, heading: 0 }, zones: [{ id: "station", x: 14, y: 26, w: 32, h: 28, colour: "red", label: "Fire station" }] }),
    check(trace) {
      const c = new Set(trace.frames.map((f) => f.led));
      if (!c.has("red") || !c.has("blue")) return notYet("Flash both red and blue lights.");
      return trace.stats.beeps >= 2 ? pass("Lights and siren work. Ready for the call!") : notYet(`Beep the siren twice. You beeped ${trace.stats.beeps}.`);
    },
    starter: starter("Siren check", 'led("red");\n'),
  }),
  BC(2, {
    id: "fire-straight",
    title: "Straight to the fire",
    goal: "Beep the siren, drive along the road, stop a little before the burning building, and spray.",
    hint: "The hose reaches about 3 squares. Stop before you bump the building.",
    world: base({
      w: 150,
      h: 50,
      robot: "scout",
      start: { x: 15, y: 25, heading: 0 },
      lines: [{ points: [{ x: 4, y: 25 }, { x: 120, y: 25 }] }],
      walls: [{ x: 120, y: 8, w: 26, h: 34 }],
      targets: [{ id: "fire", x: 119, y: 25, kind: "fire" }],
    }),
    check(trace) {
      if (trace.stats.beeps === 0) return notYet("Sound the siren first: beep!");
      if (trace.stats.bumps > 0) return notYet("The truck bumped the building. Stop a little before it.");
      return trace.stats.sprayed.length ? pass("Fire out! Straight there and straight to work.") : notYet("Get within 3 squares of the fire and spray.");
    },
    starter: starter("Straight to the fire", "beep();\nforward(20);\n", "beep()\nforward(20)\n"),
  }),
  BC(3, {
    id: "fire-two",
    title: "Two fires",
    goal: "Two buildings are on fire. Put out the first one on the way, then drive on and put out the second.",
    hint: "Plan it: forward, turn to face fire 1, spray, turn back, forward, turn, forward, spray.",
    scene: { ...cityScene, decor: [{ kind: "tree", x: 80, y: 60, r: 4 }, { kind: "hydrant", x: 135, y: 76 }] },
    world: base({
      w: 150,
      h: 100,
      robot: "scout",
      start: { x: 15, y: 85, heading: 0 },
      lines: [{ points: [{ x: 4, y: 85 }, { x: 146, y: 85 }] }, { points: [{ x: 100, y: 85 }, { x: 100, y: 30 }] }],
      walls: [
        { x: 32, y: 40, w: 28, h: 22 },
        { x: 84, y: 4, w: 32, h: 23 },
      ],
      targets: [
        { id: "fire1", x: 46, y: 61, kind: "fire" },
        { id: "fire2", x: 100, y: 26, kind: "fire" },
      ],
    }),
    check(trace) {
      if (trace.stats.bumps > 0) return notYet("The truck bumped a building. Stop a little before it.");
      const n = trace.stats.sprayed.length;
      return n === 2 ? pass("Both fires out. The whole street is safe!") : notYet(`${n} of 2 fires out. Face each fire from close by, then spray.`);
    },
    starter: starter("Two fires", "forward(30);\n", "forward(30)\n"),
  }),
];

// ============================================================ DEVELOPERS

const launchScene: Scene = { theme: "launch", decor: [{ kind: "rocket", x: 100, y: 30 }, { kind: "lamp", x: 70, y: 6 }, { kind: "lamp", x: 70, y: 54 }] };
const DS1 = semester("Developers", "S1", "S1 Homework Timer & Focus Tool", ["Variables", "Functions"], launchScene);
const padWorld = () => base({ w: 140, h: 60, robot: "racer", start: { x: 58, y: 30, heading: 0 } });
const firstShown = (trace: Trace, text: string) => trace.frames.find((f) => f.display === text)?.t ?? Infinity;

const beachScene = (friendX: number): Scene => ({ theme: "beach", decor: [{ kind: "friend", x: friendX + 4, y: 30 }, { kind: "umbrella", x: 150, y: 12 }, { kind: "palm", x: 6, y: 52 }] });
const DS2 = semester("Developers", "S2", "S2 Healthy Snack Calculator", ["Operators", "Input and output"], beachScene(110));
const TOSS_FROM = 22;
const towels = (sizes: number[], colours: Zone["colour"][] = ["pink", "blue", "yellow", "green"]): Zone[] => {
  let x = TOSS_FROM;
  return sizes.map((w, i) => {
    const z: Zone = { x, y: 20, w, h: 20, colour: colours[i % colours.length] };
    x += w;
    return z;
  });
};
function tossLab(n: number, id: string, title: string, goal: string, hint: string, d: number, mustPrint: boolean, zones: Zone[], starterJs: string, starterPy: string): Mission {
  const target = TOSS_FROM + d;
  return DS2(n, {
    id,
    title,
    goal,
    hint,
    scene: beachScene(target),
    world: base({ w: Math.max(170, target + 30), h: 60, robot: "racer", start: { x: 15, y: 30, heading: 0 }, grid: false, zones }),
    check(trace) {
      if (mustPrint && !trace.log.some((l) => numbersIn(l.text).includes(d))) return notYet("Print the distance you calculated, so you can check it.");
      if (trace.stats.firstMoveAt >= 0) return notYet("No need to drive: toss from where you are.");
      const t = trace.stats.tosses[trace.stats.tosses.length - 1];
      if (!t) return notYet("Now toss() the snack.");
      const off = Math.abs(t.x - target);
      return off <= 4 ? pass(`${d} cm. Caught it!`) : notYet(`The snack landed ${Math.round(off)} cm ${t.x < target ? "short" : "too far"}. Check your maths.`);
    },
    starter: starter(title, starterJs, starterPy),
  });
}

const marsScene: Scene = { theme: "mars", wall: "canyon", decor: [{ kind: "crater", x: 40, y: 10, r: 6 }, { kind: "rock", x: 75, y: 42, r: 3 }] };
const DS3 = semester("Developers", "S3", "S3 Fact or Fake? Media-Literacy Quiz", ["if / else", "Checking data"], marsScene);
const marsWorld = (noise = 0) => base({ w: 200, h: 50, robot: "racer", start: { x: 15, y: 25, heading: 0 }, walls: [{ x: 172, y: 0, w: 28, h: 50 }], distanceNoise: noise });
const stopBetween = (lo: number, hi: number, praise: string) => (trace: Trace) => {
  const d = last(trace).sensors.distance;
  if (trace.stats.bumps > 0) return notYet("Bump. The rover touched the canyon wall.");
  if (d > hi) return notYet(`Stopped ${d} cm away. That's too far: aim for ${lo} to ${hi} cm.`);
  if (d < lo) return notYet(`Stopped ${d} cm away. That's too close: aim for ${lo} to ${hi} cm.`);
  return pass(praise.replace("{d}", String(d)));
};

const mineScene: Scene = { theme: "mine", wall: "rockface", decor: [{ kind: "crystal", x: 12, y: 10, colour: "#7E57C2" }, { kind: "lamp", x: 40, y: 8 }], zoneIcons: { cart: "crate" } };
const DS4 = semester("Developers", "S4", "S4 Budget Buddy", ["Arrays", "Loops", "Budget math"], mineScene);
const routeStarter = starter(
  "Route",
  `const route = [["forward", 10]];\nlet cost = 0;\nfor (const [move, amount] of route) {\n  if (move === "forward") { forward(amount); cost += amount; }\n  if (move === "left") turnLeft(amount);\n  if (move === "right") turnRight(amount);\n}\nconsole.log("Cost:", cost);\n`,
  `route = [("forward", 10)]\ncost = 0\nfor move, amount in route:\n    if move == "forward":\n        forward(amount)\n        cost += amount\n    elif move == "left":\n        turn_left(amount)\n    elif move == "right":\n        turn_right(amount)\nprint("Cost:", cost)\n`,
);
function mineCheck(gems: number, opts: { cart?: boolean; budget?: number; print?: boolean }) {
  return (trace: Trace, world: World) => {
    const got = trace.stats.collected.length;
    const used = Math.round(trace.stats.distance);
    if (got < gems) return notYet(`${got} of ${gems} crystals collected.`);
    if (opts.cart && !inZone(last(trace), world.zones[0])) return notYet("All the crystals! Now park at the mine cart.");
    if (opts.budget && used > opts.budget) return notYet(`You drove ${used} cm. The battery lasts ${opts.budget} cm. Find a shorter route.`);
    if (opts.print && !trace.log.some((l) => numbersIn(l.text).some((n) => Math.abs(n - used) <= 1))) return notYet(`Done in ${used} cm. Now print the total cost from your loop.`);
    return pass(opts.budget ? `${gems} crystals for ${used} of ${opts.budget} cm. Under budget!` : `${gems} crystals collected. Nice route!`);
  };
}

const museumScene: Scene = { theme: "museum", wall: "gallery", decor: [{ kind: "statue", x: 30, y: 44 }] };
const DC = semester("Developers", "Capstone", "Capstone Problem-Solver App", ["Sensors", "if / else", "Loops"], museumScene);
const corridor = (extra: Partial<World> = {}) => base({ w: 170, h: 50, robot: "racer", start: { x: 12, y: 25, heading: 0 }, light: 85, walls: [{ x: 0, y: 0, w: 170, h: 6 }, { x: 156, y: 6, w: 14, h: 44 }], ...extra });

export const DEVELOPER_LABS: Mission[] = [
  DS1(1, {
    id: "rocket-crew",
    title: "Crew screen",
    goal: "Mission control needs the crew count. Store 4 in a variable called crew and show it on the robot's screen.",
    hint: "let crew = 4; then display(crew).",
    world: padWorld(),
    check: (trace) => (trace.frames.some((f) => f.display === "4") ? pass("crew holds 4 and the screen shows it. That's a variable!") : notYet("Show the crew count, 4, on the screen.")),
    starter: starter("Crew screen", "let crew = 0;\ndisplay(crew);\n", "crew = 0\ndisplay(crew)\n"),
  }),
  DS1(2, {
    id: "rocket-countup",
    title: "Count up",
    goal: "Systems check: show 1, 2, 3 on the screen, one number per second. Use a variable that goes up by 1.",
    hint: "let n = 1; then in a loop: display(n), wait(1), n = n + 1.",
    world: padWorld(),
    check(trace) {
      const t = ["1", "2", "3"].map((n) => firstShown(trace, n));
      if (t.some((x) => x === Infinity)) return notYet("Show 1, 2 and 3 on the screen.");
      if (t[1] - t[0] < 0.9 || t[2] - t[1] < 0.9) return notYet("Wait 1 second on each number.");
      return pass("1, 2, 3, one per second. Systems checked!");
    },
    starter: starter("Count up", "let n = 1;\ndisplay(n);\n", "n = 1\ndisplay(n)\n"),
  }),
  DS1(3, {
    id: "rocket-blink",
    title: "Blink function",
    goal: "Write a function called blink that turns the light red, waits half a second, and turns it off. Call it 3 times.",
    hint: 'function blink() { led("red"); wait(0.5); led("off"); wait(0.5); } then call blink() 3 times.',
    world: padWorld(),
    check(trace) {
      let blinks = 0;
      for (let i = 1; i < trace.frames.length; i++) if (trace.frames[i].led === "red" && trace.frames[i - 1].led !== "red") blinks++;
      return blinks >= 3 ? pass("Blink, blink, blink. One function, called 3 times!") : notYet(`${blinks} of 3 red blinks. Call your function 3 times.`);
    },
    starter: starter("Blink function", 'led("red");\n'),
  }),
  DS1(4, {
    id: "rocket-three",
    title: "Short countdown",
    goal: "A practice launch: count down 3, 2, 1 on the screen, one number per second, then launch().",
    hint: "let time = 3; while (time > 0) { display(time); wait(1); time = time - 1; } then launch().",
    world: padWorld(),
    check(trace) {
      const at = trace.stats.launches[0] ?? Infinity;
      const t = ["3", "2", "1"].map((n) => firstShown(trace, n));
      if (t.some((x) => x > at || x === Infinity)) return notYet("Show 3, 2 and 1 before the launch.");
      if (at === Infinity) return notYet("Countdown done! Now call launch().");
      if (at - t[0] < 2.9) return notYet("Wait 1 second on each number.");
      return pass("3, 2, 1, liftoff!");
    },
    starter: starter("Short countdown", "let time = 3;\ndisplay(time);\n", "time = 3\ndisplay(time)\n"),
  }),
  DS1(5, {
    id: "rocket-fuel",
    title: "Fuel check",
    goal: "The rocket has 100 litres of fuel. Write burn(): take away 25, show the fuel, wait 1. Call it until the fuel is 0, then launch().",
    hint: "let fuel = 100; function burn() { fuel = fuel - 25; display(fuel); wait(1); } while (fuel > 0) burn();",
    world: padWorld(),
    check(trace) {
      const at = trace.stats.launches[0] ?? Infinity;
      const t = ["75", "50", "25", "0"].map((n) => firstShown(trace, n));
      if (t.some((x) => x === Infinity)) return notYet("Show 75, 50, 25 and 0 as the fuel burns.");
      if (!(t[0] < t[1] && t[1] < t[2] && t[2] < t[3])) return notYet("The fuel should go down: 75, 50, 25, 0.");
      if (at === Infinity || at < t[3]) return notYet("Fuel at 0? Now launch().");
      return pass("100 litres burned in 4 steps, then liftoff!");
    },
    starter: starter("Fuel check", "let fuel = 100;\ndisplay(fuel);\n", "fuel = 100\ndisplay(fuel)\n"),
  }),

  tossLab(1, "toss-50", "Toss practice", "Your friend is 50 cm away. toss() the snack so it lands in their hands.", "toss(50) throws the snack 50 cm. The robot doesn't need to move.", 50, false, towels([50], ["pink"]), "toss(20);\n", "toss(20)\n"),
  tossLab(2, "toss-add", "Add it up", "Your friend is past a 30 cm towel and a 25 cm towel. Add them in your code, print the total, then toss() it.", "const d = 30 + 25; console.log(d); toss(d);", 55, true, towels([30, 25]), "const d = 30;\n", "d = 30\n"),
  tossLab(3, "toss-multiply", "Multiply", "2 towels, each 30 cm long. Multiply in your code, print it, then toss().", "Use variables: towels = 2, length = 30. distance = towels * length.", 60, true, towels([30, 30]), "const towels = 2;\n", "towels = 2\n"),
  tossLab(4, "toss-divide", "Halfway", "The beach mat is 140 cm long and your friend sits halfway along it. Divide in your code, print it, then toss().", "halfway = 140 / 2", 70, true, [{ x: TOSS_FROM, y: 20, w: 140, h: 20, colour: "blue" }], "const mat = 140;\n", "mat = 140\n"),
  tossLab(5, "toss-change", "Change the numbers", "Now there are 3 towels of 25 cm. Change your variables, print the distance, then toss().", "Only the numbers change; the code stays the same. That's why we use variables.", 75, true, towels([25, 25, 25]), "const towels = 3;\n", "towels = 3\n"),

  DS3(1, {
    id: "mars-read",
    title: "Read the sensor",
    goal: "Before driving, check the sensor: print distance() 3 times. Don't move yet.",
    hint: "console.log(distance()); three times, or in a loop.",
    world: marsWorld(),
    check(trace) {
      if (trace.stats.firstMoveAt >= 0) return notYet("Don't move yet. Just read the sensor.");
      const n = trace.log.filter((l) => numbersIn(l.text).length > 0).length;
      return n >= 3 ? pass("3 readings printed. Now you know what the rover sees.") : notYet(`${n} of 3 readings printed.`);
    },
    starter: starter("Read the sensor", "console.log(distance());\n", "print(distance())\n"),
  }),
  DS3(2, {
    id: "mars-bool",
    title: "True or false",
    goal: "obstacle() is true or false. Keep driving while it is false, then stop before the canyon wall.",
    hint: "while (!obstacle()) { forward(2); }",
    world: marsWorld(),
    check(trace) {
      if (trace.stats.bumps > 0) return notYet("Bump. Check obstacle() before every step.");
      return last(trace).sensors.obstacle ? pass("Stopped when obstacle() turned true. That's a boolean!") : notYet("Keep going until obstacle() is true.");
    },
    starter: starter("True or false", "console.log(obstacle());\n", "print(obstacle())\n"),
  }),
  DS3(3, {
    id: "mars-30",
    title: "Stop at 30",
    goal: "Stop the rover between 25 and 35 cm from the canyon wall.",
    hint: "while (distance() > 30) { forward(2); }",
    world: marsWorld(),
    check: stopBetween(25, 35, "Stopped {d} cm from the wall. Right on target."),
    starter: starter("Stop at 30", "forward(10);\n", "forward(10)\n"),
  }),
  DS3(4, {
    id: "mars-wobble",
    title: "Dust storm",
    goal: "A dust storm makes the sensor wobble by a few cm. Stop between 10 and 25 cm from the wall without touching it.",
    hint: "One reading can be wrong. Take three readings and use the smallest before you decide.",
    world: marsWorld(4),
    check: stopBetween(10, 25, "Stopped {d} cm from the wall, even in a dust storm. Checked, not guessed."),
    starter: starter("Dust storm", "console.log(distance());\n", "print(distance())\n"),
  }),
  DS3(5, {
    id: "mars-rock",
    title: "Rock in the way",
    goal: "A big rock blocks the way to the base. Drive until the sensor sees it, go round it, and park at the base.",
    hint: "while (!obstacle()) forward(2); then turnRight(90), forward, turnLeft(90), forward to the base.",
    world: base({
      w: 200,
      h: 80,
      robot: "racer",
      start: { x: 15, y: 20, heading: 0 },
      walls: [{ x: 100, y: 0, w: 20, h: 38 }],
      zones: [{ id: "base", x: 150, y: 48, w: 44, h: 28, colour: "blue", label: "Base" }],
    }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Let the sensor tell you when the rock is close.");
      return inZone(last(trace), world.zones[0]) ? pass("Round the rock and safe at the base. Smart rover!") : notYet("Not at the base yet.");
    },
    starter: starter("Rock in the way", "forward(10);\n", "forward(10)\n"),
  }),

  DS4(1, {
    id: "mine-array",
    title: "Route array",
    goal: "Store your route as an array of distances, loop through it to drive, collect both crystals and park at the cart.",
    hint: "const route = [40, 50, 25]; for (const d of route) forward(d);",
    world: base({ w: 160, h: 50, robot: "racer", start: { x: 20, y: 25, heading: 0 }, collectibles: [{ id: "g1", x: 60, y: 25, kind: "gem" }, { id: "g2", x: 110, y: 25, kind: "gem" }], zones: [{ id: "cart", x: 125, y: 10, w: 30, h: 30, colour: "orange", label: "Mine cart" }] }),
    check: mineCheck(2, { cart: true }),
    starter: starter("Route array", "const route = [10];\nfor (const d of route) { forward(d); }\n", "route = [10]\nfor d in route:\n    forward(d)\n"),
  }),
  DS4(2, {
    id: "mine-turns",
    title: "Moves and turns",
    goal: "The second crystal is round a corner. Store moves and turns in your route array and loop through it.",
    hint: 'Each step is ["forward", 50] or ["left", 90].',
    world: base({ w: 140, h: 100, robot: "racer", start: { x: 20, y: 85, heading: 0 }, collectibles: [{ id: "g1", x: 70, y: 85, kind: "gem" }, { id: "g2", x: 70, y: 40, kind: "gem" }], zones: [{ id: "cart", x: 55, y: 4, w: 30, h: 26, colour: "orange", label: "Mine cart" }] }),
    check: mineCheck(2, { cart: true }),
    starter: routeStarter,
  }),
  DS4(3, {
    id: "mine-cost",
    title: "Count the cost",
    goal: "Every centimetre uses battery. Collect the crystal, park at the cart, and print the total cost of your route.",
    hint: "Add up each forward amount in a cost variable inside the loop, then console.log it.",
    world: base({ w: 160, h: 50, robot: "racer", start: { x: 20, y: 25, heading: 0 }, collectibles: [{ id: "g1", x: 90, y: 25, kind: "gem" }], zones: [{ id: "cart", x: 120, y: 10, w: 30, h: 30, colour: "orange", label: "Mine cart" }] }),
    check: mineCheck(1, { cart: true, print: true }),
    starter: routeStarter,
  }),
  DS4(4, {
    id: "mine-budget",
    title: "Battery budget",
    goal: "A rock wall is in the way. Find a route to the crystal and the cart that uses no more than 175 cm of battery.",
    hint: "Go up first, then across. Add up your route before you drive it.",
    world: base({
      w: 150,
      h: 110,
      robot: "racer",
      start: { x: 20, y: 90, heading: 0 },
      walls: [{ x: 48, y: 44, w: 22, h: 66 }],
      collectibles: [{ id: "g1", x: 100, y: 30, kind: "gem" }],
      zones: [{ id: "cart", x: 116, y: 15, w: 30, h: 30, colour: "orange", label: "Mine cart" }],
    }),
    check: mineCheck(1, { cart: true, budget: 175 }),
    starter: routeStarter,
  }),
  DS4(5, {
    id: "mine-square",
    title: "Loop the loop",
    goal: "4 crystals sit round a square tunnel. Drive the square with a loop, collect all 4 and print the cost.",
    hint: "for (let i = 0; i < 4; i++) { forward(50); turnLeft(90); cost += 50; }",
    world: base({
      w: 110,
      h: 110,
      robot: "racer",
      start: { x: 25, y: 85, heading: 0 },
      walls: [{ x: 38, y: 48, w: 24, h: 24 }],
      collectibles: [
        { id: "g1", x: 50, y: 85, kind: "gem" },
        { id: "g2", x: 75, y: 60, kind: "gem" },
        { id: "g3", x: 50, y: 35, kind: "gem" },
        { id: "g4", x: 25, y: 60, kind: "gem" },
      ],
    }),
    check: mineCheck(4, { print: true }),
    starter: routeStarter,
  }),

  DC(1, {
    id: "museum-wall",
    title: "Find the wall",
    goal: "The night guard robot's first job: drive down the hall and stop before the end wall without touching it.",
    hint: "while (!obstacle()) { forward(2); }",
    world: corridor(),
    check(trace) {
      if (trace.stats.bumps > 0) return notYet("Bump! Check obstacle() before every step.");
      return last(trace).sensors.obstacle ? pass("Stopped at the wall. The guard robot can sense!") : notYet("Keep going until the wall is close.");
    },
    starter: starter("Find the wall", "forward(10);\n", "forward(10)\n"),
  }),
  DC(2, {
    id: "museum-light",
    title: "Light the way",
    goal: "One gallery is dark. Light the way in the dark and switch off where it's bright. Stop before the end wall.",
    hint: "In your loop: if (light() < 30) led on, else led off. Then check obstacle().",
    world: corridor({ lightZones: [{ x: 60, y: 0, w: 50, h: 50, level: 12, label: "Dark gallery" }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Stop before the wall.");
      if (!last(trace).sensors.obstacle) return notYet("Keep going until the wall is close.");
      return lightMatch(trace, world) >= 0.85 ? pass("Light on in the dark, off in the bright. Visitors can see the art!") : notYet("Light on in the dark gallery, off where it's bright.");
    },
    starter: starter("Light the way", "forward(10);\n", "forward(10)\n"),
  }),
  DC(3, {
    id: "museum-photo",
    title: "Photo spot",
    goal: "Drive down the hall. When the floor under the robot is yellow (the photo spot), take a photo(). Stop before the end wall.",
    hint: 'In your loop: if (colour() === "yellow" && !taken) { photo(); taken = true; }',
    world: corridor({ zones: [{ id: "spot", x: 86, y: 6, w: 22, h: 44, colour: "yellow", label: "Photo spot" }] }),
    check(trace, world) {
      const spot = world.zones[0];
      if (trace.stats.bumps > 0) return notYet("Bump! Stop before the wall.");
      const inSpot = trace.stats.photos.some((t) => {
        const f = trace.frames.find((fr) => fr.t >= t);
        return f && inZone(f, spot);
      });
      if (!inSpot) return notYet("Take a photo() while the robot is on the yellow photo spot.");
      return last(trace).sensors.obstacle ? pass("Photo taken on the spot, and stopped safely.") : notYet("Photo taken! Now keep going until the wall is close.");
    },
    starter: starter("Photo spot", "forward(10);\n", "forward(10)\n"),
  }),
  DC(4, {
    id: "museum-corner",
    title: "Turn at the corner",
    goal: "The hall turns left. If a wall is ahead, turn left; else step forward. Reach the Masterpiece room.",
    hint: "Count your turns. After 1 turn, the next wall means you've arrived.",
    world: base({ w: 160, h: 110, robot: "racer", start: { x: 15, y: 95, heading: 0 }, light: 85, walls: [{ x: 0, y: 0, w: 120, h: 75 }], zones: [{ id: "exit", x: 122, y: 0, w: 38, h: 28, colour: "yellow", label: "Masterpiece room" }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Turn before you touch a wall.");
      return inZone(last(trace), world.zones[0]) ? pass("Round the corner to the masterpiece. Your sensor led the way!") : notYet("Keep going: if a wall is ahead, turn left.");
    },
    starter: starter("Turn at the corner", "forward(10);\n", "forward(10)\n"),
  }),
  DC(5, {
    id: "museum-u",
    title: "Two corners",
    goal: "This hall has two left turns. Use the same loop to reach the Sculpture room at the top left.",
    hint: "Count turns. After 2 turns, the next wall means you've arrived.",
    world: base({ w: 160, h: 110, robot: "racer", start: { x: 15, y: 95, heading: 0 }, light: 85, walls: [{ x: 0, y: 30, w: 125, h: 50 }], zones: [{ id: "room", x: 0, y: 0, w: 40, h: 30, colour: "purple", label: "Sculpture room" }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Turn before you touch a wall.");
      return inZone(last(trace), world.zones[0]) ? pass("Two corners, one loop. The guard robot knows the way!") : notYet("Keep going: two left turns to the Sculpture room.");
    },
    starter: starter("Two corners", "forward(10);\n", "forward(10)\n"),
  }),
];

// ============================================================ ENGINEERS

const coveScene: Scene = { theme: "cove", decor: [{ kind: "ship", x: 20, y: 8 }, { kind: "barrel", x: 46, y: 60 }, { kind: "palm", x: 66, y: 8 }] };
const GS1 = semester("Engineers", "S1", "S1 Password Strength Checker", ["Functions", "if / elif / else", "Cybersecurity"], coveScene);
const vaultWorld = (codes: string[]) =>
  base({
    w: 140,
    h: 70,
    robot: "rover",
    start: { x: 20, y: 35, heading: 0 },
    codes,
    doors: [{ x: 82, y: 4, w: 7, h: 62 }],
    walls: [
      { x: 82, y: 0, w: 58, h: 4 },
      { x: 82, y: 66, w: 58, h: 4 },
    ],
    collectibles: [{ id: "treasure", x: 118, y: 35, kind: "treasure" }],
  });
const vaultCheck = (strongAt: number) => (trace: Trace) => {
  const reads = trace.stats.codeReads;
  const un = trace.stats.unlocks;
  if (un.some((u) => u.codesRead < strongAt)) return notYet("The vault opened for a weak passcode! Only unlock() after the right one.");
  if (reads.length < strongAt) return notYet(`You read ${reads.length} of ${strongAt} passcodes. Use next_code() in a loop.`);
  if (trace.sounds.filter((s) => s.kind === "beep" && s.t < reads[strongAt - 1]).length < strongAt - 1) return notYet("Beep once for each passcode you reject.");
  if (!un.length) return notYet("That passcode passes the rule. unlock() the vault.");
  if (!trace.stats.collected.length) return notYet("The vault is open. Drive in and grab the treasure.");
  return pass("Weak passcodes rejected, the right one accepted, treasure safe.");
};
const vaultStarter = starter("Vault", "const code = nextCode();\nconsole.log(code);\n", "code = next_code()\nprint(code)\n");

const factoryScene: Scene = { theme: "factory", decor: [{ kind: "conveyor", x: 22, y: 6, h: 88 }], zoneIcons: { apples: "crate", oranges: "crate", bananas: "crate", check: "crate", a: "star", b: "star", c: "star" } };
const GS2 = semester("Engineers", "S2", "S2 Smart Sorting AI", ["Dictionaries", "Functions", "Classifying"], factoryScene);
const crates: Zone[] = [
  { id: "apples", x: 120, y: 5, w: 35, h: 28, colour: "red", label: "Apples" },
  { id: "oranges", x: 120, y: 36, w: 35, h: 28, colour: "orange", label: "Oranges" },
  { id: "bananas", x: 120, y: 67, w: 35, h: 28, colour: "yellow", label: "Bananas" },
];
const sortCheck = (zoneFor: Record<string, string>) => (trace: Trace, world: World) => {
  let right = 0;
  for (const it of world.items) {
    const z = world.zones.find((s) => s.id === zoneFor[it.colour])!;
    if (inZone(itemAt(trace, world, it.id), z)) right++;
  }
  const n = world.items.length;
  return right === n ? pass(`All ${n} fruit${n === 1 ? "" : "s"} in the right crate.`) : notYet(`${right} of ${n} in the right crate.`);
};
const factoryWorld = (items: World["items"], zones: Zone[] = crates) => base({ w: 160, h: 100, robot: "rover", start: { x: 70, y: 50, heading: 180 }, items, zones });

const stationScene: Scene = { theme: "station", decor: [{ kind: "window", x: 60, y: 2, w: 40 }, { kind: "console", x: 108, y: 70 }], zoneIcons: { lab: "lab" } };
const GS3 = semester("Engineers", "S3", "S3 Chatbot for Good", ["Dictionaries", "Intents", "AI ethics"], stationScene);
const stationWorld = (messages: string[], zones: Zone[] = []) => base({ w: 120, h: 80, robot: "rover", start: { x: 20, y: 70, heading: 0 }, messages, zones });
const chatStarter = starter("Chat", "const message = nextMessage();\nconsole.log(message);\n", "message = next_message()\nprint(message)\n");

const volcanoScene: Scene = { theme: "volcano", decor: [{ kind: "lava", x: 100, y: 6, r: 6 }, { kind: "rock", x: 60, y: 50, r: 3 }] };
const GS4 = semester("Engineers", "S4", "S4 Data Detective", ["Lists", "Statistics", "Data"], volcanoScene);
const lavaWorld = () =>
  base({
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
  });
const temps = (trace: Trace) => trace.data.filter((d) => typeof d.value === "number").map((d) => d.value as number);
const tempStarter = starter("Survey", 'record("temp", temperature());\n', 'record("temp", temperature())\n');

const solarScene: Scene = { theme: "solar", decor: [{ kind: "turbine", x: 160, y: 48 }, { kind: "bush", x: 100, y: 48, r: 3 }] };
const GC = semester("Engineers", "Capstone", "Capstone Innovation Challenge", ["Design thinking", "Data", "Sustainability"], solarScene);
const solarWorld = (panels: { x: number; y: number }[], extra: Partial<World> = {}) =>
  base({ w: 170, h: 100, robot: "rover", start: { x: 15, y: 20, heading: 0 }, collectibles: panels.map((p, i) => ({ id: `p${i + 1}`, ...p, kind: "panel" as const })), ...extra });
const powerData = (trace: Trace) => trace.data.filter((d) => /power/i.test(d.name) && typeof d.value === "number").map((d) => d.value as number);
const solarStarter = starter("Solar", 'record("power", power());\n', 'record("power", power())\n');

export const ENGINEER_LABS: Mission[] = [
  GS1(1, {
    id: "vault-read",
    title: "Read a code",
    goal: "A pirate types a passcode. Read it with next_code() and print how many characters it has.",
    hint: "code = next_code() then print(len(code)).",
    world: vaultWorld(["1234"]),
    check: (trace) => (trace.stats.codeReads.length && trace.log.some((l) => numbersIn(l.text).includes(4)) ? pass("4 characters. len() measures a passcode.") : notYet("Read the code and print its length with len().")),
    starter: vaultStarter,
  }),
  GS1(2, {
    id: "vault-length",
    title: "Long enough?",
    goal: "Rule 1: a passcode needs 12 or more characters. Beep to reject a short one; unlock() for a long one, then grab the treasure.",
    hint: "if len(code) >= 12: unlock() ... else: beep(). Read the next code in a loop.",
    world: vaultWorld(["sunny", "treasure-map-key"]),
    check: vaultCheck(2),
    starter: vaultStarter,
  }),
  GS1(3, {
    id: "vault-digit",
    title: "Has a number?",
    goal: "New rule: 12 or more characters AND at least one number. Reject the rest with a beep, unlock() for the first one that passes.",
    hint: "any(ch.isdigit() for ch in code) is True if the code has a number.",
    world: vaultWorld(["seashell5", "seashells-and-sand", "seashells-and-sand5"]),
    check: vaultCheck(3),
    starter: vaultStarter,
  }),
  GS1(4, {
    id: "vault-strong",
    title: "is_strong()",
    goal: "Write is_strong(code): 12+ characters with a letter, a number and a symbol. Beep for weak codes, unlock() for the strong one.",
    hint: "Combine your checks with and. Test it on each code before you unlock.",
    world: vaultWorld(["Password1", "pass word!", "Sky-Rover-2027!"]),
    check: vaultCheck(3),
    starter: vaultStarter,
  }),
  GS1(5, {
    id: "vault-lockout",
    title: "Lockout",
    goal: "Too many wrong tries means someone is guessing. After 3 weak passcodes in a row, show \"Locked\" and never unlock, even if a strong code comes next.",
    hint: "Count the weak codes. When the count reaches 3, display(\"Locked\") and break.",
    world: vaultWorld(["1111", "abc", "qwerty", "Golden-Key-2027!"]),
    check(trace) {
      if (trace.stats.unlocks.length) return notYet("The vault opened after 3 wrong tries. A lockout must stop that.");
      if (trace.stats.codeReads.length < 3) return notYet("Read the passcodes with next_code().");
      if (trace.stats.beeps < 3) return notYet("Beep for each weak passcode.");
      return trace.frames.some((f) => /lock/i.test(f.display)) ? pass("3 wrong tries and the vault locked itself. That stops guessing attacks.") : notYet('Show "Locked" on the screen after 3 wrong tries.');
    },
    starter: vaultStarter,
  }),

  GS2(1, {
    id: "fruit-read",
    title: "Read the colour",
    goal: "A fruit sits in front of the robot. Read its colour with item_colour() and print it.",
    hint: "print(item_colour())",
    world: base({ w: 100, h: 100, robot: "rover", start: { x: 52, y: 50, heading: 180 }, items: [{ id: "f1", x: 41, y: 50, colour: "red", kind: "fruit" }] }),
    check: (trace) => (trace.log.some((l) => /red/.test(l.text)) ? pass("red: that's data the robot can sort by.") : notYet("Print item_colour() to see the fruit's colour.")),
    starter: starter("Read the colour", "forward(5);\n", "forward(5)\n"),
  }),
  GS2(2, {
    id: "fruit-one",
    title: "Crate lookup",
    goal: "Pick up the fruit, look up its crate in a dictionary, and drop it there.",
    hint: 'crate_y = {"red": 19, "orange": 50, "yellow": 81}. Then drive to that row and drop.',
    world: factoryWorld([{ id: "b1", x: 30, y: 50, colour: "red", kind: "fruit" }]),
    check: sortCheck({ red: "apples", orange: "oranges", yellow: "bananas" }),
    starter: starter("Crate lookup", "console.log(itemColour());\n", "print(item_colour())\n"),
  }),
  GS2(3, {
    id: "fruit-goto",
    title: "go_to()",
    goal: "Write go_to(x, y) and use it to visit the checkpoints A, B and C, in that order.",
    hint: "Keep track of x, y and the heading. Turn to face the target, then drive the distance (math.hypot).",
    world: factoryWorld([], [
      { id: "a", x: 20, y: 8, w: 22, h: 22, colour: "blue", label: "A" },
      { id: "b", x: 120, y: 8, w: 22, h: 22, colour: "green", label: "B" },
      { id: "c", x: 120, y: 70, w: 22, h: 22, colour: "purple", label: "C" },
    ]),
    check(trace, world) {
      const order: string[] = [];
      for (const f of trace.frames) for (const z of world.zones) if (inZone(f, z) && order[order.length - 1] !== z.id) order.push(z.id!);
      const seq = order.filter((id, i) => order.indexOf(id) === i);
      if (seq.length < 3) return notYet(`${seq.length} of 3 checkpoints visited.`);
      return seq.join("") === "abc" ? pass("A, B, C in order. Your go_to() works!") : notYet("Visit them in order: A, then B, then C.");
    },
    starter: starter("go_to()", "forward(10);\n", "forward(10)\n"),
  }),
  GS2(4, {
    id: "fruit-two",
    title: "Two fruits",
    goal: "Two fruits on the conveyor. Use your go_to() and your dictionary to pack both.",
    hint: "Loop over the rows. For each: go to the fruit, read its colour, pick up, look up the crate, deliver.",
    world: factoryWorld([
      { id: "b1", x: 30, y: 19, colour: "yellow", kind: "fruit" },
      { id: "b2", x: 30, y: 81, colour: "orange", kind: "fruit" },
    ]),
    check: sortCheck({ red: "apples", orange: "oranges", yellow: "bananas" }),
    starter: starter("Two fruits", "console.log(itemColour());\n", "print(item_colour())\n"),
  }),
  GS2(5, {
    id: "fruit-unknown",
    title: "Unknown fruit",
    goal: "A purple fruit isn't in your dictionary. Anything the robot doesn't know goes to the Check crate for a person to look at.",
    hint: 'crate.get(colour, "check") gives a default when the colour is missing.',
    world: factoryWorld(
      [
        { id: "b1", x: 30, y: 19, colour: "red", kind: "fruit" },
        { id: "b2", x: 30, y: 50, colour: "purple", kind: "fruit" },
      ],
      [crates[0], { id: "check", x: 120, y: 36, w: 35, h: 28, colour: "grey", label: "Check" }],
    ),
    check: sortCheck({ red: "apples", purple: "check" }),
    starter: starter("Unknown fruit", "console.log(itemColour());\n", "print(item_colour())\n"),
  }),

  GS3(1, {
    id: "chat-read",
    title: "Read messages",
    goal: "An astronaut sends 3 messages. Read each with next_message() and print it. An empty message means the chat is over.",
    hint: 'while message != "": print(message); message = next_message()',
    world: stationWorld(["hello robot", "how are you", "bye"]),
    check(trace) {
      const got = ["hello robot", "how are you", "bye"].filter((m) => trace.log.some((l) => l.text.includes(m))).length;
      return got === 3 ? pass("All 3 messages read and printed.") : notYet(`${got} of 3 messages printed. Use a loop.`);
    },
    starter: chatStarter,
  }),
  GS3(2, {
    id: "chat-split",
    title: "Split it",
    goal: 'Messages like "forward 30" have a word and a number. Split them and drive that far.',
    hint: "word, num = message.split() then forward(int(num)).",
    world: stationWorld(["forward 30", "forward 20"]),
    check: (trace) => (Math.abs(trace.stats.distance - 50) <= 1 ? pass("30 + 20 = 50 cm. You split the messages correctly.") : notYet(`You drove ${Math.round(trace.stats.distance)} cm. The messages add up to 50.`)),
    starter: chatStarter,
  }),
  GS3(3, {
    id: "chat-dict",
    title: "Dictionary of moves",
    goal: "Use a dictionary that maps each word (forward, left, right) to a robot function. Follow the messages to the Window lab.",
    hint: 'actions = {"forward": forward, "left": turn_left, "right": turn_right}',
    world: stationWorld(["forward 40", "left 90", "forward 40"], [{ id: "lab", x: 45, y: 15, w: 30, h: 30, colour: "purple", label: "Window lab" }]),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("Words mapped to actions. That's how intents work.") : notYet("Follow the messages to reach the Window lab.")),
    starter: chatStarter,
  }),
  GS3(4, {
    id: "chat-refuse",
    title: "Polite refusal",
    goal: 'Someone asks the robot to "open the airlock". That isn\'t a move the robot knows. Show a polite refusal on the screen and carry on.',
    hint: 'If the word isn\'t in your dictionary, display("Sorry, I can\'t do that").',
    world: stationWorld(["forward 20", "open the airlock", "forward 20"]),
    check(trace) {
      const r = trace.stats.messageReads;
      if (r.length < 3) return notYet("Read all the messages.");
      if (!trace.frames.some((f) => f.t >= r[1] && f.t < r[2] && f.display)) return notYet("Show a polite refusal when you get an unknown request.");
      return Math.abs(trace.stats.distance - 40) <= 1 ? pass("Polite, safe and still helpful.") : notYet("Only the forward messages should move the robot (40 cm in total).");
    },
    starter: chatStarter,
  }),
  GS3(5, {
    id: "chat-stop",
    title: "Stop means stop",
    goal: 'When the astronaut says "stop", the robot must stop and ignore anything after it.',
    hint: 'if word == "stop": break',
    world: stationWorld(["forward 30", "stop", "forward 40"]),
    check(trace) {
      if (trace.stats.messageReads.length < 2) return notYet("Read the messages in a loop.");
      return Math.abs(trace.stats.distance - 30) <= 1 ? pass("It stopped when told. A good assistant listens.") : notYet('The robot kept going after "stop".');
    },
    starter: chatStarter,
  }),

  GS4(1, {
    id: "lava-one",
    title: "First reading",
    goal: 'Take one temperature reading at the start with record("temp", temperature()). Then open the Data tab.',
    hint: "record() saves a name and a value to the Data tab.",
    world: lavaWorld(),
    check: (trace) => (temps(trace).length >= 1 ? pass(`First reading: ${temps(trace)[0]} °C. Data is the start of every investigation.`) : notYet('Use record("temp", temperature()).')),
    starter: starter("First reading", "print(temperature());\n", "print(temperature())\n"),
  }),
  GS4(2, {
    id: "lava-five",
    title: "Five readings",
    goal: "Drive in steps of 10 cm and record the temperature after each step. Record at least 5 readings.",
    hint: 'for i in range(5): forward(10); record("temp", temperature())',
    world: lavaWorld(),
    check(trace) {
      const n = temps(trace).length;
      if (n < 5) return notYet(`${n} of 5 readings recorded.`);
      return trace.stats.distance >= 40 ? pass("5 readings along a path. That's a dataset!") : notYet("Drive between readings so they come from different places.");
    },
    starter: tempStarter,
  }),
  GS4(3, {
    id: "lava-max",
    title: "Hottest reading",
    goal: "Record at least 8 readings across the field, keep them in a list, and print the hottest one with max().",
    hint: "readings = []; readings.append(t); print(max(readings))",
    world: lavaWorld(),
    check(trace) {
      const t = temps(trace);
      if (t.length < 8) return notYet(`${t.length} of 8 readings recorded.`);
      const m = Math.max(...t);
      return trace.log.some((l) => numbersIn(l.text).includes(m)) ? pass(`Hottest: ${m} °C. You found the maximum.`) : notYet("Print the hottest reading with max().");
    },
    starter: tempStarter,
  }),
  GS4(4, {
    id: "lava-mean",
    title: "Average temperature",
    goal: "Record at least 8 readings and print the mean (the average) of your list.",
    hint: "mean = sum(readings) / len(readings)",
    world: lavaWorld(),
    check(trace) {
      const t = temps(trace);
      if (t.length < 8) return notYet(`${t.length} of 8 readings recorded.`);
      const mean = t.reduce((a, b) => a + b, 0) / t.length;
      return trace.log.some((l) => numbersIn(l.text).some((n) => Math.abs(n - mean) <= 0.6)) ? pass(`Mean: ${mean.toFixed(1)} °C.`) : notYet("Print the mean: the sum of your readings divided by how many there are.");
    },
    starter: tempStarter,
  }),
  GS4(5, {
    id: "lava-hotspot",
    title: "Find the hot spot",
    goal: "Drive until temperature() is above 150 °C, then stop and beep to warn the team.",
    hint: "while temperature() <= 150: forward(2)  then beep().",
    world: lavaWorld(),
    check(trace, world) {
      const f = last(trace);
      const hot = (world.heatZones ?? []).filter((z) => f.x >= z.x && f.x <= z.x + z.w).pop()?.temp ?? 25;
      if (hot <= 150) return notYet("Stop where the temperature is above 150 °C.");
      return trace.stats.beeps ? pass("Hot spot found and the team warned. Sensors keep explorers safe.") : notYet("Found it! Now beep to warn the team.");
    },
    starter: starter("Find the hot spot", "forward(10);\n", "forward(10)\n"),
  }),

  GC(1, {
    id: "solar-baseline",
    title: "Baseline",
    goal: 'Before you fix anything, measure it. Record the farm\'s power now with record("power", power()).',
    hint: "A baseline is the measurement before a change.",
    world: solarWorld([{ x: 45, y: 20 }, { x: 85, y: 20 }, { x: 125, y: 20 }]),
    check: (trace) => (powerData(trace).length ? pass(`Baseline: ${powerData(trace)[0]} W. Now you can prove your fix works.`) : notYet('Record power() with record("power", power()).')),
    starter: starter("Baseline", "print(power());\n", "print(power())\n"),
  }),
  GC(2, {
    id: "solar-row",
    title: "Clean a row",
    goal: "Drive along the row and clean all 3 panels.",
    hint: "The robot cleans a panel by driving over it.",
    world: solarWorld([{ x: 45, y: 20 }, { x: 85, y: 20 }, { x: 125, y: 20 }]),
    check: (trace) => (trace.stats.collected.length === 3 ? pass("Row clean. Watch the panels shine!") : notYet(`${trace.stats.collected.length} of 3 panels clean.`)),
    starter: starter("Clean a row", "forward(20);\n", "forward(20)\n"),
  }),
  GC(3, {
    id: "solar-before-after",
    title: "Before and after",
    goal: "Record power(), clean the panel, then record power() again. Your data should show the change.",
    hint: "record, forward, record.",
    world: solarWorld([{ x: 60, y: 20 }]),
    check(trace) {
      const p = powerData(trace);
      if (p.length < 2) return notYet("Record power() before and after cleaning.");
      return p[p.length - 1] > p[0] ? pass(`${p[0]} W before, ${p[p.length - 1]} W after. That's evidence.`) : notYet("Record once before cleaning and once after.");
    },
    starter: solarStarter,
  }),
  GC(4, {
    id: "solar-all",
    title: "Whole farm",
    goal: "Plan a route that cleans all 6 panels: along the top row, down, and back along the bottom row.",
    hint: "Forward, turn right, forward, turn right, forward.",
    world: solarWorld([{ x: 45, y: 20 }, { x: 85, y: 20 }, { x: 125, y: 20 }, { x: 45, y: 75 }, { x: 85, y: 75 }, { x: 125, y: 75 }]),
    check: (trace) => (trace.stats.collected.length === 6 ? pass("Every panel clean!") : notYet(`${trace.stats.collected.length} of 6 panels clean.`)),
    starter: starter("Whole farm", "forward(20);\n", "forward(20)\n"),
  }),
  GC(5, {
    id: "solar-efficient",
    title: "Efficient route",
    goal: "Clean all 6 panels in 3 rows using no more than 320 cm of driving, and print how far you drove.",
    hint: "Snake through the rows: across, down, back, down, across.",
    world: solarWorld([{ x: 50, y: 20 }, { x: 110, y: 20 }, { x: 110, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 80 }, { x: 110, y: 80 }]),
    check(trace) {
      const used = Math.round(trace.stats.distance);
      if (trace.stats.collected.length < 6) return notYet(`${trace.stats.collected.length} of 6 panels clean.`);
      if (used > 320) return notYet(`You drove ${used} cm. Find a route under 320 cm.`);
      return trace.log.some((l) => numbersIn(l.text).some((n) => Math.abs(n - used) <= 1)) ? pass(`All 6 clean in ${used} cm. Efficient!`) : notYet(`Done in ${used} cm. Print how far you drove.`);
    },
    starter: starter("Efficient route", "forward(20);\n", "forward(20)\n"),
  }),
];
