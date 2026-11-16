"use client";

/**
 * Developers Arcade — player progress.
 *
 * Everything lives in this browser's localStorage: no accounts, no personal
 * data leaves the device. Every read/write is wrapped so the games still work
 * in private windows or when storage is blocked (progress just won't persist).
 */
import { useSyncExternalStore } from "react";

export type GameId = "rover" | "bot" | "studio";

export interface Progress {
  /** A fun coder name the player picks (never a real name — we say so in the UI). */
  coderName: string;
  xp: number;
  /** "game:level" -> best stars (1–3). */
  stars: Record<string, number>;
  badges: string[];
}

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: "hello-world", emoji: "👋", title: "Hello, World", description: "Run your very first program." },
  { id: "loop-legend", emoji: "🔁", title: "Loop Legend", description: "Solve a loop level with 3 stars." },
  { id: "function-hero", emoji: "🧩", title: "Function Hero", description: "Beat the Function level." },
  { id: "bug-hunter", emoji: "🐞", title: "Bug Hunter", description: "Fix every bug in Bug Hunt." },
  { id: "rover-commander", emoji: "🛰️", title: "Rover Commander", description: "Finish every Rover Rescue mission." },
  { id: "pythonista", emoji: "🐍", title: "Pythonista", description: "Clear all three Python warm-ups." },
  { id: "ai-trainer", emoji: "🤖", title: "AI Trainer", description: "Train a bot to 100% accuracy." },
  { id: "rule-maker", emoji: "📜", title: "Rule Maker", description: "Pass every test in Rule Writer." },
  { id: "first-app", emoji: "📱", title: "App Maker", description: "Build your first app in App Studio." },
  { id: "shipped-it", emoji: "🚀", title: "Shipped It!", description: "Download your app to share it." },
  { id: "app-architect", emoji: "🏗️", title: "App Architect", description: "Complete every App Studio mission." },
  { id: "perfectionist", emoji: "🌟", title: "Perfectionist", description: "Get 3 stars on every Rover mission." },
];

export const RANKS = [
  { xp: 0, title: "Rookie Coder", emoji: "🌱" },
  { xp: 300, title: "Code Cadet", emoji: "🧑‍🚀" },
  { xp: 800, title: "Bug Hunter", emoji: "🔍" },
  { xp: 1500, title: "Algorithm Ace", emoji: "⚡" },
  { xp: 2500, title: "App Architect", emoji: "🏗️" },
  { xp: 4000, title: "Lead Developer", emoji: "👑" },
];

export function rankFor(xp: number) {
  let index = 0;
  RANKS.forEach((r, i) => {
    if (xp >= r.xp) index = i;
  });
  const current = RANKS[index];
  const next = RANKS[index + 1];
  const pct = next ? Math.min(100, Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100)) : 100;
  return { current, next, pct, index };
}

const KEY = "codeship-dev-arcade-v1";
const EMPTY: Progress = { coderName: "", xp: 0, stars: {}, badges: [] };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function load(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) } : { ...EMPTY };
  } catch {
    cache = { ...EMPTY };
  }
  return cache;
}

function save(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep in memory only */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export function getProgress(): Progress {
  return load();
}

export function setCoderName(name: string) {
  save({ ...load(), coderName: name.slice(0, 24) });
}

export interface Reward {
  xp: number;
  badges: Badge[];
  improved: boolean;
}

/**
 * Record a finished level. XP is only awarded for *new* stars, so replaying a
 * level to improve is rewarded but farming the same result is not.
 */
export function completeLevel(game: GameId, level: string, stars: number, xpPerStar = 50): Reward {
  const p = load();
  const key = `${game}:${level}`;
  const best = p.stars[key] ?? 0;
  const gained = Math.max(0, stars - best) * xpPerStar;
  const next: Progress = {
    ...p,
    xp: p.xp + gained,
    stars: stars > best ? { ...p.stars, [key]: stars } : p.stars,
  };
  save(next);
  return { xp: gained, badges: [], improved: stars > best };
}

/** Grant XP outside of levels (e.g. App Studio mission goals). */
export function addXp(amount: number) {
  const p = load();
  save({ ...p, xp: p.xp + amount });
}

/** Returns the badge if it was newly earned, otherwise null. */
export function earnBadge(id: string): Badge | null {
  const p = load();
  if (p.badges.includes(id)) return null;
  const badge = BADGES.find((b) => b.id === id) ?? null;
  if (!badge) return null;
  save({ ...p, badges: [...p.badges, id], xp: p.xp + 100 });
  return badge;
}

export function starsFor(p: Progress, game: GameId, level: string) {
  return p.stars[`${game}:${level}`] ?? 0;
}

export function resetProgress() {
  save({ ...EMPTY });
}
