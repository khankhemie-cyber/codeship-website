/**
 * The CODEship Blocks project format. This is what Save writes to a
 * `.codeship` file and what Open reads back, so changing it means keeping
 * old files loadable (bump `version` and migrate in parseProject).
 *
 * A project is pages of actors. An actor is one character placed on one
 * page: the same character (same picture) can appear on several pages, and
 * on each page it has its own starting square and its own blocks. Page 1 is
 * always the map/front page.
 *
 * Blocks are stored in Blockly's own JSON serialisation, so the editor can
 * load them directly; the engine (engine.ts) reads the same JSON to run them.
 *
 * Erasable TypeScript only (no enums, no parameter properties): the
 * acceptance tests import this file straight into Node.
 */

export const FORMAT = "codeship-blocks";
export const FORMAT_VERSION = 1;

export const GRID_COLS = 10;
export const GRID_ROWS = 8;

/** Grow/Shrink go this many steps each way from the starting size. */
export const SIZE_STEPS = 7;
export const SIZE_FACTOR = 1.2;

export const MESSAGE_COLOURS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export type MessageColour = (typeof MESSAGE_COLOURS)[number];

/** One Blockly block, as Blockly.serialization saves it (only what we use). */
export type BlockJson = {
  type: string;
  id?: string;
  x?: number;
  y?: number;
  data?: string;
  fields?: Record<string, string | number>;
  inputs?: Record<string, { block?: BlockJson }>;
  next?: { block?: BlockJson };
};

/** Blockly workspace JSON for one actor's blocks. */
export type Scripts = { blocks?: { languageVersion?: number; blocks?: BlockJson[] } };

export type Character = { id: string; costume: string };

export type Actor = { id: string; characterId: string; x: number; y: number; scripts: Scripts };

export type Page = { id: string; background: string; actors: Actor[] };

export type Recording = { mime: string; data: string; durationMs: number };

export type Project = {
  format: typeof FORMAT;
  version: number;
  name: string;
  characters: Character[];
  pages: Page[];
  /** Keyed by clip id; a Record block holds its clip id in Blockly's `data`. */
  recordings: Record<string, Recording>;
};

export function newId(prefix: string): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function emptyScripts(): Scripts {
  return { blocks: { languageVersion: 0, blocks: [] } };
}

export function starterProject(): Project {
  const robot: Character = { id: newId("c"), costume: "robot" };
  return {
    format: FORMAT,
    version: FORMAT_VERSION,
    name: "",
    characters: [robot],
    pages: [{ id: newId("p"), background: "grass", actors: [{ id: newId("a"), characterId: robot.id, x: 2, y: 4, scripts: emptyScripts() }] }],
    recordings: {},
  };
}

const clampInt = (v: unknown, lo: number, hi: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};

/** Reads a project from untrusted JSON (a file or a link). Throws if it isn't one. */
export function parseProject(raw: unknown): Project {
  const p = raw as Partial<Project>;
  if (!p || p.format !== FORMAT || !Array.isArray(p.pages) || !Array.isArray(p.characters)) {
    throw new Error("Not a CODEship Blocks project");
  }
  if (Number(p.version) > FORMAT_VERSION) throw new Error("This project was made with a newer version of CODEship Blocks");
  const characters = p.characters
    .filter((c) => c && typeof c.id === "string")
    .map((c) => ({ id: c.id, costume: String(c.costume || "robot") }));
  const known = new Set(characters.map((c) => c.id));
  const pages = p.pages.map((pg) => ({
    id: String(pg?.id || newId("p")),
    background: String(pg?.background || "grass"),
    actors: (Array.isArray(pg?.actors) ? pg.actors : [])
      .filter((a) => a && known.has(a.characterId))
      .map((a) => ({
        id: String(a.id || newId("a")),
        characterId: a.characterId,
        x: clampInt(a.x, 0, GRID_COLS - 1, 0),
        y: clampInt(a.y, 0, GRID_ROWS - 1, 0),
        scripts: a.scripts && typeof a.scripts === "object" ? a.scripts : emptyScripts(),
      })),
  }));
  if (pages.length === 0) throw new Error("This project has no pages");
  const recordings: Record<string, Recording> = {};
  for (const [id, r] of Object.entries(p.recordings ?? {})) {
    if (r && typeof r.data === "string" && r.data.startsWith("data:audio/")) {
      recordings[id] = { mime: String(r.mime || "audio/wav"), data: r.data, durationMs: Math.max(0, Number(r.durationMs) || 0) };
    }
  }
  return { format: FORMAT, version: FORMAT_VERSION, name: String(p.name ?? ""), characters, pages, recordings };
}

/** Clip ids referenced by Record blocks anywhere in the project. */
export function usedClipIds(project: Project): Set<string> {
  const ids = new Set<string>();
  const walk = (b?: BlockJson) => {
    if (!b) return;
    if (b.type === "record" && b.data) ids.add(b.data);
    for (const input of Object.values(b.inputs ?? {})) walk(input.block);
    walk(b.next?.block);
  };
  for (const page of project.pages) for (const actor of page.actors) for (const top of actor.scripts.blocks?.blocks ?? []) walk(top);
  return ids;
}

/** Drops recordings no Record block uses any more (re-recording replaces a clip). */
export function pruneRecordings(project: Project): Project {
  const used = usedClipIds(project);
  const recordings: Record<string, Recording> = {};
  for (const [id, r] of Object.entries(project.recordings)) if (used.has(id)) recordings[id] = r;
  return { ...project, recordings };
}
