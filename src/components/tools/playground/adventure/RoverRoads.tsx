"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playCheer, playPop, unlockAudio } from "../../blocks/audio";
import type { Lang } from "../i18n";
import { COLS, DELTA, LEVELS, PIECES, PIECE_LIST, ROWS, buildable, drive, find, givenRoad, key, piecesUsed, type Dir, type Drive, type Piece, type Road } from "./roverRoads";

const T = {
  en: {
    go: "Go",
    reset: "Start over",
    erase: "Take away a road piece",
    left: "Road pieces left",
    piece: { "-": "Straight across", "|": "Straight up and down", L: "Corner: up and right", J: "Corner: up and left", F: "Corner: down and right", "7": "Corner: down and left" },
    outcome: { win: "The rover made it home!", crash: "Crash! The road leads into a rock or off the planet.", noRoad: "The road ran out. The rover stopped.", missed: "Home, but some crystals were left behind!", loop: "The rover is going round in circles!" },
    tryAgain: "Try again",
    next: "Next",
  },
  fr: {
    go: "Go",
    reset: "Recommencer",
    erase: "Enlever un morceau de route",
    left: "Morceaux de route restants",
    piece: { "-": "Tout droit (côtés)", "|": "Tout droit (haut et bas)", L: "Virage : haut et droite", J: "Virage : haut et gauche", F: "Virage : bas et droite", "7": "Virage : bas et gauche" },
    outcome: { win: "Le rover est bien rentré !", crash: "Boum ! La route mène à un rocher ou hors de la planète.", noRoad: "La route s'arrête. Le rover aussi.", missed: "Rentré, mais il manque des cristaux !", loop: "Le rover tourne en rond !" },
    tryAgain: "Réessayer",
    next: "Suivant",
  },
};

const CELL = 100;
const STEP_MS = 520;
const ANGLE: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 };
const mid = (d: Dir) => ({ x: 50 + DELTA[d].x * 50, y: 50 + DELTA[d].y * 50 });

/** A road piece drawn in a 100 x 100 cell. */
function RoadPiece({ piece, ghost = false }: { piece: Piece; ghost?: boolean }) {
  const [a, b] = PIECES[piece];
  const p = mid(a);
  const q = mid(b);
  const d = `M${p.x} ${p.y} Q50 50 ${q.x} ${q.y}`;
  return (
    <g opacity={ghost ? 0.5 : 1}>
      <path d={d} stroke="#37474F" strokeWidth="58" fill="none" />
      <path d={d} stroke="#546E7A" strokeWidth="48" fill="none" />
      <path d={d} stroke="#FFD54F" strokeWidth="5" strokeDasharray="12 10" fill="none" />
    </g>
  );
}

function Rover() {
  return (
    <g>
      <rect x="-30" y="-24" width="60" height="48" rx="12" fill="#ECEFF1" stroke="#455A64" strokeWidth="4" />
      {[-20, 20].map((x) =>
        [-28, 28].map((y) => <rect key={`${x}${y}`} x={x - 9} y={y - 7} width="18" height="14" rx="4" fill="#263238" />),
      )}
      <rect x="6" y="-14" width="18" height="28" rx="6" fill="#4FC3F7" stroke="#455A64" strokeWidth="3" />
      <circle cx="-14" cy="0" r="8" fill="#D58401" />
      <path d="M-14 0L-26 -16" stroke="#455A64" strokeWidth="3" />
      <circle cx="-26" cy="-16" r="4" fill="#E53935" />
    </g>
  );
}

function Ship() {
  return (
    <g>
      <ellipse cx="0" cy="34" rx="40" ry="10" fill="#000" opacity="0.2" />
      <path d="M-14 26l-14 12h14zM14 26l14 12h-14z" fill="#E53935" />
      <path d="M0 -40q24 22 18 66h-36q-6-44 18-66z" fill="#ECEFF1" stroke="#455A64" strokeWidth="3" />
      <circle cy="-6" r="10" fill="#4FC3F7" stroke="#455A64" strokeWidth="3" />
      <rect x="-12" y="12" width="24" height="6" rx="2" fill="#D58401" />
    </g>
  );
}

