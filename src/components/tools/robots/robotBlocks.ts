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
  Blockly.defineBlocksWithJsonArray(BLOCK_DEFS);
}
