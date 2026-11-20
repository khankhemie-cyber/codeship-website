/**
 * The Robot Lab classes that lead up to each semester's challenge.
 * Explorers and Builders: labs 1 to 3 here (lab 4 is the challenge in
 * missions.ts). Developers and Engineers: labs 1 to 5 here (lab 6 is the
 * challenge). Every mission has its own place, its own character and story,
 * and its own new coding move (CEO, 2026-11-19).
 */

import type { Trace, World, Zone } from "./kit";
import { base, inZone, itemAt, last, notYet, numbersIn, pass, sweptAround, type Mission, type Program, type Semester, type Story } from "./kit";

type LabSpec = Omit<Mission, "program" | "semester" | "fits" | "skills" | "lab" | "story"> & { skills?: string[]; story: Story };

function semester(program: Program, sem: Semester, fits: string, skills: string[]) {
  return (lab: number, spec: LabSpec): Mission => ({ ...spec, program, semester: sem, fits, skills: spec.skills ?? skills, lab });
}

const starter = (title: string, js: string, py = js) => ({ js: `// ${title}\n${js}`, py: `# ${title}\n${py}` });
const blank = (title: string) => starter(title, "", "");

const firstSoundAt = (trace: Trace) => {
  const s = trace.sounds.find((x) => x.kind === "beep" || x.kind === "note");
  return s ? s.t : Infinity;
};
const arrivedAt = (trace: Trace, z: Zone) => trace.frames.find((f) => inZone(f, z))?.t ?? Infinity;

/** Share of frames where the light matches the dark (on) and bright (off) places, skipping the edges. */
function lightMatch(trace: Trace, world: World, onlyDark = false) {
  let good = 0;
  let counted = 0;
  for (const f of trace.frames) {
    let level = world.light;
    let edge = false;
    for (const z of world.lightZones) {
      const inside = f.x >= z.x && f.x <= z.x + z.w && f.y >= z.y && f.y <= z.y + z.h;
      if (inside) level = z.level;
      if (Math.abs(f.x - z.x) < 6 || Math.abs(f.x - z.x - z.w) < 6) edge = true;
    }
    if (edge || (onlyDark && level >= 30)) continue;
    counted++;
    if ((level < 30) === (f.led !== "off")) good++;
  }
  return counted ? good / counted : 0;
}

// ============================================================ EXPLORERS (K to Grade 1, Blocks)
// Short sentences, read-aloud friendly, lots of sounds and characters.

const ES1 = semester("Explorers", "S1", "S1 My Helpful Robot", ["Sequencing", "Counting"]);
const ES2 = semester("Explorers", "S2", "S2 Kindness Cards", ["Events", "Sound"]);
const ES3 = semester("Explorers", "S3", "S3 Recycling Sorter", ["Sensors", "Loops"]);
const ES4 = semester("Explorers", "S4", "S4 My Neighbourhood Map", ["Sequencing", "Left and right"]);
const EC = semester("Explorers", "Capstone", "Capstone Show-and-Tell App", ["Sequencing", "Repeat", "Show and tell"]);

const penCheck = (minInk: number, minTurn: number, closed: boolean, what: string) => (trace: Trace) => {
  const st = trace.stats;
  if (!st.penStart) return notYet("Put the pen down first, so the robot paints as it drives.");
  if (st.inked < minInk) return notYet(`You painted ${Math.round(st.inked)} cm. Make the lines longer.`);
  if (st.turned < minTurn) return notYet("Turn at each corner.");
  const f = last(trace);
  if (closed && Math.hypot(f.x - st.penStart.x, f.y - st.penStart.y) > 6) return notYet("Almost! Finish back where you started.");
  return pass(what);
};

export const EXPLORER_LABS: Mission[] = [
  ES1(1, {
    id: "farm-rooster",
    title: "Wake up, Rooster!",
    story: { who: "Farmer Rosa", face: "👩‍🌾", says: "Good morning! The sun is up, but Rooster Ruby is still asleep. Can you drive over and beep to wake her up?" },
    goal: "Drive 3 squares to Rooster Ruby, then beep.",
    hint: "Count the squares: 1, 2, 3. That's forward 30. Then add a beep.",
    scene: { theme: "dawn", decor: [{ kind: "sun", x: 88, y: 6, r: 4 }, { kind: "fence", x: 0, y: 46, w: 100 }, { kind: "rooster", x: 46, y: 25 }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 12, y: 25, heading: 0 }, zones: [{ id: "perch", x: 35, y: 13, w: 20, h: 24, colour: "orange" }] }),
    check(trace, world) {
      const perch = world.zones[0];
      if (!inZone(last(trace), perch)) return notYet("Ruby is 3 squares away. Count again and drive right up to her.");
      if (!trace.sounds.some((s) => s.kind === "beep" && s.t >= arrivedAt(trace, perch))) return notYet("You're next to Ruby. Now beep to wake her up!");
      return pass("Cock-a-doodle-doo! Ruby is awake. Thank you, robot!");
    },
    starter: blank("Wake up, Rooster!"),
  }),
  ES1(2, {
    id: "farm-backward",
    title: "Hay for the barn",
    story: { who: "Farmer Rosa", face: "👩‍🌾", says: "Rain is coming! Grab the hay bale in front of you, then drive BACKWARD into the barn and put it down. Robots can drive backwards too!" },
    goal: "Drive to the hay, pick it up, drive backward into the barn, then drop it.",
    hint: "forward 10, pick up, backward, drop. Count the squares back to the barn.",
    scene: { theme: "barn", decor: [{ kind: "tractor", x: 78, y: 10 }, { kind: "hen", x: 50, y: 42 }, { kind: "cloud", x: 88, y: 6 }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 60, y: 25, heading: 0 }, items: [{ id: "hay", x: 80, y: 25, colour: "yellow", label: "Hay" }], zones: [{ id: "barn", x: 4, y: 12, w: 30, h: 26, colour: "blue", label: "Barn" }] }),
    check(trace, world) {
      if (!trace.stats.pickUps) return notYet("Drive up to the hay and pick it up.");
      return inZone(itemAt(trace, world, "hay"), world.zones[0]) ? pass("The hay is safe and dry. Thank you, robot!") : notYet("You've got the hay! Now drive backward into the barn and drop it.");
    },
    starter: blank("Hay for the barn"),
  }),
  ES1(3, {
    id: "farm-piglets",
    title: "Count the piglets",
    story: { who: "Peanut the piglet", face: "🐷", says: "Oink! It's bedtime and Mama Pig wants to count us. There are 5 piglets. Beep once for each one. Not too many, not too few!" },
    goal: "Count the piglets: beep exactly 5 times. No driving needed!",
    hint: "Point at each piglet with your finger and add one beep block for each.",
    scene: { theme: "pigpen", decor: [{ kind: "pig", x: 20, y: 10 }, { kind: "pig", x: 40, y: 8 }, { kind: "pig", x: 60, y: 10 }, { kind: "pig", x: 80, y: 8 }, { kind: "pig", x: 70, y: 40 }, { kind: "trough", x: 20, y: 40 }, { kind: "fence", x: 0, y: 47, w: 100 }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 45, y: 32, heading: 90 } }),
    check(trace) {
      const n = trace.stats.beeps;
      if (n === 5) return pass("1, 2, 3, 4, 5! All the piglets are counted. Goodnight, piglets!");
      return notYet(n < 5 ? `You beeped ${n} times. Count again: there are 5 piglets.` : `You beeped ${n} times. That's too many! There are 5 piglets.`);
    },
    starter: blank("Count the piglets"),
  }),

  ES2(1, {
    id: "music-hello",
    title: "Sing hello",
    story: { who: "Maestro Mo", face: "🐱", says: "Welcome to music class! Robots say hello with music. Play 3 notes: C, D and E. Like do, re, mi!" },
    goal: "Play the notes C, D and E, in that order.",
    hint: "Use 3 play note blocks: C, then D, then E.",
    scene: { theme: "practice", decor: [{ kind: "speaker", x: 10, y: 14 }, { kind: "speaker", x: 90, y: 14 }, { kind: "mirror", x: 25, y: 2, w: 50 }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 50, y: 28, heading: 90 } }),
    check(trace) {
      const n = trace.stats.notes.map((x) => x.note).join(" ");
      return n.startsWith("C D E") ? pass("Do, re, mi! What a lovely hello.") : notYet(n ? `You played ${n}. Try C, then D, then E.` : "Play your first note: C.");
    },
    starter: blank("Sing hello"),
  }),
  ES2(2, {
    id: "gym-clap",
    title: "Musical stepping stones",
    story: { who: "Coach Kim", face: "🏃‍♀️", says: "These coloured spots are magic: each one makes music! Stop on each spot and play its note. Red is C, yellow is E, blue is G." },
    goal: "Drive to each spot and play its note: C on red, E on yellow, G on blue.",
    hint: "forward 20, play C. forward 20, play E. forward 20, play G.",
    scene: { theme: "gym", decor: [{ kind: "cone", x: 10, y: 6 }, { kind: "cone", x: 90, y: 44 }, { kind: "speaker", x: 92, y: 10 }] },
    world: base({
      w: 100,
      h: 50,
      robot: "scout",
      start: { x: 10, y: 25, heading: 0 },
      zones: [
        { id: "c", x: 23, y: 17, w: 14, h: 16, colour: "red", label: "C" },
        { id: "e", x: 43, y: 17, w: 14, h: 16, colour: "yellow", label: "E" },
        { id: "g", x: 63, y: 17, w: 14, h: 16, colour: "blue", label: "G" },
      ],
    }),
    check(trace, world) {
      const want: Record<string, string> = { c: "C", e: "E", g: "G" };
      for (const z of world.zones) {
        const ok = trace.stats.notes.some((n) => {
          const f = trace.frames.find((fr) => fr.t >= n.t - 0.001);
          return n.note === want[z.id!] && f && inZone(f, z);
        });
        if (!ok) return notYet(`Stop on the ${z.colour} spot and play ${want[z.id!]}.`);
      }
      return pass("C, E, G! You played a song with your wheels.");
    },
    starter: blank("Musical stepping stones"),
  }),
  ES2(3, {
    id: "party-surprise",
    title: "Surprise party",
    story: { who: "Lulu the bunny", face: "🐰", says: "Shh! It's Grandpa Bear's birthday. When he walks in, everyone claps. Then flash your lights and beep: SURPRISE!" },
    goal: "Wait for the clap. Then flash 2 light colours and beep.",
    hint: "wait for a clap, light, light (a different colour), beep.",
    scene: { theme: "party", decor: [{ kind: "balloon", x: 12, y: 10, colour: "#EC407A" }, { kind: "balloon", x: 22, y: 8, colour: "#42A5F5" }, { kind: "balloon", x: 84, y: 12, colour: "#FFCA28" }, { kind: "balloon", x: 92, y: 9, colour: "#66BB6A" }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 50, y: 28, heading: 90 }, claps: [2.5] }),
    check(trace) {
      if (trace.frames.some((f) => f.t < 2.49 && f.led !== "off") || firstSoundAt(trace) < 2.49) return notYet("Oops, the surprise started too early! Wait for the clap.");
      const colours = new Set(trace.frames.filter((f) => f.led !== "off").map((f) => f.led));
      if (colours.size < 2) return notYet(`Flash 2 different colours. You used ${colours.size}.`);
      if (!trace.stats.beeps) return notYet("Now beep: SURPRISE!");
      return pass("SURPRISE! Grandpa Bear is so happy. Happy birthday!");
    },
    starter: blank("Surprise party"),
  }),

  ES3(1, {
    id: "lagoon-pearls",
    title: "Pearl trail",
    story: { who: "Captain Coral", face: "🐢", says: "Ahoy! I dropped my 4 pearls in a line. Each one is 1 square apart. A repeat loop can collect them all!" },
    goal: "Collect all 4 pearls using repeat 4 times: forward 10.",
    hint: "Put forward 10 inside a repeat 4 times block.",
    scene: { theme: "lagoon", decor: [{ kind: "starfish", x: 20, y: 44 }, { kind: "shell", x: 80, y: 8 }, { kind: "starfish", x: 90, y: 42, colour: "#FFCA28" }] },
    world: base({
      w: 100,
      h: 50,
      robot: "scout",
      start: { x: 12, y: 25, heading: 0 },
      collectibles: [22, 32, 42, 52].map((x, i) => ({ id: `p${i}`, x, y: 25, kind: "pearl" as const })),
    }),
    check(trace) {
      const n = trace.stats.collected.length;
      return n === 4 ? pass("4 pearls! Thank you, little sub. Loops save so many blocks!") : notYet(`${n} of 4 pearls. Repeat forward 10 four times.`);
    },
    starter: blank("Pearl trail"),
  }),
  ES3(2, {
    id: "kelp-bottle",
    title: "Bottle in the kelp",
    story: { who: "Otto the otter", face: "🦦", says: "Someone dropped a bottle by the big rock! Swim until you see the rock. Then pick up the bottle." },
    goal: "Repeat until obstacle ahead, then pick up the bottle.",
    hint: "repeat until obstacle ahead: forward 2. Then pick up.",
    scene: { theme: "kelp", wall: "coral", decor: [{ kind: "seaweed", x: 20, y: 8 }, { kind: "seaweed", x: 45, y: 50 }, { kind: "seaweed", x: 70, y: 6 }, { kind: "fish", x: 30, y: 44 }] },
    world: base({ w: 120, h: 56, robot: "scout", start: { x: 12, y: 28, heading: 0 }, walls: [{ x: 98, y: 10, w: 16, h: 36 }], items: [{ id: "bottle", x: 90, y: 28, colour: "blue", kind: "bottle" }] }),
    check(trace) {
      if (trace.stats.bumps > 0) return notYet("Bump! Let the sensor tell you when the rock is close.");
      if (last(trace).carrying === "bottle") return pass("Got it! The kelp forest is clean again. Otto says thank you!");
      return notYet(last(trace).sensors.obstacle ? "You're at the rock. Now pick up the bottle." : "Keep swimming until the sensor sees the rock.");
    },
    starter: blank("Bottle in the kelp"),
  }),
  ES3(3, {
    id: "deep-corner",
    title: "The dark cave",
    story: { who: "Lumi the jellyfish", face: "🪼", says: "It's dark down here! Swim to the wall. Turn left. Swim up to the top. Your sensor will help you." },
    goal: "Repeat until obstacle, turn left, then repeat until obstacle again. No bumps!",
    hint: "repeat until obstacle: forward 2. Turn left 90. Then the same repeat until again.",
    scene: { theme: "deep", wall: "rockface", decor: [{ kind: "fish", x: 40, y: 22 }, { kind: "chest", x: 60, y: 72 }] },
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
      if (trace.stats.turned < 85) return notYet("At the cave wall, turn left.");
      if (!f.sensors.obstacle || f.y > 40) return notYet("Keep swimming up until the ceiling is close.");
      return pass("You found the way in the dark. Lumi is glowing with joy!");
    },
    starter: blank("The dark cave"),
  }),

  ES4(1, {
    id: "snow-left",
    title: "Hello, Snowman",
    story: { who: "Pip the penguin", face: "🐧", says: "Look! Our snowman is over there, on your LEFT. Turn left, then slide up to say hello!" },
    goal: "Turn left, then drive to the snowman.",
    hint: "turn left 90 first. Then forward. The snowman is 4 squares away.",
    scene: { theme: "snowpark", decor: [{ kind: "snowman", x: 30, y: 15 }, { kind: "pine", x: 64, y: 20, r: 6 }, { kind: "penguin", x: 64, y: 66 }] },
    world: base({ w: 80, h: 80, robot: "scout", start: { x: 30, y: 65, heading: 0 }, zones: [{ id: "snowman", x: 19, y: 22, w: 22, h: 22, colour: "blue" }] }),
    check(trace, world) {
      if (trace.stats.turned < 85) return notYet("The snowman is on your left. Turn left first.");
      return inZone(last(trace), world.zones[0]) ? pass("Hello, Snowman! Pip is doing a happy dance.") : notYet("Good turn! Now count the squares to the snowman.");
    },
    starter: blank("Hello, Snowman"),
  }),
  ES4(2, {
    id: "ice-rink",
    title: "Round the rink",
    story: { who: "Pip the penguin", face: "🐧", says: "Let's skate! Go along the ice, turn RIGHT at the corner, and stop at the hot chocolate stand." },
    goal: "Drive forward, turn right at the corner, then drive to the hot chocolate stand.",
    hint: "forward 40, turn right 90, forward 40.",
    scene: { theme: "ice", decor: [{ kind: "penguin", x: 85, y: 10 }, { kind: "penguin", x: 90, y: 16 }, { kind: "cone", x: 25, y: 40 }] },
    world: base({
      w: 100,
      h: 80,
      robot: "scout",
      start: { x: 15, y: 15, heading: 0 },
      lines: [{ points: [{ x: 5, y: 15 }, { x: 55, y: 15 }, { x: 55, y: 55 }] }],
      zones: [{ id: "cocoa", x: 43, y: 44, w: 24, h: 24, colour: "orange", label: "Hot chocolate" }],
    }),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("Wheee! A perfect right turn. Hot chocolate time!") : notYet("Not at the stand yet. Which way is right for the robot?")),
    starter: blank("Round the rink"),
  }),
  ES4(3, {
    id: "village-mitten",
    title: "The lost mitten",
    story: { who: "Pip the penguin", face: "🐧", says: "Oh no, I dropped my red mitten! It's behind you. Turn all the way around, pick it up, then turn around again and bring it back to me." },
    goal: "Turn around, drive to the mitten and pick it up. Turn around again, drive back and drop it by Pip.",
    hint: "turn left 180, forward, pick up, turn left 180, forward, drop.",
    scene: { theme: "village", decor: [{ kind: "lamp", x: 20, y: 8 }, { kind: "lamp", x: 80, y: 8 }, { kind: "penguin", x: 92, y: 25 }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 65, y: 25, heading: 0 }, items: [{ id: "mitten", x: 25, y: 25, colour: "red", label: "Mitten" }], zones: [{ id: "pip", x: 70, y: 13, w: 18, h: 24, colour: "blue", label: "Pip" }] }),
    check(trace, world) {
      if (trace.stats.turned < 170) return notYet("The mitten is behind you. Turn all the way around first.");
      if (!trace.stats.pickUps) return notYet("Drive to the mitten and pick it up.");
      return inZone(itemAt(trace, world, "mitten"), world.zones[0]) ? pass("Pip's flipper is warm again! Two half turns, like a pro.") : notYet("Got it! Now turn around again, drive back and drop it by Pip.");
    },
    starter: blank("The lost mitten"),
  }),
  EC(1, {
    id: "chalk-line",
    title: "Chalk line",
    story: { who: "Ms. Dot", face: "👩‍🎨", says: "Let's make sidewalk art! Put your chalk down and draw a long line, 5 squares long." },
    goal: "Pen down, then draw a line 5 squares long.",
    hint: "pen down first, then forward 50.",
    scene: { theme: "sidewalk", decor: [{ kind: "chalk", x: 10, y: 8, colour: "#F48FB1" }, { kind: "chalk", x: 18, y: 10, colour: "#81D4FA" }, { kind: "chalk", x: 95, y: 70, colour: "#FFF59D" }] },
    world: base({ w: 110, h: 80, robot: "scout", start: { x: 25, y: 40, heading: 0 } }),
    check: penCheck(45, 0, false, "What a long line! Every picture starts with one line."),
    starter: blank("Chalk line"),
  }),
  EC(2, {
    id: "paper-stripes",
    title: "Two stripes",
    story: { who: "Ms. Dot", face: "👩‍🎨", says: "Let's make a flag! Draw a red stripe. Lift your pen, move over, then draw a blue stripe." },
    goal: "Draw a red line, lift the pen, move, then draw a blue line.",
    hint: "pen down red, forward 40, pen up, turn left 90, forward 15, pen down blue, turn left 90, forward 40.",
    scene: { theme: "paper", decor: [{ kind: "paint", x: 104, y: 10, colour: "#E53935" }, { kind: "paint", x: 104, y: 22, colour: "#1E88E5" }] },
    world: base({ w: 112, h: 70, robot: "scout", start: { x: 30, y: 50, heading: 0 } }),
    check(trace) {
      const colours = new Set<string>();
      let lifted = false;
      for (let i = 1; i < trace.frames.length; i++) {
        const a = trace.frames[i - 1];
        const b = trace.frames[i];
        if (a.pen && b.pen && (a.x !== b.x || a.y !== b.y)) colours.add(b.pen);
        if (a.pen && !b.pen) lifted = true;
      }
      if (!colours.has("red")) return notYet("Start with a red stripe: pen down red, then drive.");
      if (!lifted) return notYet("Lift the pen up before you move to the next stripe.");
      if (!colours.has("blue")) return notYet("Now draw a blue stripe.");
      return pass("A red and blue flag! Pen up, pen down, like a real artist.");
    },
    starter: blank("Two stripes"),
  }),
  EC(3, {
    id: "canvas-three-sides",
    title: "Dotted line",
    story: { who: "Ms. Dot", face: "👩‍🎨", says: "My name is Ms. Dot, so I LOVE dots! Make a dotted line: pen down, drive a little, pen up, drive a little. A repeat loop can do it 4 times." },
    goal: "Draw 4 dashes with gaps between them: repeat 4 times (pen down, forward 10, pen up, forward 10).",
    hint: "repeat 4 times: pen down, forward 10, pen up, forward 10.",
    scene: { theme: "canvas", decor: [{ kind: "easel", x: 100, y: 18 }, { kind: "paint", x: 12, y: 70, colour: "#8E24AA" }] },
    world: base({ w: 120, h: 80, robot: "scout", start: { x: 20, y: 45, heading: 0 } }),
    check(trace) {
      let dashes = 0;
      for (let i = 1; i < trace.frames.length; i++) {
        const a = trace.frames[i - 1];
        const b = trace.frames[i];
        if (!a.pen && b.pen) dashes++;
      }
      if (!dashes) return notYet("Put the pen down to start a dash.");
      if (trace.stats.inked < 30) return notYet("Drive with the pen down to paint each dash.");
      return dashes >= 4 ? pass("Dash, gap, dash, gap! Ms. Dot loves your dotted line.") : notYet(`${dashes} of 4 dashes. Lift the pen between dashes, and repeat 4 times.`);
    },
    starter: blank("Dotted line"),
  }),
];

