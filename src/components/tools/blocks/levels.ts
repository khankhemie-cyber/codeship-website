/**
 * Reach-the-goal levels for CODEship Blocks, 6–8 per semester, each using
 * only blocks taught by then. A child wins by getting their character onto
 * the goal square, visible, having collected every apple on the way.
 *
 * Nothing helps: walking into a rock, a closed door or a closed gate simply
 * doesn't happen (the character stays put), and a program that stops short
 * just stops. Debugging it is the lesson.
 *
 * Maps are 10 x 8 text grids:
 *   .  empty           H  the child's character    *  goal
 *   a  apple (collect) #  rock                      ~  water
 *   =  bridge: hidden until `bridgeDelay` s after the green flag
 *   d  small door: only a character that has Shrunk fits
 *   D  guard dog: only a hidden character can sneak past
 *   L  ladder (a "Start on Bump" landmark)
 *   1 2 3 4  gates (red, blue, yellow, green): open on a matching Send Message
 *
 * Every level has a reference solution in scripts/blocks/test-blocks.mjs, so
 * a change that makes a level impossible fails the build.
 *
 * Erasable TypeScript only: the acceptance tests import this into Node.
 */

import type { ActorState } from "./engine";
import type { BlockType } from "./i18n";
import { GRID_COLS, GRID_ROWS, type BlockJson, type MessageColour, type Project, type Scripts } from "./model";

export type Level = {
  id: string;
  semester: 1 | 2 | 3 | 4;
  number: number;
  background: string;
  hero: string;
  goal: string;
  map: string[];
  palette: BlockType[];
  /** Blocks already on the workspace when the level opens. */
  starter: StepList;
  bridgeDelay?: number;
};

/** A stack as a list: "move_right", ["wait", 3], ["repeat", 4, [...]], ["send_message", "blue"] ... */
export type Step = string | StepTuple;
export interface StepTuple extends Array<string | number | Step[] | undefined> {
  0: string;
  1?: string | number;
  2?: Step[];
}
export type StepList = Step[];

export function stackJson(steps: StepList, x = 30, y = 30): BlockJson {
  const make = (step: Step): BlockJson => {
    const [type, arg, inner] = Array.isArray(step) ? [step[0], step[1], step[2]] : [step, undefined, undefined];
    const b: BlockJson = { type };
    if (type === "say") b.fields = { TEXT: String(arg ?? "") };
    if (type === "wait" || type === "repeat") b.fields = { N: String(arg ?? 1) };
    if (type === "go_page") b.fields = { PAGE: String(arg ?? 1) };
    if (type === "send_message" || type === "start_message") b.fields = { COLOUR: String(arg ?? "red") };
    if (type === "repeat" && inner?.length) b.inputs = { DO: { block: chain(inner) } };
    return b;
  };
  const chain = (list: StepList): BlockJson => {
    const blocks = list.map(make);
    for (let i = 0; i < blocks.length - 1; i++) blocks[i].next = { block: blocks[i + 1] };
    return blocks[0];
  };
  return { ...chain(steps), x, y };
}

export const scriptsOf = (...stacks: BlockJson[]): Scripts => ({ blocks: { languageVersion: 0, blocks: stacks } });

const S1: BlockType[] = ["start_tap", "start_flag", "move_right", "move_left", "move_up", "move_down", "say", "pop", "grow"];
// Go to Page, Record and Go Home don't apply on a one-page level, so levels leave them out.
const S2: BlockType[] = [...S1, "wait", "shrink"];
const S3: BlockType[] = [...S2, "start_bump", "repeat", "hide", "show"];
const S4: BlockType[] = [...S3, "send_message"];

const GATES: Record<string, MessageColour> = { "1": "red", "2": "blue", "3": "yellow", "4": "green" };

const level = (semester: 1 | 2 | 3 | 4, number: number, rest: Omit<Level, "id" | "semester" | "number">): Level => ({
  id: `s${semester}-${number}`,
  semester,
  number,
  ...rest,
});

