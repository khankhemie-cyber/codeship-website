"use client";

import { useEffect, useRef, useState } from "react";
import { playCheer, playPop, unlockAudio } from "../blocks/audio";
import { costumeUrl } from "../blocks/costumes";
import type { Strings } from "./i18n";

/**
 * Rocket Hop: children choose the rules of a one-button flying game (what a
 * tap does, what a crash does, what a gap is worth, speed, gravity, scene,
 * player), then play it. Changing a rule and feeling the difference is the
 * lesson: events and variables, without any typing.
 */

const W = 480;
const H = 320;
const GAP = 120;
const SPACING = 210;
const COL_W = 52;
const PLAYER = 34;
const BEST_KEY = "codeship-playground-rockethop-best";

const OPTIONS = {
  hop: ["small", "medium", "big"],
  crash: ["end", "bounce", "ghost"],
  pass: ["one", "five", "faster"],
  speed: ["slow", "normal", "fast"],
  gravity: ["moon", "earth", "heavy"],
  scene: ["space", "ocean", "sky", "night"],
  flyer: ["rocket", "robot", "cat", "star", "ball"],
} as const;
type Rules = { [K in keyof typeof OPTIONS]: (typeof OPTIONS)[K][number] };
const DEFAULT_RULES: Rules = { hop: "medium", crash: "end", pass: "one", speed: "normal", gravity: "earth", scene: "space", flyer: "rocket" };

const HOP = { small: -4.6, medium: -6.4, big: -8.6 };
const SPEED = { slow: 2, normal: 2.9, fast: 4.2 };
const GRAVITY = { moon: 0.17, earth: 0.33, heavy: 0.5 };
const SCENES = {
  space: { sky: ["#0B0B2B", "#2B1B5A"], col: "#7E57C2", cap: "#B39DDB", dots: "#FFFFFF" },
  ocean: { sky: ["#4FC3F7", "#01579B"], col: "#FF7043", cap: "#FFAB91", dots: "#B3E5FC" },
  sky: { sky: ["#81D4FA", "#E1F5FE"], col: "#43A047", cap: "#81C784", dots: "#FFFFFF" },
  night: { sky: ["#1A237E", "#3949AB"], col: "#37474F", cap: "#F4D734", dots: "#FFF9C4" },
};

const ROCKET_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 62l-12 14 22-4z" fill="#D58401"/><path d="M20 38L8 24l22 4z" fill="#D58401"/>` +
  `<path d="M14 50c0-12 22-22 50-22 14 0 26 10 30 22-4 12-16 22-30 22-28 0-50-10-50-22z" fill="#ECEFF1" stroke="#586173" stroke-width="4"/>` +
  `<circle cx="60" cy="50" r="10" fill="#4FC3F7" stroke="#586173" stroke-width="4"/><path d="M14 42l-10 8 10 8z" fill="#FF7043"/></svg>`;
const flyerUrl = (id: string) => (id === "rocket" ? `data:image/svg+xml;utf8,${encodeURIComponent(ROCKET_SVG)}` : costumeUrl(id));

type Col = { x: number; gapY: number; passed: boolean };
type Game = { y: number; vy: number; cols: Col[]; score: number; speed: number; safeUntil: number; t: number; phase: "ready" | "playing" | "over" };

const newGame = (rules: Rules): Game => ({ y: H / 2, vy: 0, cols: [], score: 0, speed: SPEED[rules.speed], safeUntil: 0, t: 0, phase: "ready" });

