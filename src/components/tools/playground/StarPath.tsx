"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playCheer, playPop, unlockAudio } from "../blocks/audio";
import { costumeUrl } from "../blocks/costumes";
import type { Strings } from "./i18n";
import { COLS, LEVELS, REPEAT_COUNTS, ROWS, blockCount, find, run, type Cmd, type Dir, type Program, type RunResult } from "./starPath";

const PROGRESS_KEY = "codeship-playground-starpath";
const STEP_MS = 420;
const ROTATE: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 };
const DIR_COLOUR: Record<Dir, string> = { up: "#1E88E5", down: "#8E24AA", left: "#E53935", right: "#43A047" };

function Arrow({ d, className = "h-8 w-8" }: { d: Dir; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ transform: `rotate(${ROTATE[d]}deg)` }} aria-hidden="true">
      <path d="M4 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const clone = (p: Program): Program => JSON.parse(JSON.stringify(p));

/** For each move the robot makes: which top-level block (and which arrow inside a Repeat) it came from. */
function trace(p: Program): [number, number][] {
  const out: [number, number][] = [];
  p.forEach((c, i) => {
    if (c.t === "move") out.push([i, -1]);
    else for (let k = 0; k < c.n; k++) c.body.forEach((_, j) => out.push([i, j]));
  });
  return out;
}

