/**
 * Port CODEship blocks: drag-and-drop versions of every mission's commands.
 *
 * A workspace (Blockly's saved JSON) is turned into JavaScript to run and into
 * Python to show ("See the Python"), so kids can see how their blocks read as
 * real code. The generators work on the JSON, not live Blockly objects, so the
 * Node tests check them without a browser.
 */

import { AISLES, BLOCK_COLORS, LITTER_KINDS, type MissionId } from "./missions";

type Json = Record<string, unknown>;

export const COLOURS = {
  start: "#D58401",
  build: "#B5523B",
  shop: "#2F80ED",
  beach: "#1E9E7A",
  control: "#0A7C8A",
  sense: "#6B3FA0",
} as const;

const dd = (name: string, options: string[]) => ({ type: "field_dropdown", name, options: options.map((o) => [o, o]) });
const num = (name: string, value: number, min: number, max: number) => ({ type: "field_number", name, value, min, max, precision: 1 });
const stmt = { previousStatement: null, nextStatement: null };
const PRODUCTS = AISLES.flat();
const KINDS = Object.keys(LITTER_KINDS);

export const BLOCK_DEFS: Json[] = [
  { type: "port_start", message0: "when Run is pressed", nextStatement: null, colour: COLOURS.start, tooltip: "Your program starts here. Only blocks joined underneath will run." },

  // Control (every mission)
  { type: "port_repeat", message0: "repeat %1 times", args0: [num("N", 4, 1, 100)], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], ...stmt, colour: COLOURS.control },
  { type: "port_while", message0: "repeat while %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], ...stmt, colour: COLOURS.control },
  { type: "port_if", message0: "if %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], ...stmt, colour: COLOURS.control },
  { type: "port_if_else", message0: "if %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], message2: "else", message3: "%1", args3: [{ type: "input_statement", name: "ELSE" }], ...stmt, colour: COLOURS.control },
  { type: "port_not", message0: "not %1", args0: [{ type: "input_value", name: "A", check: "Boolean" }], output: "Boolean", colour: COLOURS.sense },
  { type: "port_say", message0: "say %1", args0: [{ type: "field_input", name: "T", text: "Hello!" }], ...stmt, colour: COLOURS.control },

  // Home: Builder Bot
  { type: "port_place", message0: "place a block", ...stmt, colour: COLOURS.build },
  { type: "port_move", message0: "move %1", args0: [num("N", 1, -12, 12)], ...stmt, colour: COLOURS.build },
  { type: "port_turn", message0: "turn %1", args0: [dd("D", ["right", "left"])], ...stmt, colour: COLOURS.build },
  { type: "port_layer", message0: "go %1 a layer", args0: [dd("D", ["up", "down"])], ...stmt, colour: COLOURS.build },
  { type: "port_color", message0: "use %1 blocks", args0: [dd("C", [...BLOCK_COLORS])], ...stmt, colour: COLOURS.build },
  { type: "port_remove", message0: "remove a block", ...stmt, colour: COLOURS.build },

  // Market: Ladder Bot
  { type: "port_customer", message0: "a customer is waiting", output: "Boolean", colour: COLOURS.sense },
  { type: "port_next_order", message0: "take the next order", ...stmt, colour: COLOURS.shop, tooltip: "Remembers what the customer wants as 'product'." },
  { type: "port_order_is", message0: "the order is %1", args0: [dd("P", PRODUCTS)], output: "Boolean", colour: COLOURS.sense },
  { type: "port_map", message0: "shelf map", message1: "%1", args1: [{ type: "input_statement", name: "DO", check: "map_entry" }], ...stmt, colour: COLOURS.shop, tooltip: "Fill in where every product is. Read the signs above each aisle." },
  { type: "port_map_entry", message0: "%1 is in aisle %2 shelf %3", args0: [dd("P", PRODUCTS), num("A", 1, 1, 4), num("L", 1, 1, 4)], previousStatement: "map_entry", nextStatement: "map_entry", colour: COLOURS.shop },
  { type: "port_go_order", message0: "go to the order's aisle and shelf", ...stmt, colour: COLOURS.shop, tooltip: "Looks the order up in your shelf map." },
  { type: "port_aisle", message0: "go to aisle %1", args0: [num("N", 1, 1, 4)], ...stmt, colour: COLOURS.shop },
  { type: "port_raise", message0: "raise ladder to shelf %1", args0: [num("N", 1, 1, 4)], ...stmt, colour: COLOURS.shop },
  { type: "port_pick", message0: "pick the product", ...stmt, colour: COLOURS.shop },
  { type: "port_deliver", message0: "deliver to the customer", ...stmt, colour: COLOURS.shop },

  // Beach: Beach Bot
  { type: "port_litter", message0: "litter is on the beach", output: "Boolean", colour: COLOURS.sense },
  { type: "port_scan", message0: "scan the nearest litter", ...stmt, colour: COLOURS.beach, tooltip: "Remembers what it found as 'item'." },
  { type: "port_item_is", message0: "the item is %1", args0: [dd("K", KINDS)], output: "Boolean", colour: COLOURS.sense },
  { type: "port_pick_up", message0: "pick it up", ...stmt, colour: COLOURS.beach },
  { type: "port_drop_in", message0: "put it in %1", args0: [dd("B", ["recycling", "compost", "garbage"])], ...stmt, colour: COLOURS.beach },
];

const cat = (name: string, colour: string, types: string[]) => ({ kind: "category", name, colour, contents: types.map((type) => ({ kind: "block", type })) });
const CONTROL = cat("Control", COLOURS.control, ["port_repeat", "port_while", "port_if", "port_if_else", "port_not", "port_say"]);

export const TOOLBOXES: Record<MissionId, object> = {
  home: { kind: "categoryToolbox", contents: [cat("Start", COLOURS.start, ["port_start"]), cat("Build", COLOURS.build, ["port_place", "port_move", "port_turn", "port_layer", "port_color", "port_remove"]), CONTROL] },
  market: {
    kind: "categoryToolbox",
    contents: [
      cat("Start", COLOURS.start, ["port_start"]),
      cat("Shop", COLOURS.shop, ["port_next_order", "port_map", "port_map_entry", "port_go_order", "port_aisle", "port_raise", "port_pick", "port_deliver"]),
      cat("Check", COLOURS.sense, ["port_customer", "port_order_is"]),
      CONTROL,
    ],
  },
  beach: {
    kind: "categoryToolbox",
    contents: [cat("Start", COLOURS.start, ["port_start"]), cat("Beach Bot", COLOURS.beach, ["port_scan", "port_pick_up", "port_drop_in"]), cat("Check", COLOURS.sense, ["port_litter", "port_item_is"]), CONTROL],
  },
};

// ---------------------------------------------------------------------------
// Starter workspaces (match the typed starter code)

type B = { type: string; fields?: Record<string, unknown>; inputs?: Record<string, { block?: B }>; next?: { block?: B }; x?: number; y?: number };

/** Chains blocks: each one's `next` is the following block. */
function chain(...blocks: B[]): B | undefined {
  for (let i = blocks.length - 2; i >= 0; i--) blocks[i] = { ...blocks[i], next: { block: blocks[i + 1] } };
  return blocks[0];
}
const blk = (type: string, fields?: Record<string, unknown>, inputs?: Record<string, B | undefined>): B => ({
  type,
  ...(fields ? { fields } : {}),
  ...(inputs ? { inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, { block: v }])) } : {}),
});
const ws = (first: B) => ({ blocks: { languageVersion: 0, blocks: [{ ...first, x: 30, y: 30 }] } });

