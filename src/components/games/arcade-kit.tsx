"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { rankFor, useProgress, type Badge } from "@/lib/games/progress";
import "./games.css";

/* ------------------------------------------------------------------ */
/* Reward events — any game can call celebrate(); <RewardLayer/> shows it */
/* ------------------------------------------------------------------ */

export interface Celebration {
  id: number;
  xp?: number;
  badge?: Badge | null;
  message?: string;
}

type Listener = (c: Celebration) => void;
const rewardListeners = new Set<Listener>();
let celebrationId = 0;

export function celebrate(c: Omit<Celebration, "id">) {
  if (!c.xp && !c.badge && !c.message) return;
  const event = { ...c, id: ++celebrationId };
  rewardListeners.forEach((l) => l(event));
}

export function RewardLayer() {
  const [items, setItems] = useState<Celebration[]>([]);

  useEffect(() => {
    const onReward: Listener = (c) => {
      setItems((prev) => [...prev, c]);
      window.setTimeout(() => setItems((prev) => prev.filter((p) => p.id !== c.id)), c.badge ? 4200 : 2600);
    };
    rewardListeners.add(onReward);
    return () => {
      rewardListeners.delete(onReward);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(320px,calc(100vw-2rem))] flex-col gap-2"
    >
      <AnimatePresence>
        {items.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${
              c.badge ? "border-amber/60 bg-[#2a2440]/95" : "border-white/10 bg-[#1f2336]/95"
            }`}
          >
            {c.badge ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl" aria-hidden>
                  {c.badge.emoji}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber">Badge unlocked</p>
                  <p className="font-display text-2xl leading-none text-white">{c.badge.title}</p>
                  <p className="mt-1 text-xs text-white/70">{c.badge.description} +100 XP</p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-white">
                {c.xp ? <span className="mr-2 font-display text-2xl text-amber">+{c.xp} XP</span> : null}
                {c.message}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout pieces                                                        */
/* ------------------------------------------------------------------ */

export function XpMeter({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const { current, next, pct } = rankFor(p.xp);
  return (
    <div className={compact ? "min-w-[150px]" : "w-full"}>
      <div className="flex items-baseline justify-between gap-3 text-xs font-semibold text-white/80">
        <span>
          <span aria-hidden>{current.emoji}</span> {current.title}
        </span>
        <span className="tabular-nums text-amber">{p.xp} XP</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={next ? `Progress to ${next.title}` : "Top rank reached"}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber via-amber to-emerald-300"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </div>
      {!compact && next ? (
        <p className="mt-1 text-[11px] text-white/55">
          {next.xp - p.xp} XP to {next.emoji} {next.title}
        </p>
      ) : null}
    </div>
  );
}

export function ArcadeTopBar({ title, emoji, semester }: { title: string; emoji: string; semester?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#161827]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link
          href="/code-hour/"
          className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden>←</span> <span className="hidden sm:inline">Code Hour</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-2xl" aria-hidden>
            {emoji}
          </span>
          <div className="min-w-0">
            {semester ? (
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-amber/90">{semester}</p>
            ) : null}
            <h1 className="truncate font-display text-2xl leading-none text-white">{title}</h1>
          </div>
        </div>
        <div className="hidden sm:block">
          <XpMeter compact />
        </div>
      </div>
    </header>
  );
}

export function Stars({ count, size = "text-2xl", animate = false }: { count: number; size?: string; animate?: boolean }) {
  return (
    <span className={`inline-flex gap-1 ${size}`} role="img" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <motion.span
          key={n}
          initial={animate ? { scale: 0, rotate: -40 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: animate ? 0.25 + n * 0.22 : 0, type: "spring", stiffness: 260, damping: 14 }}
          className={n <= count ? "text-amber drop-shadow-[0_0_10px_rgba(255,215,64,0.6)]" : "text-white/15"}
          aria-hidden
        >
          ★
        </motion.span>
      ))}
    </span>
  );
}

/** A lightweight confetti burst. Respects reduced-motion. */
export function Confetti({ fire }: { fire: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: `${fire}-${i}`,
        x: (Math.random() - 0.5) * 900,
        y: -Math.random() * 500 - 150,
        r: Math.random() * 720 - 360,
        color: ["#FFD740", "#34D399", "#60A5FA", "#F472B6", "#A78BFA", "#ffffff"][i % 6],
        delay: Math.random() * 0.15,
        w: 6 + Math.random() * 8,
      })),
    [fire]
  );
  if (!fire || reduce) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{ background: p.color, width: p.w, height: p.w * 0.45 }}
          initial={{ x: 0, y: 80, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [80, p.y, p.y + 900], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 2.2, delay: p.delay, ease: "easeOut", times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  label: string;
}) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b0c16]/75 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#1f2336] p-6 text-white shadow-2xl"
            initial={{ y: 30, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 30, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const DEV_FACTS = [
  "The first computer “bug” was a real moth found inside a computer in 1947. Debugging was born!",
  "Margaret Hamilton led the team that wrote the code that landed Apollo 11 on the Moon.",
  "Python is named after a comedy show, not the snake.",
  "JavaScript was created in just 10 days in 1995 — now it runs on billions of devices.",
  "Every app on your phone started as one line of code and lots of tiny fixes.",
  "Ada Lovelace wrote the first computer program in the 1840s — before computers existed!",
  "Pro developers spend lots of time reading and fixing code. Bugs mean you're learning.",
  "Many famous apps were started by teenagers who just wanted to build something cool.",
];

export function useDevFact(seed = 0) {
  const [fact, setFact] = useState(DEV_FACTS[seed % DEV_FACTS.length]);
  useEffect(() => {
    setFact(DEV_FACTS[Math.floor(Math.random() * DEV_FACTS.length)]);
  }, []);
  return fact;
}

export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "yellow" | "green" | "blue" | "pink" }) {
  const tones = {
    default: "bg-white/10 text-white/80",
    yellow: "bg-amber/15 text-amber",
    green: "bg-emerald-400/15 text-emerald-300",
    blue: "bg-sky-400/15 text-sky-300",
    pink: "bg-pink-400/15 text-pink-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}
