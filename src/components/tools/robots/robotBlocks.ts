/**
 * Robot Lab blocks: definitions for Blockly and a code generator that turns a
 * saved workspace (Blockly's JSON) into the same JavaScript students later
 * type themselves. The generator works on the JSON, not on live Blockly
 * objects, so the tests can check it without a browser.
 *
 * Only the stack under "when Run is pressed" runs. Loose blocks do nothing,
 * as in the Explorers Blocks tool.
 *
 * Labels: like CODEship Blocks, every block leads with its picture. In
 * "pictures only" mode the words are dropped (they stay in the tooltip for
 * the adult) and word dropdowns become pictures or colour swatches. Field
 * values never change between modes, so saved work opens in either.
 *
 * Curriculum v1.2 (CEO approved, 2026-11-26): the clap is replaced by a hand
 * wave (the Edison obstacle sensor detects a hand). "wait for a wave" and
 * "a hand waved" replace the clap blocks; migrateWorkspace() converts work
 * saved before the change.
 */

import { WAVE_SVG_BODY } from "../shared/waveIcon";

export type LabelMode = "words" | "icons";

export const BLOCK_COLOURS = {
  start: "#D58401",
  move: "#2563A8",
  act: "#6B3FA0",
  sense: "#1E7A4C",
  control: "#0A7C8A",
} as const;

const LED_OPTIONS: [string, string][] = [
  ["off", "off"],
  ["red", "red"],
  ["green", "green"],
  ["blue", "blue"],
  ["yellow", "yellow"],
  ["white", "white"],
  ["purple", "purple"],
];
const COLOUR_OPTIONS: [string, string][] = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "grey", "black", "white"].map((c) => [c, c]);

const NOTE_OPTIONS: [string, string][] = ["C", "D", "E", "F", "G", "A", "B", "C2"].map((n) => [n === "C2" ? "high C" : n, n]);
const PEN_OPTIONS: [string, string][] = ["red", "blue", "green", "yellow", "purple", "orange", "black"].map((c) => [c, c]);

const SENSE_OPTIONS: [string, string][] = [
  ["obstacle ahead", "obstacle()"],
  ["left sensor sees the line", "lineLeft()"],
  ["right sensor sees the line", "lineRight()"],
  ["middle sensor sees the line", "onLine()"],
  ["it is dark", "light() < 30"],
  ["it is bright", "light() >= 30"],
  ["a hand waved", "waved()"],
];

const num = (name: string, value: number, min = 0, max = 500) => ({ type: "field_number", name, value, min, max, precision: 0.5 });

type Json = Record<string, unknown>;

