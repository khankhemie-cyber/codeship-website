/**
 * Robot Lab mission kit: types and helpers shared by every mission file.
 * Robot Lab missions. Each one is a mat (World), a goal the page checks after
 * the run, and starter code. Missions are tagged with the program and
 * semester whose Robot Labs use them (curriculum/robotics in codeship-ops).
 * Project and program names must match the curriculum index exactly.
 */

import type { Trace, World, Zone, Pt } from "./sim";
export type { Trace, World, Zone, Pt };

export type Program = "Explorers" | "Builders" | "Developers" | "Engineers" | "Everyone";
export type Lang = "blocks" | "js" | "py";

export type GoalResult = { ok: boolean; message: string };

/** How the mat is drawn. Decoration only: the simulator never sees it. */
export type Theme =
  | "farm" | "stage" | "ocean" | "snow" | "studio"
  | "disco" | "rail" | "park" | "garden" | "city"
  | "launch" | "beach" | "mars" | "mine" | "museum"
  | "cove" | "factory" | "station" | "volcano" | "solar"
  | "lab"
  // more places, so every mission has its own scene
  | "dawn" | "barn" | "pigpen" | "practice" | "gym" | "party" | "lagoon" | "kelp" | "deep"
  | "snowpark" | "ice" | "village" | "sidewalk" | "paper" | "canvas"
  | "dressing" | "rooftop" | "classroom" | "meadow" | "nightrail" | "dogpark" | "hill" | "greenhouse"
  | "sunflowers" | "firehall" | "street" | "control" | "hangar" | "boardwalk" | "snackbar" | "pier"
  | "dunes" | "craters" | "tunnel" | "cavern" | "gemvault" | "hall" | "dinohall" | "sculpture"
  | "deck" | "cave" | "warehouse" | "lab2" | "bridge" | "garden2" | "ashfield" | "lavalake" | "rooftopsolar" | "windfarm";
export type DecorKind =
  | "hen" | "hay" | "fence" | "barn" | "speaker" | "crowd" | "coral" | "seaweed" | "fish" | "chest"
  | "pine" | "snowman" | "penguin" | "easel" | "paint" | "discoball" | "mountain" | "duck" | "bench"
  | "tree" | "bush" | "rock" | "bee" | "hive" | "lamp" | "building" | "hydrant" | "rocket" | "palm"
  | "umbrella" | "friend" | "crater" | "crystal" | "cart" | "painting" | "statue" | "ship" | "barrel"
  | "conveyor" | "window" | "console" | "lava" | "turbine" | "station"
  | "rooster" | "pig" | "trough" | "tractor" | "balloon" | "mirror" | "desk" | "kitten" | "sun" | "moon"
  | "cloud" | "dino" | "lighthouse" | "cactus" | "flower" | "plant" | "chalk" | "cone" | "shell" | "starfish" | "dish";
export type ZoneIcon = "basket" | "star" | "igloo" | "house" | "school" | "park" | "bin" | "station" | "deck" | "crate" | "lab" | "door";
/** Who tells the story of a mission (shown in a speech bubble). */
export type Story = { who: string; face: string; says: string };
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
  /** A character sets up the mission in a few friendly lines. */
  story?: Story;
  /** Which Robot Lab class of the semester this mission is for (1 to 4, or 1 to 6). */
  lab?: number;
};

export const base = (w: Partial<World> & Pick<World, "w" | "h" | "start" | "robot">): World => ({
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

export const inZone = (p: Pt, z: Zone) => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h;
export const last = (t: Trace) => t.frames[t.frames.length - 1];

export function itemAt(trace: Trace, world: World, id: string): Pt {
  const f = last(trace);
  if (f.items[id]) return f.items[id];
  const it = world.items.find((i) => i.id === id)!;
  return { x: it.x, y: it.y };
}

/** Total angle (degrees) the robot travelled round a centre point. */
export function sweptAround(trace: Trace, c: Pt) {
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

export const numbersIn = (text: string) => text.split(/[^0-9.]+/).filter(Boolean).map(Number);

export const pass = (message: string): GoalResult => ({ ok: true, message });
export const notYet = (message: string): GoalResult => ({ ok: false, message });
