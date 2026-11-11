"use client";

import { useEffect, useState } from "react";
import { SceneBackdrop } from "../../blocks/scenes";
import type { Lang } from "../i18n";
import RoverRoads from "./RoverRoads";
import { LEVELS as ROVER_LEVELS } from "./roverRoads";
import StarStitch from "./StarStitch";
import { LEVELS as STITCH_LEVELS } from "./starStitch";
import { CHAPTERS, PROLOGUE } from "./script";
import { ADVENTURE_CSS, CREW, Dialogue, Pointer, hush, type Line } from "./story";

/**
 * CODEship Adventure: a story mode for the youngest coders. Captain Kai and
 * Bolt need fuel (chapter 1, Rover Roads) and a star map (chapter 2, Star
 * Stitch) to fly home. Story scenes between levels, every line can be read
 * aloud, and a pointing hand guides each chapter's first level.
 *
 * Progress is kept per device in localStorage.
 */

const KEY = "codeship-playground-adventure";
type Progress = { prologue: boolean; read: boolean; done: Record<string, number[]> };
const fresh = (): Progress => ({ prologue: false, read: false, done: { rover: [], stitch: [] } });

const LEVEL_COUNT = { rover: ROVER_LEVELS.length, stitch: STITCH_LEVELS.length };

const UI = {
  en: { title: "CODEship Adventure", map: "Map", level: "Level", read: "Read aloud", complete: "Mission complete! The CODEship is home.", home: "Home", start: "Start", replay: "Play again", story: "Story" },
  fr: { title: "Aventure CODEship", map: "Carte", level: "Niveau", read: "Lecture à voix haute", complete: "Mission accomplie ! Le CODEship est rentré.", home: "Maison", start: "Commencer", replay: "Rejouer", story: "Histoire" },
};

function readProgress(): Progress {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && v.done) return { ...fresh(), ...v, done: { rover: [], stitch: [], ...v.done } };
  } catch {}
  return fresh();
}

function Planet({ kind }: { kind: "rover" | "stitch" | "home" }) {
  if (kind === "rover")
    return (
      <svg viewBox="-60 -60 120 120" className="h-full w-full" aria-hidden="true">
        <circle r="54" fill="#E07A3F" />
        <circle cx="-18" cy="-14" r="12" fill="#C8642F" />
        <circle cx="20" cy="18" r="16" fill="#C8642F" />
        <circle cx="22" cy="-26" r="7" fill="#C8642F" />
        <path d="M-50 10q50 30 100 0" stroke="#F4A261" strokeWidth="6" fill="none" opacity="0.6" />
      </svg>
    );
  if (kind === "stitch")
    return (
      <svg viewBox="-60 -60 120 120" className="h-full w-full" aria-hidden="true">
        <circle r="54" fill="#283593" />
        <circle r="54" fill="none" stroke="#7986CB" strokeWidth="4" />
        <path d="M-24 -18L4 -30 26 -6 8 22 -20 12z" stroke="#FFF59D" strokeWidth="3" fill="none" />
        {[[-24, -18], [4, -30], [26, -6], [8, 22], [-20, 12]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="#FFF59D" />
        ))}
      </svg>
    );
  return (
    <svg viewBox="-60 -60 120 120" className="h-full w-full" aria-hidden="true">
      <circle r="54" fill="#29B6F6" />
      <path d="M-40 -20q20-20 40-8t20 20-30 20-30-32zM10 20q20-6 34 6-10 20-30 18z" fill="#66BB6A" />
      <circle r="54" fill="none" stroke="#B3E5FC" strokeWidth="5" opacity="0.6" />
    </svg>
  );
}