export const LEVELS: Level[] = [
  // ── Semester 1: counting squares and turning ──
  level(1, 1, {
    background: "grass", hero: "robot", goal: "star", palette: S1, starter: ["start_tap"],
    map: ["..........", "..........", "..........", "..........", ".H.*......", "..........", "..........", ".........."],
  }),
  level(1, 2, {
    background: "grass", hero: "robot", goal: "star", palette: S1, starter: ["start_tap"],
    map: ["..........", "..........", "..........", "..........", ".H....*...", "..........", "..........", ".........."],
  }),
  level(1, 3, {
    background: "grass", hero: "robot", goal: "star", palette: S1, starter: [],
    map: ["..........", "..........", "..*.......", "..........", "..........", "..........", "..H.......", ".........."],
  }),
  level(1, 4, {
    background: "grass", hero: "robot", goal: "star", palette: S1, starter: [],
    map: ["..........", "..........", "..........", "....*.....", "..........", "..........", ".H........", ".........."],
  }),
  level(1, 5, {
    background: "grass", hero: "robot", goal: "star", palette: S1, starter: [],
    map: ["..........", "..........", "..........", "..........", "...#......", ".H.#.*....", "...#......", ".........."],
  }),
  level(1, 6, {
    background: "grass", hero: "robot", goal: "star", palette: S1, starter: [],
    map: ["..........", "..........", ".....*....", "..........", "..........", "..........", ".H........", ".........."],
  }),
  level(1, 7, {
    background: "grass", hero: "robot", goal: "star", palette: S1, starter: [],
    map: ["..........", "..........", "..........", "...a..*...", "..........", ".H.a......", "..........", ".........."],
  }),

  // ── Semester 2: Shrink to fit, Wait for the bridge ──
  level(2, 1, {
    background: "room", hero: "cat", goal: "star", palette: S2, starter: [],
    map: ["....#.....", "....#.....", "....#.....", "....#.....", ".H..d..*..", "....#.....", "....#.....", "....#....."],
  }),
  level(2, 2, {
    background: "room", hero: "cat", goal: "star", palette: S2, starter: [],
    map: [".....#....", ".....#....", ".....d..*.", ".....#....", ".....#....", ".H...#....", ".....#....", ".....#...."],
  }),
  level(2, 3, {
    background: "grass", hero: "cat", goal: "star", palette: S2, starter: ["start_flag"], bridgeDelay: 3,
    map: ["....~.....", "....~.....", "....~.....", "....~.....", "..H.=..*..", "....~.....", "....~.....", "....~....."],
  }),
  level(2, 4, {
    background: "grass", hero: "cat", goal: "star", palette: S2, starter: ["start_flag"], bridgeDelay: 3,
    map: ["..........", "......*...", "..........", "~~~~~~=~~~", "..........", "..........", "......H...", ".........."],
  }),
  level(2, 5, {
    background: "grass", hero: "cat", goal: "star", palette: S2, starter: ["start_flag"], bridgeDelay: 3,
    map: ["...#..~...", "...#..~...", "...#..~...", "...#..~...", ".H.d..=.*.", "...#..~...", "...#..~...", "...#..~..."],
  }),
  level(2, 6, {
    background: "room", hero: "cat", goal: "star", palette: S2, starter: [],
    map: [".....#....", ".....#....", ".....#....", ".....#.*..", ".....#....", ".....#....", ".H.a.d.a..", ".....#...."],
  }),

  // ── Semester 3: Repeat, Start on Bump, Hide and Show ──
  level(3, 1, {
    background: "street", hero: "can", goal: "bin", palette: S3, starter: ["start_tap"],
    map: ["..........", "..........", "..........", "##########", "H........*", "##########", "..........", ".........."],
  }),
  level(3, 2, {
    background: "street", hero: "can", goal: "bin", palette: S3, starter: [],
    map: ["....*.....", "..........", "..........", "..........", "..........", "..........", "..........", "....H....."],
  }),
  level(3, 3, {
    background: "street", hero: "can", goal: "bin", palette: S3, starter: [],
    map: ["..........", ".......*..", "..........", "..........", "..........", "..........", "..........", ".H........"],
  }),
  level(3, 4, {
    background: "street", hero: "can", goal: "bin", palette: S3, starter: [],
    map: ["..........", ".....*....", "..........", "..........", "..........", "..........", ".H...L....", ".........."],
  }),
  level(3, 5, {
    background: "street", hero: "can", goal: "bin", palette: S3, starter: [],
    map: ["..........", "..........", "..........", "##########", ".H..D..*..", "##########", "..........", ".........."],
  }),
  level(3, 6, {
    background: "street", hero: "can", goal: "bin", palette: S3, starter: [],
    map: ["..........", "..........", "..........", ".....*....", "....a.....", "...a......", "..a.......", ".H........"],
  }),
  level(3, 7, {
    background: "street", hero: "can", goal: "bin", palette: S3, starter: [],
    map: ["..........", "..........", "..........", "##########", "H....D...*", "##########", "..........", ".........."],
  }),

  // ── Semester 4: gates that open on a matching message ──
  level(4, 1, {
    background: "map", hero: "car", goal: "house", palette: S4, starter: [],
    map: ["....#.....", "....#.....", "....#.....", "....#.....", ".H..2..*..", "....#.....", "....#.....", "....#....."],
  }),
  level(4, 2, {
    background: "map", hero: "car", goal: "library", palette: S4, starter: [],
    map: ["...#..#...", "...#..#...", "...#..#...", "...#..#...", ".H.2..1.*.", "...#..#...", "...#..#...", "...#..#..."],
  }),
  level(4, 3, {
    background: "map", hero: "car", goal: "school", palette: S4, starter: [],
    map: [".....#....", ".....#....", ".....#....", ".....#....", "H....3...*", ".....#....", ".....#....", ".....#...."],
  }),
  level(4, 4, {
    background: "map", hero: "car", goal: "house", palette: S4, starter: [],
    map: ["##########", "##########", "##########", "##########", "H.4..d.D.*", "##########", "##########", "##########"],
  }),
  level(4, 5, {
    background: "map", hero: "car", goal: "library", palette: S4, starter: [],
    map: ["...#......", "...#....*.", "...#......", "...#......", "...######2", "...#......", ".H.1......", "...#......"],
  }),
  level(4, 6, {
    background: "map", hero: "car", goal: "school", palette: S4, starter: [],
    map: ["..........", "........*.", "..........", "#######3##", "..........", ".a.a.a.a..", "##1#######", "H........."],
  }),
];