export default function RoverRoads({ lang, level: index, onWin, onAction }: { lang: Lang; level: number; onWin: () => void; onAction: (k: string) => void }) {
  const t = T[lang];
  const level = LEVELS[index];
  const [road, setRoad] = useState<Road>(() => givenRoad(level));
  const [tool, setTool] = useState<Piece | "erase">("-");
  const [run, setRun] = useState<Drive | null>(null);
  const [step, setStep] = useState(0);
  const timer = useRef(0);
  const start = find(level, "S")[0];
  const base = find(level, "B")[0];
  const crystals = useMemo(() => find(level, "c"), [level]);
  const rocks = useMemo(() => find(level, "#"), [level]);
  const used = piecesUsed(level, road);
  const left = level.budget ? level.budget - used : null;
  const running = run !== null && step < run.path.length - 1;
  const finished = run !== null && !running;

  useEffect(() => () => window.clearInterval(timer.current), []);

  // Ground decoration, fixed per level.
  const craters = useMemo(() => {
    let s = index * 97 + 13;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 14 }, () => ({ x: r() * COLS * CELL, y: r() * ROWS * CELL, r: 8 + r() * 22 }));
  }, [index]);

  const stop = () => {
    window.clearInterval(timer.current);
    setRun(null);
    setStep(0);
  };

  const tapCell = (x: number, y: number) => {
    unlockAudio();
    if (running) return;
    if (run) stop();
    if (!buildable(level, x, y)) return;
    const k = key(x, y);
    const next = { ...road };
    if (tool === "erase" || road[k] === tool) delete next[k];
    else {
      if (left !== null && left <= 0 && !(k in road)) return;
      next[k] = tool;
    }
    playPop();
    setRoad(next);
    onAction(`cell:${x},${y}`);
  };

  const go = () => {
    unlockAudio();
    onAction("go");
    window.clearInterval(timer.current);
    const r = drive(level, road);
    setRun(r);
    setStep(0);
    let i = 0;
    timer.current = window.setInterval(() => {
      i++;
      if (i >= r.path.length) {
        window.clearInterval(timer.current);
        return;
      }
      setStep(i);
      const p = r.path[i];
      if (crystals.some((c) => c.x === p.x && c.y === p.y)) playPop();
      if (i === r.path.length - 1 && r.outcome === "win") playCheer();
    }, STEP_MS);
  };

  const pos = run ? run.path[Math.min(step, run.path.length - 1)] : start;
  // Keep the angle continuous so a turn from "up" to "right" doesn't spin the long way round.
  const angleRef = useRef(ANGLE[level.start]);
  const want = ANGLE[run ? run.dirs[Math.max(0, Math.min(step, run.dirs.length) - 1)] : level.start];
  const a = angleRef.current + ((((want - angleRef.current) % 360) + 540) % 360) - 180;
  angleRef.current = a;
  const taken = run ? new Set(run.path.slice(1, step + 1).map((p) => key(p.x, p.y))) : new Set<string>();
  const outcome = finished ? run!.outcome : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 p-3 sm:p-4">
      <div className={`relative mx-auto w-full overflow-hidden rounded-3xl border-4 border-[#5D2E12] shadow-xl ${outcome && outcome !== "win" ? "adv-wobble" : ""}`} style={{ maxWidth: `calc(55vh * ${COLS / ROWS})` }}>
        <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="block w-full touch-none select-none" data-testid="rover-board">
          <defs>
            <radialGradient id="rr-ground" cx="0.5" cy="0.4" r="0.8">
              <stop offset="0" stopColor="#F4A261" />
              <stop offset="1" stopColor="#D9733B" />
            </radialGradient>
          </defs>
          <rect width={COLS * CELL} height={ROWS * CELL} fill="url(#rr-ground)" />
          {craters.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={c.r} fill="#C8642F" />
              <circle cx={c.x + c.r * 0.15} cy={c.y + c.r * 0.15} r={c.r * 0.75} fill="#B95726" />
            </g>
          ))}
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const x = i % COLS;
            const y = Math.floor(i / COLS);
            const can = buildable(level, x, y);
            return (
              <rect
                key={i}
                data-tut={`cell-${x},${y}`}
                x={x * CELL + 2}
                y={y * CELL + 2}
                width={CELL - 4}
                height={CELL - 4}
                rx="10"
                fill={can ? "#FFFFFF" : "transparent"}
                fillOpacity={can ? 0.08 : 0}
                stroke="#FFFFFF"
                strokeOpacity={can ? 0.35 : 0}
                strokeWidth="2"
                strokeDasharray="6 6"
                className={can && !running ? "cursor-pointer hover:fill-opacity-25" : undefined}
                onClick={() => tapCell(x, y)}
                role={can ? "button" : undefined}
                aria-label={can ? `${x + 1}, ${y + 1}` : undefined}
              />
            );
          })}
          {Object.entries(road).map(([k, p]) => {
            const [x, y] = k.split(",").map(Number);
            return (
              <g key={k} transform={`translate(${x * CELL} ${y * CELL})`} pointerEvents="none">
                <RoadPiece piece={p} />
              </g>
            );
          })}
          {rocks.map((r, i) => (
            <g key={i} transform={`translate(${r.x * CELL + 50} ${r.y * CELL + 55})`} pointerEvents="none">
              <ellipse cx="0" cy="26" rx="38" ry="10" fill="#000" opacity="0.2" />
              <path d="M-38 22l-4-26 18-26 30-6 26 18 8 30-14 12z" fill="#8D8D8D" stroke="#5F5F5F" strokeWidth="4" />
              <path d="M-20 -24l12 14 20-4" stroke="#B0B0B0" strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
          ))}
          {crystals.map((c, i) => {
            const got = taken.has(key(c.x, c.y));
            return (
              <g key={i} transform={`translate(${c.x * CELL + 50} ${c.y * CELL + 50})`} pointerEvents="none" style={{ transition: "opacity 400ms", opacity: got ? 0 : 1 }}>
                <g className="adv-glow">
                  <path d="M0 -32l18 14-6 30H-12l-6-30z" fill="#B388FF" stroke="#6A1B9A" strokeWidth="3" />
                  <path d="M0 -32l-6 14 6 30 6-30z" fill="#E1BEE7" opacity="0.8" />
                </g>
              </g>
            );
          })}
          {/* launch pad */}
          <g transform={`translate(${start.x * CELL + 50} ${start.y * CELL + 50})`} pointerEvents="none">
            <circle r="42" fill="#455A64" />
            <circle r="34" fill="none" stroke="#FFD54F" strokeWidth="6" strokeDasharray="10 8" />
          </g>
          {/* base: the parked CODEship */}
          <g transform={`translate(${base.x * CELL + 50} ${base.y * CELL + 50})`} pointerEvents="none">
            <circle r="44" fill="#455A64" />
            <circle r="38" fill="#607D8B" />
            <Ship />
          </g>
          {/* rover */}
          <g
            pointerEvents="none"
            style={{
              transform: `translate(${pos.x * CELL + 50}px, ${pos.y * CELL + 50}px) rotate(${a}deg)`,
              transition: `transform ${STEP_MS * 0.95}ms linear`,
            }}
          >
            <Rover />
          </g>
        </svg>

        {outcome && (
          <div className="adv-pop absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 bg-[#010F2A]/85 p-3 text-center text-lg font-black text-white" role="status">
            <span>{t.outcome[outcome]}</span>
            {outcome === "win" ? (
              <button type="button" onClick={onWin} data-testid="level-next" className="rounded-full bg-[#F4D734] px-6 py-2 text-[#010F2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-white">
                {t.next} ▶
              </button>
            ) : (
              <button type="button" onClick={stop} className="rounded-full bg-white px-6 py-2 text-[#010F2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734]">
                {t.tryAgain}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {PIECE_LIST.map((p) => (
            <button
              key={p}
              type="button"
              data-tut={`piece-${p}`}
              aria-label={t.piece[p]}
              title={t.piece[p]}
              aria-pressed={tool === p}
              onClick={() => {
                unlockAudio();
                setTool(p);
                onAction(`piece:${p}`);
              }}
              className={`h-16 w-16 overflow-hidden rounded-2xl border-4 bg-[#E8A06A] shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734] ${tool === p ? "border-[#F4D734] scale-110" : "border-[#5D2E12]"}`}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
                <RoadPiece piece={p} />
              </svg>
            </button>
          ))}
          <button
            type="button"
            aria-label={t.erase}
            title={t.erase}
            aria-pressed={tool === "erase"}
            onClick={() => setTool("erase")}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 bg-white text-3xl shadow-[0_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734] ${tool === "erase" ? "border-[#F4D734] scale-110" : "border-[#90A4AE]"}`}
          >
            🧽
          </button>
        </div>
        {left !== null && (
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2" aria-label={`${t.left}: ${left}`} title={t.left}>
            {Array.from({ length: level.budget! }, (_, i) => (
              <span key={i} className={`h-4 w-4 rounded ${i < left ? "bg-[#546E7A] ring-2 ring-[#FFD54F]" : "bg-white/15"}`} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              stop();
              setRoad(givenRoad(level));
            }}
            className="h-12 rounded-full border border-white/30 px-4 font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]"
          >
            {t.reset}
          </button>
          <button
            type="button"
            data-tut="go"
            data-testid="go"
            onClick={go}
            disabled={running}
            className="flex h-14 items-center gap-2 rounded-full bg-[#43A047] px-8 text-xl font-black text-white shadow-[0_4px_0_#1B5E20] active:translate-y-0.5 active:shadow-none disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734]"
          >
            ▶ {t.go}
          </button>
        </div>
      </div>
    </div>
  );
}