export default function Adventure({ lang }: { lang: Lang }) {
  const u = UI[lang];
  const [p, setP] = useState<Progress>(fresh);
  const [screen, setScreen] = useState<"map" | "play">("map");
  const [chapter, setChapter] = useState(0);
  const [level, setLevel] = useState(0);
  const [dialog, setDialog] = useState<{ lines: Line[]; then: () => void } | null>(null);
  const [tut, setTut] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const update = (fn: (prev: Progress) => Progress) =>
    setP((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  useEffect(() => {
    const loaded = readProgress();
    setP(loaded);
    if (!loaded.prologue) setDialog({ lines: PROLOGUE, then: () => update((prev) => ({ ...prev, prologue: true })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => hush, []);

  const ch = CHAPTERS[chapter];
  const done = p.done[ch.id] ?? [];
  const count = LEVEL_COUNT[ch.id];

  const startLevel = (c: number, l: number, alreadySeen = seen) => {
    setLevel(l);
    setTut(0);
    const beat = CHAPTERS[c].before[l];
    const k = `${c}-${l}`;
    if (beat && !alreadySeen.has(k)) {
      const nextSeen = new Set(alreadySeen).add(k);
      setSeen(nextSeen);
      setDialog({ lines: beat, then: () => {} });
    }
  };

  const openChapter = (c: number) => {
    setChapter(c);
    setScreen("play");
    const d = p.done[CHAPTERS[c].id] ?? [];
    const first = Array.from({ length: LEVEL_COUNT[CHAPTERS[c].id] }, (_, i) => i).find((i) => !d.includes(i)) ?? 0;
    setLevel(first);
    setTut(0);
    if (d.length === 0) setDialog({ lines: CHAPTERS[c].intro, then: () => startLevel(c, first) });
    else startLevel(c, first);
  };

  const win = () => {
    update((prev) => ({ ...prev, done: { ...prev.done, [ch.id]: Array.from(new Set([...(prev.done[ch.id] ?? []), level])) } }));
    if (level === count - 1) {
      setDialog({ lines: ch.outro, then: () => setScreen("map") });
    } else startLevel(chapter, level + 1);
  };

  const onAction = (k: string) => {
    const step = ch.tutorial[tut];
    if (step && k === step.match) setTut((n) => n + 1);
  };

  const tutorialOn = screen === "play" && level === 0 && !done.includes(0) && !dialog && tut < ch.tutorial.length;
  const allDone = CHAPTERS.every((c) => (p.done[c.id] ?? []).length >= LEVEL_COUNT[c.id]);
  const nextChapter = CHAPTERS.findIndex((c) => (p.done[c.id] ?? []).length < LEVEL_COUNT[c.id]);

  const toggleRead = () => update((prev) => ({ ...prev, read: !prev.read }));
  const readBtn = (
    <button
      type="button"
      onClick={toggleRead}
      aria-pressed={p.read}
      title={u.read}
      className={`flex h-10 items-center gap-1 rounded-full border px-3 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401] ${p.read ? "border-[#F4D734] bg-[#F4D734] text-[#010F2A]" : "border-white/30 text-white"}`}
    >
      🔊 <span className="hidden sm:inline">{u.read}</span>
    </button>
  );

  return (
    <div className="relative">
      <style>{ADVENTURE_CSS}</style>

      {screen === "map" && (
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
          <SceneBackdrop id="starfield" />
          <div className="relative mx-auto flex max-w-5xl flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-black text-white sm:text-4xl">{u.title}</h2>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={() => setDialog({ lines: PROLOGUE, then: () => {} })} className="h-10 rounded-full border border-white/30 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]">
                  📖 {u.story}
                </button>
                {readBtn}
              </div>
            </div>

            <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl">
              <svg viewBox="0 0 1000 625" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path d="M120 520 C 260 520, 240 330, 330 300 S 560 420, 640 260 S 820 120, 880 150" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="6" strokeDasharray="4 16" strokeLinecap="round" fill="none" />
              </svg>
              {/* crew */}
              <div className="absolute bottom-[4%] left-[2%] hidden items-end gap-1 sm:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CREW.kai.img} alt={CREW.kai.name} className="adv-talk h-20 w-20 sm:h-28 sm:w-28" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CREW.bolt.img} alt={CREW.bolt.name} className="adv-talk h-16 w-16 sm:h-24 sm:w-24" style={{ animationDelay: "-0.7s" }} />
              </div>
              {CHAPTERS.map((c, i) => {
                const pos = i === 0 ? { left: "33%", top: "48%" } : { left: "64%", top: "42%" };
                const d = (p.done[c.id] ?? []).length;
                const total = LEVEL_COUNT[c.id];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openChapter(i)}
                    data-testid={`chapter-${c.id}`}
                    className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus:outline-none"
                    style={pos}
                  >
                    <span className={`block h-20 w-20 transition group-hover:scale-110 group-focus-visible:scale-110 sm:h-36 sm:w-36 ${nextChapter === i ? "adv-glow" : ""}`}>
                      <Planet kind={c.id} />
                    </span>
                    <span className="mt-1 rounded-full bg-[#010F2A]/80 px-3 py-1 text-center text-xs font-black text-white ring-2 ring-white/20 group-focus-visible:ring-[#F4D734] sm:text-base">
                      {i + 1}. {c.title[lang]}
                      <span className="block text-[10px] font-semibold text-white/70 sm:text-xs">{c.place[lang]}</span>
                    </span>
                    <span className="mt-1 rounded-full bg-[#F4D734] px-2 py-0.5 text-xs font-black text-[#010F2A]">
                      ⭐ {d}/{total}
                    </span>
                  </button>
                );
              })}
              <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: "88%", top: "24%" }}>
                <span className={`block h-16 w-16 sm:h-24 sm:w-24 ${allDone ? "adv-glow" : "opacity-50 grayscale"}`}>
                  <Planet kind="home" />
                </span>
                <span className="text-xs font-bold text-white/80">{u.home}</span>
              </div>
              {/* the CODEship, parked at the next stop */}
              <div
                className="absolute text-4xl transition-all duration-700 sm:text-5xl"
                style={allDone ? { left: "85%", top: "8%" } : nextChapter === 1 ? { left: "60%", top: "18%" } : { left: "28%", top: "24%" }}
                aria-hidden="true"
              >
                <span className="adv-hand inline-block">🚀</span>
              </div>
            </div>
            {allDone && (
              <p className="adv-pop mx-auto rounded-full border-4 border-[#F4D734] bg-[#010F2A] px-6 py-3 text-center text-lg font-black text-white sm:text-2xl" role="status">
                🎉 {u.complete}
              </p>
            )}
          </div>
        </div>
      )}

      {screen === "play" && (
        <div className="relative min-h-[calc(100vh-64px)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                hush();
                setScreen("map");
              }}
              className="h-10 rounded-full border border-white/30 px-3 text-sm font-bold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]"
            >
              🗺️ {u.map}
            </button>
            <p className="font-black text-white">
              {ch.title[lang]} <span className="font-semibold text-white/60">· {ch.place[lang]}</span>
            </p>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => startLevel(chapter, i)}
                  aria-label={`${u.level} ${i + 1}`}
                  aria-current={i === level ? "step" : undefined}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401] ${i === level ? "border-[#F4D734] bg-[#F4D734] text-[#010F2A]" : "border-white/30 text-white"}`}
                >
                  {i + 1}
                  {done.includes(i) && <span className="absolute -right-1.5 -top-1.5 text-[10px]">⭐</span>}
                </button>
              ))}
              {readBtn}
            </div>
          </div>
          {ch.id === "rover" ? (
            <RoverRoads key={`r${level}`} lang={lang} level={level} onWin={win} onAction={onAction} />
          ) : (
            <StarStitch key={`s${level}`} lang={lang} level={level} onWin={win} onAction={onAction} />
          )}
        </div>
      )}

      {tutorialOn && <Pointer target={ch.tutorial[tut].target} hint={ch.tutorial[tut].hint[lang]} lang={lang} autoRead={p.read} />}
      {dialog && (
        <Dialogue
          key={dialog.lines[0]?.en}
          lines={dialog.lines}
          lang={lang}
          autoRead={p.read}
          onDone={() => {
            const then = dialog.then;
            setDialog(null);
            then();
          }}
        />
      )}
    </div>
  );
}
