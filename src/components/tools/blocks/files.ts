/**
 * Where Explorers projects live. Nothing is stored on our server.
 *
 *  - Save: downloads a `.codeship` file (JSON, recordings embedded). This is
 *    the between-class answer: the instructor keeps the file and opens it
 *    next week, on any device.
 *  - Autosave: a copy in this browser's IndexedDB (localStorage is too small
 *    for audio), labelled "on this computer". A crash net within a class.
 *  - Copy link: only for projects with no recordings, which fit in a URL
 *    fragment (`#p=`). Every Semester 1 project does.
 *
 * If server storage is ever added, it belongs behind these functions.
 */

import { deflateRaw, fromBase64Url, inflateRaw, toBase64Url } from "../shared/linkCodec";
import { parseProject, pruneRecordings, type BlockJson, type Project } from "./model";

export const FILE_EXTENSION = ".codeship";
export const LINK_KEY = "p=";
export const LINK_URL_LIMIT = 2000;

// ── File ──

export function projectFileName(project: Project): string {
  const slug = project.name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${slug || "codeship-blocks"}${FILE_EXTENSION}`;
}

export function projectFileText(project: Project): string {
  return JSON.stringify(pruneRecordings(project));
}

export function downloadProject(project: Project) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([projectFileText(project)], { type: "application/json" }));
  a.download = projectFileName(project);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function readProjectFile(file: File): Promise<Project> {
  return parseProject(JSON.parse(await file.text()));
}

// ── Link (projects without recordings) ──

export type LinkResult = { ok: true; url: string } | { ok: false; reason: "recordings" | "tooBig" };

function stripIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIds);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (k !== "id" || !("type" in (value as BlockJson))) out[k] = stripIds(v);
    return out;
  }
  return value;
}

export async function createProjectLink(project: Project, base: string): Promise<LinkResult> {
  const clean = pruneRecordings(project);
  if (Object.keys(clean.recordings).length > 0) return { ok: false, reason: "recordings" };
  // Block ids are regenerated on load, so they needn't travel.
  const json = JSON.stringify({ ...clean, pages: stripIds(clean.pages) });
  const url = `${base}#${LINK_KEY}1${toBase64Url(await deflateRaw(new TextEncoder().encode(json)))}`;
  return url.length > LINK_URL_LIMIT ? { ok: false, reason: "tooBig" } : { ok: true, url };
}

/** The project a link carries, null if none; throws if the link is damaged. */
export async function readProjectLink(hash: string): Promise<Project | null> {
  const fragment = hash.replace(/^#/, "");
  if (!fragment.startsWith(LINK_KEY)) return null;
  const payload = fragment.slice(LINK_KEY.length);
  if (payload[0] !== "1") throw new Error("Unknown link format");
  const bytes = await inflateRaw(fromBase64Url(payload.slice(1)));
  return parseProject(JSON.parse(new TextDecoder().decode(bytes)));
}

// ── Autosave (IndexedDB) ──

const DB = "codeship-blocks";
const STORE = "autosave";
const KEY = "current";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export type Autosave = { project: Project; savedAt: number };

export async function readAutosave(): Promise<Autosave | null> {
  try {
    const db = await openDb();
    const raw = await new Promise<unknown>((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    const data = raw as { text?: string; savedAt?: number } | undefined;
    if (!data?.text) return null;
    return { project: parseProject(JSON.parse(data.text)), savedAt: Number(data.savedAt) || 0 };
  } catch {
    return null;
  }
}

/** Returns the save time, or null if this browser refused. */
export async function writeAutosave(project: Project): Promise<number | null> {
  try {
    const db = await openDb();
    const savedAt = Date.now();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ text: projectFileText(project), savedAt }, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return savedAt;
  } catch {
    return null;
  }
}