// ============================================================ BUILDERS (Grades 2 to 3, Blocks)
// A little more story, still short and lively.

const BS1 = semester("Builders", "S1", "S1 All About Me Page", ["Sequencing", "Outputs"]);
const BS2 = semester("Builders", "S2", "S2 Weather Helper", ["If / else", "Light sensor"]);
const BS3 = semester("Builders", "S3", "S3 Class Pet Care Guide", ["Loops", "Routines"]);
const BS4 = semester("Builders", "S4", "S4 Save the Bees Awareness Site", ["Sequencing", "Timing"]);
const BC = semester("Builders", "Capstone", "Capstone Community Helper Website", ["Planning", "Sequencing"]);

export const BUILDER_LABS: Mission[] = [
  BS1(1, {
    id: "dressing-name",
    title: "Name on the door",
    story: { who: "DJ Zara", face: "🎧", says: "Welcome backstage, superstar! Every star has their name on the dressing room door. What's your robot called? Show it on the screen!" },
    goal: "Show your robot's name on its screen.",
    hint: "Use the show block. Type a name, like Bolt or Pixel.",
    scene: { theme: "dressing", decor: [{ kind: "mirror", x: 20, y: 2, w: 60 }, { kind: "desk", x: 15, y: 50 }, { kind: "balloon", x: 88, y: 44, colour: "#AB47BC" }] },
    world: base({ w: 100, h: 60, robot: "scout", start: { x: 50, y: 32, heading: 90 } }),
    check: (trace) => (trace.frames.some((f) => f.display.trim().length >= 2) ? pass("Now everyone knows your name. Star on the door!") : notYet("Show your robot's name with the show block.")),
    starter: blank("Name on the door"),
  }),
  BS1(2, {
    id: "rooftop-colours",
    title: "City light show",
    story: { who: "DJ Zara", face: "🎧", says: "Tonight we light up the city from the rooftop! Flash 3 colours, and wait 1 second on each so everyone downtown can see." },
    goal: "Show 3 different light colours, waiting 1 second on each one.",
    hint: "light, wait 1, light, wait 1, light, wait 1.",
    scene: { theme: "rooftop", decor: [{ kind: "moon", x: 85, y: 10, r: 5 }, { kind: "speaker", x: 10, y: 14 }] },
    world: base({ w: 100, h: 60, robot: "scout", start: { x: 50, y: 28, heading: 90 } }),
    check(trace) {
      const shown = new Map<string, number>();
      for (let i = 1; i < trace.frames.length; i++) {
        const c = trace.frames[i - 1].led;
        if (c !== "off") shown.set(c, (shown.get(c) ?? 0) + (trace.frames[i].t - trace.frames[i - 1].t));
      }
      if (shown.size < 3) return notYet(`Use 3 different colours. You used ${shown.size}.`);
      const long = [...shown.values()].filter((v) => v >= 0.9).length;
      return long >= 3 ? pass("The whole city saw your light show!") : notYet("Wait 1 second on each colour so people can see it.");
    },
    starter: blank("City light show"),
  }),
  BS1(3, {
    id: "classroom-intro",
    title: "Three favourites",
    story: { who: "Mr. Patel", face: "👨‍🏫", says: "Tell the class 3 favourite things, and use a DIFFERENT robot output for each one: your favourite food on the screen, your favourite note as a sound, and your favourite colour as a light. Hold each one for 1 second." },
    goal: "Show your favourite food, wait 1. Play your favourite note. Glow your favourite colour, wait 1.",
    hint: "show Pizza, wait 1, play note G, light blue, wait 1.",
    scene: { theme: "classroom", decor: [{ kind: "desk", x: 15, y: 12 }, { kind: "desk", x: 85, y: 12 }, { kind: "desk", x: 15, y: 48 }, { kind: "desk", x: 85, y: 48 }] },
    world: base({ w: 100, h: 60, robot: "scout", start: { x: 50, y: 32, heading: 90 } }),
    check(trace) {
      const shownAt = trace.frames.find((f) => f.display.trim().length >= 2)?.t ?? Infinity;
      const noteAt = trace.stats.notes[0]?.t ?? Infinity;
      const lightAt = trace.frames.find((f) => f.led !== "off")?.t ?? Infinity;
      if (shownAt === Infinity) return notYet("First, show your favourite food on the screen.");
      if (noteAt === Infinity) return notYet("Next, play your favourite note.");
      if (lightAt === Infinity) return notYet("Last, glow in your favourite colour.");
      if (!(shownAt < noteAt && noteAt <= lightAt)) return notYet("Go in order: screen, then sound, then light.");
      if (noteAt - shownAt < 0.9 || last(trace).t - lightAt < 0.9) return notYet("Hold the food and the colour for 1 second each, so the class can see.");
      return pass("Screen, sound and light: three outputs, three favourites. The class loved it!");
    },
    starter: blank("Three favourites"),
  }),
  BS2(1, {
    id: "meadow-shade",
    title: "Find the shade",
    story: { who: "Sunny the sunflower", face: "🌻", says: "Phew, it's hot! Drive along until you reach the shadow of the big cloud. Stop as soon as it gets dark, then turn your light on." },
    goal: "Repeat until it is dark, then turn your light on.",
    hint: "repeat until it is dark: forward 2. Then light on. Use the light sensor, not counting!",
    scene: { theme: "meadow", decor: [{ kind: "cloud", x: 88, y: 8 }, { kind: "flower", x: 20, y: 8 }, { kind: "flower", x: 30, y: 44, colour: "#FFCA28" }] },
    world: base({ w: 120, h: 50, robot: "scout", start: { x: 12, y: 25, heading: 0 }, light: 85, lightZones: [{ x: 68, y: 0, w: 40, h: 50, level: 18, label: "Cloud shade" }] }),
    check(trace) {
      const f = last(trace);
      if (f.x < 68) return notYet("Keep going until it gets dark.");
      if (f.x > 76) return notYet("You went too far into the shade. Stop as soon as it gets dark.");
      return f.led !== "off" ? pass("Nice and cool in the shade. Your light sensor found it!") : notYet("You found the shade! Now turn your light on.");
    },
    starter: blank("Find the shade"),
  }),
  BS2(2, {
    id: "firefly-forest",
    title: "Night crickets",
    story: { who: "Chirp the cricket", face: "🦗", says: "Crickets only sing in the dark! Drive all the way to the camp. IF it's dark under the trees, play a chirp note. In the sunshine, stay quiet." },
    goal: "Drive to the camp. Play a note only while it is dark.",
    hint: "Inside a repeat: forward 5, then if it is dark, play a note.",
    scene: { theme: "garden2", decor: [{ kind: "tree", x: 60, y: 6, r: 7 }, { kind: "tree", x: 76, y: 44, r: 7 }], zoneIcons: { camp: "house" } },
    world: base({ w: 140, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, light: 85, lightZones: [{ x: 50, y: 0, w: 40, h: 50, level: 10, label: "Under the trees" }], zones: [{ id: "camp", x: 112, y: 12, w: 26, h: 26, colour: "orange", label: "Camp" }] }),
    check(trace, world) {
      if (!inZone(last(trace), world.zones[0])) return notYet("Keep driving all the way to the camp.");
      const dark = (x: number) => world.lightZones.some((z) => x >= z.x && x <= z.x + z.w);
      const at = trace.sounds.map((x) => trace.frames.find((f) => f.t >= x.t - 0.001)!).filter(Boolean);
      if (at.some((f) => !dark(f.x))) return notYet("Shh! You chirped in the sunshine. Only chirp in the dark.");
      return at.length ? pass("Chirp, chirp! The crickets sang under the trees.") : notYet("It was dark under the trees, but you didn't chirp. Use if it is dark.");
    },
    starter: blank("Night crickets"),
  }),
  BS2(3, {
    id: "owl-watch",
    title: "Shadow painter",
    story: { who: "Pablo the painter", face: "🧑‍🎨", says: "Let's paint the shadows! Drive across the park. IF it's dark, put your pen down. ELSE, lift it up. When you're done, only the shady parts will be painted!" },
    goal: "Drive to the end. Paint only in the dark parts: if it is dark, pen down; else, pen up.",
    hint: "Inside a repeat: forward 2, then if it is dark: pen down purple, else: pen up.",
    scene: { theme: "park", decor: [{ kind: "tree", x: 50, y: 6, r: 7 }, { kind: "tree", x: 130, y: 44, r: 7 }, { kind: "easel", x: 150, y: 10 }] },
    world: base({
      w: 160,
      h: 50,
      robot: "scout",
      start: { x: 10, y: 25, heading: 0 },
      light: 85,
      lightZones: [
        { x: 30, y: 0, w: 40, h: 50, level: 15, label: "Shade" },
        { x: 110, y: 0, w: 30, h: 50, level: 15, label: "Shade" },
      ],
    }),
    check(trace, world) {
      if (last(trace).x < 140) return notYet("Keep driving to the end of the park.");
      const dark = (x: number) => world.lightZones.some((z) => x >= z.x - 3 && x <= z.x + z.w + 3);
      let inShade = 0;
      for (let i = 1; i < trace.frames.length; i++) {
        const a = trace.frames[i - 1];
        const b = trace.frames[i];
        if (a.pen && b.pen && b.x !== a.x) {
          if (!dark(b.x)) return notYet("You painted in the sunshine! Lift the pen up when it's bright (else: pen up).");
          inShade += Math.abs(b.x - a.x);
        }
      }
      return inShade >= 55 ? pass("Two shadow paintings! If and else worked together.") : notYet("Paint the shady parts: if it is dark, pen down.");
    },
    starter: blank("Shadow painter"),
  }),

  BS3(1, {
    id: "dogpark-tree",
    title: "Walk to the big tree",
    story: { who: "Biscuit the puppy", face: "🐶", says: "Woof! Walkies! My favourite tree is 3 big steps away. Each step is 2 squares. Use a repeat loop!" },
    goal: "Repeat 3 times: forward 20. Stop at the big tree.",
    hint: "One forward 20 block inside a repeat 3 times block.",
    scene: { theme: "dogpark", follower: "puppy", decor: [{ kind: "tree", x: 84, y: 30, r: 8 }, { kind: "fence", x: 0, y: 3, w: 100 }, { kind: "bench", x: 30, y: 54 }] },
    world: base({ w: 100, h: 60, robot: "scout", start: { x: 12, y: 30, heading: 0 }, zones: [{ id: "tree", x: 62, y: 18, w: 16, h: 24, colour: "green" }] }),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("Woof woof! Biscuit loves this tree. 3 steps, one loop!") : notYet("Not at the tree yet. Repeat forward 20 three times.")),
    starter: blank("Walk to the big tree"),
  }),
  BS3(2, {
    id: "snowpark-lap",
    title: "Triangle trail",
    story: { who: "Biscuit the puppy", face: "🐶", says: "Snow day! Someone made a triangle trail round the frozen pond. A triangle has 3 sides and 3 turns. Can your loop make it?" },
    goal: "Go once round the pond on a triangle: repeat 3 times (forward 50, turn left 120). Finish where you started.",
    hint: "repeat 3 times: forward 50, turn left 120.",
    scene: { theme: "ice", follower: "puppy", wall: "pond", decor: [{ kind: "penguin", x: 82, y: 10 }, { kind: "snowman", x: 80, y: 70 }] },
    world: base({ w: 90, h: 90, robot: "scout", start: { x: 15, y: 75, heading: 0 }, walls: [{ x: 34, y: 55, w: 12, h: 12 }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Oops, you slid onto the ice! Go round the pond.");
      if (trace.stats.turned < 350) return notYet("A triangle has 3 turns of 120. Repeat 3 times.");
      if (sweptAround(trace, { x: 40, y: 61 }) < 350) return notYet("Go all the way round the pond.");
      const f = last(trace);
      return Math.hypot(f.x - world.start.x, f.y - world.start.y) <= 8 ? pass("A perfect triangle! Biscuit made triangle paw prints.") : notYet("Finish back where you started.");
    },
    starter: blank("Triangle trail"),
  }),
  BS3(3, {
    id: "hill-stairs",
    title: "Up the hill",
    story: { who: "Biscuit the puppy", face: "🐶", says: "My ball rolled all the way up the sand dune! The path goes over, up, over, up, like stairs. Can you spot the pattern?" },
    goal: "Climb the stair path to the ball: repeat 3 times (forward, turn left, forward, turn right).",
    hint: "repeat 3 times: forward 20, turn left 90, forward 20, turn right 90.",
    scene: { theme: "dunes", follower: "puppy", decor: [{ kind: "shell", x: 30, y: 30 }, { kind: "cactus", x: 90, y: 70 }] },
    world: base({ w: 110, h: 90, robot: "scout", start: { x: 12, y: 78, heading: 0 }, collectibles: [{ id: "ball", x: 74, y: 18, kind: "ball" }] }),
    check(trace) {
      if (!trace.stats.collected.length) return notYet("Not at the ball yet. Repeat the step pattern 3 times.");
      return trace.stats.turned >= 500 ? pass("Fetched! Patterns are easy with loops.") : notYet("Follow the stair path: over, up, over, up.");
    },
    starter: blank("Up the hill"),
  }),

  BS4(1, {
    id: "greenhouse-bloom",
    title: "First bloom",
    story: { who: "Bea the bee", face: "🐝", says: "Bzzz! This bud needs a little care. Stop right on it and wait 1 second, and it will bloom!" },
    goal: "Drive to the bud and wait 1 second.",
    hint: "forward to the bud, then wait 1.",
    scene: { theme: "greenhouse", decor: [{ kind: "plant", x: 15, y: 8 }, { kind: "plant", x: 85, y: 42 }, { kind: "bee", x: 70, y: 12 }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 10, y: 25, heading: 0 }, places: [{ id: "f1", x: 50, y: 25, label: "Bud", kind: "flower", hold: 1 }] }),
    check: (trace) => (last(trace).done.includes("f1") ? pass("It bloomed! Bea is buzzing with joy.") : notYet("Stop right on the bud and wait 1 second.")),
    starter: blank("First bloom"),
  }),
  BS4(2, {
    id: "window-sprinkler",
    title: "Window box sprinkler",
    story: { who: "Bea the bee", face: "🐝", says: "The flower boxes on Maple Street are thirsty! Stop beside each one, face it, and spray water. Bees need flowers!" },
    goal: "Water both plants: drive, turn to face a plant, spray. Then do the next one.",
    hint: "The hose sprays straight ahead. Turn left to face a plant, spray, then turn right to carry on.",
    scene: { theme: "village", decor: [{ kind: "lamp", x: 10, y: 45 }, { kind: "bee", x: 110, y: 40 }] },
    world: base({
      w: 120,
      h: 50,
      robot: "scout",
      start: { x: 10, y: 35, heading: 0 },
      targets: [
        { id: "t1", x: 40, y: 12, kind: "plant" },
        { id: "t2", x: 90, y: 12, kind: "plant" },
      ],
    }),
    check(trace) {
      const n = trace.stats.sprayed.length;
      return n === 2 ? pass("Both flower boxes are happy. Here come the bees!") : notYet(`${n} of 2 plants watered. Face each plant, then spray.`);
    },
    starter: blank("Window box sprinkler"),
  }),
  BS4(3, {
    id: "sunflower-wait",
    title: "Follow the sun",
    story: { who: "Bea the bee", face: "🐝", says: "Did you know sunflowers turn to follow the sun? Be a sunflower! Turn right 45, wait 2 seconds, and do it 3 times, from morning to evening." },
    goal: "Turn right 45 and wait 2 seconds, 3 times. No driving!",
    hint: "turn right 45, wait 2, turn right 45, wait 2, turn right 45, wait 2.",
    scene: { theme: "sunflowers", decor: [{ kind: "sun", x: 88, y: 8, r: 5 }, { kind: "flower", x: 20, y: 8, colour: "#FDD835" }, { kind: "flower", x: 15, y: 44, colour: "#FDD835" }, { kind: "hive", x: 85, y: 44 }] },
    world: base({ w: 100, h: 50, robot: "scout", start: { x: 50, y: 25, heading: 90 } }),
    check(trace) {
      if (trace.stats.distance > 2) return notYet("Sunflowers don't walk! Stay in one spot and just turn.");
      if (trace.stats.turned < 130) return notYet("Turn right 45, 3 times, to follow the sun across the sky.");
      const runs: number[] = [];
      let from = trace.frames[0];
      for (const f of trace.frames) {
        if (f.heading !== from.heading) {
          runs.push(f.t - from.t);
          from = f;
        }
      }
      runs.push(last(trace).t - from.t);
      const pauses = runs.slice(1).filter((d) => d >= 1.9).length;
      return pauses >= 3 ? pass("Morning, noon and evening. You followed the sun all day!") : notYet("Wait 2 seconds after each turn, so the sun can move.");
    },
    starter: blank("Follow the sun"),
  }),

  BC(1, {
    id: "firehall-siren",
    title: "Siren check",
    story: { who: "Captain Ada", face: "👩‍🚒", says: "Every morning we test the fire truck. The siren goes red, beep, blue, beep, and it does that 3 times. Use a repeat! Then drive out of the fire hall onto the road." },
    goal: "Repeat 3 times: red light, beep, blue light, beep. Then drive out onto the road.",
    hint: "repeat 3 times: light red, beep, light blue, beep. Then forward 50.",
    scene: { theme: "firehall", decor: [{ kind: "hydrant", x: 60, y: 8 }, { kind: "cone", x: 92, y: 50 }], zoneIcons: { bay: "station" } },
    world: base({
      w: 110,
      h: 60,
      robot: "scout",
      start: { x: 28, y: 32, heading: 0 },
      zones: [
        { id: "bay", x: 10, y: 16, w: 36, h: 32, colour: "red", label: "Fire hall" },
        { id: "road", x: 70, y: 18, w: 34, h: 28, colour: "grey", label: "Road" },
      ],
    }),
    check(trace, world) {
      let reds = 0;
      for (let i = 1; i < trace.frames.length; i++) if (trace.frames[i].led === "red" && trace.frames[i - 1].led !== "red") reds++;
      if (reds < 3 || trace.stats.beeps < 6) return notYet("The siren goes red, beep, blue, beep, 3 times. A repeat block makes it easy.");
      return inZone(last(trace), world.zones[1]) ? pass("Siren works! Truck 1 is out on the road and ready.") : notYet("Siren tested! Now drive out of the hall onto the road.");
    },
    starter: blank("Siren check"),
  }),
  BC(2, {
    id: "street-kitten",
    title: "Kitten rescue",
    story: { who: "Mrs. Lee", face: "👵", says: "Help! My kitten Mango is stuck by the lamp post. Please bring her back to my front door." },
    goal: "Drive to Mango, pick her up, drive back, and drop her at Mrs. Lee's door.",
    hint: "forward, pick up, backward, drop. Plan the numbers first.",
    scene: { theme: "street", decor: [{ kind: "lamp", x: 100, y: 25 }, { kind: "tree", x: 60, y: 6, r: 4 }], zoneIcons: { door: "house" } },
    world: base({ w: 120, h: 50, robot: "scout", start: { x: 22, y: 25, heading: 0 }, items: [{ id: "mango", x: 86, y: 25, colour: "orange", kind: "kitten" }], zones: [{ id: "door", x: 2, y: 14, w: 20, h: 22, colour: "pink", label: "Front door" }] }),
    check(trace, world) {
      if (!trace.stats.pickUps) return notYet("Drive to Mango and pick her up.");
      return inZone(itemAt(trace, world, "mango"), world.zones[0]) ? pass("Mango is home safe! Mrs. Lee is giving you a big hug.") : notYet("You've got Mango! Now bring her to the front door and drop her there.");
    },
    starter: blank("Kitten rescue"),
  }),
  BC(3, {
    id: "crosswalk-wait",
    title: "Crosswalk helper",
    story: { who: "Officer Sam", face: "👮", says: "Kids are walking to school! Drive until your sensor finds the crosswalk line, wait 3 seconds so they can cross, then drive on to the school." },
    goal: "Repeat until the middle sensor sees the line, wait 3, then drive to the school.",
    hint: "repeat until middle sensor sees the line: forward 1. wait 3. Then forward.",
    scene: { theme: "sidewalk", decor: [{ kind: "cone", x: 40, y: 6 }, { kind: "cone", x: 40, y: 44 }, { kind: "tree", x: 90, y: 6, r: 4 }], zoneIcons: { school: "school" } },
    world: base({ w: 140, h: 50, robot: "scout", start: { x: 12, y: 25, heading: 0 }, lines: [{ points: [{ x: 60, y: 4 }, { x: 60, y: 46 }], width: 3 }], zones: [{ id: "school", x: 108, y: 10, w: 28, h: 30, colour: "blue", label: "School" }] }),
    check(trace, world) {
      const near = trace.frames.filter((f) => f.x > 52 && f.x < 63);
      if (!near.length) return notYet("Drive until your sensor finds the crosswalk line.");
      const stoppedFor = near.length ? Math.max(...near.map((f) => f.t)) - Math.min(...near.map((f) => f.t)) : 0;
      if (stoppedFor < 2.9) return notYet("Stop at the crosswalk and wait 3 seconds for the children.");
      return inZone(last(trace), world.zones[0]) ? pass("Everyone crossed safely, and you made it to school. Great helping!") : notYet("Everyone's across. Now drive on to the school.");
    },
    starter: blank("Crosswalk helper"),
  }),
];

