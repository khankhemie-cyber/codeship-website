/**
 * Robot Lab blocks: definitions for Blockly and a code generator that turns a
 * saved workspace (Blockly's JSON) into the same JavaScript students later
 * type themselves. The generator works on the JSON, not on live Blockly
 * objects, so the tests can check it without a browser.
 *
 * Only the stack under "when Run is pressed" runs. Loose blocks do nothing,
 * as in the Explorers Blocks tool.
 */

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

const SENSE_OPTIONS: [string, string][] = [
  ["obstacle ahead", "obstacle()"],
  ["left sensor sees the line", "lineLeft()"],
  ["right sensor sees the line", "lineRight()"],
  ["middle sensor sees the line", "onLine()"],
  ["it is dark", "light() < 30"],
  ["it is bright", "light() >= 30"],
  ["I heard a clap", "clapped()"],
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
  { type: "robot_display", message0: "show %1", args0: [{ type: "field_input", name: "T", text: "Hi!" }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act },
  { type: "robot_record", message0: "record %1 reading", args0: [{ type: "field_dropdown", name: "S", options: [["light", "light"], ["distance", "distance"]] }], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.act, tooltip: "Save a reading to the Data tab." },

  { type: "robot_wait", message0: "wait %1 seconds", args0: [num("N", 1, 0, 60)], previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control },
  { type: "robot_wait_clap", message0: "wait for a clap", previousStatement: null, nextStatement: null, colour: BLOCK_COLOURS.control },
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
  clap: '<path d="M8 13 5 10a1.5 1.5 0 0 1 2-2l4 4m-1-3-2-2a1.5 1.5 0 0 1 2-2l5 5a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7 0l-3-3"/><path d="M16 3l1-1.5M19 5l1.5-1M20 8h1.5"/>',
  repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="m7 22-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  forever: '<path d="M12 12c-2-2.7-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.3 6-4zm0 0c2 2.7 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.3-6 4z"/>',
  branch: '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
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
  robot_pick_up: "grab",
  robot_drop: "drop",
  robot_beep: "beep",
  robot_led: "bulb",
  robot_display: "screen",
  robot_record: "chart",
  robot_wait: "clock",
  robot_wait_clap: "clap",
  robot_repeat: "repeat",
  robot_forever: "forever",
  robot_until: "repeat",
  robot_if: "branch",
  robot_if_else: "branch",
  robot_sense: "eye",
};

/** Puts each block's picture first (%1) and renumbers the rest of its first line. */
function withIcons(defs: Json[]): Json[] {
  return defs.map((d) => {
    const icon = BLOCK_ICONS[String(d.type)];
    if (!icon) return d;
    const colour = d.type === "robot_start" ? "#010F2A" : "#FFFFFF";
    const msg = String(d.message0).replace(/%(\d+)/g, (_, n) => `%${Number(n) + 1}`);
    return {
      ...d,
      message0: `%1 ${msg}`,
      args0: [{ type: "field_image", src: blockIcon(icon, colour), width: 26, height: 26, alt: "" }, ...((d.args0 as object[]) ?? [])],
    };
  });
}

export const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    { kind: "category", name: "Start", colour: BLOCK_COLOURS.start, contents: [{ kind: "block", type: "robot_start" }] },
    { kind: "category", name: "Move", colour: BLOCK_COLOURS.move, contents: ["robot_forward", "robot_backward", "robot_turn_left", "robot_turn_right", "robot_speed"].map((type) => ({ kind: "block", type })) },
    { kind: "category", name: "Do", colour: BLOCK_COLOURS.act, contents: ["robot_pick_up", "robot_drop", "robot_beep", "robot_led", "robot_display", "robot_record"].map((type) => ({ kind: "block", type })) },
    { kind: "category", name: "Control", colour: BLOCK_COLOURS.control, contents: ["robot_wait", "robot_wait_clap", "robot_repeat", "robot_forever", "robot_until", "robot_if", "robot_if_else"].map((type) => ({ kind: "block", type })) },
    { kind: "category", name: "Sense", colour: BLOCK_COLOURS.sense, contents: ["robot_sense", "robot_compare", "robot_colour_is", "robot_not"].map((type) => ({ kind: "block", type })) },
  ],
};

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
    case "robot_display":
      return `${ind}display(${str(f.T)});\n`;
    case "robot_record":
      return `${ind}record(${str(f.S)}, ${f.S === "distance" ? "distance()" : "light()"});\n`;
    case "robot_wait":
      return `${ind}wait(${n(f.N)});\n`;
    case "robot_wait_clap":
      return `${ind}waitForClap();\n`;
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

/** Turns a saved workspace into JavaScript. Returns "" if there is no start block. */
export function blocksToJs(workspace: unknown): string {
  loopVar = 0;
  const top = ((workspace as { blocks?: { blocks?: B[] } })?.blocks?.blocks ?? []) as B[];
  const starts = top.filter((b) => b.type === "robot_start");
  if (starts.length === 0) return "";
  return starts.map((s) => stack(s.next?.block, "")).join("\n");
}

/** Register the blocks with a Blockly instance (called once, in the browser). */
export function registerRobotBlocks(Blockly: { defineBlocksWithJsonArray: (defs: object[]) => void; Blocks: Record<string, unknown> }) {
  if (Blockly.Blocks.robot_start) return;
  Blockly.defineBlocksWithJsonArray(withIcons(BLOCK_DEFS));
}
