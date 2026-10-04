/**
 * The twenty Explorers blocks, defined for Blockly. This is the complete
 * vocabulary for all four semesters: do not add blocks here without the
 * curriculum changing first.
 *
 * Every block is identified by its PICTURE and its colour group; the words
 * are an adult label and disappear in "pictures only" mode. Numbers, pages
 * and message colours are picked from dropdowns, never typed. Only the Say
 * block has a text box, and the instructor types in it.
 *
 * The colour groups are printed in the instructor books and workbooks, so
 * the primary colours below must not change.
 */

import * as Blockly from "blockly/core";
import { MESSAGE_COLOURS } from "./model";
import { blockLabel, type BlockType, type UiLang } from "./i18n";

export type LabelMode = "words" | "icons";

type Group = "start" | "move" | "say" | "fun" | "control";

export const GROUP_COLOURS: Record<Group, string> = {
  start: "#D58401",
  move: "#E6ECF4",
  say: "#035762",
  fun: "#4E2B6F",
  control: "#012C61",
};

// Secondary/tertiary shades give every block a visible outline on the light workspace.
const BLOCK_STYLES: Record<Group, { colourPrimary: string; colourSecondary: string; colourTertiary: string }> = {
  start: { colourPrimary: GROUP_COLOURS.start, colourSecondary: "#E8A033", colourTertiary: "#8A5500" },
  move: { colourPrimary: GROUP_COLOURS.move, colourSecondary: "#F5F8FB", colourTertiary: "#586173" },
  say: { colourPrimary: GROUP_COLOURS.say, colourSecondary: "#0A7C8A", colourTertiary: "#012F35" },
  fun: { colourPrimary: GROUP_COLOURS.fun, colourSecondary: "#6B4593", colourTertiary: "#2A163D" },
  control: { colourPrimary: GROUP_COLOURS.control, colourSecondary: "#1C4A85", colourTertiary: "#000A1A" },
};

/** Blocks on gold and pale backgrounds get navy text and icons, for contrast. */
const DARK_ON: Group[] = ["start", "move"];

type Def = { type: BlockType; group: Group; semester: 1 | 2 | 3 | 4; icon: string };

export const BLOCKS: Def[] = [
  { type: "start_tap", group: "start", semester: 1, icon: "tap" },
  { type: "start_flag", group: "start", semester: 1, icon: "flag" },
  { type: "start_bump", group: "start", semester: 3, icon: "bump" },
  { type: "start_message", group: "start", semester: 4, icon: "envelope" },
  { type: "move_right", group: "move", semester: 1, icon: "right" },
  { type: "move_left", group: "move", semester: 1, icon: "left" },
  { type: "move_up", group: "move", semester: 1, icon: "up" },
  { type: "move_down", group: "move", semester: 1, icon: "down" },
  { type: "go_home", group: "move", semester: 4, icon: "home" },
  { type: "say", group: "say", semester: 1, icon: "speech" },
  { type: "record", group: "say", semester: 2, icon: "mic" },
  { type: "pop", group: "fun", semester: 1, icon: "pop" },
  { type: "grow", group: "fun", semester: 1, icon: "grow" },
  { type: "shrink", group: "fun", semester: 2, icon: "shrink" },
  { type: "hide", group: "fun", semester: 3, icon: "hide" },
  { type: "show", group: "fun", semester: 3, icon: "show" },
  { type: "wait", group: "control", semester: 2, icon: "clock" },
  { type: "go_page", group: "control", semester: 2, icon: "page" },
  { type: "repeat", group: "control", semester: 3, icon: "loop" },
  { type: "send_message", group: "control", semester: 4, icon: "send" },
];

export const HAT_TYPES = new Set<string>(["start_tap", "start_flag", "start_bump", "start_message"]);

// ── Pictures (24x24 strokes, drawn in the block's text colour) ──

