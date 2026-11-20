"use client";

/**
 * Bus Buddies progress: finished levels and stickers, in this browser's
 * localStorage only. No account, nothing leaves the device. Every read and
 * write is wrapped, so the game still plays when storage is blocked.
 */
import { useSyncExternalStore } from "react";

export interface BusProgress {
  done: string[];
  stickers: string[];
}

const KEY = "codeship-bus-buddies-v1";
const EMPTY: BusProgress = { done: [], stickers: [] };
let cache: BusProgress | null = null;
const listeners = new Set<() => void>();

function load(): BusProgress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<BusProgress>) : {};
    cache = { done: Array.isArray(parsed.done) ? parsed.done : [], stickers: Array.isArray(parsed.stickers) ? parsed.stickers : [] };
  } catch {
    cache = { ...EMPTY };
  }
  return cache;
}

function save(next: BusProgress) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function useBusProgress(): BusProgress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    load,
    () => EMPTY,
  );
}

export function completeLevel(levelId: string, stickerId: string) {
  const p = load();
  save({
    done: p.done.includes(levelId) ? p.done : [...p.done, levelId],
    stickers: p.stickers.includes(stickerId) ? p.stickers : [...p.stickers, stickerId],
  });
}

export function resetProgress() {
  save({ ...EMPTY });
}
