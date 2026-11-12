"use client";

import { useMemo, useRef, useState } from "react";
import { playCheer, playPop, unlockAudio } from "../../blocks/audio";
import { SceneBackdrop } from "../../blocks/scenes";
import type { Lang } from "../i18n";
import { BADGES, LEVELS, emptyState, step, stuck, type State } from "./starStitch";

const T = {
  en: {
    undo: "Undo",
    reset: "Start over",
    code: "Code card",
    wrong: { notALine: "Boing! That line isn't in the picture.", alreadyDrawn: "That line is already drawn!", wrongStar: "Look at the code card: which star is next?" },
    stuck: "Stuck! No more lines from this star. Try starting somewhere else.",
    done: "You made a",
    next: "Next",
  },
  fr: {
    undo: "Annuler",
    reset: "Recommencer",
    code: "Carte de code",
    wrong: { notALine: "Boing ! Cette ligne n'est pas dans l'image.", alreadyDrawn: "Cette ligne est déjà tracée !", wrongStar: "Regarde la carte de code : quelle étoile vient ensuite ?" },
    stuck: "Bloqué ! Plus de ligne depuis cette étoile. Essaie de commencer ailleurs.",
    done: "Tu as fait :",
    next: "Suivant",
  },
};

const U = 100;
const OFF = 50;
const W = 600;
const H = 500;
const px = ([x, y]: [number, number]) => ({ x: OFF + x * U, y: OFF + y * U });

/** A small badge shape, centred on 0,0. */
export function Badge({ i, r = 12 }: { i: number; r?: number }) {
  const { colour, shape } = BADGES[i];
  const s = r;
  const common = { fill: colour, stroke: "#010F2A", strokeWidth: 2.5 };
  switch (shape) {
    case "circle":
      return <circle r={s} {...common} />;
    case "square":
      return <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={3} {...common} />;
    case "triangle":
      return <path d={`M0 ${-s * 1.15}L${s * 1.1} ${s * 0.85}H${-s * 1.1}z`} {...common} />;
    case "diamond":
      return <path d={`M0 ${-s * 1.2}L${s} 0 0 ${s * 1.2} ${-s} 0z`} {...common} />;
    case "heart":
      return <path d={`M0 ${s}C${-s * 1.6} 0 ${-s * 0.9} ${-s * 1.5} 0 ${-s * 0.5}C${s * 0.9} ${-s * 1.5} ${s * 1.6} 0 0 ${s}z`} {...common} />;
    case "moon":
      return <path d={`M${s * 0.2} ${-s * 1.1}A${s * 1.1} ${s * 1.1} 0 1 0 ${s * 0.2} ${s * 1.1}A${s * 0.8} ${s * 1.1} 0 1 1 ${s * 0.2} ${-s * 1.1}z`} {...common} />;
    case "hexagon":
      return <path d={Array.from({ length: 6 }, (_, k) => `${k ? "L" : "M"}${(Math.cos((k * Math.PI) / 3) * s).toFixed(1)} ${(Math.sin((k * Math.PI) / 3) * s).toFixed(1)}`).join("") + "z"} {...common} />;
    default:
      return <path d={Array.from({ length: 10 }, (_, k) => { const rr = k % 2 ? s * 0.5 : s * 1.15; const a = (k * Math.PI) / 5 - Math.PI / 2; return `${k ? "L" : "M"}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`; }).join("") + "z"} {...common} />;
  }
}

