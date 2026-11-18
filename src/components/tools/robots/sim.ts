/**
 * CODEship Robot Lab simulator. Pure logic, no DOM, no timers: the student's
 * program calls the robot API synchronously, every call advances a virtual
 * clock, and the run produces a trace of frames that the page plays back.
 * The worker, the page and the acceptance tests all run this same file, so
 * what a test checks is exactly what a student sees.
 *
 * Units: centimetres and seconds. Heading is in degrees, 0 = facing right,
 * 90 = facing up the mat (turning left adds to the heading). Screen y grows
 * downward, so moving "up" subtracts from y.
 */

export type ColourName = "white" | "black" | "red" | "green" | "blue" | "yellow" | "purple" | "orange" | "pink" | "grey";
export type LedColour = "off" | "red" | "green" | "blue" | "yellow" | "white" | "purple";
export const LED_COLOURS: LedColour[] = ["off", "red", "green", "blue", "yellow", "white", "purple"];

export type Pt = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type Zone = Rect & { colour: ColourName; label?: string; id?: string };
export type LightZone = Rect & { level: number; label?: string };
export type Item = { id: string; x: number; y: number; colour: ColourName; label?: string };
export type Place = Pt & { label: string; kind?: "flower" | "house" | "flag" | "spot" };
export type RobotKind = "scout" | "racer" | "rover";

export type World = {
  /** Mat size in cm. */
  w: number;
  h: number;
  /** Black tape lines (polylines). */
  lines: { points: Pt[]; width?: number }[];
  /** Coloured floor areas. The colour sensor reads them. Later zones sit on top. */
  zones: Zone[];
  /** Solid obstacles. The distance sensor sees them; the robot can't drive through them. */
  walls: Rect[];
  /** Small objects the robot can pick up and drop. */
  items: Item[];
  /** Labels drawn on the mat (flowers, houses, flags). Decoration plus goal checks. */
  places: Place[];
  /** Room light, 0 (dark) to 100 (bright). */
  light: number;
  lightZones: LightZone[];
  /** Seconds (from the start of the run) when a friend claps. */
  claps: number[];
  /** Passcodes visitors type, in order (next_code() hands them out one at a time). */
  codes?: string[];
  /** Chat messages a person sends the robot, in order (next_message()). */
  messages?: string[];
  /** Distance sensor wobble in cm (0 = perfect). Deterministic, so runs repeat exactly. */
  distanceNoise: number;
  /** Show a 10 cm grid. */
  grid: boolean;
  start: { x: number; y: number; heading: number };
  robot: RobotKind;
};

export type Sensors = {
  lineLeft: boolean;
  lineRight: boolean;
  onLine: boolean;
  distance: number;
  obstacle: boolean;
  light: number;
  colour: ColourName;
  itemColour: ColourName | "none";
};

export type Frame = {
  t: number;
  x: number;
  y: number;
  heading: number;
  led: LedColour;
  display: string;
  carrying: string | null;
  /** Positions of items that have moved, by id (only the ones that differ from the world). */
  items: Record<string, Pt>;
  sensors: Sensors;
  bumped: boolean;
};

export type LogLine = { t: number; text: string };
export type DataRow = { t: number; name: string; value: number | string };
export type SoundEvent = { t: number; kind: "beep" | "clap" };

export type RunStats = {
  distance: number;
  bumps: number;
  beeps: number;
  pickUps: number;
  drops: { t: number; id: string; x: number; y: number }[];
  /** First time the robot moved or turned (-1 if it never did). */
  firstMoveAt: number;
  /** Total degrees turned, either way. */
  turned: number;
  /** When each passcode / message was read. */
  codeReads: number[];
  messageReads: number[];
};

export type Trace = {
  frames: Frame[];
  log: LogLine[];
  data: DataRow[];
  sounds: SoundEvent[];
  stats: RunStats;
  /** Set when the run stopped early (time limit). Student errors are reported separately. */
  stoppedReason: string | null;
  endTime: number;
};