// ============================================================ DEVELOPERS (Grades 4 to 5, JavaScript)

const DS1 = semester("Developers", "S1", "S1 Homework Timer & Focus Tool", ["Variables", "Functions"]);
const DS2 = semester("Developers", "S2", "S2 Healthy Snack Calculator", ["Operators", "Input and output"]);
const DS3 = semester("Developers", "S3", "S3 Fact or Fake? Media-Literacy Quiz", ["if / else", "Checking data"]);
const DS4 = semester("Developers", "S4", "S4 Budget Buddy", ["Arrays", "Loops", "Budget math"]);
const DC = semester("Developers", "Capstone", "Capstone Problem-Solver App", ["Sensors", "if / else", "Loops"]);

const firstShown = (trace: Trace, text: string) => trace.frames.find((f) => f.display === text)?.t ?? Infinity;
const printed = (trace: Trace, n: number, tol = 0.01) => trace.log.some((l) => numbersIn(l.text).some((x) => Math.abs(x - n) <= tol));
const routeStarter = (title: string) =>
  starter(
    title,
    `const route = [["forward", 10]];\nlet cost = 0;\nfor (const [move, amount] of route) {\n  if (move === "forward") { forward(amount); cost += amount; }\n  if (move === "left") turnLeft(amount);\n  if (move === "right") turnRight(amount);\n}\nconsole.log("Cost:", cost);\n`,
    `route = [("forward", 10)]\ncost = 0\nfor move, amount in route:\n    if move == "forward":\n        forward(amount)\n        cost += amount\n    elif move == "left":\n        turn_left(amount)\n    elif move == "right":\n        turn_right(amount)\nprint("Cost:", cost)\n`,
  );
