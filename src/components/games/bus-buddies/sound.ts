"use client";

/**
 * Bus Buddies: voices and sound effects.
 *
 * Voices are pre-made MP3s (scripts/bus-buddies/generate-voices.mjs), one per
 * line in voice-script.json, listed in /ship-it/bus-buddies/audio/manifest.json.
 * Each chapter's files are preloaded when the chapter opens. If a file is
 * missing (or sound is off), the line still shows in a speech bubble for a
 * reading-length pause, so the game always works.
 *
 * Sound effects are made live with the Web Audio API: no audio files, no licences.
 */
import { useSyncExternalStore } from "react";
import script from "@/lib/games/bus/voice-script.json";

export type Speaker = "bina" | "codey" | "turtle" | "duck" | "owl";

interface Line {
  id: string;
  chapter: number;
  character: Speaker;
  text: string;
}

const LINES = new Map<string, Line>((script.lines as Line[]).map((l) => [l.id, l]));
const AUDIO_BASE = "/ship-it/bus-buddies/audio/";
const MUTE_KEY = "codeship-bus-buddies-muted";

export function lineText(id: string) {
  return LINES.get(id)?.text ?? "";
}
export function lineSpeaker(id: string): Speaker {
  return LINES.get(id)?.character ?? "codey";
}

/* ---------------- shared state (who is talking, muted) ---------------- */

interface VoiceState {
  muted: boolean;
  /** Line being spoken right now, and by whom. */
  lineId: string | null;
  speaker: Speaker | null;
}

let state: VoiceState = { muted: false, lineId: null, speaker: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<VoiceState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

let mutedLoaded = false;
function loadMuted() {
  if (mutedLoaded || typeof window === "undefined") return;
  mutedLoaded = true;
  try {
    state = { ...state, muted: window.localStorage.getItem(MUTE_KEY) === "1" };
  } catch {}
}

export function useVoiceState(): VoiceState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      loadMuted();
      return state;
    },
    () => state,
  );
}

export function setMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
  if (muted) current?.pause();
  set({ muted });
}

/* ---------------- manifest and preloading ---------------- */

let manifest: Record<string, { file: string }> | null = null;
let manifestPromise: Promise<void> | null = null;
const cache = new Map<string, HTMLAudioElement>();

function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(`${AUDIO_BASE}manifest.json`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : { lines: {} }))
      .then((m: { lines?: Record<string, { file: string }> }) => {
        manifest = m.lines ?? {};
      })
      .catch(() => {
        manifest = {};
      });
  }
  return manifestPromise;
}

function audioFor(id: string): HTMLAudioElement | null {
  const entry = manifest?.[id];
  if (!entry) return null;
  let a = cache.get(id);
  if (!a) {
    a = new Audio(AUDIO_BASE + entry.file);
    a.preload = "auto";
    cache.set(id, a);
  }
  return a;
}

/** Fetch this chapter's lines (and the shared ones) ahead of time. */
export async function preloadChapter(chapter: number) {
  await loadManifest();
  for (const l of LINES.values()) if (l.chapter === chapter || l.chapter === 0) audioFor(l.id);
}

/* ---------------- speaking ---------------- */

let current: HTMLAudioElement | null = null;
/** Bumped by every new line: a line that is no longer current stops waiting. */
let token = 0;
/** Bumped by every say()/sayAll()/stopTalking(): ends a running sayAll. */
let seq = 0;

/** A comfortable reading pause for when there's no audio. */
const pauseFor = (text: string) => 900 + text.split(/\s+/).length * 380;

/**
 * Speak one line. Resolves when it has finished (or was cut off by another
 * line or stop()). The bubble shows for as long as the line plays.
 */
export function say(id: string): Promise<void> {
  seq++;
  return speak(id);
}

async function speak(id: string): Promise<void> {
  const line = LINES.get(id);
  if (!line) return;
  const my = ++token;
  current?.pause();
  set({ lineId: id, speaker: line.character });
  await loadManifest();
  if (my !== token) return;
  const audio = state.muted ? null : audioFor(id);
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(watch);
      resolve();
    };
    // Resolve if another line takes over.
    const watch = setInterval(() => {
      if (my !== token) finish();
    }, 100);
    if (audio) {
      current = audio;
      audio.currentTime = 0;
      audio.onended = finish;
      audio.onerror = () => setTimeout(finish, pauseFor(line.text));
      audio.play().catch(() => setTimeout(finish, pauseFor(line.text)));
    } else {
      setTimeout(finish, pauseFor(line.text));
    }
  });
  if (my === token) set({ speaker: null });
}

/** Speak several lines in a row. Stops early if something else speaks. */
export async function sayAll(ids: string[]): Promise<boolean> {
  const my = ++seq;
  for (const id of ids) {
    if (my !== seq) return false;
    await speak(id);
  }
  return my === seq;
}

/** Stop talking; the last line stays in its bubble. */
export function stopTalking() {
  token++;
  seq++;
  current?.pause();
  set({ speaker: null });
}

/* ---------------- sound effects (Web Audio) ---------------- */

let ctx: AudioContext | null = null;
function ac() {
  if (state.muted || typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18, slideTo?: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(start: number, dur: number, vol: number, freq: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + start;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(freq, t);
  f.frequency.exponentialRampToValueAtTime(freq / 4, t + dur);
  const g = a.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const sfx = {
  /** Unlock audio on the first tap (iPad needs a user gesture). */
  unlock: () => ac(),
  pop: () => tone(660, 0, 0.09, "triangle", 0.12, 990),
  remove: () => tone(500, 0, 0.1, "triangle", 0.1, 260),
  vroom: () => {
    tone(90, 0, 0.45, "sawtooth", 0.05, 140);
    tone(180, 0, 0.4, "triangle", 0.04, 260);
  },
  turn: () => tone(420, 0, 0.18, "sine", 0.08, 560),
  honk: () => {
    for (const s of [0, 0.28]) {
      tone(392, s, 0.22, "square", 0.07);
      tone(494, s, 0.22, "square", 0.06);
    }
  },
  boing: () => tone(320, 0, 0.5, "sine", 0.16, 110),
  board: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.16, "triangle", 0.1)),
  cheer: () => {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, "triangle", 0.12));
    noise(0.1, 0.8, 0.08, 6000);
  },
  sticker: () => [880, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.25, "sine", 0.1)),
  splash: () => noise(0, 0.7, 0.25, 1600),
};