export const ROBOT_RADIUS: Record<RobotKind, number> = { scout: 4.5, racer: 6, rover: 7.5 };
/** Longest run, in simulated seconds. Stops a `while True:` that keeps driving forever. */
export const TIME_LIMIT = 180;
const FRAME_DT = 0.05;
const DEFAULT_SPEED = 15; // cm/s
const TURN_SPEED = 150; // degrees/s
const LINE_WIDTH = 2; // cm (real electrical tape is 1.5; a little wider is kinder on screen)
const LINE_SENSOR_FORWARD = 3.2;
const LINE_SENSOR_SIDE = 1.1;
const DISTANCE_MAX = 200;
const OBSTACLE_CM = 15;
const REACH = 7; // how far in front of the robot's edge it can grab or see an item

export class TimeUp extends Error {
  constructor() {
    super(`Time's up: the robot ran for ${TIME_LIMIT} seconds, so the run was stopped. If you used a loop that never ends, that is fine; this is where it stops.`);
    this.name = "TimeUp";
  }
}

export class RobotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RobotError";
  }
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const round1 = (n: number) => Math.round(n * 10) / 10;

function inRect(p: Pt, r: Rect) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function distToSegment(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

function circleHitsRect(c: Pt, r: number, rect: Rect) {
  const nx = Math.max(rect.x, Math.min(c.x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(c.y, rect.y + rect.h));
  return Math.hypot(c.x - nx, c.y - ny) < r;
}

/** Distance along a ray to a rectangle's edge, or Infinity. */
function rayToRect(o: Pt, dx: number, dy: number, r: Rect) {
  let tmin = -Infinity;
  let tmax = Infinity;
  for (const [p, d, lo, hi] of [
    [o.x, dx, r.x, r.x + r.w],
    [o.y, dy, r.y, r.y + r.h],
  ] as const) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return Infinity;
    } else {
      let t1 = (lo - p) / d;
      let t2 = (hi - p) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return Infinity;
    }
  }
  if (tmax < 0) return Infinity;
  return tmin >= 0 ? tmin : 0;
}