function mineCheck(gems: number, opts: { cart?: boolean; budget?: number; print?: boolean }, win: string) {
  return (trace: Trace, world: World) => {
    const got = trace.stats.collected.length;
    const used = Math.round(trace.stats.distance);
    if (got < gems) return notYet(`${got} of ${gems} crystals collected.`);
    if (opts.cart && !inZone(last(trace), world.zones[0])) return notYet("All the crystals! Now park at the mine cart.");
    if (opts.budget && used > opts.budget) return notYet(`You drove ${used} cm, but the battery only lasts ${opts.budget} cm. Find a shorter route.`);
    if (opts.print && !printed(trace, used, 1)) return notYet(`Done in ${used} cm. Now print the total cost from your loop.`);
    return pass(win.replace("{used}", String(used)));
  };
}
const marsWorld = (noise = 0) => base({ w: 200, h: 50, robot: "racer", start: { x: 15, y: 25, heading: 0 }, walls: [{ x: 172, y: 0, w: 28, h: 50 }], distanceNoise: noise });
const corridor = (extra: Partial<World> = {}) => base({ w: 170, h: 50, robot: "racer", start: { x: 12, y: 25, heading: 0 }, light: 85, walls: [{ x: 0, y: 0, w: 170, h: 6 }, { x: 156, y: 6, w: 14, h: 44 }], ...extra });
const TOSS_FROM = 22;