function readProgress(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    return Array.isArray(v) ? v.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

export default function StarPath({ s }: { s: Strings }) {
  const [index, setIndex] = useState(0);
  const level = LEVELS[index];
  const [program, setProgram] = useState<Program>(() => clone(level.starter ?? []));
  const [openLoop, setOpenLoop] = useState<number | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const timer = useRef(0);

  useEffect(() => setDone(readProgress()), []);
  useEffect(() => () => window.clearInterval(timer.current), []);

  const robotStart = useMemo(() => find(level, "R")[0], [level]);
  const stars = useMemo(() => find(level, "*"), [level]);
  const rocks = useMemo(() => find(level, "#"), [level]);
  const running = result !== null && step < result.steps.length - 1;
  const finished = result !== null && step >= result.steps.length - 1;
  const pos = result ? result.steps[Math.min(step, result.steps.length - 1)] : robotStart;
  const used = blockCount(program);
  const traced = useMemo(() => trace(program), [program]);
  const active = result && step > 0 && result.outcome !== "tooMany" ? traced[step - 1] : null;

  const stopRun = () => {
    window.clearInterval(timer.current);
    setResult(null);
    setStep(0);
  };

  const goTo = (i: number) => {
    stopRun();
    setIndex(i);
    setProgram(clone(LEVELS[i].starter ?? []));
    setOpenLoop(null);
  };

  const edit = (fn: (p: Program) => Program) => {
    unlockAudio();
    if (result) stopRun();
    setProgram((p) => fn(clone(p)));
  };

  const overBudget = (extra: number) => !!level.maxBlocks && used + extra > level.maxBlocks;

  const addArrow = (d: Dir) => {
    if (overBudget(1)) return;
    playPop();
    edit((p) => {
      const loop = openLoop !== null ? p[openLoop] : null;
      if (loop && loop.t === "repeat") loop.body.push({ t: "move", d });
      else p.push({ t: "move", d });
      return p;
    });
  };

  const addRepeat = () => {
    if (overBudget(1)) return;
    playPop();
    edit((p) => {
      p.push({ t: "repeat", n: 2, body: [] });
      setOpenLoop(p.length - 1);
      return p;
    });
  };

  const removeAt = (i: number, j = -1) =>
    edit((p) => {
      const c = p[i];
      if (j >= 0 && c.t === "repeat") c.body.splice(j, 1);
      else {
        p.splice(i, 1);
        setOpenLoop((o) => (o === null || o === i ? null : o > i ? o - 1 : o));
      }
      return p;
    });

  const cycleCount = (i: number) =>
    edit((p) => {
      const c = p[i];
      if (c.t === "repeat") c.n = REPEAT_COUNTS[(REPEAT_COUNTS.indexOf(c.n) + 1) % REPEAT_COUNTS.length];
      return p;
    });

  const go = () => {
    unlockAudio();
    window.clearInterval(timer.current);
    setOpenLoop(null);
    const r = run(level, program);
    setResult(r);
    setStep(0);
    if (r.steps.length <= 1) return;
    let i = 0;
    timer.current = window.setInterval(() => {
      i++;
      setStep(i);
      const p = r.steps[i];
      if (stars.some((st) => st.x === p.x && st.y === p.y)) playPop();
      if (i >= r.steps.length - 1) window.clearInterval(timer.current);
    }, STEP_MS);
  };

  // Celebrate once the walk reaches the end of a winning run.
  useEffect(() => {
    if (!finished || !result) return;
    if (result.outcome === "win") {
      playCheer();
      setDone((prev) => {
        if (prev.includes(index)) return prev;
        const next = [...prev, index];
        try {
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [finished, result, index]);

  const outcome = finished ? result!.outcome : null;
  const isLast = index === LEVELS.length - 1;
  const cell = (x: number, y: number) => ({ left: `${(x / COLS) * 100}%`, top: `${(y / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` });
  const bump = outcome === "bump" ? result!.bumpDir : undefined;

  const blockBtn = "flex h-14 min-w-14 items-center justify-center rounded-xl text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
      {/* Level picker */}
      <div className="flex flex-wrap items-center gap-2">
        {LEVELS.map((l, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${s.level} ${i + 1}: ${s.kinds[l.kind]}`}
            aria-current={i === index ? "step" : undefined}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401] ${
              i === index ? "border-[#D58401] bg-[#D58401] text-[#010F2A]" : l.kind === "loop" ? "border-[#7E57C2] bg-white text-[#4E2B6F]" : l.kind === "debug" ? "border-[#E53935] bg-white text-[#B71C1C]" : "border-[#138A9A] bg-white text-[#035762]"
            }`}
          >
            {i + 1}
            {done.includes(i) && <span className="absolute -right-1 -top-1 text-xs" aria-hidden="true">⭐</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold text-white">
          {s.level} {index + 1} · <span className="text-[#F4D734]">{s.kinds[level.kind]}</span>
        </p>
        {level.maxBlocks && (
          <div className="flex items-center gap-1" aria-label={`${s.budget}: ${used} / ${level.maxBlocks}`} title={s.budget}>
            {Array.from({ length: level.maxBlocks }, (_, i) => (
              <span key={i} className={`h-5 w-5 rounded-md border-2 border-white/70 ${i < used ? "bg-[#F4D734]" : "bg-transparent"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="relative mx-auto w-full overflow-hidden rounded-2xl border-4 border-[#0A2648] bg-[#A5D6A7]" style={{ aspectRatio: `${COLS} / ${ROWS}`, maxWidth: `calc(52vh * ${COLS / ROWS})` }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <div key={i} className={`absolute border border-white/30 ${(i % COLS + Math.floor(i / COLS)) % 2 ? "bg-black/[0.04]" : ""}`} style={cell(i % COLS, Math.floor(i / COLS))} />
        ))}
        {rocks.map((r, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`r${i}`} src={costumeUrl("rock")} alt="" className="absolute" style={{ ...cell(r.x, r.y), transform: "scale(0.94)" }} />
        ))}
        {stars.map((st, i) => {
          const taken = result ? result.steps.slice(1, step + 1).some((p) => p.x === st.x && p.y === st.y) : false;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`s${i}`}
              src={costumeUrl("star")}
              alt=""
              className="absolute transition-all duration-300"
              style={{ ...cell(st.x, st.y), opacity: taken ? 0 : 1, transform: taken ? "scale(1.6)" : "scale(0.72)" }}
            />
          );
        })}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={costumeUrl("robot")}
          alt="Robot"
          className="absolute"
          style={{
            ...cell(pos.x, pos.y),
            transition: `left ${STEP_MS * 0.8}ms ease-in-out, top ${STEP_MS * 0.8}ms ease-in-out`,
            animation: bump ? `sp-bump-${bump} 400ms ease-in-out 2` : outcome === "win" ? "sp-win 600ms ease-in-out 2" : undefined,
          }}
        />
        {outcome && (
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 bg-[#010F2A]/85 p-3 text-center text-lg font-bold text-white" role="status">
            <span>{outcome === "win" && isLast ? s.allDone : s.outcome[outcome]}</span>
            {outcome === "win" && !isLast ? (
              <button type="button" onClick={() => goTo(index + 1)} className="rounded-full bg-[#F4D734] px-5 py-2 text-[#010F2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-white">
                {s.next} →
              </button>
            ) : outcome !== "win" ? (
              <button type="button" onClick={stopRun} className="rounded-full bg-white px-5 py-2 text-[#010F2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734]">
                {s.tryAgain}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Program */}
      <div className="min-h-[5.5rem] rounded-2xl border-2 border-dashed border-white/30 bg-white/[0.06] p-3" aria-label="Program">
        <div className="flex flex-wrap items-center gap-2">
          {program.map((c: Cmd, i) =>
            c.t === "move" ? (
              <button
                key={i}
                type="button"
                onClick={() => removeAt(i)}
                aria-label={s.dirs[c.d]}
                className={`${blockBtn} ${active?.[0] === i ? "ring-4 ring-[#F4D734]" : ""}`}
                style={{ background: DIR_COLOUR[c.d] }}
              >
                <Arrow d={c.d} />
              </button>
            ) : (
              <div
                key={i}
                className={`flex items-center gap-1 rounded-xl border-4 bg-[#7E57C2] p-1 pr-2 ${openLoop === i ? "border-[#F4D734]" : active?.[0] === i ? "border-[#F4D734]/70" : "border-[#4E2B6F]"}`}
              >
                <button type="button" onClick={() => setOpenLoop(openLoop === i ? null : i)} aria-label={s.repeat} className="flex h-12 items-center gap-1 rounded-lg px-2 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                    <path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" onClick={() => cycleCount(i)} aria-label={`${s.repeat} ${c.n}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-[#4E2B6F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]">
                  {c.n}
                </button>
                <div className="flex min-h-12 min-w-12 items-center gap-1 rounded-lg bg-black/20 p-1">
                  {c.body.map((b, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => removeAt(i, j)}
                      aria-label={s.dirs[b.d]}
                      className={`${blockBtn} h-11 min-w-11 ${active?.[0] === i && active[1] === j ? "ring-4 ring-[#F4D734]" : ""}`}
                      style={{ background: DIR_COLOUR[b.d] }}
                    >
                      <Arrow d={b.d} className="h-6 w-6" />
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => removeAt(i)} aria-label={`${s.clear} ${s.repeat}`} className="ml-1 text-lg font-bold text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]">
                  ✕
                </button>
              </div>
            ),
          )}
        </div>
        <p className="mt-2 text-xs text-white/50">{openLoop !== null ? s.loopHint : s.removeHint}</p>
      </div>

      {/* Palette + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["up", "down", "left", "right"] as Dir[]).map((d) => (
            <button key={d} type="button" onClick={() => addArrow(d)} aria-label={s.dirs[d]} disabled={overBudget(1)} className={`${blockBtn} h-16 w-16 disabled:opacity-40`} style={{ background: DIR_COLOUR[d] }}>
              <Arrow d={d} className="h-9 w-9" />
            </button>
          ))}
          {level.allowRepeat && (
            <button type="button" onClick={openLoop !== null ? () => setOpenLoop(null) : addRepeat} disabled={openLoop === null && overBudget(1)} className={`${blockBtn} h-16 gap-2 px-4 font-bold disabled:opacity-40`} style={{ background: "#7E57C2" }}>
              <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                <path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {openLoop !== null ? s.doneLoop : s.repeat}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goTo(index)} className="h-12 rounded-full border border-white/30 px-4 font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]">
            {level.starter ? s.reset : s.clear}
          </button>
          <button
            type="button"
            onClick={go}
            disabled={running || program.length === 0}
            className="flex h-14 items-center gap-2 rounded-full bg-[#43A047] px-7 text-xl font-black text-white shadow-[0_4px_0_#1B5E20] active:translate-y-0.5 active:shadow-none disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734]"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
            </svg>
            {s.go}
          </button>
        </div>
      </div>

      <style>{`
@keyframes sp-win { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-18%) scale(1.1) } }
@keyframes sp-bump-right { 0%,100% { transform: translateX(0) } 50% { transform: translateX(18%) } }
@keyframes sp-bump-left { 0%,100% { transform: translateX(0) } 50% { transform: translateX(-18%) } }
@keyframes sp-bump-up { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-18%) } }
@keyframes sp-bump-down { 0%,100% { transform: translateY(0) } 50% { transform: translateY(18%) } }
`}</style>
    </div>
  );
}