/** Small deterministic pseudo-random sequence (same run, same wobble). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Sim {
  readonly world: World;
  x: number;
  y: number;
  heading: number;
  t = 0;
  speed = DEFAULT_SPEED;
  led: LedColour = "off";
  display = "";
  carrying: string | null = null;
  bumped = false;
  items: Map<string, Pt>;
  frames: Frame[] = [];
  log: LogLine[] = [];
  data: DataRow[] = [];
  sounds: SoundEvent[] = [];
  stats: RunStats = { distance: 0, bumps: 0, beeps: 0, pickUps: 0, drops: [], firstMoveAt: -1, turned: 0, codeReads: [], messageReads: [] };
  private clapsHeard = 0;
  private rand: () => number;
  readonly radius: number;

  constructor(world: World) {
    this.world = world;
    this.x = world.start.x;
    this.y = world.start.y;
    this.heading = world.start.heading;
    this.items = new Map(world.items.map((it) => [it.id, { x: it.x, y: it.y }]));
    this.radius = ROBOT_RADIUS[world.robot];
    this.rand = mulberry32(20270112);
    for (const c of world.claps) this.sounds.push({ t: c, kind: "clap" });
    this.snap();
  }

  // ---------- sensing ----------

  private floorAt(p: Pt): ColourName {
    for (const line of this.world.lines) {
      const half = (line.width ?? LINE_WIDTH) / 2;
      for (let i = 1; i < line.points.length; i++) {
        if (distToSegment(p, line.points[i - 1], line.points[i]) <= half) return "black";
      }
    }
    for (let i = this.world.zones.length - 1; i >= 0; i--) {
      if (inRect(p, this.world.zones[i])) return this.world.zones[i].colour;
    }
    return "white";
  }

  private sensorPoint(forward: number, side: number): Pt {
    const h = rad(this.heading);
    // "side" positive = robot's left.
    return {
      x: this.x + Math.cos(h) * forward - Math.sin(h) * side,
      y: this.y - Math.sin(h) * forward - Math.cos(h) * side,
    };
  }

  private rawDistance(): number {
    const h = rad(this.heading);
    const dx = Math.cos(h);
    const dy = -Math.sin(h);
    const front = this.sensorPoint(this.radius, 0);
    let best = Infinity;
    const W = this.world;
    const edges: Rect[] = [
      { x: -10, y: -10, w: W.w + 20, h: 10 },
      { x: -10, y: W.h, w: W.w + 20, h: 10 },
      { x: -10, y: 0, w: 10, h: W.h },
      { x: W.w, y: 0, w: 10, h: W.h },
    ];
    for (const r of [...W.walls, ...edges]) best = Math.min(best, rayToRect(front, dx, dy, r));
    return Math.min(DISTANCE_MAX, best);
  }

  private itemInReach(): string | null {
    let bestId: string | null = null;
    let bestD = Infinity;
    const front = this.sensorPoint(this.radius + REACH / 2, 0);
    for (const [id, p] of this.items) {
      if (id === this.carrying) continue;
      const d = Math.hypot(p.x - front.x, p.y - front.y);
      if (d <= REACH && d < bestD) {
        bestD = d;
        bestId = id;
      }
    }
    return bestId;
  }

  lightLevel(): number {
    let level = this.world.light;
    for (const z of this.world.lightZones) if (inRect(this, z)) level = z.level;
    return level;
  }

  sensors(): Sensors {
    const lineLeft = this.floorAt(this.sensorPoint(LINE_SENSOR_FORWARD, LINE_SENSOR_SIDE)) === "black";
    const lineRight = this.floorAt(this.sensorPoint(LINE_SENSOR_FORWARD, -LINE_SENSOR_SIDE)) === "black";
    const onLine = this.floorAt(this.sensorPoint(LINE_SENSOR_FORWARD, 0)) === "black";
    const distance = Math.round(this.rawDistance());
    const reach = this.itemInReach();
    const itemColour = reach ? this.world.items.find((i) => i.id === reach)!.colour : "none";
    return {
      lineLeft,
      lineRight,
      onLine,
      distance,
      obstacle: distance < OBSTACLE_CM,
      light: this.lightLevel(),
      colour: this.floorAt(this) === "black" ? "black" : this.floorAt(this),
      itemColour,
    };
  }

  // ---------- frames ----------

  private snap() {
    const moved: Record<string, Pt> = {};
    for (const it of this.world.items) {
      const p = this.items.get(it.id)!;
      if (p.x !== it.x || p.y !== it.y) moved[it.id] = { x: round1(p.x), y: round1(p.y) };
    }
    this.frames.push({
      t: Math.round(this.t * 1000) / 1000,
      x: round1(this.x),
      y: round1(this.y),
      heading: round1(this.heading),
      led: this.led,
      display: this.display,
      carrying: this.carrying,
      items: moved,
      sensors: this.sensors(),
      bumped: this.bumped,
    });
  }

  private tick(dt: number) {
    this.t += dt;
    if (this.carrying) {
      const p = this.sensorPoint(this.radius + 2.5, 0);
      this.items.set(this.carrying, p);
    }
    this.snap();
    if (this.t > TIME_LIMIT) throw new TimeUp();
  }

  private markMove() {
    if (this.stats.firstMoveAt < 0) this.stats.firstMoveAt = this.t;
  }

  private collides(x: number, y: number) {
    const r = this.radius;
    const W = this.world;
    if (x - r < 0 || y - r < 0 || x + r > W.w || y + r > W.h) return true;
    return W.walls.some((w) => circleHitsRect({ x, y }, r, w));
  }

  // ---------- the robot API (each call advances time) ----------

  private num(v: unknown, name: string): number {
    const n = Number(v);
    if (!Number.isFinite(n)) {
      const got = typeof v === "number" && Number.isNaN(v) ? "NaN (not a number). Check the maths or the variable that made it" : typeof v === "undefined" ? "nothing (undefined)" : JSON.stringify(v);
      throw new RobotError(`${name} needs a number, but got ${got}.`);
    }
    return n;
  }

  drive(cm: unknown) {
    let remaining = this.num(cm, "forward");
    const dir = remaining < 0 ? -1 : 1;
    remaining = Math.abs(remaining);
    this.markMove();
    this.bumped = false;
    while (remaining > 1e-6) {
      const step = Math.min(remaining, this.speed * FRAME_DT);
      const h = rad(this.heading);
      const nx = this.x + Math.cos(h) * step * dir;
      const ny = this.y - Math.sin(h) * step * dir;
      if (this.collides(nx, ny)) {
        this.bumped = true;
        this.stats.bumps++;
        this.tick(FRAME_DT);
        return false;
      }
      this.x = nx;
      this.y = ny;
      this.stats.distance += step;
      remaining -= step;
      this.tick((step / this.speed));
    }
    return true;
  }

  turn(deg: unknown) {
    let remaining = this.num(deg, "turn");
    const dir = remaining < 0 ? -1 : 1;
    remaining = Math.abs(remaining);
    this.markMove();
    while (remaining > 1e-6) {
      const step = Math.min(remaining, TURN_SPEED * FRAME_DT);
      this.heading = (((this.heading + step * dir) % 360) + 360) % 360;
      this.stats.turned += step;
      remaining -= step;
      this.tick(step / TURN_SPEED);
    }
  }

  wait(seconds: unknown) {
    let s = Math.max(0, this.num(seconds, "wait"));
    while (s > 1e-6) {
      const step = Math.min(s, FRAME_DT * 4);
      s -= step;
      this.tick(step);
    }
  }

  setSpeed(cmPerSecond: unknown) {
    const n = this.num(cmPerSecond, "set speed");
    this.speed = Math.max(2, Math.min(40, n));
  }

  setLed(colour: unknown) {
    const c = String(colour).toLowerCase() as LedColour;
    if (!LED_COLOURS.includes(c)) throw new RobotError(`The light can be ${LED_COLOURS.join(", ")}. "${colour}" isn't one of them.`);
    this.led = c;
    this.tick(0.05);
  }

  setDisplay(text: unknown) {
    this.display = String(text ?? "").slice(0, 24);
    this.tick(0.05);
  }

  beep() {
    this.sounds.push({ t: this.t, kind: "beep" });
    this.stats.beeps++;
    this.wait(0.3);
  }

  pickUp(): boolean {
    if (this.carrying) {
      this.tick(0.2);
      return false;
    }
    const id = this.itemInReach();
    this.tick(0.3);
    if (!id) return false;
    this.carrying = id;
    this.stats.pickUps++;
    this.tick(0.2);
    return true;
  }

  drop(): boolean {
    if (!this.carrying) {
      this.tick(0.2);
      return false;
    }
    const id = this.carrying;
    const p = this.sensorPoint(this.radius + 3, 0);
    this.items.set(id, p);
    this.carrying = null;
    this.stats.drops.push({ t: this.t, id, x: round1(p.x), y: round1(p.y) });
    this.tick(0.3);
    return true;
  }

  /** Wait until the next clap. Returns false (after a short wait) if nobody claps again. */
  waitForClap(): boolean {
    const next = this.world.claps[this.clapsHeard];
    if (next === undefined) {
      this.wait(1);
      return false;
    }
    if (next > this.t) this.wait(next - this.t);
    this.clapsHeard++;
    return true;
  }

  /** The next passcode a visitor types, or "" when nobody else is waiting. */
  nextCode(): string {
    const list = this.world.codes ?? [];
    const i = this.stats.codeReads.length;
    this.tick(0.3);
    if (i >= list.length) return "";
    this.stats.codeReads.push(this.t);
    return list[i];
  }

  /** The next chat message, or "" when the conversation is over. */
  nextMessage(): string {
    const list = this.world.messages ?? [];
    const i = this.stats.messageReads.length;
    this.tick(0.3);
    if (i >= list.length) return "";
    this.stats.messageReads.push(this.t);
    return list[i];
  }

  /** True once for each clap that has happened since the last check. */
  clapped(): boolean {
    this.tick(0.02);
    const next = this.world.claps[this.clapsHeard];
    if (next !== undefined && next <= this.t) {
      this.clapsHeard++;
      return true;
    }
    return false;
  }

  // Sensor reads take a moment, like a real robot, so a loop that only
  // reads sensors still moves the clock and can't spin forever.
  read<K extends keyof Sensors>(key: K): Sensors[K] {
    this.tick(0.02);
    const s = this.sensors();
    if (key === "distance" && this.world.distanceNoise > 0) {
      const wobble = (this.rand() * 2 - 1) * this.world.distanceNoise;
      return Math.max(0, Math.round(s.distance + wobble)) as Sensors[K];
    }
    return s[key];
  }

  print(text: string) {
    this.log.push({ t: Math.round(this.t * 10) / 10, text });
  }

  record(name: unknown, value: unknown) {
    const v = typeof value === "number" ? value : Number.isFinite(Number(value)) ? Number(value) : String(value);
    this.data.push({ t: Math.round(this.t * 10) / 10, name: String(name), value: v });
    this.tick(0.05);
  }

  trace(stoppedReason: string | null): Trace {
    return {
      frames: this.frames,
      log: this.log,
      data: this.data,
      sounds: this.sounds.sort((a, b) => a.t - b.t),
      stats: this.stats,
      stoppedReason,
      endTime: this.t,
    };
  }
}