export const STARTER_BLOCKS: Record<MissionId, unknown> = {
  home: ws(chain(blk("port_start"), blk("port_color", { C: "brick" }), blk("port_repeat", { N: 5 }, { DO: chain(blk("port_place"), blk("port_move", { N: 1 })) }), blk("port_turn", { D: "right" }))!),
  market: ws(
    chain(
      blk("port_start"),
      blk("port_map", undefined, { DO: chain(blk("port_map_entry", { P: "rice", A: 1, L: 1 }), blk("port_map_entry", { P: "cereal", A: 4, L: 4 })) }),
      blk("port_while", undefined, { COND: blk("port_customer"), DO: chain(blk("port_next_order"), blk("port_go_order"), blk("port_pick"), blk("port_deliver")) })
    )!
  ),
  beach: ws(
    chain(
      blk("port_start"),
      blk("port_while", undefined, {
        COND: blk("port_litter"),
        DO: chain(blk("port_scan"), blk("port_pick_up"), blk("port_if_else", undefined, { COND: blk("port_item_is", { K: "can" }), DO: blk("port_drop_in", { B: "recycling" }), ELSE: blk("port_drop_in", { B: "garbage" }) })),
      })
    )!
  ),
};

/** Exposed for the tests, which build full solutions from the same helpers. */
export const build = { chain, blk, ws };

// ---------------------------------------------------------------------------
// Generators

const q = (v: unknown) => JSON.stringify(String(v ?? ""));
const n = (v: unknown, fallback = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.round(x) : fallback;
};

type Lang = "js" | "py";

function cond(b: B | undefined, lang: Lang): string {
  if (!b) return lang === "py" ? "False" : "false";
  const f = b.fields ?? {};
  switch (b.type) {
    case "port_customer":
      return "has_customer()";
    case "port_litter":
      return "has_litter()";
    case "port_order_is":
      return lang === "py" ? `product == ${q(f.P)}` : `product === ${q(f.P)}`;
    case "port_item_is":
      return lang === "py" ? `item == ${q(f.K)}` : `item === ${q(f.K)}`;
    case "port_not":
      return lang === "py" ? `not (${cond(b.inputs?.A?.block, lang)})` : `!(${cond(b.inputs?.A?.block, lang)})`;
    default:
      return lang === "py" ? "False" : "false";
  }
}

function stack(b: B | undefined, ind: string, lang: Lang, ctx: Ctx): string {
  let out = "";
  for (let cur = b; cur; cur = cur.next?.block) out += statement(cur, ind, lang, ctx);
  return out;
}