export const DEVELOPER_LABS: Mission[] = [
  DS1(1, {
    id: "control-crew",
    title: "Crew count",
    story: { who: "Commander Lin", face: "👩‍🚀", says: "Mission Control here. Before any launch we log the crew. Store the crew count in a variable named crew, and put it on the big screen." },
    goal: "Store 4 in a variable called crew and display it.",
    hint: "let crew = 4; then display(crew);",
    scene: { theme: "control", decor: [{ kind: "console", x: 10, y: 8 }, { kind: "console", x: 80, y: 8 }, { kind: "console", x: 45, y: 46 }, { kind: "window", x: 30, y: 2, w: 40 }] },
    world: base({ w: 100, h: 60, robot: "racer", start: { x: 50, y: 32, heading: 90 } }),
    check: (trace) => (trace.frames.some((f) => f.display === "4") ? pass("Crew of 4, logged. Your first variable is on the big screen!") : notYet("Show the crew count, 4, on the screen.")),
    starter: starter("Crew count", "let crew = 0;\ndisplay(crew);\n", "crew = 0\ndisplay(crew)\n"),
  }),
  DS1(2, {
    id: "hangar-trip",
    title: "Hangar shuttle",
    story: { who: "Mechanic Theo", face: "🧑‍🔧", says: "Can you fetch a part from the hangar? Store the distance in ONE variable and use it twice: drive in, wait 1 second while I load you up, then reverse out." },
    goal: "Use one variable for the distance: drive into the hangar, wait 1, then reverse back to the start.",
    hint: "const trip = 50; forward(trip); wait(1); backward(trip);",
    scene: { theme: "hangar", decor: [{ kind: "tractor", x: 112, y: 48 }, { kind: "lamp", x: 20, y: 8 }], zoneIcons: { hangar: "crate" } },
    world: base({ w: 130, h: 60, robot: "racer", start: { x: 20, y: 30, heading: 0 }, zones: [{ id: "hangar", x: 58, y: 14, w: 26, h: 32, colour: "orange", label: "Hangar" }] }),
    check(trace, world) {
      const visits = trace.frames.filter((f) => inZone(f, world.zones[0]));
      if (!visits.length) return notYet("Drive into the hangar first.");
      if (visits[visits.length - 1].t - visits[0].t < 0.9) return notYet("Wait 1 second in the hangar while the part is loaded.");
      const f = last(trace);
      return Math.hypot(f.x - world.start.x, f.y - world.start.y) <= 3 ? pass("Part delivered! One variable, used twice: that's why we name things.") : notYet("Now reverse back to exactly where you started. Reuse your variable!");
    },
    starter: starter("Hangar shuttle", "const trip = 10;\nforward(trip);\n", "trip = 10\nforward(trip)\n"),
  }),
  DS1(3, {
    id: "lab-beacon",
    title: "Beacon function",
    story: { who: "Dr. Ama", face: "👩‍🔬", says: "Our test beacon blinks red to say 'all clear'. Write a function called blink(), then call it 3 times. Write once, use many times!" },
    goal: "Write blink(): red light, wait 0.5, off, wait 0.5. Call it 3 times.",
    hint: 'function blink() { led("red"); wait(0.5); led("off"); wait(0.5); }',
    scene: { theme: "lab2", decor: [{ kind: "desk", x: 15, y: 10 }, { kind: "desk", x: 85, y: 10 }, { kind: "dish", x: 85, y: 48 }] },
    world: base({ w: 100, h: 60, robot: "racer", start: { x: 50, y: 32, heading: 90 } }),
    check(trace) {
      let blinks = 0;
      for (let i = 1; i < trace.frames.length; i++) if (trace.frames[i].led === "red" && trace.frames[i - 1].led !== "red") blinks++;
      return blinks >= 3 ? pass("Blink, blink, blink. All clear! One function, called 3 times.") : notYet(`${blinks} of 3 red blinks. Call your function 3 times.`);
    },
    starter: starter("Beacon function", 'led("red");\n'),
  }),
  DS1(4, {
    id: "bridge-signal",
    title: "Signal colours",
    story: { who: "Commander Lin", face: "👩‍🚀", says: "We're on the roof with the big antenna. Send our signal to the space station: red, then green, then blue. Write ONE function, flash(colour), that takes the colour as a parameter." },
    goal: "Write flash(colour) and call it with red, green and blue, in that order.",
    hint: 'function flash(colour) { led(colour); wait(0.5); led("off"); wait(0.2); } then flash("red"); flash("green"); flash("blue");',
    scene: { theme: "rooftop", decor: [{ kind: "dish", x: 15, y: 12 }, { kind: "moon", x: 85, y: 10, r: 4 }] },
    world: base({ w: 100, h: 60, robot: "racer", start: { x: 50, y: 32, heading: 90 } }),
    check(trace) {
      const seq: string[] = [];
      for (const f of trace.frames) if (f.led !== "off" && seq[seq.length - 1] !== f.led) seq.push(f.led);
      if (seq.join(",").includes("red,green,blue")) return pass("Signal received: red, green, blue! Parameters let one function do many jobs.");
      return notYet(seq.length ? `Your signal was ${seq.join(", ")}. Send red, green, blue.` : "Call flash() with red, then green, then blue.");
    },
    starter: starter("Signal colours", "function flash(colour) {\n  led(colour);\n}\n", "def flash(colour):\n    led(colour)\n"),
  }),
  DS1(5, {
    id: "depot-fuel",
    title: "Fuel calculator",
    story: { who: "Mechanic Theo", face: "🧑‍🔧", says: "Every centimetre takes 2 litres of fuel. Write a function fuelFor(cm) that RETURNS the fuel needed. Show the fuel for a 40 cm trip, then drive it." },
    goal: "Write fuelFor(cm) that returns cm * 2. Display fuelFor(40), then drive forward 40.",
    hint: "function fuelFor(cm) { return cm * 2; } display(fuelFor(40)); forward(40);",
    scene: { theme: "warehouse", decor: [{ kind: "barrel", x: 12, y: 10 }, { kind: "barrel", x: 18, y: 15 }, { kind: "barrel", x: 88, y: 50 }] },
    world: base({ w: 100, h: 60, robot: "racer", start: { x: 20, y: 30, heading: 0 } }),
    check(trace) {
      const shown = firstShown(trace, "80");
      if (shown === Infinity) return notYet("Display fuelFor(40). It should show 80.");
      if (trace.stats.firstMoveAt >= 0 && trace.stats.firstMoveAt < shown) return notYet("Work out the fuel BEFORE you drive.");
      return Math.abs(trace.stats.distance - 40) <= 1 ? pass("80 litres for 40 cm. Functions that return answers are super useful!") : notYet("Now drive the 40 cm trip.");
    },
    starter: starter("Fuel calculator", "function fuelFor(cm) {\n  return 0;\n}\n", "def fuel_for(cm):\n    return 0\n"),
  }),

  DS2(1, {
    id: "boardwalk-toss",
    title: "Catch!",
    story: { who: "Lifeguard Sam", face: "🏄", says: "Hey! I'm on my break and I'm starving. I'm exactly 50 cm away. Can you toss() me that apple?" },
    goal: "toss(50) so the apple lands in Sam's hands.",
    hint: "toss(cm) throws that many centimetres forward. The robot doesn't need to move.",
    scene: { theme: "boardwalk", decor: [{ kind: "friend", x: TOSS_FROM + 54, y: 30 }, { kind: "umbrella", x: 112, y: 12 }] },
    world: base({ w: 130, h: 60, robot: "racer", start: { x: 15, y: 30, heading: 0 } }),
    check(trace) {
      const t = trace.stats.tosses[trace.stats.tosses.length - 1];
      if (!t) return notYet("Use toss() to throw the apple.");
      const off = Math.abs(t.x - (TOSS_FROM + 50));
      return off <= 4 ? pass("Nice throw! Sam says thanks. Crunch!") : notYet(`It landed ${Math.round(off)} cm ${t.x < TOSS_FROM + 50 ? "short" : "too far"}. Sam is 50 cm away.`);
    },
    starter: starter("Catch!", "toss(20);\n", "toss(20)\n"),
  }),
  DS2(2, {
    id: "pier-add",
    title: "High tide",
    story: { who: "Grandma Rose", face: "🎣", says: "The pier is 90 cm long, but the tide is coming in and the last 25 cm is under water! Work out how far you can drive and stay dry: subtract in your code, print it, then drive exactly that far." },
    goal: "Calculate 90 - 25 in your code, print it, then drive forward that far.",
    hint: "const dry = 90 - 25; console.log(dry); forward(dry);",
    scene: { theme: "pier", decor: [{ kind: "fish", x: 40, y: 52 }, { kind: "fish", x: 110, y: 8 }, { kind: "lighthouse", x: 120, y: 48 }] },
    world: base({ w: 130, h: 60, robot: "racer", start: { x: 15, y: 30, heading: 0 }, zones: [{ x: 0, y: 18, w: 88, h: 24, colour: "orange", label: "Dry" }, { x: 88, y: 18, w: 27, h: 24, colour: "blue", label: "Under water" }] }),
    check(trace) {
      if (!printed(trace, 65)) return notYet("Print the dry distance you calculated, so you can check it.");
      const d = trace.stats.distance;
      if (d > 66) return notYet("Splash! You drove into the water. Check your subtraction.");
      return d >= 64 ? pass("90 - 25 = 65. Right to the edge, and your wheels are dry!") : notYet("Now drive forward that far.");
    },
    starter: starter("High tide", "const pier = 90;\n", "pier = 90\n"),
  }),
  DS2(3, {
    id: "snackbar-total",
    title: "Smoothie stand",
    story: { who: "Kai at the smoothie stand", face: "🧃", says: "Three friends want smoothies, and each one costs $4. Can your robot work out the total, show it on the screen and print it on the receipt?" },
    goal: "Multiply 3 smoothies × $4 in your code. Display the total and print it.",
    hint: "const total = 3 * 4; display(total); console.log(total);",
    scene: { theme: "snackbar", decor: [{ kind: "umbrella", x: 15, y: 12 }, { kind: "desk", x: 50, y: 10 }, { kind: "flower", x: 90, y: 50, colour: "#FF7043" }] },
    world: base({ w: 100, h: 60, robot: "racer", start: { x: 50, y: 36, heading: 90 } }),
    check(trace) {
      if (!trace.frames.some((f) => f.display.includes("12"))) return notYet("Show the total on the screen.");
      return printed(trace, 12) ? pass("$12 for 3 smoothies. Your robot can run the till!") : notYet("Print the total on the receipt too (console.log).");
    },
    starter: starter("Smoothie stand", "const smoothies = 3;\n", "smoothies = 3\n"),
  }),
  DS2(4, {
    id: "cove-halfway",
    title: "Halfway there",
    story: { who: "Lifeguard Sam", face: "🏄", says: "The lifeguard tower is 120 cm away. Today's drill: drive exactly HALFWAY and stop on the yellow flag. Let your code do the dividing." },
    goal: "Store 120 in a variable, divide it by 2, and drive forward that far.",
    hint: "const tower = 120; forward(tower / 2);",
    scene: { theme: "cove", decor: [{ kind: "lighthouse", x: 140, y: 14 }, { kind: "starfish", x: 70, y: 54 }] },
    world: base({ w: 160, h: 60, robot: "racer", start: { x: 15, y: 40, heading: 0 }, zones: [{ id: "half", x: 68, y: 28, w: 14, h: 24, colour: "yellow", label: "Halfway" }] }),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("120 ÷ 2 = 60. Right on the flag!") : notYet("Not on the halfway flag. Did you divide by 2?")),
    starter: starter("Halfway there", "const tower = 120;\n", "tower = 120\n"),
  }),
  DS2(5, {
    id: "picnic-share",
    title: "Fair shares",
    story: { who: "Mia", face: "👧", says: "We have 17 grapes for 5 friends. Everyone gets the same, and the robot gets the leftovers! Use % to find how many are left over, and show it." },
    goal: "Display 17 % 5 (the leftovers). Print how many grapes each friend gets, too.",
    hint: "% gives the remainder. Math.floor(17 / 5) gives each share.",
    scene: { theme: "garden2", decor: [{ kind: "umbrella", x: 20, y: 14 }, { kind: "flower", x: 80, y: 10 }, { kind: "bee", x: 70, y: 50 }] },
    world: base({ w: 100, h: 60, robot: "racer", start: { x: 50, y: 36, heading: 90 } }),
    check(trace) {
      if (!trace.frames.some((f) => f.display.trim() === "2")) return notYet("Display the leftovers: 17 % 5.");
      return printed(trace, 3) ? pass("3 grapes each, and 2 for the robot. % is the sharing operator!") : notYet("Print how many grapes each friend gets.");
    },
    starter: starter("Fair shares", "const grapes = 17;\n", "grapes = 17\n"),
  }),

  DS3(1, {
    id: "dunes-read",
    title: "First readings",
    story: { who: "Dr. Ortiz", face: "👨‍🔬", says: "Welcome to Mars! We just landed. Rule one for scientists: look before you leap. Print 3 distance readings before the rover moves an inch." },
    goal: "Print distance() 3 times. Don't move yet.",
    hint: "for (let i = 0; i < 3; i++) console.log(distance());",
    scene: { theme: "launch", wall: "canyon", decor: [{ kind: "rocket", x: 30, y: 10 }, { kind: "rock", x: 40, y: 10, r: 3 }, { kind: "rock", x: 120, y: 42, r: 2 }] },
    world: marsWorld(),
    check(trace) {
      if (trace.stats.firstMoveAt >= 0) return notYet("Don't move yet. Just read the sensor.");
      const n = trace.log.filter((l) => numbersIn(l.text).length > 0).length;
      return n >= 3 ? pass("3 readings logged. That's how real science starts!") : notYet(`${n} of 3 readings printed.`);
    },
    starter: starter("First readings", "console.log(distance());\n", "print(distance())\n"),
  }),
  DS3(2, {
    id: "craters-bool",
    title: "True or false?",
    story: { who: "Dr. Ortiz", face: "👨‍🔬", says: "We're on the icy plains near the Mars pole. obstacle() answers true or false, nothing else. Keep driving while it's false. The moment it's true, stop!" },
    goal: "Drive while obstacle() is false, then stop before the crater wall.",
    hint: "while (!obstacle()) { forward(2); }",
    scene: { theme: "ice", wall: "rockface", decor: [{ kind: "rock", x: 50, y: 10, r: 2 }, { kind: "rock", x: 100, y: 42, r: 2 }] },
    world: marsWorld(),
    check(trace) {
      if (trace.stats.bumps > 0) return notYet("Bump. Check obstacle() before every step.");
      return last(trace).sensors.obstacle ? pass("Stopped the moment it turned true. That's a boolean!") : notYet("Keep going until obstacle() is true.");
    },
    starter: starter("True or false?", "console.log(obstacle());\n", "print(obstacle())\n"),
  }),
  DS3(3, {
    id: "volcano-30",
    title: "Back away!",
    story: { who: "Dr. Ortiz", face: "👨‍🔬", says: "Whoa, the rover rolled right up to Olympus Mons, the biggest volcano in the solar system! It's too close. Back away until the distance sensor reads at least 30 cm." },
    goal: "Drive backward until distance() is 30 cm or more. Stop between 30 and 36 cm.",
    hint: "while (distance() < 30) { backward(2); }",
    scene: { theme: "volcano", wall: "rockface", decor: [{ kind: "lava", x: 186, y: 10, r: 5 }, { kind: "rock", x: 60, y: 42, r: 3 }] },
    world: base({ w: 200, h: 50, robot: "racer", start: { x: 160, y: 25, heading: 0 }, walls: [{ x: 172, y: 0, w: 28, h: 50 }] }),
    check(trace) {
      const d = last(trace).sensors.distance;
      if (trace.stats.bumps > 0) return notYet("Bump! You're already close. Go backward, not forward.");
      if (d < 30) return notYet(`Still only ${d} cm away. Keep backing away until it reads 30 or more.`);
      if (d > 36) return notYet(`${d} cm. That's further than needed: stop as soon as it reads 30.`);
      return pass(`${d} cm. Safe, and you only backed up as far as you needed!`);
    },
    starter: starter("Back away!", "console.log(distance());\n", "print(distance())\n"),
  }),
  DS3(4, {
    id: "ash-rock",
    title: "Rock in the road",
    story: { who: "Dr. Ortiz", face: "👨‍🔬", says: "A giant boulder is blocking the way to base! Drive until your sensor sees it, then go around it." },
    goal: "Drive until the rock is close, go round it, and park at the base.",
    hint: "while (!obstacle()) forward(2); turnRight(90); forward(40); turnLeft(90); then drive to the base.",
    scene: { theme: "dunes", wall: "rockface", decor: [{ kind: "crater", x: 40, y: 64, r: 6 }, { kind: "dish", x: 186, y: 10 }], zoneIcons: { base: "lab" } },
    world: base({ w: 200, h: 80, robot: "racer", start: { x: 15, y: 20, heading: 0 }, walls: [{ x: 100, y: 0, w: 20, h: 38 }], zones: [{ id: "base", x: 150, y: 48, w: 44, h: 28, colour: "blue", label: "Base" }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Let the sensor tell you when the rock is close.");
      return inZone(last(trace), world.zones[0]) ? pass("Round the boulder and home to base. Smart rover!") : notYet("Not at the base yet.");
    },
    starter: starter("Rock in the road", "forward(10);\n", "forward(10)\n"),
  }),
  DS3(5, {
    id: "polar-samples",
    title: "Red rock samples",
    story: { who: "Dr. Ortiz", face: "👨‍🔬", says: "This ash field is full of grey rock, but the interesting rocks are RED. Drive across. IF the ground under you is red, beep to take a sample. ELSE, stay quiet." },
    goal: "Drive to the far side. Beep only while you're on a red patch.",
    hint: 'In a loop: forward(5); if (colour() === "red") beep();',
    scene: { theme: "ashfield", decor: [{ kind: "crater", x: 30, y: 8, r: 4 }, { kind: "crater", x: 150, y: 44, r: 4 }] },
    world: base({
      w: 190,
      h: 50,
      robot: "racer",
      start: { x: 12, y: 25, heading: 0 },
      zones: [
        { x: 50, y: 10, w: 20, h: 30, colour: "red" },
        { x: 120, y: 10, w: 20, h: 30, colour: "red" },
      ],
    }),
    check(trace, world) {
      if (last(trace).x < 170) return notYet("Drive all the way across the ash field.");
      const red = (x: number) => world.zones.some((z) => x >= z.x && x <= z.x + z.w);
      const at = trace.sounds.filter((s) => s.kind === "beep").map((s) => trace.frames.find((f) => f.t >= s.t - 0.001)!);
      if (at.some((f) => !red(f.x))) return notYet("You beeped on plain ground. Only sample the red rocks!");
      const hits = new Set(at.map((f) => (f.x < 95 ? 1 : 2)));
      return hits.size === 2 ? pass("2 red samples and no false alarms. Checked, not guessed!") : notYet(`${hits.size} of 2 red patches sampled.`);
    },
    starter: starter("Red rock samples", "console.log(colour());\n", "print(colour())\n"),
  }),

  DS4(1, {
    id: "tunnel-array",
    title: "The crystal tunnel",
    story: { who: "Miner Jo", face: "⛏️", says: "Two crystals are glowing down this tunnel! Write your route as an array of distances and loop through it. Then park at the mine cart." },
    goal: "Store the distances in an array, loop to drive them, collect both crystals and park at the cart.",
    hint: "const route = [40, 50, 25]; for (const d of route) forward(d);",
    scene: { theme: "tunnel", path: "rail", decor: [{ kind: "lamp", x: 40, y: 8 }, { kind: "lamp", x: 100, y: 42 }], zoneIcons: { cart: "crate" } },
    world: base({ w: 160, h: 50, robot: "racer", start: { x: 20, y: 25, heading: 0 }, collectibles: [{ id: "g1", x: 60, y: 25, kind: "gem" }, { id: "g2", x: 110, y: 25, kind: "gem" }], lines: [{ points: [{ x: 0, y: 25 }, { x: 160, y: 25 }] }], zones: [{ id: "cart", x: 125, y: 10, w: 30, h: 30, colour: "orange", label: "Mine cart" }] }),
    check: mineCheck(2, { cart: true }, "2 crystals and a perfect park. Arrays keep your route tidy!"),
    starter: starter("The crystal tunnel", "const route = [10];\nfor (const d of route) { forward(d); }\n", "route = [10]\nfor d in route:\n    forward(d)\n"),
  }),
  DS4(2, {
    id: "vault-turns",
    title: "Round the corner",
    story: { who: "Miner Jo", face: "⛏️", says: 'The next crystal is round a corner. Your array can store turns too: each step is a little pair, like ["left", 90].' },
    goal: "Store moves and turns in your route array. Collect both crystals and reach the cart.",
    hint: 'const route = [["forward", 50], ["left", 90], ["forward", 70]];',
    scene: { theme: "gemvault", decor: [{ kind: "crystal", x: 120, y: 80, colour: "#26C6DA" }, { kind: "crystal", x: 15, y: 20, colour: "#AB47BC" }], zoneIcons: { cart: "crate" } },
    world: base({ w: 140, h: 100, robot: "racer", start: { x: 20, y: 85, heading: 0 }, collectibles: [{ id: "g1", x: 70, y: 85, kind: "gem" }, { id: "g2", x: 70, y: 40, kind: "gem" }], zones: [{ id: "cart", x: 55, y: 4, w: 30, h: 26, colour: "orange", label: "Mine cart" }] }),
    check: mineCheck(2, { cart: true }, "Round the corner and loaded up. Your array remembered every move!"),
    starter: routeStarter("Round the corner"),
  }),
  DS4(3, {
    id: "cave-cost",
    title: "What did it cost?",
    story: { who: "Miner Jo", face: "⛏️", says: "Every centimetre uses battery. Grab the crystal, park at the cart, and print the total cost of your trip. We keep a budget down here!" },
    goal: "Collect the crystal, park at the cart, and print the total distance from your loop.",
    hint: "Add each forward amount to a cost variable inside the loop, then console.log(cost).",
    scene: { theme: "cave", decor: [{ kind: "lamp", x: 30, y: 8 }, { kind: "crystal", x: 150, y: 44, colour: "#FFCA28" }], zoneIcons: { cart: "crate" } },
    world: base({ w: 160, h: 50, robot: "racer", start: { x: 20, y: 25, heading: 0 }, collectibles: [{ id: "g1", x: 90, y: 25, kind: "gem" }], zones: [{ id: "cart", x: 120, y: 10, w: 30, h: 30, colour: "orange", label: "Mine cart" }] }),
    check: mineCheck(1, { cart: true, print: true }, "Trip cost: {used} cm. Now you know where the battery goes!"),
    starter: routeStarter("What did it cost?"),
  }),
  DS4(4, {
    id: "lava-budget",
    title: "Which way is cheaper?",
    story: { who: "Miner Jo", face: "⛏️", says: "Careful: there's a lava pool in the way, and the battery's low. There are two ways round to the mine cart. Store both routes as arrays, add up each one, print both totals, then drive the cheaper one. Only 175 cm of battery left!" },
    goal: "Store route A and route B as arrays. Print the total of each, then drive the cheaper one to the cart.",
    hint: 'A: [["left", 90], ["forward", 60], ["right", 90], ["forward", 110]]. B: [["left", 90], ["forward", 75], ["right", 90], ["forward", 110], ["right", 90], ["forward", 15]]. Write a function cost(route).',
    scene: { theme: "lavalake", wall: "rockface", decor: [{ kind: "lava", x: 59, y: 82, r: 7 }], zoneIcons: { cart: "crate" } },
    world: base({
      w: 150,
      h: 110,
      robot: "racer",
      start: { x: 20, y: 90, heading: 0 },
      walls: [{ x: 48, y: 44, w: 22, h: 66 }],
      zones: [{ id: "cart", x: 116, y: 15, w: 30, h: 30, colour: "orange", label: "Mine cart" }],
    }),
    check(trace, world) {
      if (!printed(trace, 170) || !printed(trace, 200)) return notYet("Print the total of BOTH routes before you choose.");
      const used = Math.round(trace.stats.distance);
      if (!inZone(last(trace), world.zones[0])) return notYet("Now drive the cheaper route to the mine cart.");
      return used <= 175 ? pass(`Route A: 170 cm, route B: 200 cm. You picked the cheaper one and saved 30 cm of battery!`) : notYet(`You drove ${used} cm. That's the expensive route! Drive the cheaper one.`);
    },
    starter: routeStarter("Which way is cheaper?"),
  }),
  DS4(5, {
    id: "cavern-square",
    title: "The crystal loop",
    story: { who: "Miner Jo", face: "⛏️", says: "4 crystals sit around a pillar, one on each side. Same move, 4 times... sounds like a loop! Print your total cost when you're done." },
    goal: "Drive a square round the pillar with a loop, collect all 4 crystals and print the cost.",
    hint: "for (let i = 0; i < 4; i++) { forward(50); turnLeft(90); cost += 50; }",
    scene: { theme: "cavern", wall: "rockface", decor: [{ kind: "lamp", x: 8, y: 8 }, { kind: "lamp", x: 100, y: 100 }] },
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
    check: mineCheck(4, { print: true }, "4 crystals for {used} cm, with one loop. Miner Jo is impressed!"),
    starter: routeStarter("The crystal loop"),
  }),

  DC(1, {
    id: "hall-wall",
    title: "Night shift",
    story: { who: "Guard Gus", face: "💂", says: "It's my first night with a robot helper! Patrol to the end of the hall, beep at the checkpoint, then come all the way back to me. Count your steps so you know how far to go back." },
    goal: "Drive to the end wall without touching it, beep, then drive backward to where you started.",
    hint: "let steps = 0; while (!obstacle()) { forward(2); steps++; } beep(); backward(steps * 2);",
    scene: { theme: "hall", wall: "gallery", decor: [{ kind: "statue", x: 60, y: 44 }, { kind: "statue", x: 120, y: 44 }] },
    world: corridor(),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Check obstacle() before every step.");
      const atWall = trace.frames.find((f) => f.sensors.obstacle);
      if (!atWall) return notYet("Patrol all the way to the end wall first.");
      if (!trace.sounds.some((x) => x.kind === "beep" && x.t >= atWall.t)) return notYet("Beep at the checkpoint by the end wall.");
      const f = last(trace);
      return Math.abs(f.x - world.start.x) <= 3 ? pass("Patrol done and back with Gus. Your counter brought you home!") : notYet("Now go back to exactly where you started. Use a variable to count your steps.");
    },
    starter: starter("Night shift", "let steps = 0;\nforward(10);\n", "steps = 0\nforward(10)\n"),
  }),
  DC(2, {
    id: "dino-light",
    title: "Dinosaur hall",
    story: { who: "Guard Gus", face: "💂", says: "The dinosaur hall is pitch black at night. Light it up so I can see the T. rex, then switch off when it's bright again. Stop before the wall." },
    goal: "Light on in the dark, off where it's bright. Stop before the end wall.",
    hint: "In your loop: if (light() < 30) led on, else led off. Then check obstacle().",
    scene: { theme: "dinohall", wall: "gallery", decor: [{ kind: "dino", x: 84, y: 40 }] },
    world: corridor({ lightZones: [{ x: 60, y: 6, w: 50, h: 44, level: 12, label: "Dino hall" }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Stop before the wall.");
      if (!last(trace).sensors.obstacle) return notYet("Keep going until the wall is close.");
      return lightMatch(trace, world) >= 0.85 ? pass("ROAR! Gus saw the T. rex in your light, and you saved power after. Smart!") : notYet("Light on in the dark hall, off where it's bright.");
    },
    starter: starter("Dinosaur hall", "forward(10);\n", "forward(10)\n"),
  }),
  DC(3, {
    id: "sculpture-photo",
    title: "Photo for the catalogue",
    story: { who: "Curator Ines", face: "👩‍💼", says: "We need a photo of our new sculpture for the catalogue. When the floor under you turns yellow, that's the photo spot. Take ONE photo, then carry on to the wall." },
    goal: "When the floor under you is yellow, take one photo(). Then stop before the wall.",
    hint: 'if (colour() === "yellow" && !taken) { photo(); taken = true; }',
    scene: { theme: "sculpture", wall: "gallery", decor: [{ kind: "statue", x: 97, y: 44 }] },
    world: corridor({ zones: [{ id: "spot", x: 86, y: 6, w: 22, h: 44, colour: "yellow", label: "Photo spot" }] }),
    check(trace, world) {
      const spot = world.zones[0];
      if (trace.stats.bumps > 0) return notYet("Bump! Stop before the wall.");
      if (trace.stats.photos.length > 1) return notYet("Just ONE photo, please. Use a variable to remember you took it.");
      const inSpot = trace.stats.photos.some((t) => {
        const f = trace.frames.find((fr) => fr.t >= t);
        return f && inZone(f, spot);
      });
      if (!inSpot) return notYet("Take the photo while you're on the yellow spot.");
      return last(trace).sensors.obstacle ? pass("Perfect shot for the catalogue! Ines is printing it now.") : notYet("Great photo! Now keep going until the wall is close.");
    },
    starter: starter("Photo for the catalogue", "forward(10);\n", "forward(10)\n"),
  }),
  DC(4, {
    id: "school-corner",
    title: "The corner",
    story: { who: "Guard Gus", face: "💂", says: "This hall turns a corner! Here's the trick: IF a wall is ahead, turn left. ELSE, step forward. Count your turns so you know when you've arrived." },
    goal: "If a wall is ahead, turn left; else step forward. Reach the Masterpiece room.",
    hint: "After 1 turn, the next wall means you've arrived.",
    scene: { theme: "classroom", wall: "gallery", zoneIcons: { exit: "star" } },
    world: base({ w: 160, h: 110, robot: "racer", start: { x: 15, y: 95, heading: 0 }, light: 85, walls: [{ x: 0, y: 0, w: 120, h: 75 }], zones: [{ id: "exit", x: 122, y: 0, w: 38, h: 28, colour: "yellow", label: "Masterpiece room" }] }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Turn before you touch a wall.");
      return inZone(last(trace), world.zones[0]) ? pass("Round the corner, all by sensor. Gus didn't even need a map!") : notYet("Keep going: if a wall is ahead, turn left.");
    },
    starter: starter("The corner", "forward(10);\n", "forward(10)\n"),
  }),
  DC(5, {
    id: "glasshouse-u",
    title: "Full patrol lap",
    story: { who: "Curator Ines", face: "👩‍💼", says: "Tonight, patrol the WHOLE glass house: all the way round the outside, past every wall, and stop back where you started. Count your corners so you know when the lap is done." },
    goal: "Use if wall ahead → turn left, else → forward. Count your turns and stop after one full lap, back near the start.",
    hint: "After 3 turns, the next wall means the lap is done. Stop there.",
    scene: { theme: "greenhouse", decor: [{ kind: "plant", x: 80, y: 55 }, { kind: "plant", x: 60, y: 50 }, { kind: "plant", x: 100, y: 60 }] },
    world: base({ w: 160, h: 110, robot: "racer", start: { x: 15, y: 95, heading: 0 }, light: 85 }),
    check(trace, world) {
      if (trace.stats.bumps > 0) return notYet("Bump! Turn before you touch a wall.");
      if (trace.stats.turned < 265) return notYet("Keep going round. A full lap passes all 4 walls.");
      if (sweptAround(trace, { x: 80, y: 55 }) < 300) return notYet("Go all the way round the glass house.");
      const f = last(trace);
      return Math.hypot(f.x - world.start.x, f.y - world.start.y) <= 15 ? pass("One full lap, counted by your code. Ines can lock up now!") : notYet("You kept going! Count your turns and stop when you're back at the start.");
    },
    starter: starter("Full patrol lap", "let turns = 0;\nforward(10);\n", "turns = 0\nforward(10)\n"),
  }),
];

// ============================================================ ENGINEERS (Grades 6 to 8, Python)

const GS1 = semester("Engineers", "S1", "S1 Password Strength Checker", ["Functions", "if / elif / else", "Cybersecurity"]);
const GS2 = semester("Engineers", "S2", "S2 Smart Sorting AI", ["Dictionaries", "Functions", "Classifying"]);
const GS3 = semester("Engineers", "S3", "S3 Chatbot for Good", ["Dictionaries", "Intents", "AI ethics"]);
const GS4 = semester("Engineers", "S4", "S4 Data Detective", ["Lists", "Statistics", "Data"]);
const GC = semester("Engineers", "Capstone", "Capstone Innovation Challenge", ["Design thinking", "Data", "Sustainability"]);

type VaultLayout = "right" | "far" | "up" | "turn";
const vaultWorld = (codes: string[], layout: VaultLayout = "right") => {
  if (layout === "far")
    return base({ w: 190, h: 70, robot: "rover", start: { x: 20, y: 35, heading: 0 }, codes, doors: [{ x: 132, y: 4, w: 7, h: 62 }], walls: [{ x: 132, y: 0, w: 58, h: 4 }, { x: 132, y: 66, w: 58, h: 4 }], collectibles: [{ id: "treasure", x: 168, y: 35, kind: "treasure" }] });
  if (layout === "up")
    return base({ w: 120, h: 110, robot: "rover", start: { x: 60, y: 90, heading: 90 }, codes, doors: [{ x: 30, y: 46, w: 60, h: 7 }], walls: [{ x: 0, y: 46, w: 30, h: 7 }, { x: 90, y: 46, w: 30, h: 7 }], collectibles: [{ id: "treasure", x: 60, y: 18, kind: "treasure" }] });
  if (layout === "turn")
    return base({ w: 140, h: 100, robot: "rover", start: { x: 20, y: 30, heading: 0 }, codes, doors: [{ x: 82, y: 4, w: 7, h: 52 }], walls: [{ x: 82, y: 0, w: 58, h: 4 }, { x: 82, y: 56, w: 7, h: 44 }], collectibles: [{ id: "treasure", x: 112, y: 78, kind: "treasure" }] });
  return base({
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
};
const vaultCheck = (strongAt: number, win: string) => (trace: Trace) => {
  const reads = trace.stats.codeReads;
  const un = trace.stats.unlocks;
  if (un.some((u) => u.codesRead < strongAt)) return notYet("The door opened for a passcode that breaks the rule! Only unlock() for the right one.");
  if (reads.length < strongAt) return notYet(`You read ${reads.length} of ${strongAt} passcodes. Use next_code() in a loop.`);
  if (trace.sounds.filter((s) => s.kind === "beep" && s.t < reads[strongAt - 1]).length < strongAt - 1) return notYet("Beep once for each passcode you reject.");
  if (!un.length) return notYet("That passcode passes the rule. unlock() the door.");
  if (!trace.stats.collected.length) return notYet("The door is open. Drive in and grab the chest.");
  return pass(win);
};
const vaultStarter = starter("Passcodes", "const code = nextCode();\nconsole.log(code);\n", "code = next_code()\nprint(code)\n");

const crates: Zone[] = [
  { id: "apples", x: 120, y: 5, w: 35, h: 28, colour: "red", label: "Apples" },
  { id: "oranges", x: 120, y: 36, w: 35, h: 28, colour: "orange", label: "Oranges" },
  { id: "bananas", x: 120, y: 67, w: 35, h: 28, colour: "yellow", label: "Bananas" },
];
const sortCheck = (zoneFor: Record<string, string>, win: string) => (trace: Trace, world: World) => {
  let right = 0;
  for (const it of world.items) {
    const z = world.zones.find((s) => s.id === zoneFor[it.colour])!;
    if (inZone(itemAt(trace, world, it.id), z)) right++;
  }
  const n = world.items.length;
  return right === n ? pass(win) : notYet(`${right} of ${n} in the right crate.`);
};
const factoryWorld = (items: World["items"], zones: Zone[] = crates) => base({ w: 160, h: 100, robot: "rover", start: { x: 70, y: 50, heading: 180 }, items, zones });

const chatWorld = (messages: string[], zones: Zone[] = []) => base({ w: 120, h: 80, robot: "rover", start: { x: 20, y: 70, heading: 0 }, messages, zones });
const chatStarter = starter("Messages", "const message = nextMessage();\nconsole.log(message);\n", "message = next_message()\nprint(message)\n");

const fieldWorld = (zones: { x: number; temp: number }[]) =>
  base({ w: 200, h: 60, robot: "rover", start: { x: 12, y: 30, heading: 0 }, temp: 25, heatZones: zones.map((z) => ({ x: z.x, y: 0, w: 40, h: 60, temp: z.temp })) });
const temps = (trace: Trace) => trace.data.filter((d) => typeof d.value === "number").map((d) => d.value as number);
const tempStarter = starter("Survey", 'record("temp", temperature());\n', 'record("temp", temperature())\n');

const solarWorld = (panels: { x: number; y: number }[]) =>
  base({ w: 170, h: 100, robot: "rover", start: { x: 15, y: 20, heading: 0 }, collectibles: panels.map((p, i) => ({ id: `p${i + 1}`, ...p, kind: "panel" as const })) });
const powerData = (trace: Trace) => trace.data.filter((d) => /power/i.test(d.name) && typeof d.value === "number").map((d) => d.value as number);
const solarStarter = starter("Solar", 'record("power", power());\n', 'record("power", power())\n');

export const ENGINEER_LABS: Mission[] = [
  GS1(1, {
    id: "deck-read",
    title: "The first passcode",
    story: { who: "Captain Mira", face: "⚓", says: "Welcome aboard, engineer! Our new deckhand just set a passcode for the captain's cabin. Read it with next_code() and tell me how long it is. Short passcodes are easy for pirates to guess." },
    goal: "Read one passcode and print its length.",
    hint: "code = next_code(), then print(len(code)).",
    scene: { theme: "deck", decor: [{ kind: "barrel", x: 15, y: 10 }, { kind: "barrel", x: 22, y: 60 }, { kind: "ship", x: 60, y: 10 }] },
    world: vaultWorld(["1234"]),
    check: (trace) => (trace.stats.codeReads.length && printed(trace, 4) ? pass("4 characters. A pirate could guess that before lunch! Time for some rules.") : notYet("Read the code and print its length with len().")),
    starter: vaultStarter,
  }),
  GS1(2, {
    id: "cave-length",
    title: "Long enough?",
    story: { who: "Captain Mira", face: "⚓", says: "The crew is choosing a new passcode for the supply cave at the end of the tunnel. Rule 1: 12 characters or more. Beep to reject anything shorter. When a crew member picks a long one, unlock() to test it and fetch the supplies." },
    goal: "Beep for passcodes under 12 characters. unlock() for the first long one, then drive in and grab the chest.",
    hint: "if len(code) >= 12: unlock() ... else: beep(). Read the next code in a loop.",
    scene: { theme: "cave", decor: [{ kind: "lamp", x: 30, y: 8 }, { kind: "barrel", x: 40, y: 60 }] },
    world: vaultWorld(["sunny", "treasure-map-key"], "far"),
    check: vaultCheck(2, "Short one rejected, long one accepted. Rule 1 works!"),
    starter: vaultStarter,
  }),
  GS1(3, {
    id: "dock-digit",
    title: "Strength meter",
    story: { who: "Quartermaster Ben", face: "🧔", says: "No doors today. The crew wants a strength meter! For each passcode, show weak (under 12 characters), ok (long but no number) or strong (long AND has a number). Leave each answer up for 1 second." },
    goal: "For each of the 3 passcodes, display weak, ok or strong using if / elif / else. Wait 1 second after each.",
    hint: 'if len(code) < 12: display("weak") elif not any(ch.isdigit() for ch in code): display("ok") else: display("strong")',
    scene: { theme: "boardwalk", decor: [{ kind: "ship", x: 40, y: 62 }, { kind: "barrel", x: 60, y: 8 }] },
    world: base({ w: 100, h: 70, robot: "rover", start: { x: 50, y: 40, heading: 90 }, codes: ["seashell5", "seashells-and-sand", "seashells-and-sand5"] }),
    check(trace) {
      const reads = trace.stats.codeReads;
      if (reads.length < 3) return notYet(`You read ${reads.length} of 3 passcodes. Use next_code() in a loop.`);
      if (trace.stats.unlocks.length) return notYet("No doors today! Just rate each passcode.");
      const want = [/weak/i, /^ok|ok$|medium/i, /strong/i];
      for (let i = 0; i < 3; i++) {
        const end = reads[i + 1] ?? Infinity;
        const shown = trace.frames.filter((f) => f.t >= reads[i] && f.t < end).map((f) => f.display);
        if (!shown.some((d) => want[i].test(d))) return notYet(`Passcode ${i + 1} should show "${["weak", "ok", "strong"][i]}". Check your if / elif / else.`);
      }
      return pass("weak, ok, strong. Your meter tells the crew exactly how good each passcode is.");
    },
    starter: vaultStarter,
  }),
  GS1(4, {
    id: "beach-strong",
    title: "is_strong()",
    story: { who: "Captain Mira", face: "⚓", says: "Time to write the real thing. Make a function, is_strong(code): 12+ characters with a letter, a number AND a symbol. Test the crew's codes for the beach hut. The chest is round the corner inside." },
    goal: "Write is_strong(code). Beep for weak codes; unlock() for the strong one, then drive in and turn to reach the chest.",
    hint: "Combine your checks with and. Return True or False.",
    scene: { theme: "beach", decor: [{ kind: "palm", x: 10, y: 60 }, { kind: "umbrella", x: 60, y: 10 }] },
    world: vaultWorld(["Password1", "pass word!", "Sky-Rover-2027!"], "turn"),
    check: vaultCheck(3, "is_strong() caught two weak ones. That function is ready for the real vault."),
    starter: vaultStarter,
  }),
  GS1(5, {
    id: "fort-lockout",
    title: "Lockout",
    story: { who: "Captain Mira", face: "⚓", says: "Pirates are guessing at the fort door, again and again! After 3 wrong tries in a row, show 'Locked' and NEVER open, even if a good code comes next." },
    goal: 'After 3 weak passcodes in a row, display "Locked" and stop. Never unlock.',
    hint: 'Count the weak codes. When the count reaches 3: display("Locked") and break.',
    scene: { theme: "village", decor: [{ kind: "barrel", x: 40, y: 60 }, { kind: "lamp", x: 10, y: 8 }] },
    world: vaultWorld(["1111", "abc", "qwerty", "Golden-Key-2027!"], "up"),
    check(trace) {
      if (trace.stats.unlocks.length) return notYet("The door opened after 3 wrong tries! A lockout must stop that.");
      if (trace.stats.codeReads.length < 3) return notYet("Read the passcodes with next_code().");
      if (trace.stats.beeps < 3) return notYet("Beep for each weak passcode.");
      return trace.frames.some((f) => /lock/i.test(f.display)) ? pass("Locked after 3 tries. Guessing attacks stop right here.") : notYet('Show "Locked" on the screen after 3 wrong tries.');
    },
    starter: vaultStarter,
  }),

  GS2(1, {
    id: "qa-colour",
    title: "What colour is it?",
    story: { who: "Engineer Raj", face: "👨‍🏭", says: "Welcome to the quality lab. Our sorting AI starts with one simple question: what colour is this fruit? Read it with item_colour() and print the answer." },
    goal: "Print the colour of the fruit in front of the robot.",
    hint: "print(item_colour())",
    scene: { theme: "classroom", decor: [{ kind: "desk", x: 15, y: 15 }, { kind: "desk", x: 85, y: 85 }] },
    world: base({ w: 100, h: 100, robot: "rover", start: { x: 52, y: 50, heading: 180 }, items: [{ id: "f1", x: 41, y: 50, colour: "red", kind: "fruit" }] }),
    check: (trace) => (trace.log.some((l) => /red/.test(l.text)) ? pass("red. That's the first piece of data our AI needs.") : notYet("Print item_colour() to see the fruit's colour.")),
    starter: starter("What colour is it?", "forward(5);\n", "forward(5)\n"),
  }),
  GS2(2, {
    id: "warehouse-lookup",
    title: "Look it up",
    story: { who: "Engineer Raj", face: "👨‍🏭", says: "Instead of a long chain of ifs, we use a dictionary: colour in, crate out. Pick up this apple, look up its crate, and drop it there." },
    goal: "Pick up the fruit, look up its crate in a dictionary, and drop it there.",
    hint: 'crate_y = {"red": 19, "orange": 50, "yellow": 81}. Then drive to that row and drop.',
    scene: { theme: "warehouse", decor: [{ kind: "barrel", x: 90, y: 92 }, { kind: "conveyor", x: 22, y: 30, h: 40 }], zoneIcons: { apples: "crate", oranges: "crate", bananas: "crate" } },
    world: factoryWorld([{ id: "b1", x: 30, y: 50, colour: "red", kind: "fruit" }]),
    check: sortCheck({ red: "apples", orange: "oranges", yellow: "bananas" }, "Apple in the Apples crate. One dictionary lookup did it!"),
    starter: starter("Look it up", "console.log(itemColour());\n", "print(item_colour())\n"),
  }),
  GS2(3, {
    id: "loading-goto",
    title: "go_to()",
    story: { who: "Forklift Freya", face: "👷‍♀️", says: "A good sorting robot can drive to ANY spot. Write go_to(x, y), then prove it: visit loading bays A, B and C, in that order." },
    goal: "Write go_to(x, y) and use it to visit A, then B, then C.",
    hint: "Keep track of x, y and the heading. Turn to face the target (math.atan2), then drive the distance (math.hypot).",
    scene: { theme: "sidewalk", decor: [{ kind: "cone", x: 70, y: 50 }, { kind: "barrel", x: 10, y: 90 }], zoneIcons: { a: "star", b: "star", c: "star" } },
    world: factoryWorld([], [
      { id: "a", x: 20, y: 8, w: 22, h: 22, colour: "blue", label: "A" },
      { id: "b", x: 120, y: 8, w: 22, h: 22, colour: "green", label: "B" },
      { id: "c", x: 120, y: 70, w: 22, h: 22, colour: "purple", label: "C" },
    ]),
    check(trace, world) {
      const order: string[] = [];
      for (const f of trace.frames) for (const z of world.zones) if (inZone(f, z) && !order.includes(z.id!)) order.push(z.id!);
      if (order.length < 3) return notYet(`${order.length} of 3 bays visited.`);
      return order.join("") === "abc" ? pass("A, B, C. Your go_to() can take the robot anywhere!") : notYet("Visit them in order: A, then B, then C.");
    },
    starter: starter("go_to()", "forward(10);\n", "forward(10)\n"),
  }),
  GS2(4, {
    id: "market-two",
    title: "Stock count",
    story: { who: "Mr. Okafor", face: "👨‍🌾", says: "Before I open my fruit stand, I need a stock count. Visit each fruit, read its colour, and count them in a dictionary, like {'red': 2}. Then print it for me. No packing today!" },
    goal: "Visit all 3 fruits, count each colour in a dictionary, and print the dictionary.",
    hint: "counts = {}. For each fruit: counts[colour] = counts.get(colour, 0) + 1. Then print(counts).",
    scene: { theme: "snackbar", decor: [{ kind: "umbrella", x: 110, y: 15 }, { kind: "flower", x: 90, y: 92 }] },
    world: factoryWorld(
      [
        { id: "b1", x: 30, y: 19, colour: "red", kind: "fruit" },
        { id: "b2", x: 30, y: 50, colour: "yellow", kind: "fruit" },
        { id: "b3", x: 30, y: 81, colour: "red", kind: "fruit" },
      ],
      [],
    ),
    check(trace) {
      if (trace.stats.pickUps) return notYet("No packing today! Just count. Leave the fruit where it is.");
      const text = trace.log.map((l) => l.text).join(" ");
      if (!/red\D{0,6}2/.test(text) || !/yellow\D{0,6}1/.test(text)) return notYet("Print your counts. There should be 2 red and 1 yellow.");
      return pass("2 red, 1 yellow. Stock count done, and a dictionary did the counting!");
    },
    starter: starter("Stock count", "const counts = {};\nconsole.log(counts);\n", "counts = {}\nprint(counts)\n"),
  }),
  GS2(5, {
    id: "greenhouse-unknown",
    title: "Never seen it before",
    story: { who: "Engineer Raj", face: "👨‍🏭", says: "Here's a real AI problem: a purple fruit from the greenhouse, and our dictionary has never seen purple! A responsible AI sends anything it doesn't know to a person to check." },
    goal: "Pack the apple. Send the purple fruit to the Check crate, using a default value.",
    hint: 'crate.get(colour, "check") gives a default when the colour is missing.',
    scene: { theme: "greenhouse", decor: [{ kind: "plant", x: 70, y: 90 }, { kind: "plant", x: 90, y: 10 }], zoneIcons: { apples: "crate", check: "crate" } },
    world: factoryWorld(
      [
        { id: "b1", x: 30, y: 19, colour: "red", kind: "fruit" },
        { id: "b2", x: 30, y: 50, colour: "purple", kind: "fruit" },
      ],
      [crates[0], { id: "check", x: 120, y: 36, w: 35, h: 28, colour: "grey", label: "Check" }],
    ),
    check: sortCheck({ red: "apples", purple: "check" }, "The AI knew what it didn't know, and asked a human. That's responsible AI."),
    starter: starter("Never seen it before", "console.log(itemColour());\n", "print(item_colour())\n"),
  }),

  GS3(1, {
    id: "control-read",
    title: "Incoming messages",
    story: { who: "Astronaut Kai", face: "👨‍🚀", says: "Hello from orbit! You're at our snowy ground station up north. I'm sending you 3 messages. Read each one with next_message() and print it. An empty message means I'm done talking." },
    goal: "Read and print every message until an empty one arrives.",
    hint: 'while message != "": print(message); message = next_message()',
    scene: { theme: "snowpark", decor: [{ kind: "dish", x: 15, y: 15 }, { kind: "pine", x: 95, y: 20, r: 6 }] },
    world: chatWorld(["hello robot", "how are you", "bye"]),
    check(trace) {
      const got = ["hello robot", "how are you", "bye"].filter((m) => trace.log.some((l) => l.text.includes(m))).length;
      return got === 3 ? pass("All 3 messages received. Hello, Kai!") : notYet(`${got} of 3 messages printed. Use a loop.`);
    },
    starter: chatStarter,
  }),
  GS3(2, {
    id: "bridge-split",
    title: "Split it",
    story: { who: "Astronaut Kai", face: "👨‍🚀", says: "My messages are short, like 'forward 30'. That's a word and a number stuck together. split() them apart and drive the right distance." },
    goal: "Split each message into a word and a number, and drive that far.",
    hint: "word, num = message.split() then forward(int(num)).",
    scene: { theme: "bridge", decor: [{ kind: "window", x: 30, y: 2, w: 60 }, { kind: "console", x: 100, y: 70 }] },
    world: chatWorld(["forward 30", "forward 20"]),
    check: (trace) => (Math.abs(trace.stats.distance - 50) <= 1 ? pass("30 + 20 = 50 cm. Message understood!") : notYet(`You drove ${Math.round(trace.stats.distance)} cm. The messages add up to 50.`)),
    starter: chatStarter,
  }),
  GS3(3, {
    id: "lab-intents",
    title: "Words to actions",
    story: { who: "Dr. Yuki", face: "👩‍🔬", says: "Chatbots match words to intents. Build a dictionary that maps 'forward', 'left' and 'right' to robot functions, then follow my messages to the microscope." },
    goal: "Use a dictionary of actions to follow the messages to the microscope.",
    hint: 'actions = {"forward": forward, "left": turn_left, "right": turn_right}',
    scene: { theme: "lab2", decor: [{ kind: "desk", x: 100, y: 15 }, { kind: "dish", x: 100, y: 62 }], zoneIcons: { lab: "lab" } },
    world: chatWorld(["forward 60", "left 90", "forward 30"], [{ id: "lab", x: 68, y: 28, w: 24, h: 24, colour: "purple", label: "Microscope" }]),
    check: (trace, world) => (inZone(last(trace), world.zones[0]) ? pass("Words became actions. That's how intents work!") : notYet("Follow the messages to reach the microscope.")),
    starter: chatStarter,
  }),
  GS3(4, {
    id: "observatory-refuse",
    title: "Not that button!",
    story: { who: "Astronaut Kai", face: "👨‍🚀", says: "We're in the launch hangar, next to the airlock. Uh-oh: someone in the chat asked the robot to 'open the airlock'. A helpful robot must NOT do that. Show a polite refusal, then keep helping." },
    goal: "Refuse anything that isn't a known move with a polite message on the screen. Do the moves you do know.",
    hint: 'If the word isn\'t in your dictionary: display("Sorry, I can\'t do that").',
    scene: { theme: "hangar", decor: [{ kind: "rocket", x: 92, y: 20 }, { kind: "cone", x: 15, y: 10 }] },
    world: chatWorld(["forward 20", "open the airlock", "forward 20"]),
    check(trace) {
      const r = trace.stats.messageReads;
      if (r.length < 3) return notYet("Read all the messages.");
      if (!trace.frames.some((f) => f.t >= r[1] && f.t < r[2] && f.display)) return notYet("Show a polite refusal when you get an unknown request.");
      return Math.abs(trace.stats.distance - 40) <= 1 ? pass("Polite, safe and still helpful. Kai can breathe easy!") : notYet("Only the forward messages should move the robot (40 cm in total).");
    },
    starter: chatStarter,
  }),
  GS3(5, {
    id: "airlock-stop",
    title: "Stop means stop",
    story: { who: "Commander Lin", face: "👩‍🚀", says: "We're testing you in the rover tunnel. Safety rule number one: when a human says 'stop', the robot stops. Right away, no matter what comes next." },
    goal: 'When the message is "stop", stop the robot and ignore everything after it.',
    hint: 'if word == "stop": break',
    scene: { theme: "tunnel", decor: [{ kind: "lamp", x: 80, y: 8 }, { kind: "lamp", x: 80, y: 72 }] },
    world: chatWorld(["forward 30", "stop", "forward 40"]),
    check(trace) {
      if (trace.stats.messageReads.length < 2) return notYet("Read the messages in a loop.");
      return Math.abs(trace.stats.distance - 30) <= 1 ? pass("It stopped when told. That's a robot humans can trust.") : notYet('The robot kept going after "stop".');
    },
    starter: chatStarter,
  }),

  GS4(1, {
    id: "ash-one",
    title: "The first reading",
    story: { who: "Dr. Amara", face: "🌋", says: "Welcome to the ash field. Every investigation starts with ONE measurement. Record the temperature right here, then look at the Data tab." },
    goal: 'Record one temperature reading with record("temp", temperature()).',
    hint: "record() saves a name and a value to the Data tab.",
    scene: { theme: "ashfield", decor: [{ kind: "rock", x: 60, y: 10, r: 3 }, { kind: "rock", x: 150, y: 48, r: 2 }] },
    world: fieldWorld([{ x: 60, temp: 40 }, { x: 120, temp: 55 }]),
    check: (trace) => (temps(trace).length >= 1 ? pass(`First reading: ${temps(trace)[0]} °C. Every dataset starts with one number.`) : notYet('Use record("temp", temperature()).')),
    starter: starter("The first reading", "console.log(temperature());\n", "print(temperature())\n"),
  }),
  GS4(2, {
    id: "lake-five",
    title: "Along the lava lake",
    story: { who: "Dr. Amara", face: "🌋", says: "One reading can't show a pattern. Drive along the lava lake in 10 cm steps and record the temperature after each one. I need at least 5." },
    goal: "Drive in 10 cm steps and record the temperature after each. At least 5 readings.",
    hint: 'for i in range(5): forward(10); record("temp", temperature())',
    scene: { theme: "lavalake", decor: [{ kind: "lava", x: 100, y: 52, r: 6 }, { kind: "lava", x: 160, y: 8, r: 4 }] },
    world: fieldWorld([{ x: 20, temp: 70 }, { x: 60, temp: 120 }, { x: 100, temp: 90 }]),
    check(trace) {
      const n = temps(trace).length;
      if (n < 5) return notYet(`${n} of 5 readings recorded.`);
      return trace.stats.distance >= 40 ? pass("5 readings along the lake. Now it's a dataset!") : notYet("Drive between readings so they come from different places.");
    },
    starter: tempStarter,
  }),
  GS4(3, {
    id: "dunes-max",
    title: "The hottest vent",
    story: { who: "Dr. Amara", face: "🌋", says: "These sand dunes hide hot vents, and one row of readings could miss them. Sweep the field like a lawnmower: along the top row, down, and back along the bottom. Then print the hottest reading. Python's max() will help." },
    goal: "Sweep both rows, recording at least 8 readings in a list, then print the hottest one with max().",
    hint: "Row 1: 8 times forward(15) and record. Turn right, forward(40), turn right. Row 2: the same. Then print(max(readings)).",
    scene: { theme: "dunes", decor: [{ kind: "cactus", x: 150, y: 10 }, { kind: "rock", x: 20, y: 80, r: 3 }] },
    world: base({
      w: 170,
      h: 90,
      robot: "rover",
      start: { x: 12, y: 25, heading: 0 },
      temp: 25,
      heatZones: [
        { x: 60, y: 10, w: 30, h: 30, temp: 85 },
        { x: 30, y: 50, w: 30, h: 30, temp: 60 },
        { x: 100, y: 50, w: 30, h: 30, temp: 140 },
      ],
    }),
    check(trace) {
      const t = temps(trace);
      if (t.length < 8) return notYet(`${t.length} of 8 readings recorded.`);
      if (!trace.frames.some((f) => f.y < 40) || !trace.frames.some((f) => f.y > 55)) return notYet("Sweep BOTH rows. The hottest vent might be hiding in the one you skipped.");
      const m = Math.max(...t);
      return printed(trace, m) ? pass(`Hottest vent: ${m} °C, found in the second row. A full sweep paid off!`) : notYet("Print the hottest reading with max().");
    },
    starter: tempStarter,
  }),
  GS4(4, {
    id: "craters-mean",
    title: "On average",
    story: { who: "Dr. Amara", face: "🌋", says: "Let's measure all the way round the rim of this crater. Some sides are warm, some are cool. Record as you drive, finish where you started, and the mean of all your readings tells us the average heat of the rim." },
    goal: "Drive once round the crater, recording at least 8 readings, and end where you started. Print their mean.",
    hint: "4 sides: on each side, 3 times forward(30) and record. Then turn_left(90). mean = sum(readings) / len(readings)",
    scene: { theme: "mars", wall: "rockface", decor: [{ kind: "rock", x: 130, y: 70, r: 3 }, { kind: "lava", x: 65, y: 60, r: 5 }] },
    world: base({
      w: 140,
      h: 125,
      robot: "rover",
      start: { x: 20, y: 105, heading: 0 },
      temp: 25,
      walls: [{ x: 45, y: 40, w: 40, h: 40 }],
      heatZones: [
        { x: 0, y: 0, w: 140, h: 30, temp: 90 },
        { x: 95, y: 30, w: 45, h: 95, temp: 60 },
        { x: 0, y: 30, w: 35, h: 60, temp: 40 },
      ],
    }),
    check(trace, world) {
      const t = temps(trace);
      if (t.length < 8) return notYet(`${t.length} of 8 readings recorded.`);
      if (trace.stats.bumps > 0) return notYet("Bump! Stay on the rim, round the outside of the crater.");
      if (sweptAround(trace, { x: 65, y: 60 }) < 350) return notYet("Drive all the way round the crater.");
      const f = last(trace);
      if (Math.hypot(f.x - world.start.x, f.y - world.start.y) > 6) return notYet("Finish back where you started.");
      const mean = t.reduce((a, b) => a + b, 0) / t.length;
      return printed(trace, mean, 0.6) ? pass(`Average: ${mean.toFixed(1)} °C. One number that sums up the whole rim.`) : notYet("Print the mean: the sum of your readings divided by how many there are.");
    },
    starter: tempStarter,
  }),
  GS4(5, {
    id: "cavern-hotspot",
    title: "Danger zone",
    story: { who: "Dr. Amara", face: "🌋", says: "This lava tube turns a corner, and somewhere up the side tunnel is a dangerous hot spot. Drive to the end wall, turn left, then creep forward until temperature() goes over 150 °C. STOP and beep to warn the team." },
    goal: "Drive to the wall, turn left, then drive until the temperature is above 150 °C. Stop and beep.",
    hint: "while not obstacle(): forward(2). turn_left(90). while temperature() <= 150: forward(2). beep()",
    scene: { theme: "cavern", wall: "rockface", decor: [{ kind: "lava", x: 130, y: 12, r: 6 }] },
    world: base({
      w: 150,
      h: 120,
      robot: "rover",
      start: { x: 12, y: 102, heading: 0 },
      temp: 25,
      walls: [{ x: 0, y: 0, w: 108, h: 84 }],
      heatZones: [
        { x: 60, y: 84, w: 40, h: 36, temp: 70 },
        { x: 108, y: 40, w: 42, h: 44, temp: 110 },
        { x: 108, y: 0, w: 42, h: 40, temp: 180 },
      ],
    }),
    check(trace, world) {
      const f = last(trace);
      if (trace.stats.bumps > 0) return notYet("Bump! Check obstacle() before every step.");
      const hot = (world.heatZones ?? []).filter((z) => f.x >= z.x && f.x <= z.x + z.w && f.y >= z.y && f.y <= z.y + z.h).pop()?.temp ?? 25;
      if (hot <= 150) return notYet(f.x < 100 ? "Drive to the end wall and turn left into the side tunnel." : "Keep going until the temperature is above 150 °C.");
      return trace.stats.beeps ? pass("Round the corner, hot spot found, team warned. Sensors keep explorers safe.") : notYet("Found it! Now beep to warn the team.");
    },
    starter: starter("Danger zone", "forward(10);\n", "forward(10)\n"),
  }),

  GC(1, {
    id: "roof-baseline",
    title: "Measure first",
    story: { who: "Engineer Noor", face: "👩‍🔧", says: "Our school's rooftop solar panels are covered in dust. Before we fix anything, we measure. Record the power right now: that's your baseline." },
    goal: 'Record the power before cleaning with record("power", power()).',
    hint: "A baseline is the measurement before you change anything.",
    scene: { theme: "rooftopsolar", decor: [{ kind: "lamp", x: 160, y: 90 }] },
    world: solarWorld([{ x: 45, y: 20 }, { x: 85, y: 20 }, { x: 125, y: 20 }]),
    check: (trace) => (powerData(trace).length ? pass(`Baseline: ${powerData(trace)[0]} W. Now you can prove your fix works.`) : notYet('Record power() with record("power", power()).')),
    starter: starter("Measure first", "console.log(power());\n", "print(power())\n"),
  }),
  GC(2, {
    id: "windfarm-row",
    title: "Clean a row",
    story: { who: "Engineer Noor", face: "👩‍🔧", says: "Next to the wind turbines there's a row of 3 dusty panels. Drive along the row to clean them. Watch them sparkle!" },
    goal: "Drive along the row and clean all 3 panels.",
    hint: "The robot cleans a panel by driving over it.",
    scene: { theme: "windfarm", decor: [{ kind: "turbine", x: 150, y: 60 }, { kind: "turbine", x: 30, y: 70 }] },
    world: solarWorld([{ x: 45, y: 20 }, { x: 85, y: 20 }, { x: 125, y: 20 }]),
    check: (trace) => (trace.stats.collected.length === 3 ? pass("Row clean! The panels are sparkling.") : notYet(`${trace.stats.collected.length} of 3 panels clean.`)),
    starter: starter("Clean a row", "forward(20);\n", "forward(20)\n"),
  }),
  GC(3, {
    id: "meadow-before-after",
    title: "Before and after",
    story: { who: "Engineer Noor", face: "👩‍🔧", says: "A pitch needs proof. Record the power, clean the meadow panel, then record the power again. If the number goes up, that's your evidence." },
    goal: "Record power(), clean the panel, then record power() again.",
    hint: "record, forward, record.",
    scene: { theme: "meadow", decor: [{ kind: "flower", x: 20, y: 80 }, { kind: "bee", x: 110, y: 70 }] },
    world: solarWorld([{ x: 60, y: 20 }]),
    check(trace) {
      const p = powerData(trace);
      if (p.length < 2) return notYet("Record power() before AND after cleaning.");
      return p[p.length - 1] > p[0] ? pass(`${p[0]} W before, ${p[p.length - 1]} W after. That's evidence!`) : notYet("Record once before cleaning and once after.");
    },
    starter: solarStarter,
  }),
  GC(4, {
    id: "hill-all",
    title: "Power after every panel",
    story: { who: "Engineer Noor", face: "👩‍🔧", says: "The hillside farm is shaped like a big L. This time, record power() before you start AND after every panel you clean. Then the Data tab will show a staircase going up: proof that every panel matters." },
    goal: "Record power() at the start and after each of the 5 panels. Your readings should go up each time.",
    hint: "record, then for each panel: drive to it and record. Turn right at the corner.",
    scene: { theme: "hill", decor: [{ kind: "turbine", x: 160, y: 50 }] },
    world: solarWorld([{ x: 45, y: 20 }, { x: 85, y: 20 }, { x: 125, y: 20 }, { x: 125, y: 50 }, { x: 125, y: 80 }]),
    check(trace) {
      const p = powerData(trace);
      if (trace.stats.collected.length < 5) return notYet(`${trace.stats.collected.length} of 5 panels clean.`);
      if (p.length < 6) return notYet(`${p.length} of 6 readings. Record once at the start and once after each panel.`);
      const steps = p.slice(1).filter((v, i) => v > p[i]).length;
      return steps >= 5 ? pass(`${p[0]} W up to ${p[p.length - 1]} W in 5 steps. A perfect staircase of evidence!`) : notYet("Record right after each panel, so every reading is higher than the last.");
    },
    starter: solarStarter,
  }),
  GC(5, {
    id: "sunflower-efficient",
    title: "Efficient route",
    story: { who: "Engineer Noor", face: "👩‍🔧", says: "Cleaning robots use energy too! Clean all 6 panels in the sunflower field using no more than 320 cm, and print how far you drove." },
    goal: "Clean all 6 panels with at most 320 cm of driving, and print the distance.",
    hint: "Snake through the rows: across, down, back, down, across.",
    scene: { theme: "sunflowers", decor: [{ kind: "flower", x: 160, y: 10, colour: "#FDD835" }, { kind: "flower", x: 20, y: 95, colour: "#FDD835" }] },
    world: solarWorld([{ x: 50, y: 20 }, { x: 110, y: 20 }, { x: 110, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 80 }, { x: 110, y: 80 }]),
    check(trace) {
      const used = Math.round(trace.stats.distance);
      if (trace.stats.collected.length < 6) return notYet(`${trace.stats.collected.length} of 6 panels clean.`);
      if (used > 320) return notYet(`You drove ${used} cm. Find a route under 320 cm.`);
      return printed(trace, used, 1) ? pass(`All 6 clean in ${used} cm. Efficient AND clean!`) : notYet(`Done in ${used} cm. Print how far you drove.`);
    },
    starter: starter("Efficient route", "forward(20);\n", "forward(20)\n"),
  }),
];