export const levelById = (id: string) => LEVELS.find((l) => l.id === id);

// ── Building a level as a project ──

type Thing = { id: string; kind: string; costume: string; x: number; y: number; colour?: MessageColour };

export const HERO_ID = "hero";

export function levelThings(level: Level): Thing[] {
  const things: Thing[] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const c = level.map[y]?.[x] ?? ".";
      const id = `t${x}-${y}`;
      if (c === "*") things.push({ id, kind: "goal", costume: level.goal, x, y });
      else if (c === "a") things.push({ id, kind: "item", costume: "apple", x, y });
      else if (c === "#") things.push({ id, kind: "wall", costume: "rock", x, y });
      else if (c === "~") things.push({ id, kind: "wall", costume: "water", x, y });
      else if (c === "=") {
        // Water underneath, so the crossing looks like water until the bridge appears.
        things.push({ id: `${id}w`, kind: "decor", costume: "water", x, y });
        things.push({ id, kind: "bridge", costume: "bridge", x, y });
      }
      else if (c === "d") things.push({ id, kind: "door", costume: "door", x, y });
      else if (c === "D") things.push({ id, kind: "guard", costume: "dog", x, y });
      else if (c === "L") things.push({ id, kind: "ladder", costume: "ladder", x, y });
      else if (GATES[c]) things.push({ id, kind: "gate", costume: `gate-${GATES[c]}`, x, y, colour: GATES[c] });
    }
  }
  return things;
}

export function heroStart(level: Level): { x: number; y: number } {
  for (let y = 0; y < GRID_ROWS; y++) {
    const x = (level.map[y] ?? "").indexOf("H");
    if (x >= 0) return { x, y };
  }
  return { x: 0, y: 0 };
}

export function starterScripts(level: Level): Scripts {
  return level.starter.length ? scriptsOf(stackJson(level.starter)) : scriptsOf();
}

/** The level as a one-page project; the hero is drawn last, on top. */
export function levelProject(level: Level, heroScripts: Scripts): Project {
  const things = levelThings(level);
  const costumes = [...new Set([level.hero, ...things.map((t) => t.costume)])];
  const characters = costumes.map((c) => ({ id: `c-${c}`, costume: c }));
  const helperScripts = (t: Thing): Scripts => {
    // Bridges start hidden (LevelRules.afterReset) and appear N seconds after the green flag.
    if (t.kind === "bridge") return scriptsOf(stackJson(["start_flag", ["wait", level.bridgeDelay ?? 3], "show"]));
    if (t.kind === "gate") return scriptsOf(stackJson([["start_message", t.colour], "hide"]));
    return scriptsOf();
  };
  return {
    format: "codeship-blocks",
    version: 1,
    name: level.id,
    characters,
    recordings: {},
    pages: [
      {
        id: "level",
        background: level.background,
        actors: [
          ...things.map((t) => ({ id: t.id, characterId: `c-${t.costume}`, x: t.x, y: t.y, scripts: helperScripts(t) })),
          { id: HERO_ID, characterId: `c-${level.hero}`, ...heroStart(level), scripts: heroScripts },
        ],
      },
    ],
  };
}

/** The level's rules, plugged into the engine (canEnter) and checked after every tick. */
export class LevelRules {
  things: Thing[];
  constructor(level: Level) {
    this.things = levelThings(level);
  }

  canEnter = (actorId: string, x: number, y: number, states: Map<string, ActorState>): boolean => {
    const me = states.get(actorId);
    for (const t of this.things) {
      if (t.x !== x || t.y !== y) continue;
      const thing = states.get(t.id);
      if (t.kind === "wall") return false;
      if (t.kind === "door" && !(me && me.level < 0)) return false;
      if (t.kind === "bridge" && thing?.visible === false) return false;
      if (t.kind === "gate" && thing?.visible !== false) return false;
      if (t.kind === "guard" && me?.visible !== false) return false;
    }
    return true;
  };

  afterReset = (states: Map<string, ActorState>) => {
    for (const t of this.things) if (t.kind === "bridge") states.get(t.id)!.visible = false;
  };

  /** Collects apples under the hero; returns true when the level is won. */
  check(states: Map<string, ActorState>, onCollect?: () => void): boolean {
    const hero = states.get(HERO_ID);
    if (!hero) return false;
    let allCollected = true;
    for (const t of this.things) {
      if (t.kind !== "item") continue;
      const item = states.get(t.id);
      if (!item) continue;
      if (item.visible && hero.x === t.x && hero.y === t.y) {
        item.visible = false;
        onCollect?.();
      }
      if (item.visible) allCollected = false;
    }
    const goal = this.things.find((t) => t.kind === "goal");
    return Boolean(goal && hero.visible && hero.x === goal.x && hero.y === goal.y && allCollected);
  }
}
