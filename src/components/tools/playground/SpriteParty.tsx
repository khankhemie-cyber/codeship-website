"use client";

import { useEffect, useRef, useState } from "react";
import { playPop, unlockAudio } from "../blocks/audio";
import { BACKGROUNDS, backgroundById, costumeUrl } from "../blocks/costumes";
import type { Strings } from "./i18n";

/**
 * Sprite Party: put characters on a stage, give each kind of character
 * "When ___, do ___" rules, press Run. Rules belong to the costume, so every
 * cat follows the cat rules, including the ones made by "make another one".
 *
 * Saved per device in localStorage. Nothing leaves the computer.
 */

const STORAGE_KEY = "codeship-playground-spriteparty";
const W = 1000;
const H = 625;
const SIZE = 110;
const MAX_SPRITES = 40;
const SPRITE_COSTUMES = ["cat", "dog", "robot", "star", "ball", "flower", "sun", "car", "gift", "tree", "can", "card"];

export type EventId = "start" | "clicked" | "touch" | "every";
const BEHAVIOURS = ["wander", "bounce", "spin", "dance", "follow", "still"] as const;
const ONCE = ["jump", "grow", "shrink", "colour", "say", "sparkle", "pop", "clone", "teleport", "vanish"] as const;
export type ActionId = (typeof BEHAVIOURS)[number] | (typeof ONCE)[number];
const EVENTS: EventId[] = ["start", "clicked", "touch", "every"];

type Rule = { event: EventId; action: ActionId; text?: string };
type Placed = { id: string; costume: string; x: number; y: number };
type Scene = { background: string; sprites: Placed[]; rules: Record<string, Rule[]> };

type Live = Placed & {
  vx: number;
  vy: number;
  angle: number;
  scale: number;
  hue: number;
  moving: "wander" | "bounce" | "follow" | null;
  spin: boolean;
  dance: boolean;
  jumpT: number;
  bubble: string | null;
  bubbleUntil: number;
  turnAt: number;
};
type Spark = { x: number; y: number; vx: number; vy: number; until: number; colour: string };

let nextId = 1;
const uid = () => `s${Date.now().toString(36)}${nextId++}`;

const EXAMPLES: { name: { en: string; fr: string }; scene: () => Scene }[] = [
  {
    name: { en: "Bouncy balls", fr: "Balles rebondissantes" },
    scene: () => ({
      background: "party",
      sprites: [
        { id: uid(), costume: "ball", x: 200, y: 200 },
        { id: uid(), costume: "ball", x: 500, y: 400 },
        { id: uid(), costume: "ball", x: 800, y: 250 },
      ],
      rules: { ball: [{ event: "start", action: "bounce" }, { event: "touch", action: "colour" }, { event: "touch", action: "pop" }, { event: "clicked", action: "clone" }] },
    }),
  },
  {
    name: { en: "Pet park", fr: "Parc à animaux" },
    scene: () => ({
      background: "grass",
      sprites: [
        { id: uid(), costume: "cat", x: 250, y: 420 },
        { id: uid(), costume: "dog", x: 700, y: 420 },
        { id: uid(), costume: "tree", x: 500, y: 250 },
      ],
      rules: {
        cat: [{ event: "start", action: "wander" }, { event: "clicked", action: "say", text: "Meow!" }, { event: "clicked", action: "jump" }],
        dog: [{ event: "start", action: "follow" }, { event: "touch", action: "say", text: "Woof!" }],
        tree: [{ event: "every", action: "sparkle" }],
      },
    }),
  },
  {
    name: { en: "Night sky", fr: "Ciel de nuit" },
    scene: () => ({
      background: "night",
      sprites: [
        { id: uid(), costume: "star", x: 300, y: 200 },
        { id: uid(), costume: "robot", x: 650, y: 430 },
      ],
      rules: {
        star: [{ event: "start", action: "spin" }, { event: "clicked", action: "clone" }, { event: "clicked", action: "sparkle" }, { event: "every", action: "teleport" }],
        robot: [{ event: "start", action: "dance" }, { event: "clicked", action: "say", text: "Beep boop!" }],
      },
    }),
  },
];