export const BLOCK_DEFS: Json[] = [
  { type: "robot_start", message0: "when Run is pressed", nextStatement: null, colour: BLOCK_COLOURS.start, tooltip: "Your program starts here. Only blocks joined underneath will run." },

  { type: "robot_forward", message0: "forward %1 cm", args0: [num("N", 10)], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.move, tooltip: "Drive forward. Each square on the mat is 10 cm." },
  { type: "robot_backward", message0: "backward %1 cm", args0: [num("N", 10)], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.move },
  { type: "robot_turn_left", message0: "turn left %1 °", args0: [num("N", 90, 0, 360)], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.move, tooltip: "Turn on the spot. 90 is a quarter turn." },
  { type: "robot_turn_right", message0: "turn right %1 °", args0: [num("N", 90, 0, 360)], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.move },
  { type: "robot_speed", message0: "set speed %1 cm/s", args0: [num("N", 15, 2, 40)], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.move },

  { type: "robot_pick_up", message0: "pick up", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Grab the object right in front of the robot." },
  { type: "robot_drop", message0: "drop", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act },
  { type: "robot_beep", message0: "beep", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act },
  { type: "robot_led", message0: "light %1", args0: [{ type: "field_dropdown", name: "C", options: LED_OPTIONS.slice(1).concat([LED_OPTIONS[0]]) }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act },
  { type: "robot_play", message0: "play note %1", args0: [{ type: "field_dropdown", name: "N", options: NOTE_OPTIONS }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Play a musical note." },
  { type: "robot_pen_down", message0: "pen down %1", args0: [{ type: "field_dropdown", name: "C", options: PEN_OPTIONS }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Paint a line wherever the robot drives." },
  { type: "robot_pen_up", message0: "pen up", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Stop painting." },
  { type: "robot_unlock", message0: "unlock the door", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Open the locked door. Only do this for the right reason!" },
  { type: "robot_spray", message0: "spray water", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Spray water straight ahead. It reaches about 3 squares." },
  { type: "robot_display", message0: "show %1", args0: [{ type: "field_input", name: "T", text: "Hi!" }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act },
  { type: "robot_record", message0: "record %1 reading", args0: [{ type: "field_dropdown", name: "S", options: [["light", "light"], ["distance", "distance"], ["temperature", "temperature"], ["power", "power"]] }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Save a reading to the Data tab." },

  { type: "robot_wait", message0: "wait %1 seconds", args0: [num("N", 1, 0, 60)], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control },
  { type: "robot_wait_wave", message0: "wait for a wave", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control, tooltip: "Wait until someone waves a hand in front of the robot." },
  { type: "robot_repeat", message0: "repeat %1 times", args0: [num("N", 4, 1, 500)], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control },
  { type: "robot_forever", message0: "repeat forever", message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null, colour: BLOCK_COLOURS.control },
  { type: "robot_until", message0: "repeat until %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control },
  { type: "robot_if", message0: "if %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control },
  { type: "robot_if_else", message0: "if %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], message2: "else", message3: "%1", args3: [{ type: "input_statement", name: "ELSE" }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control },

  { type: "robot_sense", message0: "%1", args0: [{ type: "field_dropdown", name: "S", options: SENSE_OPTIONS }], output: "Boolean", colour: BLOCK_COLOURS.sense },
  { type: "robot_compare", message0: "%1 %2 %3", args0: [{ type: "field_dropdown", name: "S", options: [["distance (cm)", "distance()"], ["light level", "light()"]] }, { type: "field_dropdown", name: "OP", options: [["<", "<"], [">", ">"], ["=", "==="]] }, num("N", 20, 0, 200)], output: "Boolean", colour: BLOCK_COLOURS.sense },
  { type: "robot_colour_is", message0: "%1 colour is %2", args0: [{ type: "field_dropdown", name: "WHAT", options: [["floor", "colour()"], ["object", "itemColour()"]] }, { type: "field_dropdown", name: "C", options: COLOUR_OPTIONS }], output: "Boolean", colour: BLOCK_COLOURS.sense },
  { type: "robot_not", message0: "not %1", args0: [{ type: "input_value", name: "A", check: "Boolean" }], output: "Boolean", colour: BLOCK_COLOURS.sense },
];

// ---------------------------------------------------------------- icons

const ICON_PATHS: Record<string, string> = {
  flag: '<path d="M5 22V3"/><path d="M5 3h13l-3 4.5 3 4.5H5z" fill="#2EB84B"/>',
  forward: '<path d="M12 20V5m-6 6 6-6 6 6"/>',
  backward: '<path d="M12 4v15m-6-6 6 6 6-6"/>',
  left: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/>',
  right: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h2"/>',
  speed: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 18 4-6"/>',
  grab: '<path d="M7 11V6a2 2 0 0 1 4 0v4m0-1V4a2 2 0 0 1 4 0v6m0-1a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-2.5-4a2 2 0 0 1 3.4-2L7 15"/>',
  drop: '<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 21h14"/>',
  beep: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  bulb: '<path d="M9 18h6m-5 3h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  screen: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M7 10h6M7 13h4"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5m4 5V8m4 8v-3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  // Same picture as the CODEship Blocks "Start on Wave" block: a hand waving at the sensor.
  wave: WAVE_SVG_BODY,
  gripper: '<path d="M12 2.5V7"/><path d="M6.5 7h11"/><path d="M6.5 7v4.5l3.5 4.5M17.5 7v4.5L14 16"/><circle cx="12" cy="18.5" r="2.5"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/><path d="M12 15v2"/>',
  box: '<path d="M12 3 3.5 7.2v9.6L12 21l8.5-4.2V7.2z"/><path d="M3.5 7.2 12 11.4l8.5-4.2M12 11.4V21"/>',
  until: '<path d="M14.5 6.5a6.5 6.5 0 1 0 1.5 8"/><path d="M11 6.5h3.5V3"/><path d="M20.5 7v10" stroke-width="3"/>',
  wall: '<rect x="13" y="4" width="8" height="16" rx="1"/><path d="M3 12h7m-3-3 3 3-3 3"/>',
  lineL: '<path d="M8 3v18" stroke-width="4"/><circle cx="16" cy="12" r="3"/>',
  lineR: '<path d="M16 3v18" stroke-width="4"/><circle cx="8" cy="12" r="3"/>',
  lineM: '<path d="M12 3v18" stroke-width="4"/><circle cx="12" cy="12" r="3"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M5 19l1.8-1.8M17.2 6.8 19 5"/>',
  thermo: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 10v6"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  floor: '<path d="M2 18h20"/><path d="M5 18l3-8h8l3 8"/>',
  ruler: '<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3m4-3v4m4-4v3m4-3v4"/>',
  repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="m7 22-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  forever: '<path d="M12 12c-2-2.7-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.3 6-4zm0 0c2 2.7 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.3-6 4z"/>',
  branch: '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  note: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  penup: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M3 3l18 18"/>',
  water: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
};

export function blockIcon(name: string, colour = "#FFFFFF"): string {
  const body = ICON_PATHS[name] ?? ICON_PATHS.eye;
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`,
  )}`;
}

const BLOCK_ICONS: Record<string, string> = {
  robot_start: "flag",
  robot_forward: "forward",
  robot_backward: "backward",
  robot_turn_left: "left",
  robot_turn_right: "right",
  robot_speed: "speed",
  robot_pick_up: "gripper",
  robot_drop: "drop",
  robot_beep: "beep",
  robot_led: "bulb",
  robot_display: "screen",
  robot_play: "note",
  robot_pen_down: "pen",
  robot_pen_up: "penup",
  robot_spray: "water",
  robot_unlock: "unlock",
  robot_record: "chart",
  robot_wait: "clock",
  robot_wait_wave: "wave",
  robot_repeat: "repeat",
  robot_forever: "forever",
  robot_until: "until",
  robot_if: "branch",
  robot_if_else: "branch",
  robot_sense: "eye",
};

/** Pictures for word dropdown options in "pictures only" mode, by option value. */
const OPTION_ICONS: Record<string, string> = {
  "obstacle()": "wall",
  "lineLeft()": "lineL",
  "lineRight()": "lineR",
  "onLine()": "lineM",
  "light() < 30": "moon",
  "light() >= 30": "sun",
  "waved()": "wave",
  "distance()": "ruler",
  "light()": "bulb",
  light: "bulb",
  distance: "ruler",
  temperature: "thermo",
  power: "bolt",
  "colour()": "floor",
  "itemColour()": "box",
};
const SWATCHES: Record<string, string> = {
  red: "#E53935", green: "#43A047", blue: "#1E88E5", yellow: "#FDD835", white: "#FFFFFF", purple: "#8E24AA",
  orange: "#FB8C00", pink: "#EC407A", grey: "#9E9E9E", black: "#111111",
};

function swatch(colour: string): string {
  // "off" is an empty ring with a line through it.
  const body = SWATCHES[colour]
    ? `<circle cx="12" cy="12" r="9" fill="${SWATCHES[colour]}" stroke="#fff" stroke-width="2.5"/>`
    : '<circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M5.5 18.5 18.5 5.5" stroke="#fff" stroke-width="2.5"/>';
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`)}`;
}

/** A dropdown option as a picture, or null if it has none (notes and numbers stay as they are). */
function optionPicture(label: string, value: string): { src: string; width: number; height: number; alt: string } | null {
  if (SWATCHES[value] || value === "off") return { src: swatch(value), width: 26, height: 26, alt: label };
  const icon = OPTION_ICONS[value];
  return icon ? { src: blockIcon(icon), width: 26, height: 26, alt: label } : null;
}

/** Pictures-only first lines for blocks without a block picture. */
const ICON_MESSAGES: Record<string, string> = { robot_colour_is: "%1 %2" };

/** The words of a block's first line, without placeholders, for its tooltip. */
const wordsOf = (msg: string) => msg.replace(/%\d+/g, "…").replace(/\s+/g, " ").trim();

/**
 * Puts each block's picture first (%1) and renumbers the rest of its first
 * line. In "icons" mode the words go, leaving the picture and the fields.
 */
export function withIcons(defs: Json[], mode: LabelMode = "words"): Json[] {
  return defs.map((d) => {
    const icon = BLOCK_ICONS[String(d.type)];
    let def: Json = d;
    if (mode === "icons") {
      const args = ((d.args0 as Json[]) ?? []).map((a) => {
        if (a.type !== "field_dropdown") return a;
        const opts = a.options as [string, string][];
        const pics = opts.map(([label, value]) => optionPicture(label, value));
        return pics.every(Boolean) ? { ...a, options: opts.map(([, value], i) => [pics[i], value]) } : a;
      });
      // Blocks with a picture keep only their fields. Blocks without one keep
      // their short logic word ("not"); "else" also stays, so the two arms differ.
      const strip = (m: unknown) => String(m ?? "").match(/%\d+/g)?.join(" ") ?? "";
      def = {
        ...d,
        args0: args,
        message0: ICON_MESSAGES[String(d.type)] ?? (icon ? strip(d.message0) : d.message0),
        tooltip: String(d.tooltip ?? wordsOf(String(d.message0))),
      };
    }
    if (!icon) return def;
    const colour = d.type === "robot_start" ? "#010F2A" : "#FFFFFF";
    const msg = String(def.message0).replace(/%(\d+)/g, (_, n) => `%${Number(n) + 1}`);
    return {
      ...def,
      message0: `%1 ${msg}`.trim(),
      args0: [{ type: "field_image", src: blockIcon(icon, colour), width: 26, height: 26, alt: wordsOf(String(d.message0)) }, ...((def.args0 as object[]) ?? [])],
    };
  });
}

const CATEGORIES: { name: string; key: string; icon: string; colour: string; types: string[] }[] = [
  { name: "Start", key: "start", icon: "flag", colour: BLOCK_COLOURS.start, types: ["robot_start"] },
  { name: "Move", key: "move", icon: "forward", colour: BLOCK_COLOURS.move, types: ["robot_forward", "robot_backward", "robot_turn_left", "robot_turn_right", "robot_speed"] },
  { name: "Do", key: "do", icon: "bulb", colour: BLOCK_COLOURS.act, types: ["robot_pick_up", "robot_drop", "robot_beep", "robot_play", "robot_led", "robot_display", "robot_pen_down", "robot_pen_up", "robot_spray", "robot_unlock", "robot_record"] },
  { name: "Control", key: "control", icon: "repeat", colour: BLOCK_COLOURS.control, types: ["robot_wait", "robot_wait_wave", "robot_repeat", "robot_forever", "robot_until", "robot_if", "robot_if_else"] },
  { name: "Sense", key: "sense", icon: "eye", colour: BLOCK_COLOURS.sense, types: ["robot_sense", "robot_compare", "robot_colour_is", "robot_not"] },
];

/**
 * The palette. In "pictures only" mode each category tab is a picture on its
 * colour (the word stays for screen readers, hidden on screen).
 */
export function toolboxFor(mode: LabelMode = "words") {
  return {
    kind: "categoryToolbox",
    contents: CATEGORIES.map((c) => ({
      kind: "category",
      name: c.name,
      colour: c.colour,
      ...(mode === "icons" ? { cssconfig: { icon: `blocklyToolboxCategoryIcon rl-cat-icon rl-cat-${c.key}`, label: "blocklyToolboxCategoryLabel rl-cat-label" } } : {}),
      contents: c.types.map((type) => ({ kind: "block", type })),
    })),
  };
}
export const TOOLBOX = toolboxFor("words");

/** CSS for the picture category tabs (pictures-only mode). */
export const CATEGORY_ICON_CSS = CATEGORIES.map(
  (c) => `.robot-blocks .rl-cat-${c.key} { background: ${c.colour} url("${blockIcon(c.icon, c.key === "start" ? "#010F2A" : "#FFFFFF")}") center / 24px no-repeat; }`,
).join("\n");

/** A new project: just the start block. */
export const EMPTY_WORKSPACE = { blocks: { languageVersion: 0, blocks: [{ type: "robot_start", x: 30, y: 30 }] } };

// ---------------------------------------------------------------- generator

type B = { type: string; fields?: Record<string, unknown>; inputs?: Record<string, { block?: B }>; next?: { block?: B } };

const n = (v: unknown, fallback = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
};
const str = (v: unknown) => JSON.stringify(String(v ?? ""));

function cond(b: B | undefined): string {
  if (!b) return "false";
  const f = b.fields ?? {};
  switch (b.type) {
    case "robot_sense":
      return String(f.S ?? "false");
    case "robot_compare":
      return `${f.S} ${f.OP} ${n(f.N)}`;
    case "robot_colour_is":
      return `${f.WHAT} === ${str(f.C)}`;
    case "robot_not": {
      const inner = cond(b.inputs?.A?.block);
      return `!(${inner})`;
    }
    default:
      return "false";
  }
}

function stack(b: B | undefined, indent: string): string {
  let out = "";
  for (let cur = b; cur; cur = cur.next?.block) out += statement(cur, indent);
  return out;
}

let loopVar = 0;

function statement(b: B, ind: string): string {
  const f = b.fields ?? {};
  const body = (name: string) => stack(b.inputs?.[name]?.block, ind + "  ");
  switch (b.type) {
    case "robot_forward":
      return `${ind}forward(${n(f.N)});\n`;
    case "robot_backward":
      return `${ind}backward(${n(f.N)});\n`;
    case "robot_turn_left":
      return `${ind}turnLeft(${n(f.N)});\n`;
    case "robot_turn_right":
      return `${ind}turnRight(${n(f.N)});\n`;
    case "robot_speed":
      return `${ind}setSpeed(${n(f.N, 15)});\n`;
    case "robot_pick_up":
      return `${ind}pickUp();\n`;
    case "robot_drop":
      return `${ind}drop();\n`;
    case "robot_beep":
      return `${ind}beep();\n`;
    case "robot_led":
      return `${ind}led(${str(f.C ?? "red")});\n`;
    case "robot_play":
      return `${ind}play(${str(f.N ?? "C")});\n`;
    case "robot_pen_down":
      return `${ind}penDown(${str(f.C ?? "red")});\n`;
    case "robot_pen_up":
      return `${ind}penUp();\n`;
    case "robot_spray":
      return `${ind}spray();\n`;
    case "robot_unlock":
      return `${ind}unlock();\n`;
    case "robot_display":
      return `${ind}display(${str(f.T)});\n`;
    case "robot_record":
      return `${ind}record(${str(f.S)}, ${f.S === "distance" ? "distance()" : f.S === "temperature" ? "temperature()" : f.S === "power" ? "power()" : "light()"});\n`;
    case "robot_wait":
      return `${ind}wait(${n(f.N)});\n`;
    case "robot_wait_wave":
      return `${ind}waitForWave();\n`;
    case "robot_repeat": {
      const v = "i" + (loopVar++ || "");
      return `${ind}for (let ${v} = 0; ${v} < ${Math.round(n(f.N, 1))}; ${v}++) {\n${body("DO")}${ind}}\n`;
    }
    case "robot_forever":
      return `${ind}while (true) {\n${body("DO")}${ind}}\n`;
    case "robot_until":
      return `${ind}while (!(${cond(b.inputs?.COND?.block)})) {\n${body("DO")}${ind}}\n`;
    case "robot_if":
      return `${ind}if (${cond(b.inputs?.COND?.block)}) {\n${body("DO")}${ind}}\n`;
    case "robot_if_else":
      return `${ind}if (${cond(b.inputs?.COND?.block)}) {\n${body("DO")}${ind}} else {\n${body("ELSE")}${ind}}\n`;
    default:
      return "";
  }
}

/**
 * Work saved before curriculum v1.2 used the clap blocks. Swap them for the
 * wave blocks (same place, same meaning) so old projects still open and run.
 */
export function migrateWorkspace<T>(workspace: T): T {
  if (!workspace || typeof workspace !== "object") return workspace;
  const text = JSON.stringify(workspace);
  if (!/robot_wait_clap|clapped\(\)/.test(text)) return workspace;
  return JSON.parse(text.replace(/"robot_wait_clap"/g, '"robot_wait_wave"').replace(/"clapped\(\)"/g, '"waved()"')) as T;
}

/** Student code saved before v1.2: the clap calls become the wave calls. */
export function migrateCode(code: string): string {
  return code.replace(/\bwaitForClap\(/g, "waitForWave(").replace(/\bwait_for_clap\(/g, "wait_for_wave(").replace(/\bclapped\(/g, "waved(");
}

/** Turns a saved workspace into JavaScript. Returns "" if there is no start block. */
export function blocksToJs(workspace: unknown): string {
  loopVar = 0;
  workspace = migrateWorkspace(workspace);
  const top = ((workspace as { blocks?: { blocks?: B[] } })?.blocks?.blocks ?? []) as B[];
  const starts = top.filter((b) => b.type === "robot_start");
  if (starts.length === 0) return "";
  return starts.map((s) => stack(s.next?.block, "")).join("\n");
}

let registeredMode: LabelMode | null = null;

/** (Re)define the blocks for a label mode with a Blockly instance (in the browser). Call before loading a workspace. */
export function registerRobotBlocks(Blockly: { Blocks: Record<string, unknown> }, mode: LabelMode = "words") {
  if (registeredMode === mode && Blockly.Blocks.robot_start) return;
  registeredMode = mode;
  for (const json of withIcons(BLOCK_DEFS, mode)) {
    Blockly.Blocks[String(json.type)] = {
      init(this: { jsonInit: (j: object) => void }) {
        this.jsonInit(json);
      },
    };
  }
}