/** Names students use, per language, mapped onto the simulator. */
export function robotApi(sim: Sim) {
  const s = sim;
  return {
    forward: (cm: number) => s.drive(cm),
    backward: (cm: number) => s.drive(-Number(cm)),
    turnLeft: (deg: number) => s.turn(deg),
    turnRight: (deg: number) => s.turn(-Number(deg)),
    wait: (sec: number) => s.wait(sec),
    setSpeed: (n: number) => s.setSpeed(n),
    led: (c: string) => s.setLed(c),
    display: (text: unknown) => s.setDisplay(text),
    beep: () => s.beep(),
    pickUp: () => s.pickUp(),
    drop: () => s.drop(),
    waitForClap: () => s.waitForClap(),
    clapped: () => s.clapped(),
    lineLeft: () => s.read("lineLeft"),
    lineRight: () => s.read("lineRight"),
    onLine: () => s.read("onLine"),
    distance: () => s.read("distance"),
    obstacle: () => s.read("obstacle"),
    light: () => s.read("light"),
    colour: () => s.read("colour"),
    itemColour: () => s.read("itemColour"),
    record: (name: string, value: unknown) => s.record(name, value),
    nextCode: () => s.nextCode(),
    nextMessage: () => s.nextMessage(),
    print: (...parts: unknown[]) => s.print(parts.map(String).join(" ")),
  };
}

export type RobotApi = ReturnType<typeof robotApi>;

/** Python spellings (snake_case) for the same functions. */
export const PYTHON_NAMES: Record<string, keyof RobotApi> = {
  forward: "forward",
  backward: "backward",
  turn_left: "turnLeft",
  turn_right: "turnRight",
  wait: "wait",
  set_speed: "setSpeed",
  led: "led",
  display: "display",
  beep: "beep",
  pick_up: "pickUp",
  drop: "drop",
  wait_for_clap: "waitForClap",
  clapped: "clapped",
  line_left: "lineLeft",
  line_right: "lineRight",
  on_line: "onLine",
  distance: "distance",
  obstacle: "obstacle",
  light: "light",
  colour: "colour",
  color: "colour",
  item_colour: "itemColour",
  item_color: "itemColour",
  record: "record",
  next_code: "nextCode",
  next_message: "nextMessage",
};

/** The JavaScript names, in the order the reference card lists them. */
export const JS_NAMES = Object.keys(robotApi(null as unknown as Sim)) as (keyof RobotApi)[];
