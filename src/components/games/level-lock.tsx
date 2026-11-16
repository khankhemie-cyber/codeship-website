"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ClassPasswordForm, { useClassAccess } from "@/components/ClassPasswordForm";
import { PROGRAMS } from "@/data/programs";
import type { ProgramSlug } from "@/data/programs";
import { Modal } from "./arcade-kit";

/**
 * Ship It! Arcade paywall: the first FREE_LEVELS levels of every game are free
 * to play. The rest are part of the paid program and unlock with the same
 * class password families already use for that program's workbook and quizzes
 * (checked on the server by /api/workbooks/login, which sets an HttpOnly
 * cookie). Every game must gate its levels with useLevelAccess().
 */
export const FREE_LEVELS = 5;

export function useLevelAccess(program: ProgramSlug) {
  const [status, setStatus] = useClassAccess(program);
  return {
    status,
    unlocked: status === "open",
    /** True when level `index` (0-based, in the game's play order) needs the password. */
    isLocked: (index: number) => index >= FREE_LEVELS && status !== "open",
    markUnlocked: () => setStatus("open"),
  };
}

/**
 * Fetches a game's paid levels (6+) once the class password is in. The data is
 * never part of the public bundle: /api/arcade/levels returns it only to a
 * browser holding the class-password cookie. Returns null until loaded.
 */
export function usePaidLevels<T>(game: string, unlocked: boolean): { levels: T[] | null; failed: boolean } {
  const [levels, setLevels] = useState<T[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    setFailed(false);
    fetch(`/api/arcade/levels/?game=${encodeURIComponent(game)}`, { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { levels?: T[] }) => {
        if (!cancelled) setLevels(data.levels ?? []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [game, unlocked]);
  return { levels, failed };
}

function programLabel(program: ProgramSlug) {
  const p = PROGRAMS.find((x) => x.slug === program);
  return p ? `${p.level} · ${p.gradeBand}` : program;
}

export function LockBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber">
      <span aria-hidden>🔑</span> Class level
    </span>
  );
}

/** The unlock dialog: class password form plus a way into the program. */
export function UnlockModal({
  open,
  onClose,
  program,
  onUnlock,
}: {
  open: boolean;
  onClose: () => void;
  program: ProgramSlug;
  onUnlock: () => void;
}) {
  const p = PROGRAMS.find((x) => x.slug === program);
  return (
    <Modal open={open} onClose={onClose} label="Unlock more levels">
      <div className="text-center">
        <p className="text-5xl" aria-hidden>
          🔐
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-amber">Class levels</p>
        <h3 className="mt-1 font-display text-3xl font-extrabold">You finished the free levels!</h3>
        <p className="mt-2 text-sm text-white/70">
          The first {FREE_LEVELS} levels are free for everyone. The rest are part of the {p?.level ?? "CODEship"} program. Enter your class
          password to keep going.
        </p>
      </div>
      <div className="mt-5 [&>div]:max-w-none [&>div]:rounded-2xl">
        <ClassPasswordForm
          program={program}
          level={p?.level ?? program}
          action="Unlock all levels"
          onUnlock={() => {
            onUnlock();
            onClose();
          }}
        />
      </div>
      <p className="mt-4 text-center text-sm text-white/65">
        Not in a class yet?{" "}
        <Link href={`/programs/${program}/`} className="font-bold text-amber underline-offset-4 hover:underline">
          See the {programLabel(program)} program →
        </Link>
      </p>
    </Modal>
  );
}
