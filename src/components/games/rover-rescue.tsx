"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ROVER_LEVELS,
  countLines,
  scoreRover,
  simulateRover,
  type RoverLevel,
  type RoverResult,
} from "@/lib/games/rover";
import { completeLevel, earnBadge, getProgress, starsFor, useProgress } from "@/lib/games/progress";
import { ArcadeTopBar, Confetti, Modal, Pill, RewardLayer, Stars, celebrate, useDevFact } from "./arcade-kit";
import { CodeEditor, highlight, type CodeEditorHandle } from "./code-editor";
import { FREE_LEVELS, LockBadge, UnlockModal, useLevelAccess } from "./level-lock";

const COMMANDS = ["move", "turnLeft", "turnRight", "collect", "pathAhead", "gemHere", "atGoal", "say"];
const SPEEDS = [
  { label: "🐢", title: "Slow", ms: 520 },
  { label: "🚙", title: "Normal", ms: 300 },
  { label: "🚀", title: "Fast", ms: 110 },
];

function storageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** Run student code in a throwaway worker with a hard timeout. */
function runInWorker(code: string, level: RoverLevel): Promise<RoverResult> {
  return new Promise((resolve) => {
    let worker: Worker | null = null;
    let url = "";
    const fallback = (error: string): RoverResult => ({
      frames: [],
      error,
      reachedGoal: false,
      gemsTotal: 0,
      gemsCollected: 0,
    });
    try {
      const src = `const simulateRover = ${simulateRover.toString()};
self.onmessage = (e) => {
  try { self.postMessage(simulateRover(e.data.code, e.data.map, e.data.dir)); }
  catch (err) { self.postMessage({ frames: [], error: String(err), reachedGoal: false, gemsTotal: 0, gemsCollected: 0 }); }
};`;
      url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
      worker = new Worker(url);
    } catch {
      // Workers unavailable (very old browser): run inline — the step cap still protects most loops.
      resolve(simulateRover(code, level.map, level.dir));
      return;
    }
    const timer = window.setTimeout(() => {
      worker?.terminate();
      URL.revokeObjectURL(url);
      resolve(fallback("Your code took too long to finish — it might be stuck in a loop that never ends."));
    }, 1500);
    worker.onmessage = (e: MessageEvent<RoverResult>) => {
      window.clearTimeout(timer);
      worker?.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };
    worker.postMessage({ code, map: level.map, dir: level.dir });
  });
}

/* ------------------------------------------------------------------ */
/* Sprites                                                              */
/* ------------------------------------------------------------------ */