export default function RocketHop({ s }: { s: Strings }) {
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [phase, setPhase] = useState<Game["phase"]>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const bestRef = useRef(0);
  bestRef.current = best;
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(newGame(DEFAULT_RULES));
  const rulesRef = useRef(rules);
  rulesRef.current = rules;
  const img = useRef<HTMLImageElement | null>(null);
  const raf = useRef(0);
  const stars = useRef(Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.4 })));

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch {}
  }, []);

  useEffect(() => {
    const i = new Image();
    i.src = flyerUrl(rules.flyer);
    i.onload = () => draw();
    img.current = i;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules.flyer, rules.scene]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function draw() {
    const c = canvas.current?.getContext("2d");
    if (!c) return;
    const g = game.current;
    c.setTransform(2, 0, 0, 2, 0, 0);
    const sc = SCENES[rulesRef.current.scene];
    const grad = c.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, sc.sky[0]);
    grad.addColorStop(1, sc.sky[1]);
    c.fillStyle = grad;
    c.fillRect(0, 0, W, H);
    c.fillStyle = sc.dots;
    for (const st of stars.current) {
      const x = (((st.x - g.t * 0.3 * st.r) % W) + W) % W;
      c.globalAlpha = rulesRef.current.scene === "sky" ? 0.5 : 0.8;
      c.beginPath();
      c.arc(x, st.y, rulesRef.current.scene === "sky" ? st.r * 6 : st.r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    for (const col of g.cols) {
      for (const [y0, y1] of [
        [0, col.gapY - GAP / 2],
        [col.gapY + GAP / 2, H],
      ]) {
        c.fillStyle = sc.col;
        c.beginPath();
        c.roundRect(col.x, y0 - 10, COL_W, y1 - y0 + 20, 14);
        c.fill();
        c.fillStyle = sc.cap;
        const capY = y0 === 0 ? y1 - 14 : y0;
        c.beginPath();
        c.roundRect(col.x - 4, capY, COL_W + 8, 14, 7);
        c.fill();
        if (rulesRef.current.scene === "night") {
          c.fillStyle = "#FFF59D";
          for (let wy = y0 + 18; wy < y1 - 18; wy += 22) for (const wx of [10, 30]) if ((wy + wx + col.x) % 3 > 1) c.fillRect(col.x + wx, wy, 10, 10);
        }
      }
    }
    const ghost = rulesRef.current.crash === "ghost" && g.phase === "playing";
    c.save();
    c.globalAlpha = g.safeUntil > g.t && Math.floor(g.t / 6) % 2 ? 0.3 : ghost ? 0.85 : 1;
    c.translate(90, g.y);
    c.rotate(Math.max(-0.5, Math.min(0.7, g.vy * 0.06)));
    if (img.current?.complete) c.drawImage(img.current, -PLAYER / 2 - 6, -PLAYER / 2 - 6, PLAYER + 12, PLAYER + 12);
    c.restore();
  }

  function setPhaseBoth(p: Game["phase"]) {
    game.current.phase = p;
    setPhase(p);
  }

  function step(dtMs: number) {
    const g = game.current;
    const r = rulesRef.current;
    const f = Math.min(3, dtMs / 16.67);
    g.t += f;
    g.vy += GRAVITY[r.gravity] * f;
    g.y += g.vy * f;
    const last = g.cols[g.cols.length - 1];
    if (!last || last.x < W - SPACING) g.cols.push({ x: W + 20, gapY: 70 + Math.random() * (H - 140), passed: false });
    for (const col of g.cols) col.x -= g.speed * f;
    g.cols = g.cols.filter((col) => col.x > -COL_W - 10);

    // Fly through a gap.
    for (const col of g.cols)
      if (!col.passed && col.x + COL_W < 90 - PLAYER / 2) {
        col.passed = true;
        g.score += r.pass === "five" ? 5 : 1;
        if (r.pass === "faster") g.speed = Math.min(8, g.speed * 1.08);
        playPop();
      }

    // Crash: walls, floor, ceiling.
    const half = PLAYER / 2 - 3;
    const hitEdge = g.y - half < 0 || g.y + half > H;
    const hitCol = g.cols.some((col) => col.x < 90 + half && col.x + COL_W > 90 - half && (g.y - half < col.gapY - GAP / 2 || g.y + half > col.gapY + GAP / 2));
    if ((hitEdge || hitCol) && g.t > g.safeUntil) {
      if (r.crash === "end") {
        setPhaseBoth("over");
        if (g.score > bestRef.current) {
          bestRef.current = g.score;
          setBest(g.score);
          playCheer();
          try {
            localStorage.setItem(BEST_KEY, String(g.score));
          } catch {}
        }
      } else if (r.crash === "bounce") {
        g.score = Math.max(0, g.score - 1);
        const next = g.cols.find((col) => col.x + COL_W > 90 - half);
        g.y = next ? next.gapY : H / 2;
        g.vy = -2;
        g.safeUntil = g.t + 60;
      }
    }
    if (r.crash !== "end") {
      g.y = Math.max(half, Math.min(H - half, g.y));
      if (g.y >= H - half) g.vy = Math.min(g.vy, 0);
    }
    setScore(g.score);
  }

  function play() {
    unlockAudio();
    cancelAnimationFrame(raf.current);
    game.current = newGame(rulesRef.current);
    setScore(0);
    setPhaseBoth("playing");
    hop();
    let last = performance.now();
    const loop = (t: number) => {
      step(t - last);
      last = t;
      draw();
      if (game.current.phase === "playing") raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }

  function hop() {
    const g = game.current;
    if (g.phase !== "playing") return;
    g.vy = HOP[rulesRef.current.hop];
  }

  const press = () => {
    if (game.current.phase === "playing") hop();
    else play();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target as HTMLElement)?.closest("button,select,input")) return;
      e.preventDefault();
      press();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const change = <K extends keyof Rules>(key: K) => {
    const opts = OPTIONS[key] as unknown as readonly Rules[K][];
    setRules((r) => ({ ...r, [key]: opts[(opts.indexOf(r[key]) + 1) % opts.length] }));
    if (game.current.phase !== "playing") {
      game.current = newGame({ ...rulesRef.current });
      setPhaseBoth("ready");
    }
  };

  const label = (key: keyof Rules): string => {
    const v = rules[key];
    if (key === "flyer") return v;
    return (s.opts as Record<string, Record<string, string>>)[key][v];
  };

  const chip = (k: keyof Rules) => (
    <button
      key={k}
      type="button"
      onClick={() => change(k)}
      data-testid={`rule-${k}`}
      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-bold text-[#010F2A] shadow-[0_3px_0_rgba(0,0,0,0.25)] hover:bg-[#FFF8E6] active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D734]"
    >
      {k === "flyer" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flyerUrl(rules.flyer)} alt="" className="h-6 w-6" />
      )}
      {k === "flyer" ? "" : label(k)}
      <span aria-hidden="true" className="text-xs text-[#D58401]">
        ⟳
      </span>
    </button>
  );

  const row = (when: string, colour: string, children: React.ReactNode) => (
    <div className="rounded-xl border-l-[6px] bg-white/[0.06] p-2.5" style={{ borderColor: colour }}>
      <p className="mb-1.5 text-sm font-black" style={{ color: colour }}>
        {when}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">{children}</div>
    </div>
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 p-4 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-3">
        <div className="relative w-full overflow-hidden rounded-2xl border-4 border-[#0A2648]" style={{ aspectRatio: `${W} / ${H}` }}>
          <canvas
            ref={canvas}
            width={W * 2}
            height={H * 2}
            className="h-full w-full touch-none"
            onPointerDown={(e) => {
              e.preventDefault();
              press();
            }}
            aria-label={s.games.rocketHop.name}
            data-testid="rocket-canvas"
          />
          <div className="pointer-events-none absolute left-3 top-2 text-2xl font-black text-white [text-shadow:0_2px_0_#010F2A]">
            {s.score}: {score}
          </div>
          <div className="pointer-events-none absolute right-3 top-3 text-sm font-bold text-white/80 [text-shadow:0_1px_0_#010F2A]">
            {s.best}: {best}
          </div>
          {phase !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#010F2A]/45 p-4 text-center">
              {phase === "over" && <p className="text-3xl font-black text-white">{s.gameOver}</p>}
              <button
                type="button"
                onClick={play}
                className="flex h-14 items-center gap-2 rounded-full bg-[#43A047] px-8 text-xl font-black text-white shadow-[0_4px_0_#1B5E20] active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734]"
              >
                ▶ {phase === "over" ? s.playAgain : s.play}
              </button>
              {phase === "ready" && <p className="text-sm font-semibold text-white">{s.tapToPlay}</p>}
            </div>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white/60">{s.yourRules}</h3>
        {row(s.atStart, "#F4D734", <>
          {s.flyer} {chip("flyer")} {s.scene.toLowerCase()} {chip("scene")} {s.speed} {chip("speed")} {s.gravity} {chip("gravity")}
        </>)}
        {row(s.whenTap, "#29B6F6", <>
          {chip("hop")}
        </>)}
        {row(s.whenPass, "#66BB6A", <>
          {chip("pass")}
        </>)}
        {row(s.whenCrash, "#EF5350", <>
          {chip("crash")}
        </>)}
      </aside>
    </div>
  );
}