const emptyScene = (): Scene => ({ background: "sky", sprites: [], rules: {} });

function readScene(): Scene | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (v && Array.isArray(v.sprites) && v.rules && typeof v.background === "string") return v;
  } catch {}
  return null;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export default function SpriteParty({ s, lang }: { s: Strings; lang: "en" | "fr" }) {
  const [scene, setScene] = useState<Scene>(emptyScene);
  const [selected, setSelected] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [, setFrame] = useState(0);
  const live = useRef<Live[]>([]);
  const sparks = useRef<Spark[]>([]);
  const pointer = useRef({ x: W / 2, y: H / 2 });
  const stageRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const loaded = useRef(false);

  // Load / save.
  useEffect(() => {
    const saved = readScene();
    const sc = saved ?? EXAMPLES[1].scene();
    setScene(sc);
    setSelected(sc.sprites[0]?.costume ?? null);
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scene));
    } catch {}
  }, [scene]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const toStage = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  // ── Running ──
  function doAction(sp: Live, rule: Rule, now: number) {
    const a = rule.action;
    switch (a) {
      case "wander":
      case "bounce":
      case "follow": {
        sp.moving = a;
        if (a === "bounce" && Math.hypot(sp.vx, sp.vy) < 1) {
          const ang = rand(0, Math.PI * 2);
          sp.vx = Math.cos(ang) * 4;
          sp.vy = Math.sin(ang) * 4;
        }
        break;
      }
      case "spin":
        sp.spin = true;
        break;
      case "dance":
        sp.dance = true;
        break;
      case "still":
        sp.moving = null;
        sp.spin = false;
        sp.dance = false;
        sp.vx = sp.vy = 0;
        break;
      case "jump":
        sp.jumpT = now;
        break;
      case "grow":
        sp.scale = Math.min(3, sp.scale * 1.25);
        break;
      case "shrink":
        sp.scale = Math.max(0.4, sp.scale / 1.25);
        break;
      case "colour":
        sp.hue = (sp.hue + 70) % 360;
        break;
      case "say":
        sp.bubble = rule.text?.trim() || s.sayDefault;
        sp.bubbleUntil = now + 2000;
        break;
      case "sparkle":
        for (let i = 0; i < 14; i++) {
          const ang = rand(0, Math.PI * 2);
          const v = rand(2, 7);
          sparks.current.push({ x: sp.x, y: sp.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, until: now + rand(500, 900), colour: ["#F4D734", "#E91E63", "#29B6F6", "#66BB6A", "#FFFFFF"][i % 5] });
        }
        break;
      case "pop":
        playPop();
        break;
      case "clone":
        if (live.current.length >= MAX_SPRITES) {
          setNotice(s.tooManySprites);
          break;
        }
        live.current.push({ ...sp, id: uid(), x: clamp(sp.x + rand(-80, 80), 40, W - 40), y: clamp(sp.y + rand(-80, 80), 40, H - 40), vx: -sp.vx || rand(-4, 4), vy: sp.vy || rand(-4, 4), bubble: null, jumpT: 0 });
        break;
      case "teleport":
        sp.x = rand(60, W - 60);
        sp.y = rand(60, H - 60);
        break;
      case "vanish":
        live.current = live.current.filter((o) => o !== sp);
        break;
    }
  }

  function fire(sp: Live, event: EventId, now: number) {
    for (const r of sceneRef.current.rules[sp.costume] ?? []) if (r.event === event) doAction(sp, r, now);
  }

  const start = () => {
    unlockAudio();
    setNotice(null);
    const now = performance.now();
    live.current = scene.sprites.map((p) => ({ ...p, vx: 0, vy: 0, angle: 0, scale: 1, hue: 0, moving: null, spin: false, dance: false, jumpT: 0, bubble: null, bubbleUntil: 0, turnAt: 0 }));
    sparks.current = [];
    for (const sp of [...live.current]) fire(sp, "start", now);
    setRunning(true);
    let lastEvery = now;
    const touching = new Map<string, number>();
    const loop = (t: number) => {
      const sprites = live.current;
      for (const sp of sprites) {
        if (sp.moving === "wander") {
          if (t > sp.turnAt) {
            const ang = rand(0, Math.PI * 2);
            sp.vx = Math.cos(ang) * 2.2;
            sp.vy = Math.sin(ang) * 2.2;
            sp.turnAt = t + rand(800, 2200);
          }
        } else if (sp.moving === "follow") {
          const dx = pointer.current.x - sp.x;
          const dy = pointer.current.y - sp.y;
          const d = Math.hypot(dx, dy);
          sp.vx = d > 8 ? (dx / d) * Math.min(5, d / 10) : 0;
          sp.vy = d > 8 ? (dy / d) * Math.min(5, d / 10) : 0;
        }
        if (sp.moving) {
          sp.x += sp.vx;
          sp.y += sp.vy;
          const half = (SIZE * sp.scale) / 2;
          if (sp.x < half || sp.x > W - half) sp.vx *= -1;
          if (sp.y < half || sp.y > H - half) sp.vy *= -1;
          sp.x = clamp(sp.x, half, W - half);
          sp.y = clamp(sp.y, half, H - half);
        }
        if (sp.spin) sp.angle = (sp.angle + 4) % 360;
        if (sp.bubble && t > sp.bubbleUntil) sp.bubble = null;
      }
      // Touching: once per pair per second.
      for (let i = 0; i < sprites.length; i++)
        for (let j = i + 1; j < sprites.length; j++) {
          const a = sprites[i];
          const b = sprites[j];
          const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
          const near = Math.hypot(a.x - b.x, a.y - b.y) < ((a.scale + b.scale) * SIZE) / 2 * 0.7;
          if (near && (touching.get(key) ?? 0) < t) {
            touching.set(key, t + 1000);
            fire(a, "touch", t);
            fire(b, "touch", t);
          }
        }
      if (t - lastEvery > 2000) {
        lastEvery = t;
        for (const sp of [...live.current]) fire(sp, "every", t);
      }
      sparks.current = sparks.current.filter((p) => p.until > t);
      for (const p of sparks.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
      }
      setFrame((f) => f + 1);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };

  const stop = () => {
    cancelAnimationFrame(raf.current);
    setRunning(false);
    live.current = [];
    sparks.current = [];
  };

  // ── Editing ──
  const addSprite = (costume: string) => {
    unlockAudio();
    if (scene.sprites.length >= MAX_SPRITES) return setNotice(s.tooManySprites);
    playPop();
    if (running) stop();
    setScene((sc) => ({ ...sc, sprites: [...sc.sprites, { id: uid(), costume, x: rand(150, W - 150), y: rand(150, H - 150) }], rules: sc.rules[costume] ? sc.rules : { ...sc.rules, [costume]: [] } }));
    setSelected(costume);
  };
  const removeOne = (costume: string) =>
    setScene((sc) => {
      const i = sc.sprites.map((p) => p.costume).lastIndexOf(costume);
      return i < 0 ? sc : { ...sc, sprites: sc.sprites.filter((_, k) => k !== i) };
    });
  const setRules = (costume: string, fn: (r: Rule[]) => Rule[]) => {
    if (running) stop();
    setScene((sc) => ({ ...sc, rules: { ...sc.rules, [costume]: fn([...(sc.rules[costume] ?? [])]) } }));
  };
  const updateRule = (i: number, patch: Partial<Rule>) => selected && setRules(selected, (rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const loadExample = (i: number) => {
    stop();
    const sc = EXAMPLES[i].scene();
    setScene(sc);
    setSelected(sc.sprites[0]?.costume ?? null);
  };

  const onSpriteDown = (e: React.PointerEvent, p: Placed | Live) => {
    e.stopPropagation();
    unlockAudio();
    setSelected(p.costume);
    if (running) {
      const sp = live.current.find((o) => o.id === p.id);
      if (sp) fire(sp, "clicked", performance.now());
      return;
    }
    const pt = toStage(e);
    drag.current = { id: p.id, dx: pt.x - p.x, dy: pt.y - p.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onStageMove = (e: React.PointerEvent) => {
    const pt = toStage(e);
    pointer.current = pt;
    const d = drag.current;
    if (!d || running) return;
    setScene((sc) => ({ ...sc, sprites: sc.sprites.map((p) => (p.id === d.id ? { ...p, x: clamp(pt.x - d.dx, 40, W - 40), y: clamp(pt.y - d.dy, 40, H - 40) } : p)) }));
  };

  const shown: (Placed | Live)[] = running ? live.current : scene.sprites;
  const kinds = [...new Set(scene.sprites.map((p) => p.costume))];
  const rules = selected ? scene.rules[selected] ?? [] : [];
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const panelBtn = "rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]";
  const select = "rounded-md border border-white/20 bg-[#0A2648] px-2 py-1.5 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 p-4 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={running ? stop : start}
            className={`flex h-12 items-center gap-2 rounded-full px-6 text-lg font-black text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734] ${running ? "bg-[#E53935]" : "bg-[#43A047]"}`}
          >
            {running ? "■" : "▶"} {running ? s.stop : s.run}
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-white/80">
            {s.scene}
            <select className={select} value={scene.background} onChange={(e) => setScene((sc) => ({ ...sc, background: e.target.value }))}>
              {BACKGROUNDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name[lang]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          ref={stageRef}
          className="relative w-full touch-none select-none overflow-hidden rounded-2xl border-4 border-[#0A2648]"
          style={{ aspectRatio: `${W} / ${H}`, background: backgroundById(scene.background).css }}
          onPointerMove={onStageMove}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => (drag.current = null)}
          data-testid="sprite-stage"
        >
          {shown.map((p) => {
            const l = running ? (p as Live) : null;
            const jump = l && l.jumpT ? Math.max(0, 1 - (performance.now() - l.jumpT) / 500) : 0;
            const dy = jump ? -Math.sin(jump * Math.PI) * 80 : 0;
            const dance = l?.dance ? Math.sin(performance.now() / 120) * 12 : 0;
            const scale = l?.scale ?? 1;
            return (
              <div
                key={p.id}
                className="absolute"
                style={{ left: pct(p.x, W), top: pct(p.y, H), width: pct(SIZE * scale, W), aspectRatio: "1", transform: `translate(-50%, -50%) translateY(${pct(dy, SIZE * scale)})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={costumeUrl(p.costume)}
                  alt={p.costume}
                  draggable={false}
                  onPointerDown={(e) => onSpriteDown(e, p)}
                  className={`h-full w-full cursor-pointer ${!running && selected === p.costume ? "drop-shadow-[0_0_6px_#F4D734]" : ""}`}
                  style={{ transform: `rotate(${(l?.angle ?? 0) + dance}deg)`, filter: l?.hue ? `hue-rotate(${l.hue}deg) saturate(1.4)` : undefined }}
                />
                {l?.bubble && (
                  <div className="absolute bottom-[95%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-[#010F2A] bg-white px-3 py-1 text-sm font-bold text-[#010F2A] sm:text-base">{l.bubble}</div>
                )}
              </div>
            );
          })}
          {sparks.current.map((p, i) => (
            <span key={i} className="pointer-events-none absolute h-2 w-2 rounded-full" style={{ left: pct(p.x, W), top: pct(p.y, H), background: p.colour }} />
          ))}
          {scene.sprites.length === 0 && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-lg font-bold text-[#010F2A]/60">{s.pickSprite}</p>}
        </div>
        {notice && (
          <p className="text-sm text-[#F4D734]" role="status">
            {notice}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
          {s.examples}:
          {EXAMPLES.map((ex, i) => (
            <button key={i} type="button" onClick={() => loadExample(i)} className={panelBtn}>
              {ex.name[lang]}
            </button>
          ))}
          <button type="button" onClick={() => (stop(), setScene(emptyScene()), setSelected(null))} className={panelBtn}>
            {s.startOver}
          </button>
        </div>
      </div>

      <aside className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <section>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/60">{s.addSprite}</h3>
          <div className="grid grid-cols-6 gap-2">
            {SPRITE_COSTUMES.map((c) => (
              <button key={c} type="button" onClick={() => addSprite(c)} aria-label={`${s.addSprite}: ${c}`} className="aspect-square rounded-lg bg-white/90 p-1 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={costumeUrl(c)} alt="" className="h-full w-full" />
              </button>
            ))}
          </div>
        </section>

        {kinds.length > 0 && (
          <section>
            <div className="flex flex-wrap gap-2">
              {kinds.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelected(c)}
                  aria-pressed={selected === c}
                  className={`flex items-center gap-1 rounded-full border-2 py-1 pl-1 pr-3 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401] ${selected === c ? "border-[#F4D734] bg-white/10" : "border-white/15"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={costumeUrl(c)} alt="" className="h-7 w-7 rounded-full bg-white p-0.5" />×{scene.sprites.filter((p) => p.costume === c).length}
                </button>
              ))}
            </div>
          </section>
        )}

        {selected && (
          <section className="flex flex-col gap-2" aria-label={`${s.rules} ${selected}`}>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={costumeUrl(selected)} alt="" className="h-9 w-9 rounded-lg bg-white p-1" />
              <h3 className="font-bold text-white">{s.rules}</h3>
              <button type="button" onClick={() => removeOne(selected)} className="ml-auto text-xs text-white/60 underline hover:text-white">
                {s.removeSprite}
              </button>
            </div>
            {rules.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-xl border-l-4 border-[#D58401] bg-[#D58401]/15 p-2 text-sm text-white">
                <span className="font-bold text-[#F4D734]">{s.when}</span>
                <select className={select} value={r.event} onChange={(e) => updateRule(i, { event: e.target.value as EventId })}>
                  {EVENTS.map((ev) => (
                    <option key={ev} value={ev}>
                      {s.events[ev]}
                    </option>
                  ))}
                </select>
                <span className="font-bold text-[#F4D734]">{s.then}</span>
                <select className={select} value={r.action} onChange={(e) => updateRule(i, { action: e.target.value as ActionId })}>
                  <optgroup label={s.behaviours}>
                    {BEHAVIOURS.map((a) => (
                      <option key={a} value={a}>
                        {s.actions[a]}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={s.once}>
                    {ONCE.map((a) => (
                      <option key={a} value={a}>
                        {s.actions[a]}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {r.action === "say" && (
                  <input
                    className={`${select} w-28`}
                    maxLength={30}
                    value={r.text ?? ""}
                    placeholder={s.sayDefault}
                    onChange={(e) => updateRule(i, { text: e.target.value })}
                  />
                )}
                <button type="button" aria-label="✕" onClick={() => setRules(selected, (rs) => rs.filter((_, k) => k !== i))} className="ml-auto px-1 text-white/60 hover:text-white">
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setRules(selected, (rs) => [...rs, { event: rs.length ? "clicked" : "start", action: rs.length ? "jump" : "wander" }])} className={panelBtn}>
              + {s.addRule}
            </button>
          </section>
        )}
      </aside>
    </div>
  );
}