const ICON_PATHS: Record<string, (c: string) => string> = {
  tap: (c) =>
    `<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1a1.5 1.5 0 0 1 3 0v1m0 0a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15a1.5 1.5 0 0 1 2.5-1.6L9 16" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 4 3.5 2.5M10.5 1.5V0M16 4l1.5-1.5" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
  flag: () => `<path d="M5 22V3" stroke="#010F2A" stroke-width="2.4" stroke-linecap="round"/><path d="M5 3h13l-3 4.5 3 4.5H5z" fill="#2EB84B" stroke="#010F2A" stroke-width="1.8" stroke-linejoin="round"/>`,
  bump: (c) =>
    `<rect x="1.5" y="8" width="8" height="8" rx="1.5" fill="none" stroke="${c}" stroke-width="2"/><rect x="14.5" y="8" width="8" height="8" rx="1.5" fill="none" stroke="${c}" stroke-width="2"/><path d="M12 3v3M12 18v3M9.5 5l1 1.5M14.5 5l-1 1.5M9.5 19l1-1.5M14.5 19l-1-1.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  envelope: (c) => `<rect x="2.5" y="5" width="19" height="14" rx="2" fill="none" stroke="${c}" stroke-width="2"/><path d="m3 6 9 7 9-7" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`,
  send: (c) => `<path d="M3 11.5 21 3l-6 18-3.5-7.5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M11.5 13.5 21 3" stroke="${c}" stroke-width="2"/>`,
  right: (c) => `<path d="M3 12h16m-6-6.5L19.5 12 13 18.5" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  left: (c) => `<path d="M21 12H5m6-6.5L4.5 12l6.5 6.5" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  up: (c) => `<path d="M12 21V5m-6.5 6L12 4.5l6.5 6.5" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  down: (c) => `<path d="M12 3v16m-6.5-6L12 19.5l6.5-6.5" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  home: (c) => `<path d="M3 11 12 3l9 8M5.5 9v11h13V9" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20v-6h4v6" fill="none" stroke="${c}" stroke-width="2.4"/>`,
  speech: (c) => `<path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 16h-9l-5 4.5V16H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 4z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M7 8.5h10M7 12h7" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  mic: (c) => `<rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="none" stroke="${c}" stroke-width="2"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  micFull: (c) => `<rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="${c}" stroke="${c}" stroke-width="2"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="4" r="3.2" fill="#FF6B6B"/>`,
  pop: (c) => `<path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="${c}"/>`,
  grow: (c) => `<path d="M14 3h7v7M10 21H3v-7M21 3l-7 7M3 21l7-7" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  shrink: (c) => `<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  hide: (c) => `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="${c}" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="${c}" stroke-width="2"/><path d="M3 3l18 18" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
  show: (c) => `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="${c}" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="${c}"/>`,
  clock: (c) => `<circle cx="12" cy="12" r="9.5" fill="none" stroke="${c}" stroke-width="2"/><path d="M12 6.5V12l3.5 2.5" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,
  page: (c) => `<path d="M5 2.5h9l5 5v14H5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M14 2.5v5h5M8.5 15h6m-2.5-2.5L15 15l-2.5 2.5" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  loop: (c) => `<path d="M17.5 6.5A7.5 7.5 0 1 0 19.5 13" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><path d="M14 6.5h4.5V2" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
};

export function iconUrl(name: string, colour: string): string {
  const body = (ICON_PATHS[name] ?? ICON_PATHS.pop)(colour);
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`)}`;
}

const SWATCH: Record<string, string> = {
  red: "#E53935",
  orange: "#FB8C00",
  yellow: "#FDD835",
  green: "#43A047",
  blue: "#1E88E5",
  purple: "#8E24AA",
};