const STAR = Array.from({ length: 10 }, (_, k) => {
  const r = k % 2 ? 9 : 22;
  const a = (k * Math.PI) / 5 - Math.PI / 2;
  return `${k ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
}).join("") + "z";

export default function StarStitch({ lang, level: index, onWin, onAction }: { lang: Lang; level: number; onWin: () => void; onAction: (k: string) => void }) {
  const t = T[lang];
  const level = LEVELS[index];
  const [history, setHistory] = useState<State[]>([emptyState()]);
  const [message, setMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const state = history[history.length - 1];
  const done = state.drawn.length === level.edges.length;
  const isStuck = stuck(level, state);
  const pegs = useMemo(() => level.pegs.map(px), [level]);

  const tap = (peg: number) => {
    unlockAudio();
    if (done) return;
    onAction(`peg:${peg}`);
    const r = step(level, state, peg);
    if (!r.ok) {
      setMessage(t.wrong[r.reason]);
      setShake((n) => n + 1);
      return;
    }
    setMessage(null);
    setHistory((h) => [...h, r.state]);
    if (r.done) playCheer();
    else playPop();
  };

  const toSvg = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const cur = state.current !== null ? pegs[state.current] : null;
  const codeAt = state.codeIndex;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 p-3 sm:p-4">
      {level.mode === "code" && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border-4 border-[#F4D734] bg-[#FFF8E1] p-2 shadow-[0_4px_0_rgba(0,0,0,0.3)]" aria-label={t.code} data-testid="code-card">
          <span className="px-1 text-xl" aria-hidden="true">
            📜
          </span>
          {level.code!.map((p, k) => (
            <span key={k} className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${k === codeAt && !done ? "bg-[#F4D734] ring-4 ring-[#D58401]" : k < codeAt ? "bg-[#C8E6C9]" : "bg-white"}`}>
              <svg viewBox="-18 -18 36 36" className="h-8 w-8" aria-hidden="true">
                <Badge i={p} />
              </svg>
              {k < codeAt && <span className="absolute -right-1 -top-1 text-xs">✅</span>}
            </span>
          ))}
        </div>
      )}

      {done && (
        <div className="adv-pop flex flex-wrap items-center justify-center gap-3 rounded-2xl border-4 border-[#F4D734] bg-[#010F2A] p-3 text-center text-lg font-black text-white" role="status">
          <span>
            ✨ {t.done} <span className="text-[#F4D734]">{level.name[lang]}</span>!
          </span>
          <button type="button" onClick={onWin} data-testid="level-next" className="rounded-full bg-[#F4D734] px-6 py-2 text-[#010F2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-white">
            {t.next} ▶
          </button>
        </div>
      )}
      <div key={shake} className={`relative mx-auto w-full overflow-hidden rounded-3xl border-4 border-[#283593] shadow-xl ${shake ? "adv-wobble" : ""}`} style={{ maxWidth: `calc(55vh * ${W / H})`, aspectRatio: `${W} / ${H}` }}>
        <SceneBackdrop id="starfield" />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full touch-none select-none"
          onPointerMove={(e) => setPointer(toSvg(e))}
          onPointerLeave={() => setPointer(null)}
          data-testid="stitch-board"
        >
          <defs>
            <filter id="ss-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* the picture to trace (trace levels), or revealed at the end */}
          {(level.mode === "trace" || done) &&
            level.edges.map(([a, b], i) => (
              <line key={i} x1={pegs[a].x} y1={pegs[a].y} x2={pegs[b].x} y2={pegs[b].y} stroke="#FFFFFF" strokeOpacity={done ? 0 : 0.35} strokeWidth="6" strokeDasharray="4 12" strokeLinecap="round" />
            ))}
          {/* lines drawn so far */}
          <g filter="url(#ss-glow)">
            {state.drawn.map((k) => {
              const [a, b] = k.split("-").map(Number);
              return <line key={k} x1={pegs[a].x} y1={pegs[a].y} x2={pegs[b].x} y2={pegs[b].y} stroke={done ? "#FFF59D" : "#FFD54F"} strokeWidth={done ? 10 : 8} strokeLinecap="round" />;
            })}
          </g>
          {/* the stretchy band from the current star to the finger */}
          {cur && pointer && !done && (
            <line x1={cur.x} y1={cur.y} x2={pointer.x} y2={pointer.y} stroke="#F48FB1" strokeWidth="5" strokeDasharray="10 8" strokeLinecap="round" pointerEvents="none" />
          )}
          {pegs.map((p, i) => {
            const isCur = state.current === i;
            const nextInCode = level.mode === "code" && level.code![codeAt] === i && !done;
            return (
              <g key={i} transform={`translate(${p.x} ${p.y})`}>
                {(isCur || nextInCode) && <circle r="34" fill="none" stroke={isCur ? "#F48FB1" : "#F4D734"} strokeWidth="4" className="adv-ring" />}
                <path d={STAR} fill="#FFF9C4" stroke="#FFD54F" strokeWidth="3" className="adv-glow" />
                <g transform="translate(26 24)">
                  <Badge i={i} r={12} />
                </g>
                <circle
                  r="42"
                  fill="transparent"
                  data-tut={`peg-${i}`}
                  data-testid={`peg-${i}`}
                  role="button"
                  aria-label={`${BADGES[i].colour} ${BADGES[i].shape}`}
                  className="cursor-pointer"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    tap(i);
                  }}
                />
              </g>
            );
          })}
        </svg>

      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-h-[1.75rem] text-base font-bold text-[#F4D734]" role="status">
          {isStuck ? t.stuck : message}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
            }}
            disabled={history.length <= 1 || done}
            className="h-12 rounded-full border border-white/30 px-4 font-semibold text-white hover:bg-white/10 disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]"
          >
            ↶ {t.undo}
          </button>
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setHistory([emptyState()]);
            }}
            className={`h-12 rounded-full px-5 font-black focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401] ${isStuck ? "adv-ring bg-[#F4D734] text-[#010F2A]" : "border border-white/30 text-white hover:bg-white/10"}`}
          >
            {t.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