function RoverSprite({ bonk }: { bonk: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={`h-full w-full ${bonk ? "animate-[shake_0.3s_ease-in-out_2]" : ""}`} aria-hidden>
      <rect x="9" y="8" width="22" height="26" rx="6" fill="#FFD740" />
      <rect x="9" y="8" width="22" height="26" rx="6" fill="url(#rv)" />
      <rect x="4" y="10" width="6" height="9" rx="2" fill="#2E3246" />
      <rect x="30" y="10" width="6" height="9" rx="2" fill="#2E3246" />
      <rect x="4" y="23" width="6" height="9" rx="2" fill="#2E3246" />
      <rect x="30" y="23" width="6" height="9" rx="2" fill="#2E3246" />
      <rect x="13" y="12" width="14" height="8" rx="3" fill="#1b1e2e" />
      <circle cx="17" cy="16" r="2" fill="#5eead4" />
      <circle cx="23" cy="16" r="2" fill="#5eead4" />
      <path d="M20 2 L26 9 H14 Z" fill="#F472B6" />
      <defs>
        <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GemSprite() {
  return (
    <svg viewBox="0 0 40 40" className="h-[62%] w-[62%] animate-[floaty_2.4s_ease-in-out_infinite]" aria-hidden>
      <path d="M20 4 L34 16 L20 36 L6 16 Z" fill="#60A5FA" />
      <path d="M20 4 L27 16 L20 36 L13 16 Z" fill="#93C5FD" />
      <path d="M6 16 H34" stroke="#DBEAFE" strokeWidth="1.5" />
    </svg>
  );
}

function BeaconSprite({ lit }: { lit: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center" aria-hidden>
      <span className={`absolute h-[80%] w-[80%] rounded-full ${lit ? "bg-emerald-300/50" : "bg-emerald-400/25"} animate-ping`} />
      <span className="absolute h-[62%] w-[62%] rounded-full border-2 border-emerald-300/70" />
      <span className="h-[30%] w-[30%] rounded-full bg-emerald-300 shadow-[0_0_18px_4px_rgba(110,231,183,0.7)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Board                                                                */
/* ------------------------------------------------------------------ */

function Board({
  level,
  frame,
  rotation,
  speedMs,
  sayMsg,
}: {
  level: RoverLevel;
  frame: { r: number; c: number; collected: string[]; kind: string };
  rotation: number;
  speedMs: number;
  sayMsg: string | null;
}) {
  const rows = level.map.length;
  const cols = level.map[0].length;
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0c0d1a] p-2 shadow-[0_30px_80px_-30px_rgba(63,81,181,0.6)]"
      style={{ maxWidth: Math.min(560, cols * 64) }}
    >
      <div className="relative" style={{ aspectRatio: `${cols} / ${rows}` }}>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {level.map.flatMap((row, r) =>
            row.split("").map((ch, c) => {
              const key = `${r},${c}`;
              const wall = ch === "#";
              return (
                <div
                  key={key}
                  className={`relative flex items-center justify-center ${
                    wall
                      ? "m-[1px] rounded-md bg-[#0c0d1a]"
                      : "m-[1px] rounded-md bg-gradient-to-br from-[#36407a] to-[#2a3163] shadow-[inset_0_-3px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  }`}
                >
                  {ch === "o" ? <span className="h-1.5 w-1.5 rounded-full bg-amber/40" /> : null}
                  {ch === "*" && !frame.collected.includes(key) ? <GemSprite /> : null}
                  {ch === "G" ? <BeaconSprite lit={frame.r === r && frame.c === c} /> : null}
                </div>
              );
            })
          )}
        </div>
        <div
          className="absolute"
          style={{
            width: `${100 / cols}%`,
            height: `${100 / rows}%`,
            left: `${(frame.c / cols) * 100}%`,
            top: `${(frame.r / rows) * 100}%`,
            transition: `left ${speedMs * 0.9}ms ease-in-out, top ${speedMs * 0.9}ms ease-in-out`,
          }}
        >
          <div className="h-full w-full p-[8%]" style={{ transform: `rotate(${rotation}deg)`, transition: `transform ${speedMs * 0.9}ms ease-in-out` }}>
            <RoverSprite bonk={frame.kind === "bonk" || frame.kind === "empty"} />
          </div>
          {sayMsg ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-2 py-1 text-xs font-bold text-navy shadow-lg"
            >
              {sayMsg}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Level select                                                         */
/* ------------------------------------------------------------------ */

function LevelSelect({
  onPick,
  unlockAll,
  setUnlockAll,
  isPaid,
  unlocked,
  askUnlock,
}: {
  onPick: (i: number) => void;
  unlockAll: boolean;
  setUnlockAll: (v: boolean) => void;
  isPaid: (i: number) => boolean;
  unlocked: boolean;
  askUnlock: () => void;
}) {
  const p = useProgress();
  const total = ROVER_LEVELS.reduce((s, l) => s + starsFor(p, "rover", l.id), 0);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <Pill tone="yellow">JavaScript · Grades 4–8</Pill>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-none text-white md:text-5xl">Mission Control</h2>
          <p className="mt-3 max-w-xl text-white/70">
            A rover is stranded on a distant moon and only <strong className="text-amber">your code</strong> can guide it home.
            Write real JavaScript — each mission unlocks a new superpower.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Stars collected</p>
          <p className="mt-1 font-display text-4xl text-amber">
            {total} <span className="text-white/40">/ {ROVER_LEVELS.length * 3}</span>
          </p>
          <p className="mt-1 text-xs text-white/60">★ reach the beacon · ★ grab every gem · ★ use par lines or fewer</p>
        </div>
      </div>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ROVER_LEVELS.map((l, i) => {
          const stars = starsFor(p, "rover", l.id);
          const paid = isPaid(i);
          const locked = paid || (!unlockAll && i > 0 && starsFor(p, "rover", ROVER_LEVELS[i - 1].id) === 0);
          return (
            <li key={l.id}>
              <motion.button
                type="button"
                disabled={locked && !paid}
                onClick={() => (paid ? askUnlock() : onPick(i))}
                whileHover={locked ? undefined : { y: -4 }}
                whileTap={locked ? undefined : { scale: 0.97 }}
                className={`focus-ring group relative flex h-full w-full flex-col rounded-2xl border p-4 text-left transition ${
                  locked
                    ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-50"
                    : stars
                    ? "border-amber/30 bg-gradient-to-br from-[#2a2d4a] to-[#1d2036] hover:border-amber/60"
                    : "border-sky-400/40 bg-gradient-to-br from-[#25305e] to-[#1d2036] shadow-[0_0_30px_-10px_rgba(96,165,250,0.6)] hover:border-sky-300"
                }`}
                aria-label={`Mission ${i + 1}: ${l.title}, ${l.concept}${paid ? ", class level, needs class password" : locked ? ", locked" : `, ${stars} stars`}`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-display text-3xl leading-none text-white/30">{String(i + 1).padStart(2, "0")}</span>
                  {paid ? <span aria-hidden>🔑</span> : locked ? <span aria-hidden>🔒</span> : <Stars count={stars} size="text-base" />}
                </span>
                <span className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-sky-300">{l.concept}</span>
                <span className="mt-0.5 text-lg font-bold text-white">{l.title}</span>
                {paid ? (
                  <span className="mt-2">
                    <LockBadge />
                  </span>
                ) : !locked && !stars ? (
                  <span className="mt-2 text-xs font-semibold text-amber">▶ Next up</span>
                ) : null}
              </motion.button>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/50">
        {unlocked ? (
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={unlockAll} onChange={(e) => setUnlockAll(e.target.checked)} className="accent-amber" />
            Instructor mode — unlock every mission
          </label>
        ) : (
          <p>
            Missions 1–{FREE_LEVELS} are free.{" "}
            <button type="button" onClick={askUnlock} className="focus-ring rounded font-semibold text-amber underline-offset-4 hover:underline">
              Have a class password? Unlock all {ROVER_LEVELS.length} →
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Play screen                                                          */
/* ------------------------------------------------------------------ */

function rotationsFor(frames: { d: number }[], startDir: number) {
  const out: number[] = [];
  let rot = startDir * 90;
  let prev = startDir;
  for (const f of frames) {
    const delta = (f.d - prev + 4) % 4;
    rot += delta === 3 ? -90 : delta * 90;
    prev = f.d;
    out.push(rot);
  }
  return out;
}

function Play({ index, onBack, onNext }: { index: number; onBack: () => void; onNext: () => void }) {
  const level = ROVER_LEVELS[index];
  const storeKey = `codeship-rover-code-${level.id}`;
  const [code, setCode] = useState(level.starter);
  const [result, setResult] = useState<RoverResult | null>(null);
  const [frameIdx, setFrameIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [outcome, setOutcome] = useState<{ stars: number; xp: number; lines: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const editor = useRef<CodeEditorHandle>(null);
  const timer = useRef<number | null>(null);
  const fact = useDevFact(index);

  useEffect(() => {
    setCode(storageGet(storeKey) ?? level.starter);
    setResult(null);
    setFrameIdx(0);
    setOutcome(null);
    setShowHint(false);
    setLog([]);
  }, [storeKey, level.starter]);

  useEffect(() => {
    storageSet(storeKey, code);
  }, [code, storeKey]);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const startFrame = useMemo(() => {
    const preview = simulateRover("", level.map, level.dir);
    return preview.frames[0];
  }, [level]);

  const frames = useMemo(() => (result?.frames.length ? result.frames : [startFrame]), [result, startFrame]);
  const rotations = useMemo(() => rotationsFor(frames, level.dir), [frames, level.dir]);
  const frame = frames[Math.min(frameIdx, frames.length - 1)];
  const sayMsg = frame.kind === "say" ? frame.msg ?? null : null;
  const lines = countLines(code);

  const finish = useCallback(
    (res: RoverResult) => {
      setRunning(false);
      const stars = scoreRover(res, countLines(code), level.par);
      if (stars > 0) {
        const reward = completeLevel("rover", level.id, stars);
        setOutcome({ stars, xp: reward.xp, lines: countLines(code) });
        setConfetti((n) => n + 1);
        const badges: (string | false)[] = [
          stars === 3 && (level.id === "loop-the-loop" || level.id === "staircase") && "loop-legend",
          level.id === "functions" && "function-hero",
          level.id === "bug-hunt" && "bug-hunter",
        ];
        const p = getProgress();
        if (ROVER_LEVELS.every((l) => (p.stars[`rover:${l.id}`] ?? 0) > 0)) badges.push("rover-commander");
        if (ROVER_LEVELS.every((l) => (p.stars[`rover:${l.id}`] ?? 0) === 3)) badges.push("perfectionist");
        window.setTimeout(() => {
          badges.forEach((b) => {
            if (!b) return;
            const badge = earnBadge(b);
            if (badge) celebrate({ badge });
          });
        }, 900);
      } else {
        setLog((l) => [
          ...l,
          res.error
            ? `⚠️ ${res.error}`
            : "🛰️ The program finished, but the rover isn't on the beacon yet. Add more steps!",
        ]);
      }
    },
    [code, level]
  );

  const run = async () => {
    if (running) return;
    if (timer.current) window.clearInterval(timer.current);
    setOutcome(null);
    setRunning(true);
    setFrameIdx(0);
    setLog(["▶ Running your code…"]);
    const first = earnBadge("hello-world");
    if (first) celebrate({ badge: first });
    const res = await runInWorker(code, level);
    setResult(res);
    if (!res.frames.length) {
      finish(res);
      return;
    }
    let i = 0;
    const ms = SPEEDS[speed].ms;
    timer.current = window.setInterval(() => {
      i++;
      if (i >= res.frames.length) {
        if (timer.current) window.clearInterval(timer.current);
        finish(res);
        return;
      }
      setFrameIdx(i);
      const f = res.frames[i];
      if (f.kind === "say" && f.msg) setLog((l) => [...l, `💬 ${f.msg}`]);
      if (f.kind === "collect") setLog((l) => [...l, `💎 Gem collected (${f.collected.length}/${res.gemsTotal})`]);
    }, ms);
  };

  const reset = () => {
    if (timer.current) window.clearInterval(timer.current);
    setRunning(false);
    setResult(null);
    setFrameIdx(0);
    setLog([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <Confetti fire={confetti} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
          ← All missions
        </button>
        <span className="text-sm text-white/40">Mission {index + 1} of {ROVER_LEVELS.length}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left: brief + editor */}
        <section className="flex min-w-0 flex-col gap-4" aria-label="Mission and code">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#262a48] to-[#1c1f35] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="blue">💡 {level.concept}</Pill>
              <Pill tone="yellow">Par: {level.par} lines</Pill>
            </div>
            <h2 className="mt-3 font-display text-4xl leading-none text-white">{level.title}</h2>
            <p className="mt-2 font-semibold text-amber">🎯 {level.mission}</p>
            <details className="group mt-3 rounded-2xl bg-black/20 p-3 open:pb-4" open={index < 9}>
              <summary className="cursor-pointer list-none text-sm font-bold text-sky-200 marker:hidden">
                <span className="mr-1 inline-block transition group-open:rotate-90">▸</span> Learn it: {level.concept}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{level.lesson}</p>
              <pre
                className="mt-3 overflow-x-auto rounded-xl bg-[#0f1120] p-3 font-mono text-[13px] leading-6"
                dangerouslySetInnerHTML={{ __html: highlight(level.example, COMMANDS) }}
              />
            </details>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Insert code">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">Tap to insert</span>
              {level.tools.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => editor.current?.insert(t.insert)}
                  className="focus-ring rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-amber transition hover:border-amber/50 hover:bg-amber/10"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <CodeEditor ref={editor} value={code} onChange={setCode} commands={COMMANDS} label={`Code for ${level.title}`} minLines={10} />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
              <span>
                Lines of code: <strong className={lines <= level.par ? "text-emerald-300" : "text-orange-300"}>{lines}</strong> / par {level.par}
              </span>
              <span className="hidden md:inline">Tab indents · Esc then Tab to leave the editor</span>
            </div>
          </div>
        </section>

        {/* Right: board + controls */}
        <section className="flex min-w-0 flex-col gap-4" aria-label="Moon map">
          <Board level={level} frame={frame} rotation={rotations[Math.min(frameIdx, rotations.length - 1)]} speedMs={SPEEDS[speed].ms} sayMsg={sayMsg} />

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              onClick={run}
              disabled={running}
              whileTap={{ scale: 0.95 }}
              className="focus-ring flex-1 rounded-2xl bg-amber px-6 py-3.5 font-display text-2xl text-navy shadow-[0_10px_30px_-10px_rgba(255,215,64,0.8)] transition hover:brightness-105 disabled:opacity-60 sm:flex-none"
            >
              {running ? "Running…" : "▶ Run code"}
            </motion.button>
            <button type="button" onClick={reset} className="focus-ring rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
              ↺ Reset rover
            </button>
            <button type="button" onClick={() => setShowHint((v) => !v)} className="focus-ring rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10" aria-expanded={showHint}>
              💡 Hint
            </button>
            <div className="ml-auto flex items-center gap-1 rounded-2xl border border-white/10 p-1" role="radiogroup" aria-label="Rover speed">
              {SPEEDS.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  role="radio"
                  aria-checked={speed === i}
                  title={s.title}
                  aria-label={s.title}
                  onClick={() => setSpeed(i)}
                  className={`focus-ring rounded-xl px-2.5 py-1.5 text-lg ${speed === i ? "bg-white/15" : "opacity-60 hover:opacity-100"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {showHint ? (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber/30 bg-amber/10 p-3 text-sm text-amber">
              💡 {level.hint}
            </motion.p>
          ) : null}

          <div className="min-h-[96px] rounded-2xl border border-white/10 bg-black/30 p-3 font-mono text-xs leading-relaxed text-white/80" aria-live="polite" aria-label="Rover console">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Console</p>
            {log.length ? log.slice(-6).map((l, i) => <p key={i} className={l.startsWith("⚠️") ? "text-orange-300" : ""}>{l}</p>) : <p className="text-white/40">Write your code, then press Run. Errors show up here — they’re clues, not failures!</p>}
          </div>
          <p className="text-xs text-white/40">🧠 {fact}</p>
        </section>
      </div>

      <Modal open={!!outcome} onClose={() => setOutcome(null)} label="Mission complete">
        {outcome ? (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Mission complete</p>
            <h3 className="mt-1 font-display text-5xl">{outcome.stars === 3 ? "Perfect code!" : outcome.stars === 2 ? "Great job!" : "You made it!"}</h3>
            <div className="mt-4">
              <Stars count={outcome.stars} size="text-5xl" animate />
            </div>
            <ul className="mx-auto mt-4 max-w-xs space-y-1 text-left text-sm text-white/80">
              <li>✅ Reached the beacon</li>
              <li>{outcome.stars >= 2 ? "✅" : "⬜"} Collected every gem</li>
              <li>
                {outcome.stars === 3 ? "✅" : "⬜"} {outcome.lines} lines (par {level.par})
              </li>
            </ul>
            {outcome.stars < 3 ? (
              <p className="mt-3 text-sm text-amber/90">
                {outcome.stars === 1 ? "Can you grab every gem too?" : `Pro tip: can you do it in ${level.par} lines? Loops and functions help!`}
              </p>
            ) : null}
            {outcome.xp ? <p className="mt-3 font-display text-3xl text-amber">+{outcome.xp} XP</p> : null}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => setOutcome(null)} className="focus-ring flex-1 rounded-2xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/10">
                Improve my code
              </button>
              {index < ROVER_LEVELS.length - 1 ? (
                <button type="button" onClick={onNext} className="focus-ring flex-1 rounded-2xl bg-amber px-4 py-3 font-bold text-navy">
                  Next mission →
                </button>
              ) : (
                <button type="button" onClick={onBack} className="focus-ring flex-1 rounded-2xl bg-amber px-4 py-3 font-bold text-navy">
                  🏆 All missions
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function RoverRescue() {
  const [index, setIndex] = useState<number | null>(null);
  const [unlockAll, setUnlockAll] = useState(false);
  const [asking, setAsking] = useState(false);
  const access = useLevelAccess("developers");

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  return (
    <>
      <ArcadeTopBar title="Rover Rescue" emoji="🛰️" semester="Ship It! Arcade · JavaScript" />
      <RewardLayer />
      {index === null || access.isLocked(index) ? (
        <LevelSelect
          onPick={setIndex}
          unlockAll={unlockAll}
          setUnlockAll={setUnlockAll}
          isPaid={access.isLocked}
          unlocked={access.unlocked}
          askUnlock={() => setAsking(true)}
        />
      ) : (
        <Play
          key={index}
          index={index}
          onBack={() => setIndex(null)}
          onNext={() => {
            const next = Math.min(ROVER_LEVELS.length - 1, index + 1);
            if (access.isLocked(next)) {
              setIndex(null);
              setAsking(true);
            } else setIndex(next);
          }}
        />
      )}
      <UnlockModal open={asking} onClose={() => setAsking(false)} program="developers" onUnlock={access.markUnlocked} />
    </>
  );
}