const swatchUrl = (colour: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${SWATCH[colour]}" stroke="#fff" stroke-width="2.5"/></svg>`,
  )}`;

const textColour = (group: Group) => (DARK_ON.includes(group) ? "#010F2A" : "#FFFFFF");
const ICON_SIZE = 36;

export function recordIcon(hasClip: boolean) {
  return iconUrl(hasClip ? "micFull" : "mic", textColour("say"));
}

// "Go to Page" offers only the pages that exist; the editor keeps this current.
let pageCount = 1;
export function setPageCount(n: number) {
  pageCount = Math.max(1, n);
}

const numberOptions = (from: number, to: number): [string, string][] =>
  Array.from({ length: to - from + 1 }, (_, i) => [String(from + i), String(from + i)]);

let lastRegistered = "";

/** (Re)define the blocks for a language and label mode. Call before loading a workspace. */
export function registerBlocks(lang: UiLang, mode: LabelMode) {
  const key = `${lang}/${mode}`;
  if (key === lastRegistered) return;
  lastRegistered = key;
  for (const def of BLOCKS) {
    const fg = textColour(def.group);
    const args: object[] = [{ type: "field_image", name: "ICON", src: def.type === "record" ? recordIcon(false) : iconUrl(def.icon, fg), width: ICON_SIZE, height: ICON_SIZE, alt: blockLabel(lang, def.type) }];
    if (mode === "words") args.push({ type: "field_label", text: blockLabel(lang, def.type), class: "cb-label" });
    switch (def.type) {
      case "say":
        args.push({ type: "field_input", name: "TEXT", text: lang === "fr" ? "Bonjour !" : "Hello!" });
        break;
      case "wait":
        args.push({ type: "field_dropdown", name: "N", options: numberOptions(1, 9) });
        break;
      case "repeat":
        args.push({ type: "field_dropdown", name: "N", options: numberOptions(1, 10) });
        break;
      case "send_message":
      case "start_message":
        args.push({
          type: "field_dropdown",
          name: "COLOUR",
          options: MESSAGE_COLOURS.map((c) => [{ src: swatchUrl(c), width: 32, height: 32, alt: c }, c]),
        });
        break;
    }
    const message = args.map((_, i) => `%${i + 1}`).join(" ");
    const json: Record<string, unknown> = { type: def.type, message0: message, args0: args, style: def.group, tooltip: "" };
    if (HAT_TYPES.has(def.type)) json.nextStatement = null;
    else {
      json.previousStatement = null;
      json.nextStatement = null;
    }
    if (def.type === "repeat") {
      json.message1 = "%1";
      json.args1 = [{ type: "input_statement", name: "DO" }];
    }
    const isHat = HAT_TYPES.has(def.type);
    const isGoPage = def.type === "go_page";
    Blockly.Blocks[def.type] = {
      init(this: Blockly.Block) {
        this.jsonInit(json);
        if (isGoPage) {
          this.appendDummyInput("PAGE_INPUT").appendField(new Blockly.FieldDropdown(() => numberOptions(1, pageCount)), "PAGE");
          this.setInputsInline(true);
        }
        if (isHat) (this as Blockly.Block & { hat?: string }).hat = "cap";
        this.setHelpUrl("");
      },
    };
  }
}

export function blockTheme() {
  return Blockly.Theme.defineTheme("codeship-explorers", {
    name: "codeship-explorers",
    base: Blockly.Themes.Classic,
    blockStyles: BLOCK_STYLES,
    componentStyles: {
      workspaceBackgroundColour: "#F4F7FB",
      flyoutBackgroundColour: "#E3E9F2",
      flyoutOpacity: 1,
      scrollbarColour: "#9AA6B8",
      insertionMarkerColour: "#D58401",
      insertionMarkerOpacity: 0.5,
    },
    fontStyle: { family: "Inter, system-ui, sans-serif", weight: "700", size: 13 },
    startHats: true,
  });
}

/**
 * The palette, in colour groups, limited to blocks taught up to `semester`
 * (0 = all twenty), or to exactly `only` (a level's palette).
 */
export function toolboxFor(semester: number, only?: readonly string[]): Blockly.utils.toolbox.ToolboxDefinition {
  const groups: Group[] = ["start", "move", "say", "fun", "control"];
  const contents: Blockly.utils.toolbox.FlyoutItemInfo[] = [];
  for (const group of groups) {
    const defs = BLOCKS.filter((b) => b.group === group && (only ? only.includes(b.type) : semester === 0 || b.semester <= semester));
    defs.forEach((d, i) => contents.push({ kind: "block", type: d.type, gap: i === defs.length - 1 ? 36 : 12 } as Blockly.utils.toolbox.FlyoutItemInfo));
  }
  return { kind: "flyoutToolbox", contents };
}

export const DARK_TEXT_TYPES = new Set(BLOCKS.filter((b) => DARK_ON.includes(b.group)).map((b) => b.type));