type Ctx = { loop: number; map: [string, number, number][] };

function statement(b: B, ind: string, lang: Lang, ctx: Ctx): string {
  const f = b.fields ?? {};
  const py = lang === "py";
  const step = py ? "    " : "  ";
  const end = py ? "" : ";";
  const body = (name: string) => {
    const s = stack(b.inputs?.[name]?.block, ind + step, lang, ctx);
    return s || (py ? `${ind}${step}pass\n` : "");
  };
  const call = (s: string) => `${ind}${s}${end}\n`;
  const block = (head: string, name: string) => (py ? `${ind}${head}:\n${body(name)}` : `${ind}${head} {\n${body(name)}${ind}}\n`);
  switch (b.type) {
    case "port_repeat": {
      const v = ctx.loop++ ? `i${ctx.loop - 1}` : "i";
      return block(py ? `for ${v} in range(${n(f.N, 1)})` : `for (let ${v} = 0; ${v} < ${n(f.N, 1)}; ${v}++)`, "DO");
    }
    case "port_while":
      return block(py ? `while ${cond(b.inputs?.COND?.block, lang)}` : `while (${cond(b.inputs?.COND?.block, lang)})`, "DO");
    case "port_if":
      return block(py ? `if ${cond(b.inputs?.COND?.block, lang)}` : `if (${cond(b.inputs?.COND?.block, lang)})`, "DO");
    case "port_if_else":
      return py
        ? `${ind}if ${cond(b.inputs?.COND?.block, lang)}:\n${body("DO")}${ind}else:\n${body("ELSE")}`
        : `${ind}if (${cond(b.inputs?.COND?.block, lang)}) {\n${body("DO")}${ind}} else {\n${body("ELSE")}${ind}}\n`;
    case "port_say":
      return call(`print(${q(f.T)})`);
    case "port_place":
      return call("place()");
    case "port_move":
      return call(`move(${n(f.N, 1)})`);
    case "port_turn":
      return call(f.D === "left" ? "turn_left()" : "turn_right()");
    case "port_layer":
      return call(f.D === "down" ? "down()" : "up()");
    case "port_color":
      return call(`set_color(${q(f.C)})`);
    case "port_remove":
      return call("remove()");
    case "port_next_order":
      return call("product = next_order()");
    case "port_map": {
      for (let e = b.inputs?.DO?.block; e; e = e.next?.block) {
        if (e.type === "port_map_entry") ctx.map.push([String(e.fields?.P), n(e.fields?.A, 1), n(e.fields?.L, 1)]);
      }
      const rows = ctx.map.map(([p, a, l]) => `${ind}${step}${q(p)}: [${a}, ${l}],`).join("\n");
      return py ? `${ind}shelf_map = {\n${rows}\n${ind}}\n` : `${ind}shelf_map = {\n${rows}\n${ind}};\n`;
    }
    case "port_go_order":
      return py
        ? `${ind}aisle, level = shelf_map[product]\n${ind}go_to_aisle(aisle)\n${ind}raise_to(level)\n`
        : `${ind}if (!(product in shelf_map)) throw new Error(product + " is not in your shelf map yet. Read the aisle signs and add it");\n${ind}[aisle, level] = shelf_map[product];\n${ind}go_to_aisle(aisle);\n${ind}raise_to(level);\n`;
    case "port_aisle":
      return call(`go_to_aisle(${n(f.N, 1)})`);
    case "port_raise":
      return call(`raise_to(${n(f.N, 1)})`);
    case "port_pick":
      return call("pick()");
    case "port_deliver":
      return call("deliver()");
    case "port_scan":
      return call("item = scan()");
    case "port_pick_up":
      return call("pick_up()");
    case "port_drop_in":
      return call(`drop_in(${q(f.B)})`);
    default:
      return "";
  }
}

function generate(workspace: unknown, lang: Lang): string {
  const top = ((workspace as { blocks?: { blocks?: B[] } })?.blocks?.blocks ?? []) as B[];
  const starts = top.filter((b) => b.type === "port_start");
  if (!starts.length) return "";
  const ctx: Ctx = { loop: 0, map: [] };
  const body = starts.map((s) => stack(s.next?.block, "", lang, ctx)).join("\n");
  if (lang === "py") return body;
  // JavaScript needs its variables declared once, up front.
  return `let product = null, item = null, aisle = 0, level = 0, shelf_map = {};\n${body}`;
}

/** The JavaScript that actually runs. "" if there is no start block. */
export const blocksToJs = (workspace: unknown) => generate(workspace, "js");
/** The same program as Python, to show kids what their blocks say. */
export const blocksToPy = (workspace: unknown) => generate(workspace, "py");

/** Register the blocks with a Blockly instance (once, in the browser). */
export function registerPortBlocks(Blockly: { defineBlocksWithJsonArray: (defs: object[]) => void; Blocks: Record<string, unknown> }) {
  if (Blockly.Blocks.port_start) return;
  Blockly.defineBlocksWithJsonArray(BLOCK_DEFS);
}
