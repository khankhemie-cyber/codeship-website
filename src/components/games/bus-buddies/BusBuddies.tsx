"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BUS_FREE_LEVELS, BUS_PROGRAM, CHAPTERS, FREE_LEVELS, type Block, type Item, type Level, type PaletteBlock, type PassengerId, type Program, type ThingId } from "@/lib/games/bus/levels";
import {
  DX,
  DY,
  autopilot,
  coneSpot,
  findChar,
  firstBlock,
  headings,
  isRed,
  nextCone,
  nextCorrect,
  pieces,
  run,
  startState,
  stateAfter,
  type Frame,
  type Pos,
  type RunResult,
} from "@/lib/games/bus/engine";
import type { Mood } from "./characters";
import {
  BLOCK_STYLE,
  BinaFace,
  BinaSide,
  BinaTop,
  BlockIcon,
  BridgePlanks,
  C,
  Clouds,
  Codey,
  Cone,
  Digger,
  FerryBoat,
  LightPiece,
  PassengerArt,
  StickerArt,
  ThingArt,
  Tile,
} from "./art";
import { initVoices, lineSpeaker, lineText, preloadChapter, say, setMuted, sfx, stopTalking, useVoiceState, type Speaker } from "./sound";
import { completeLevel, resetProgress, useBusProgress } from "./store";
import { UnlockModal, useLevelAccess, usePaidLevels } from "../level-lock";
import "./bus-buddies.css";

type Screen =
  | { name: "home" }
  | { name: "chapter"; chapter: number }
  | { name: "scene"; chapter: number; kind: "intro" | "outro" }
  | { name: "play"; levelId: string }
  | { name: "stickers" };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const STEP_MS = 650;
const ANIMALS: PassengerId[] = ["turtle", "duck", "owl"];
const isAnimal = (id: PassengerId) => ANIMALS.includes(id);
const ALL_IDS = CHAPTERS.flatMap((c) => c.levelIds);

/* ================================================================== */
/* Shell                                                                */
/* ================================================================== */

export function BusBuddies() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [asking, setAsking] = useState(false);
  const progress = useBusProgress();
  const access = useLevelAccess(BUS_PROGRAM);
  const paid = usePaidLevels<Level>("bus", access.unlocked);
  const levels = useMemo(() => [...FREE_LEVELS, ...(paid.levels ?? [])], [paid.levels]);
  const byId = useCallback((id: string) => levels.find((l) => l.id === id), [levels]);
  const loadedIn = useCallback((n: number) => levels.filter((l) => l.chapter === n), [levels]);

  useEffect(() => initVoices(), []);
  // Stop any voice when the screen changes or the game closes.
  useEffect(() => () => stopTalking(), [screen]);

  const openChapter = useCallback(
    (chapter: number) => {
      void preloadChapter(chapter);
      const list = loadedIn(chapter);
      const started = list.some((l) => progress.done.includes(l.id));
      setScreen(list.length && !started ? { name: "scene", chapter, kind: "intro" } : { name: "chapter", chapter });
    },
    [loadedIn, progress.done],
  );

  const play = () => {
    sfx.unlock();
    const nextId = ALL_IDS.find((id) => !progress.done.includes(id));
    openChapter(nextId ? Number(nextId.split("-")[0]) : 1);
  };

  const askUnlock = () => {
    void say("common.locked");
    setAsking(true);
  };

  return (
    <div className="bb-root relative min-h-[calc(100vh-10rem)] bg-[#001432] text-[#001432]" onPointerDown={() => sfx.unlock()}>
      <TopBar onHome={screen.name === "home" ? null : () => setScreen({ name: "home" })} />
      <div className="mx-auto max-w-[1180px] px-2 pb-6 sm:px-4">
        {screen.name === "home" ? (
          <Home onPlay={play} onChapter={openChapter} onStickers={() => setScreen({ name: "stickers" })} loaded={(n) => loadedIn(n).length > 0} />
        ) : null}
        {screen.name === "chapter" ? (
          <ChapterScreen
            chapter={screen.chapter}
            byId={byId}
            loading={access.unlocked && !paid.levels && !paid.failed}
            onLevel={(id) => setScreen({ name: "play", levelId: id })}
            onLocked={askUnlock}
            onStory={() => setScreen({ name: "scene", chapter: screen.chapter, kind: "intro" })}
          />
        ) : null}
        {screen.name === "scene" ? (
          <Scene
            key={`${screen.chapter}-${screen.kind}`}
            chapter={screen.chapter}
            kind={screen.kind}
            onDone={() => {
              if (screen.kind === "intro") {
                const list = loadedIn(screen.chapter);
                const first = list.find((l) => !progress.done.includes(l.id)) ?? list[0];
                setScreen(first ? { name: "play", levelId: first.id } : { name: "chapter", chapter: screen.chapter });
              } else setScreen({ name: "stickers" });
            }}
          />
        ) : null}
        {screen.name === "play" && byId(screen.levelId) ? (
          <Play
            key={screen.levelId}
            level={byId(screen.levelId)!}
            onNext={() => {
              const level = byId(screen.levelId)!;
              const ids = CHAPTERS.find((c) => c.n === level.chapter)!.levelIds;
              const nextId = ids[ids.indexOf(level.id) + 1];
              if (!nextId) setScreen({ name: "scene", chapter: level.chapter, kind: "outro" });
              else if (byId(nextId)) setScreen({ name: "play", levelId: nextId });
              else {
                setScreen({ name: "chapter", chapter: level.chapter });
                askUnlock();
              }
            }}
            onChapter={() => setScreen({ name: "chapter", chapter: byId(screen.levelId)!.chapter })}
          />
        ) : null}
        {screen.name === "stickers" ? <StickerBook onHome={() => setScreen({ name: "home" })} /> : null}
      </div>
      <div className="text-white">
        <UnlockModal open={asking} onClose={() => setAsking(false)} program={BUS_PROGRAM} free={BUS_FREE_LEVELS} onUnlock={access.markUnlocked} />
      </div>
    </div>
  );
}

/* ================================================================== */
/* Top bar: home, sound, grown-up corner                                */
/* ================================================================== */

function RoundButton({
  label,
  onClick,
  children,
  className = "",
  pressed,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      disabled={disabled}
      className={`focus-ring bb-block flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-[0_5px_0_rgba(0,0,0,0.25)] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function SpeakerIcon({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
      <path d="M6 15 h7 l10 -8 v26 l-10 -8 h-7 Z" fill="currentColor" />
      {off ? (
        <path d="M28 14 l9 12 M37 14 l-9 12" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M28 14 q5 6 0 12 M32 10 q9 10 0 20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
      <path d="M6 15 h6 l8 -7 v24 l-8 -7 h-6 Z" fill="currentColor" />
      <path d="M26 13 a8 8 0 1 1 -1 13" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M22 9 l5 4 l-5 4" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const UndoIcon = () => (
  <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
    <path d="M16 10 L6 20 L16 30 M7 20 H26 q8 0 8 8" stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function TopBar({ onHome }: { onHome: (() => void) | null }) {
  const { muted } = useVoiceState();
  return (
    <header className="mx-auto flex max-w-[1180px] items-center gap-3 px-2 py-3 sm:px-4">
      {onHome ? (
        <RoundButton label="Home" onClick={onHome} className="bg-[#F0D030] text-[#001432]">
          <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
            <path d="M6 20 L20 7 L34 20 V34 H24 V25 H16 V34 H6 Z" fill="currentColor" />
          </svg>
        </RoundButton>
      ) : (
        <Link href="/ship-it/" className="focus-ring rounded-full px-3 py-2 text-sm font-bold text-white/70 hover:text-white">
          ← Arcade
        </Link>
      )}
      <p className="font-display text-lg font-extrabold leading-tight text-white sm:text-2xl">
        Bus Buddies <span className="text-[#F0D030]">Road Trip</span>
      </p>
      <div className="ml-auto flex items-center gap-3">
        <RoundButton label={muted ? "Turn sound on" : "Turn sound off"} pressed={muted} onClick={() => setMuted(!muted)} className="bg-[#138A9A] text-white">
          <SpeakerIcon off={muted} />
        </RoundButton>
        <GrownUpCorner />
      </div>
    </header>
  );
}

/* ================================================================== */
/* Talking: speaker portrait + speech bubble                             */
/* ================================================================== */

/** How a character looks while saying a line: oops lines look worried, happy lines smile. */
function lineMood(id: string): Mood {
  if (/oops|too_short|full|missed|owl\.sleep|dead_end|which_way|too_long|ferry_dock|locked/.test(id)) return "oops";
  if (/happy|great|sticker|join|cheer|thanks|reward|honk|yay|got|party|song|arrive/.test(id)) return "happy";
  return "idle";
}

function Portrait({ who, talking, mood }: { who: Speaker; talking: boolean; mood: Mood }) {
  if (who === "codey") return <Codey talking={talking} mood={mood} />;
  if (who === "bina") return <BinaFace talking={talking} mood={mood} />;
  return <PassengerArt id={who} talking={talking} mood={mood} />;
}

/** Shows whoever is speaking, with the line in a bubble; a repeat button replays `promptId`. */
function Talker({ fallback, promptId }: { fallback: string; promptId?: string }) {
  const v = useVoiceState();
  const id = v.lineId ?? fallback;
  const who = v.speaker ?? lineSpeaker(id);
  const talking = !!v.speaker;
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`h-20 w-20 shrink-0 rounded-full bg-white/90 p-1 shadow-md sm:h-24 sm:w-24 ${talking ? "bb-speaking" : ""}`}>
        <Portrait who={who} talking={talking} mood={lineMood(id)} />
      </div>
      <div className="relative min-h-[64px] flex-1 rounded-3xl bg-white px-4 py-3 text-lg font-bold leading-snug text-[#001432] shadow-md sm:text-xl" aria-live="polite">
        <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" aria-hidden />
        {lineText(id)}
      </div>
      {promptId ? (
        <RoundButton label="Say it again" onClick={() => void say(promptId)} className="bg-[#7E57C2] text-white">
          <RepeatIcon />
        </RoundButton>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* Home                                                                 */
/* ================================================================== */

const CHAPTER_ICON = ["🌅", "🌊", "🚧", "🚦", "⛰️", "🎂"];

function Home({ onPlay, onChapter, onStickers, loaded }: { onPlay: () => void; onChapter: (n: number) => void; onStickers: () => void; loaded: (n: number) => boolean }) {
  const progress = useBusProgress();
  return (
    <div className="overflow-hidden rounded-[32px] bg-gradient-to-b from-[#BDE8FF] via-[#DFF4FF] to-[#B8E59A] p-4 sm:p-8">
      <div className="grid items-center gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="bb-drive-in">
          <div className="bb-float">
            <BinaSide mood="happy" riders={ANIMALS} driving />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="font-display text-4xl font-extrabold leading-none text-[#001432] sm:text-6xl">
            Bus Buddies
            <span className="block text-[#7E57C2]">Road Trip</span>
          </h1>
          <button
            type="button"
            onClick={() => {
              onPlay();
              void say("common.welcome");
            }}
            className="focus-ring bb-go mx-auto mt-6 flex h-28 w-56 items-center justify-center gap-3 rounded-full bg-[#2EB84B] font-display text-4xl font-extrabold text-white shadow-[0_8px_0_#1E7F33] md:mx-0"
            aria-label="Play"
          >
            <svg viewBox="0 0 40 40" className="h-12 w-12" aria-hidden>
              <path d="M12 8 L32 20 L12 32 Z" fill="#fff" />
            </svg>
            Play
          </button>
        </div>
      </div>

      <h2 className="sr-only">Trips</h2>
      <div className="relative mt-6 rounded-[28px] bg-white/60 p-4">
        <svg viewBox="0 0 600 60" preserveAspectRatio="none" className="absolute inset-x-4 top-1/2 h-10 w-[calc(100%-2rem)] -translate-y-1/2" aria-hidden>
          <path d="M0 30 Q75 0 150 30 T300 30 T450 30 T600 30" stroke={C.road} strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M0 30 Q75 0 150 30 T300 30 T450 30 T600 30" stroke="#fff" strokeWidth="3" strokeDasharray="10 10" fill="none" />
        </svg>
        <ol className="relative grid grid-cols-3 gap-3 sm:grid-cols-6">
          {CHAPTERS.map((ch, i) => {
            const done = ch.levelIds.every((id) => progress.done.includes(id));
            const locked = !loaded(ch.n);
            return (
              <li key={ch.n} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onChapter(ch.n)}
                  aria-label={`Trip ${ch.n}: ${ch.title}${locked ? " (class levels)" : ""}`}
                  className={`focus-ring bb-block relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 text-4xl shadow-[0_6px_0_rgba(0,0,0,0.2)] ${
                    locked ? "border-white/70 bg-white/70" : "border-[#F0D030] bg-white"
                  }`}
                >
                  <span aria-hidden className={locked ? "opacity-60" : ""}>
                    {CHAPTER_ICON[i]}
                  </span>
                  <span className="absolute -top-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#001432] text-base font-extrabold text-[#F0D030]">
                    {ch.n}
                  </span>
                  {locked ? (
                    <span className="absolute -bottom-1 -right-1 text-2xl" aria-hidden>
                      🔑
                    </span>
                  ) : null}
                  {done ? (
                    <span className="absolute -bottom-1 -right-1 text-2xl" aria-hidden>
                      ⭐
                    </span>
                  ) : null}
                </button>
                <span className="mt-2 text-center text-xs font-bold text-[#001432]/70">{ch.title}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={onStickers}
          className="focus-ring bb-block flex h-20 items-center gap-3 rounded-full bg-[#7E57C2] px-6 font-display text-2xl font-extrabold text-white shadow-[0_6px_0_#5B3D99]"
        >
          <span className="text-4xl" aria-hidden>
            📒
          </span>
          Stickers <span className="rounded-full bg-white/25 px-3 py-1 text-lg">{progress.done.filter((id) => ALL_IDS.includes(id)).length}</span>
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Chapter: pick a level                                                */
/* ================================================================== */

function ChapterScreen({
  chapter,
  byId,
  loading,
  onLevel,
  onLocked,
  onStory,
}: {
  chapter: number;
  byId: (id: string) => Level | undefined;
  loading: boolean;
  onLevel: (id: string) => void;
  onLocked: () => void;
  onStory: () => void;
}) {
  const progress = useBusProgress();
  const ch = CHAPTERS.find((c) => c.n === chapter)!;
  const nextId = ch.levelIds.find((id) => !progress.done.includes(id) && byId(id));
  const anyLoaded = ch.levelIds.some((id) => byId(id));
  useEffect(() => {
    void say(anyLoaded ? "common.pick_chapter" : "common.locked");
  }, [anyLoaded]);
  return (
    <div className={`rounded-[32px] bg-gradient-to-b p-4 sm:p-8 ${BACKDROP_BG[chapter - 1]}`}>
      <Talker fallback="common.pick_chapter" />
      <h1 className="mt-5 text-center font-display text-3xl font-extrabold">
        Trip {ch.n}: {ch.title}
      </h1>
      <ol className="mt-6 flex flex-wrap items-center justify-center gap-5">
        {ch.levelIds.map((id, i) => {
          const level = byId(id);
          const done = progress.done.includes(id);
          const open = !!level && (done || i === 0 || progress.done.includes(ch.levelIds[i - 1]));
          const classLevel = !level;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={!classLevel && !open}
                onClick={() => (classLevel ? (loading ? undefined : onLocked()) : onLevel(id))}
                aria-label={`Level ${i + 1}${level ? `: ${level.title}` : ""}${done ? " (done)" : ""}${classLevel ? " (class level, needs the class password)" : ""}`}
                className={`focus-ring bb-block relative h-32 w-32 rounded-full bg-white p-2 shadow-[0_6px_0_rgba(0,0,0,0.2)] disabled:opacity-40 ${id === nextId ? "bb-pulse" : ""}`}
              >
                {done ? (
                  <StickerArt art={ch.stickers[i]} />
                ) : (
                  <span className={`flex h-full w-full items-center justify-center rounded-full font-display text-5xl font-extrabold text-[#001432] ${classLevel ? "bg-[#E8EAF2]" : "bg-[#FFF4C2]"}`}>
                    {classLevel && loading ? "…" : i + 1}
                  </span>
                )}
                {classLevel ? (
                  <span className="absolute -bottom-1 -right-1 text-3xl" aria-hidden>
                    🔑
                  </span>
                ) : !open ? (
                  <span className="absolute -bottom-1 -right-1 text-3xl" aria-hidden>
                    🔒
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {anyLoaded ? (
          <button type="button" onClick={onStory} className="focus-ring bb-block flex h-16 items-center gap-2 rounded-full bg-white px-5 font-bold shadow-[0_5px_0_rgba(0,0,0,0.15)]">
            <span className="text-3xl" aria-hidden>
              📖
            </span>
            Watch the story
          </button>
        ) : null}
        {ch.levelIds.some((id) => !byId(id)) && !loading ? (
          <button type="button" onClick={onLocked} className="focus-ring bb-block flex h-16 items-center gap-2 rounded-full bg-[#F0D030] px-5 font-bold shadow-[0_5px_0_#C9A90F]">
            <span className="text-3xl" aria-hidden>
              🔑
            </span>
            Grown-ups: unlock with the class password
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Story scenes                                                         */
/* ================================================================== */

const BACKDROP_BG = [
  "from-[#9AD8FF] via-[#D7F0FF] to-[#FFF1C9]",
  "from-[#8FD3FF] via-[#CFEFFF] to-[#B9E8FF]",
  "from-[#BFE3FF] via-[#E6F4FF] to-[#FFE3C2]",
  "from-[#A9D8FF] via-[#E1F1FF] to-[#E8E8F5]",
  "from-[#9EC9F5] via-[#D9ECFF] to-[#E3EEF8]",
  "from-[#D9C9FF] via-[#FFE1F0] to-[#FFF1C9]",
];

function Backdrop({ chapter }: { chapter: number }) {
  return (
    <svg viewBox="0 0 800 260" className="absolute inset-x-0 bottom-0 w-full" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {chapter === 5 ? (
        <g>
          <path d="M0 150 L120 40 L220 130 L330 20 L460 140 L560 50 L700 150 L800 70 V260 H0 Z" fill="#8E9AAF" />
          <path d="M120 40 L150 68 L132 62 L120 78 L106 64 Z M330 20 L362 52 L342 46 L330 62 L316 48 Z M560 50 L590 78 L572 72 L560 88 L546 74 Z" fill="#fff" />
        </g>
      ) : null}
      {chapter === 4 ? (
        <g>
          {[
            [30, 90, 70, "#FFCCBC"],
            [110, 60, 90, "#B3E5FC"],
            [210, 100, 60, "#FFF9C4"],
            [560, 70, 80, "#D1C4E9"],
            [650, 50, 100, "#FFCCBC"],
            [740, 95, 60, "#B3E5FC"],
          ].map(([x, y, w, c]) => (
            <g key={String(x)}>
              <rect x={x as number} y={y as number} width={w as number} height={200} rx="8" fill={c as string} />
              {[0, 1, 2].map((r) => (
                <rect key={r} x={(x as number) + 12} y={(y as number) + 16 + r * 30} width={(w as number) - 24} height="14" rx="3" fill="#ffffffaa" />
              ))}
            </g>
          ))}
          <g transform="translate(470 120)">
            <rect x="0" y="0" width="6" height="70" fill="#546E7A" />
            <rect x="-12" y="-46" width="30" height="54" rx="8" fill={C.navy} />
            <circle cx="3" cy="-32" r="9" fill="#FF5252" className="bb-light-on" />
            <circle cx="3" cy="-8" r="9" fill="#1E3A1E" />
          </g>
        </g>
      ) : null}
      {chapter === 6 ? (
        <g>
          <rect x="560" y="70" width="190" height="150" rx="8" fill="#E57373" />
          <path d="M545 80 L655 10 L765 80 Z" fill="#C62828" />
          <rect x="625" y="130" width="60" height="90" rx="6" fill="#FFE0B2" />
          <path d="M0 40 Q200 90 400 40 T800 40" stroke={C.purple} strokeWidth="2" fill="none" />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M${i * 50 + 10} ${44 + Math.sin(i) * 8} l12 22 l12 -22 Z`} fill={[C.gold, C.teal, C.pink, C.purple][i % 4]} />
          ))}
          {[
            [80, 110, C.red],
            [140, 90, C.teal],
            [500, 100, C.gold],
          ].map(([x, y, c]) => (
            <g key={String(x)} className="bb-balloon">
              <path d={`M${x} ${(y as number) + 22} v60`} stroke="#90A4AE" strokeWidth="2" />
              <ellipse cx={x as number} cy={y as number} rx="18" ry="22" fill={c as string} />
            </g>
          ))}
        </g>
      ) : null}
      <path d="M0 170 Q200 110 400 160 T800 140 V260 H0 Z" fill={chapter === 5 ? "#9CCB7E" : "#9BD67A"} />
      {chapter === 2 ? (
        <g>
          <path d="M380 190 Q560 150 800 170 V220 H380 Z" fill="#4FC3F7" />
          <path d="M440 185 q10 -6 20 0 M560 175 q10 -6 20 0 M680 182 q10 -6 20 0" stroke="#fff" strokeWidth="3" fill="none" />
          <g className="bb-bob-water" style={{ transformOrigin: "600px 180px" }}>
            <ellipse cx="600" cy="180" rx="16" ry="9" fill="#FFF6C8" />
            <circle cx="612" cy="170" r="7" fill="#FFF6C8" />
            <path d="M618 170 l7 1 -7 3 Z" fill={C.orange} />
          </g>
        </g>
      ) : null}
      {chapter === 3 ? (
        <g>
          <g transform="translate(600 112)">
            <Digger ox={0} oy={0} s={1.1} />
          </g>
          {[60, 130, 470].map((x) => (
            <g key={x} transform={`translate(${x - 50} 128)`}>
              <Cone x={0} y={0} />
            </g>
          ))}
        </g>
      ) : null}
      <path d="M0 210 Q300 180 800 200 V260 H0 Z" fill="#7CC35E" />
      <rect x="0" y="216" width="800" height="30" fill={C.road} />
      <path d="M0 231 H800" stroke="#fff" strokeWidth="3" strokeDasharray="20 18" />
    </svg>
  );
}

function Scene({ chapter, kind, onDone }: { chapter: number; kind: "intro" | "outro"; onDone: () => void }) {
  const ch = CHAPTERS.find((c) => c.n === chapter)!;
  const lines = kind === "intro" ? ch.intro : ch.outro;
  const party = chapter === 6 && kind === "outro";
  const [i, setI] = useState(0);
  const [ended, setEnded] = useState(false);
  const sang = useRef(false);
  const v = useVoiceState();

  useEffect(() => {
    void preloadChapter(chapter);
    if (kind === "outro") sfx.cheer();
  }, [chapter, kind]);

  useEffect(() => {
    let alive = true;
    if (party && lines[i].startsWith("ch6.song") && !sang.current) {
      sang.current = true;
      sfx.song();
    }
    void say(lines[i]).then(async () => {
      await sleep(350);
      if (!alive) return;
      if (i + 1 < lines.length) setI(i + 1);
      else setEnded(true);
    });
    return () => {
      alive = false;
    };
  }, [i, lines, party]);

  const who = v.speaker ?? lineSpeaker(lines[i]);
  const talking = !!v.speaker;
  const riders: PassengerId[] = chapter === 1 && kind === "intro" ? [] : ANIMALS;
  const singing = party && lines[i].startsWith("ch6.song");
  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-b ${BACKDROP_BG[chapter - 1]}`}>
      {kind === "outro" ? <Confetti /> : null}
      <Backdrop chapter={chapter} />
      {chapter !== 4 && chapter !== 6 ? <div className="absolute right-[8%] top-6 h-20 w-20 rounded-full bg-[#FFE066] shadow-[0_0_60px_20px_#FFE06688]" aria-hidden /> : null}
      <div className="relative grid min-h-[540px] grid-rows-[auto_1fr] gap-4 p-4 sm:p-8">
        <div className="mx-auto w-full max-w-2xl">
          <Talker fallback={lines[i]} />
        </div>
        {party ? (
          <div className="flex items-end justify-center gap-1 pb-10 sm:gap-4">
            <div className="w-[min(320px,38%)]">
              <BinaSide talking={who === "bina" && talking} mood="happy" />
            </div>
            {ANIMALS.map((id) => (
              <div key={id} className="relative w-16 sm:w-28">
                {singing ? <MusicNotes /> : null}
                <PassengerArt id={id} talking={who === id && talking} mood="happy" />
              </div>
            ))}
            <div className="hidden w-24 sm:block">
              <ThingArt id="cake" mood="happy" />
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-center gap-4 pb-8">
            <div className="bb-drive-in w-[min(560px,72%)]">
              <BinaSide
                talking={who === "bina" && talking}
                mood={kind === "outro" ? "happy" : who === "bina" ? lineMood(lines[i]) : "idle"}
                riders={riders}
                driving={!ended && kind === "intro" && i === 0}
              />
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-4 right-4 flex gap-3">
        {!ended ? (
          <RoundButton label="Next" onClick={() => (i + 1 < lines.length ? setI(i + 1) : setEnded(true))} className="bg-white text-[#001432]">
            <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
              <path d="M10 20 H30 M22 11 L31 20 L22 29" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </RoundButton>
        ) : (
          <button
            type="button"
            onClick={() => {
              stopTalking();
              onDone();
            }}
            className="focus-ring bb-go flex h-24 items-center gap-2 rounded-full bg-[#2EB84B] px-8 font-display text-3xl font-extrabold text-white shadow-[0_7px_0_#1E7F33]"
          >
            {kind === "intro" ? "Let's go!" : "My stickers"}
            <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden>
              <path d="M12 8 L32 20 L12 32 Z" fill="#fff" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function MusicNotes() {
  return (
    <svg viewBox="0 0 60 60" className="bb-notes absolute -top-10 left-1/2 h-12 w-12 -translate-x-1/2" aria-hidden>
      <path d="M14 40 V14 l20 -6 v26" stroke={C.purple} strokeWidth="4" fill="none" />
      <ellipse cx="10" cy="42" rx="6" ry="5" fill={C.purple} />
      <ellipse cx="30" cy="36" rx="6" ry="5" fill={C.purple} />
    </svg>
  );
}

/* ================================================================== */
/* Playing a level                                                      */
/* ================================================================== */

interface BusView {
  x: number;
  y: number;
  angle: number;
  mood?: "wobble" | "happy";
  ferrying?: boolean;
}

/** Where the ferry waits: in the water next to the dock farthest from the start. */
function farDockWater(level: Level): Pos | null {
  const s = startState(level);
  let best: Pos | null = null;
  let bestD = -1;
  level.map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const d = Math.abs(x - s.x) + Math.abs(y - s.y);
      if (ch === "k" && d > bestD) {
        bestD = d;
        best = { x, y };
      }
    }),
  );
  const b = best as Pos | null;
  if (!b) return null;
  for (let d = 0; d < 4; d++) if (level.map[b.y + DY[d]]?.[b.x + DX[d]] === "w") return { x: b.x + DX[d], y: b.y + DY[d] };
  return null;
}

function Play({ level, onNext, onChapter }: { level: Level; onNext: () => void; onChapter: () => void }) {
  const cones = level.mode === "cones";
  const start = useMemo(() => startState(level), [level]);
  const ferryHome = useMemo(() => farDockWater(level), [level]);
  const bodyMax = level.repeatBody ?? 3;
  const [program, setProgram] = useState<Program>([]);
  /** Index of the Repeat that new blocks go into, or null. */
  const [openRep, setOpenRep] = useState<number | null>(null);
  const [placed, setPlaced] = useState<Pos[]>([]);
  const [bus, setBus] = useState<BusView>({ x: start.x, y: start.y, angle: start.angle });
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [blame, setBlame] = useState<string | null>(null);
  const [aboard, setAboard] = useState<PassengerId[]>(level.riding);
  const [boarding, setBoarding] = useState<PassengerId | null>(null);
  const [woken, setWoken] = useState<PassengerId[]>([]);
  const [bridges, setBridges] = useState<{ x: number; y: number; horizontal: boolean }[]>([]);
  const [ferry, setFerry] = useState<Pos | null>(ferryHome);
  const [ferryMoving, setFerryMoving] = useState(false);
  const [tick, setTick] = useState(0);
  const [honking, setHonking] = useState(false);
  const [fails, setFails] = useState(0);
  const [won, setWon] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const alive = useRef(true);
  const chapter = CHAPTERS.find((c) => c.n === level.chapter)!;
  const levelNo = chapter.levelIds.indexOf(level.id) + 1;

  useEffect(() => {
    alive.current = true;
    void preloadChapter(level.chapter);
    void (async () => {
      await say(level.prompt);
      for (const p of level.passengers) if (p.waitingLine && p.needs === "honk" && alive.current) await say(p.waitingLine);
      if (cones && alive.current) await say("common.cones_tap");
    })();
    return () => {
      alive.current = false;
      stopTalking();
    };
  }, [level, cones]);

  const resetWorld = () => {
    setBus({ x: start.x, y: start.y, angle: start.angle });
    setAboard(level.riding);
    setWoken([]);
    setBridges([]);
    setFerry(ferryHome);
    setTick(0);
    setBlame(null);
    setActive(null);
  };

  const used = pieces(program);
  const full = used >= level.maxBlocks;
  const dirs = useMemo(() => headings(level, program), [level, program]);
  const locked = running || won;

  const edit = (next: Program, open: number | null) => {
    if (locked) return;
    resetWorld();
    setProgram(next);
    setOpenRep(open);
  };

  const add = (b: PaletteBlock) => {
    if (locked) return;
    if (full) {
      void say("common.full");
      sfx.boing();
      return;
    }
    sfx.pop();
    if (b === "repeat") {
      if (!program.some((it) => typeof it !== "string")) void say("common.repeat_tip");
      edit([...program, { repeat: 2, body: [] }], program.length);
      return;
    }
    const target = openRep !== null ? program[openRep] : undefined;
    if (openRep !== null && target && typeof target !== "string" && target.body.length < bodyMax) {
      const body = [...target.body, b];
      edit(
        program.map((it, i) => (i === openRep ? { ...target, body } : it)),
        body.length >= bodyMax ? null : openRep,
      );
      return;
    }
    edit([...program, b], null);
  };

  const undo = () => {
    if (locked) return;
    const target = openRep !== null ? program[openRep] : undefined;
    if (openRep !== null && target && typeof target !== "string" && target.body.length) {
      sfx.remove();
      edit(
        program.map((it, i) => (i === openRep ? { ...target, body: target.body.slice(0, -1) } : it)),
        openRep,
      );
      return;
    }
    if (!program.length) return;
    sfx.remove();
    edit(program.slice(0, -1), null);
  };

  const removeAt = (path: string) => {
    sfx.remove();
    const [i, j] = path.split(".").map(Number);
    if (Number.isNaN(j) || j === undefined) {
      edit(
        program.filter((_, k) => k !== i),
        openRep === i ? null : openRep !== null && openRep > i ? openRep - 1 : openRep,
      );
    } else {
      const rep = program[i];
      if (typeof rep === "string") return;
      edit(
        program.map((it, k) => (k === i ? { ...rep, body: rep.body.filter((_, m) => m !== j) } : it)),
        i,
      );
    }
  };

  const toggleCone = (x: number, y: number) => {
    if (locked || !coneSpot(level, x, y)) return;
    const has = placed.some((p) => p.x === x && p.y === y);
    if (!has && placed.length >= (level.cones ?? 0)) {
      void say("common.cones_full");
      sfx.boing();
      return;
    }
    sfx.cone();
    resetWorld();
    setPlaced(has ? placed.filter((p) => p.x !== x || p.y !== y) : [...placed, { x, y }]);
  };

  // Hints: after 2 tries a ghost shows the next move; after 4 Codey offers to do it.
  const hint = fails >= 2 && !locked && !cones ? nextCorrect(level, program) : null;
  const ghostState = hint ? stateAfter(level, level.solution.slice(0, hint.index)) : null;
  const hintBlock = hint ? firstBlock(hint.item) : null;
  const coneHint = fails >= 2 && !locked && cones ? nextCone(level, placed) : null;
  const canHelp = fails >= 4 && !locked && (cones ? !!coneHint : !!hint);

  const help = () => {
    sfx.pop();
    if (cones && coneHint) {
      resetWorld();
      const keep = placed.filter((p) => level.coneSolution?.some(([x, y]) => x === p.x && y === p.y));
      setPlaced([...keep, coneHint]);
    } else if (hint) edit([...program.slice(0, hint.index), hint.item], null);
    void say("common.help_done");
  };

  async function animateFrame(f: Frame) {
    setTick(f.tick);
    if (f.bump) {
      sfx.vroom();
      setBus({ x: f.x + (f.bump.x - f.x) * 0.38, y: f.y + (f.bump.y - f.y) * 0.38, angle: f.angle });
      await sleep(380);
      if (level.map[f.bump.y]?.[f.bump.x] === "w") sfx.splash();
      else sfx.boing();
      setBus({ x: f.x, y: f.y, angle: f.angle, mood: "wobble" });
      await sleep(500);
      return;
    }
    if (f.block === "forward") sfx.vroom();
    if (f.block === "left" || f.block === "right") sfx.turn();
    if (f.block === "wait") sfx.tick();
    if (f.block === "honk") {
      sfx.honk();
      setHonking(true);
      setTimeout(() => setHonking(false), 700);
    }
    if (f.block === "pickup" && !f.boarded) sfx.pop();
    if (f.bridge) {
      sfx.build();
      setBridges((b) => [...b, { x: f.bridge!.x, y: f.bridge!.y, horizontal: f.dir % 2 === 1 }]);
      await sleep(STEP_MS);
      setTick(f.tick + 1);
      return;
    }
    if (f.ferry) {
      // The ferry sails over to Bina's dock, then carries her across.
      sfx.ferryHorn();
      setFerryMoving(false);
      setFerry({ x: f.ferry.from.x + DX[f.dir], y: f.ferry.from.y + DY[f.dir] });
      await sleep(1000);
      setFerryMoving(true);
      setBus({ x: f.ferry.from.x + DX[f.dir] * 0.6, y: f.ferry.from.y + DY[f.dir] * 0.6, angle: f.angle, ferrying: true });
      await sleep(450);
      setFerry({ x: f.x - DX[f.dir], y: f.y - DY[f.dir] });
      setBus({ x: f.x - DX[f.dir] * 0.4, y: f.y - DY[f.dir] * 0.4, angle: f.angle, ferrying: true });
      await sleep(1200);
      setFerryMoving(false);
      setBus({ x: f.x, y: f.y, angle: f.angle });
      await sleep(500);
      setTick(f.tick + 1);
      return;
    }
    setBus({ x: f.x, y: f.y, angle: f.angle });
    await sleep(STEP_MS);
    setTick(f.tick + 1);
  }

  const go = async () => {
    if (locked) return;
    sfx.unlock();
    if (!cones && !program.length) {
      void say("common.add_blocks");
      return;
    }
    stopTalking();
    resetWorld();
    setOpenRep(null);
    setRunning(true);
    await sleep(250);
    const result: RunResult = cones ? autopilot(level, placed) : run(level, program);
    let riding = [...level.riding];
    for (const f of result.frames) {
      if (!alive.current) return;
      setActive(f.path || null);
      if (f.woke) setWoken((w) => [...w, f.woke!]);
      await animateFrame(f);
      if (f.boarded) {
        setBoarding(f.boarded);
        sfx.board();
        await sleep(650);
        riding = [...riding, f.boarded];
        setAboard(riding);
        setBoarding(null);
        const p = level.passengers.find((q) => q.id === f.boarded)!;
        await say(p.boardLine);
      }
    }
    if (!alive.current) return;
    setActive(null);
    const outcome = result.outcome;
    if (outcome.ok) {
      setWon(true);
      setBus((b) => ({ ...b, mood: "happy" }));
      sfx.cheer();
      await say(level.successLine);
      if (!alive.current) return;
      completeLevel(level.id, level.sticker.id);
      sfx.sticker();
      setShowSticker(true);
      await say("common.sticker");
    } else {
      setBlame(outcome.blame);
      setBus((b) => ({ ...b, mood: "wobble" }));
      const tries = fails + 1;
      setFails(tries);
      setRunning(false);
      await say(outcome.line);
      if (!alive.current) return;
      if (tries >= 4) await say("common.help_offer");
      else if (tries >= 2) await say("common.hint_offer");
      else await say("common.try_again");
    }
    setRunning(false);
  };

  const animalsAboard = aboard.filter(isAnimal);
  const thingsAboard = aboard.filter((id) => !isAnimal(id)) as ThingId[];

  return (
    <div className={`rounded-[32px] bg-gradient-to-b p-3 sm:p-5 ${BACKDROP_BG[level.chapter - 1]}`}>
      {won ? <Confetti /> : null}
      <div className="mb-3 flex items-center gap-3">
        <button type="button" onClick={onChapter} className="focus-ring flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-2" aria-label="All levels in this trip">
          {chapter.levelIds.map((id, i) => (
            <span key={id} className={`h-4 w-4 rounded-full ${i + 1 === levelNo ? "bg-[#7E57C2] ring-4 ring-[#7E57C2]/30" : i + 1 < levelNo ? "bg-[#2EB84B]" : "bg-[#001432]/20"}`} />
          ))}
        </button>
        <p className="truncate font-display text-lg font-extrabold text-[#001432]/80">{level.title}</p>
      </div>

      <div className="grid gap-4 [@media(orientation:landscape)_and_(min-width:860px)]:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
        <div className="mx-auto w-full max-w-[min(100%,46vh)] [@media(orientation:landscape)]:max-w-[min(100%,72vh)]">
          <MapView
            level={level}
            bus={bus}
            aboard={aboard}
            boarding={boarding}
            woken={woken}
            honking={honking}
            bridges={bridges}
            ferry={ferry}
            ferryMoving={ferryMoving}
            tick={tick}
            cones={cones ? { placed, onTap: toggleCone, ghost: coneHint, enabled: !locked } : null}
            ghost={ghostState && hintBlock ? { ...ghostState, block: hintBlock } : null}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Talker fallback={level.prompt} promptId={level.prompt} />

          <div className="flex items-center gap-2 rounded-3xl bg-white/60 p-2">
            <div className="w-28 shrink-0" aria-label={`On the bus: ${aboard.length ? aboard.join(", ") : "nobody yet"}`}>
              <BinaSide riders={animalsAboard} mood={bus.mood === "happy" ? "happy" : bus.mood === "wobble" ? "oops" : "idle"} />
              {thingsAboard.length ? (
                <div className="mt-1 flex justify-center gap-1">
                  {thingsAboard.map((id) => (
                    <span key={id} className="h-9 w-9">
                      <ThingArt id={id} />
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            {cones ? (
              <ConeTray left={(level.cones ?? 0) - placed.length} total={level.cones ?? 0} />
            ) : (
              <ProgramStrip
                program={program}
                dirs={dirs.byPath}
                max={level.maxBlocks}
                used={used}
                open={openRep}
                bodyMax={bodyMax}
                active={active}
                blame={blame}
                hintIndex={hint && hint.index < program.length ? hint.index : null}
                disabled={locked}
                onRemove={removeAt}
                onCount={(i) => {
                  const rep = program[i];
                  if (typeof rep === "string") return;
                  sfx.pop();
                  edit(
                    program.map((it, k) => (k === i ? { ...rep, repeat: rep.repeat === 2 ? 3 : 2 } : it)),
                    openRep,
                  );
                }}
                onOpen={(i) => setOpenRep(openRep === i ? null : i)}
              />
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {!cones ? (
              <div className="flex flex-wrap gap-3" role="group" aria-label="Blocks">
                {level.blocks.map((b) => {
                  const isHint = !!hint && (typeof hint.item === "string" ? hint.item === b : b === "repeat");
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => add(b)}
                      disabled={locked}
                      aria-label={`Add ${BLOCK_STYLE[b].label}`}
                      className={`focus-ring bb-block h-20 w-20 rounded-2xl p-2 shadow-[0_6px_0_rgba(0,0,0,0.25)] disabled:opacity-50 ${isHint ? "bb-pulse" : ""}`}
                      style={{ background: BLOCK_STYLE[b].color }}
                    >
                      <BlockIcon block={b} dir={dirs.end} />
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div className="ml-auto flex items-center gap-3">
              <RoundButton
                label={cones ? "Take away all the cones" : "Take away the last block"}
                onClick={() => {
                  if (!cones) return undo();
                  if (locked || !placed.length) return;
                  sfx.remove();
                  resetWorld();
                  setPlaced([]);
                }}
                className="bg-white text-[#001432]"
              >
                <UndoIcon />
              </RoundButton>
              <button
                type="button"
                onClick={go}
                disabled={locked}
                aria-label="Go"
                className="focus-ring bb-go flex h-28 w-28 items-center justify-center rounded-full bg-[#2EB84B] font-display text-4xl font-extrabold text-white shadow-[0_8px_0_#1E7F33] disabled:opacity-60"
              >
                GO
              </button>
            </div>
          </div>

          {canHelp ? (
            <button type="button" onClick={help} className="focus-ring bb-block bb-pulse flex h-16 items-center gap-3 self-start rounded-full bg-[#F0D030] pl-1 pr-5 font-bold shadow-[0_5px_0_#C9A90F]">
              <span className="h-14 w-14 rounded-full bg-white">
                <Codey />
              </span>
              {cones ? "Put a cone down for me" : "Add the next block for me"}
            </button>
          ) : null}
        </div>
      </div>

      {showSticker ? <StickerReward level={level} isLast={levelNo === chapter.levelIds.length} onNext={onNext} /> : null}
    </div>
  );
}

function ConeTray({ left, total }: { left: number; total: number }) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2" aria-label={`${left} of ${total} cones left`}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 100 100" className={`h-16 w-16 ${i < left ? "" : "opacity-25"}`} aria-hidden>
          <Cone x={0} y={0} />
        </svg>
      ))}
    </div>
  );
}

function StripBlock({
  block,
  dir,
  label,
  active,
  glow,
  small,
  disabled,
  onTap,
}: {
  block: Block;
  dir: number;
  label: string;
  active: boolean;
  glow: boolean;
  small?: boolean;
  disabled?: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-label={label}
      className={`focus-ring bb-block bb-pop-in relative rounded-2xl p-1.5 shadow-[0_4px_0_rgba(0,0,0,0.25)] ${small ? "h-14 w-14" : "h-16 w-16"} ${active ? "bb-running" : ""} ${glow ? "bb-blame" : ""}`}
      style={{ background: BLOCK_STYLE[block].color }}
    >
      <BlockIcon block={block} dir={dir} />
    </button>
  );
}

function ProgramStrip({
  program,
  dirs,
  max,
  used,
  open,
  bodyMax,
  active,
  blame,
  hintIndex,
  disabled,
  onRemove,
  onCount,
  onOpen,
}: {
  program: Program;
  dirs: Record<string, number>;
  max: number;
  used: number;
  open: number | null;
  bodyMax: number;
  active: string | null;
  blame: string | null;
  hintIndex: number | null;
  disabled: boolean;
  onRemove: (path: string) => void;
  onCount: (i: number) => void;
  onOpen: (i: number) => void;
}) {
  const free = Math.max(0, max - used);
  return (
    <ol className="flex flex-1 flex-wrap items-center gap-2" aria-label={`Your program: ${used} of ${max} slots used`}>
      {program.map((item: Item, i) => {
        if (typeof item === "string") {
          return (
            <li key={i}>
              <StripBlock
                block={item}
                dir={dirs[`${i}`] ?? 0}
                label={`Step ${i + 1}: ${BLOCK_STYLE[item].label}. Tap to take it away.`}
                active={active === `${i}`}
                glow={blame === `${i}` || hintIndex === i}
                disabled={disabled}
                onTap={() => onRemove(`${i}`)}
              />
            </li>
          );
        }
        const isOpen = open === i;
        return (
          <li
            key={i}
            className={`bb-pop-in flex flex-wrap items-center gap-1.5 rounded-3xl border-4 p-1.5 ${isOpen ? "border-[#FF7A2F] bg-[#FFE6D6]" : "border-[#FF7A2F]/60 bg-[#FFF1E8]"} ${hintIndex === i ? "bb-blame" : ""}`}
          >
            <button
              type="button"
              onClick={() => onCount(i)}
              disabled={disabled}
              aria-label={`Repeat ${item.repeat} times. Tap to change.`}
              className="focus-ring bb-block flex h-14 w-16 flex-col items-center justify-center rounded-2xl bg-[#FF7A2F] font-display text-xl font-extrabold leading-none text-white shadow-[0_4px_0_rgba(0,0,0,0.2)]"
            >
              <span className="h-6 w-6">
                <BlockIcon block="repeat" />
              </span>
              ×{item.repeat}
            </button>
            {item.body.map((b, j) => (
              <StripBlock
                key={j}
                small
                block={b}
                dir={dirs[`${i}.${j}`] ?? 0}
                label={`Inside Repeat: ${BLOCK_STYLE[b].label}. Tap to take it away.`}
                active={active === `${i}.${j}`}
                glow={blame === `${i}.${j}`}
                disabled={disabled}
                onTap={() => onRemove(`${i}.${j}`)}
              />
            ))}
            {item.body.length < bodyMax ? (
              <button
                type="button"
                onClick={() => onOpen(i)}
                disabled={disabled}
                aria-label={isOpen ? "New blocks go inside this Repeat. Tap to stop." : "Tap to put new blocks inside this Repeat"}
                className={`focus-ring flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-dashed text-2xl font-extrabold ${isOpen ? "bb-pulse border-[#FF7A2F] bg-white text-[#FF7A2F]" : "border-[#FF7A2F]/40 text-[#FF7A2F]/60"}`}
              >
                {isOpen ? "✓" : "+"}
              </button>
            ) : null}
          </li>
        );
      })}
      {Array.from({ length: open !== null ? 0 : free }, (_, i) => (
        <li key={`e${i}`} className={`h-16 w-16 rounded-2xl border-4 border-dashed border-[#001432]/20 ${i === 0 ? "bg-white/70" : ""}`} aria-hidden />
      ))}
    </ol>
  );
}

/* ================================================================== */
/* The map                                                              */
/* ================================================================== */

function MapView({
  level,
  bus,
  aboard,
  boarding,
  woken,
  honking,
  bridges,
  ferry,
  ferryMoving,
  tick,
  cones,
  ghost,
}: {
  level: Level;
  bus: BusView;
  aboard: PassengerId[];
  boarding: PassengerId | null;
  woken: PassengerId[];
  honking: boolean;
  bridges: { x: number; y: number; horizontal: boolean }[];
  ferry: Pos | null;
  ferryMoving: boolean;
  tick: number;
  cones: { placed: Pos[]; onTap: (x: number, y: number) => void; ghost: Pos | null; enabled: boolean } | null;
  ghost: { x: number; y: number; dir: number; angle: number; block: Block } | null;
}) {
  const rows = level.map.length;
  const cols = level.map[0].length;
  const bridgeSet = useMemo(() => new Set(bridges.map((b) => `${b.x},${b.y}`)), [bridges]);
  const near = (x: number, y: number) => Math.abs(Math.round(bus.x) - x) + Math.abs(Math.round(bus.y) - y) === 1;
  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border-[6px] border-white shadow-xl" style={{ aspectRatio: `${cols} / ${rows}` }}>
      <svg viewBox={`0 0 ${cols * 100} ${rows * 100}`} className="block h-full w-full" role="img" aria-label="Map of the road">
        {level.map.map((row, y) => [...row].map((_, x) => <Tile key={`${x}-${y}`} level={level} x={x} y={y} bridges={bridgeSet} waving={row[x] === "c" && near(x, y)} />))}
        {bridges.map((b) => (
          <BridgePlanks key={`${b.x},${b.y}`} {...b} />
        ))}

        {level.lights?.map((l) => {
          const at = findChar(level, l.ch)!;
          const red = isRed(level, l.ch, tick);
          return <LightPiece key={l.ch} x={at.x} y={at.y} kind={l.kind} red={red} left={Math.max(0, l.red - tick)} />;
        })}

        {/* Cones levels: tap a road square to put a cone on it */}
        {cones
          ? level.map.map((row, y) =>
              [...row].map((_, x) =>
                coneSpot(level, x, y) ? (
                  <rect
                    key={`c${x}-${y}`}
                    x={x * 100 + 8}
                    y={y * 100 + 8}
                    width="84"
                    height="84"
                    rx="18"
                    fill="#fff"
                    fillOpacity={0.001}
                    stroke="#fff"
                    strokeOpacity={cones.enabled ? 0.6 : 0}
                    strokeWidth="4"
                    strokeDasharray="10 8"
                    className={cones.enabled ? "cursor-pointer" : ""}
                    role="button"
                    aria-label={`Road square ${x + 1}, ${y + 1}${cones.placed.some((p) => p.x === x && p.y === y) ? ": has a cone, tap to take it away" : ": tap to put a cone"}`}
                    onClick={() => cones.onTap(x, y)}
                  />
                ) : null,
              ),
            )
          : null}
        {cones?.placed.map((p) => (
          <g key={`cone${p.x},${p.y}`} pointerEvents="none">
            <Cone x={p.x} y={p.y} />
          </g>
        ))}
        {cones?.ghost ? (
          <g pointerEvents="none">
            <Cone x={cones.ghost.x} y={cones.ghost.y} ghost />
          </g>
        ) : null}

        <Clouds width={cols * 100} />

        {/* Friends and things waiting at their stops */}
        {level.passengers.map((p) => {
          if (aboard.includes(p.id) && boarding !== p.id) return null;
          const at = findChar(level, p.stop)!;
          const asleep = p.needs === "honk" && !woken.includes(p.id);
          const close = Math.abs(bus.x - at.x) + Math.abs(bus.y - at.y) <= 1.01;
          return (
            <svg key={p.id} x={at.x * 100 + 12} y={at.y * 100 - 18} width="76" height="76" viewBox="0 0 100 100" overflow="visible" pointerEvents="none">
              <g className={boarding === p.id ? "bb-boarding" : asleep ? "" : "bb-waiting-pass"}>
                <PassengerArt id={p.id} asleep={asleep} mood={close && !asleep ? "happy" : "idle"} />
              </g>
            </svg>
          );
        })}

        {ghost ? <GhostArrow {...ghost} /> : null}

        {ferry ? <FerryBoat cx={ferry.x * 100 + 50} cy={ferry.y * 100 + 50} moving={ferryMoving} /> : null}

        {/* Bina */}
        <g
          className={`bb-bus ${bus.ferrying ? "bb-bus-ferry" : ""} ${bus.mood === "wobble" ? "bb-wobble" : bus.mood === "happy" ? "bb-happy" : ""}`}
          style={{ transform: `translate(${bus.x * 100 + 50}px, ${bus.y * 100 + 50}px) rotate(${bus.angle}deg)` }}
          pointerEvents="none"
        >
          <g className="bb-bus-inner">
            <g transform="scale(0.82)">
              <BinaTop />
            </g>
            {honking ? (
              <g stroke={C.gold} strokeWidth="6" fill="none" strokeLinecap="round">
                <path d="M-22 -54 q22 -16 44 0" />
                <path d="M-32 -66 q32 -22 64 0" />
              </g>
            ) : null}
          </g>
        </g>
      </svg>
    </div>
  );
}

function GhostArrow({ x, y, dir, angle, block }: { x: number; y: number; dir: number; angle: number; block: Block }) {
  const cx = x * 100 + 50;
  const cy = y * 100 + 50;
  const stroke = { stroke: "#fff", strokeWidth: 12, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  if (block === "forward") {
    const tx = cx + DX[dir] * 100;
    const ty = cy + DY[dir] * 100;
    return (
      <g className="bb-ghost pointer-events-none">
        <line x1={cx + DX[dir] * 30} y1={cy + DY[dir] * 30} x2={tx} y2={ty} {...stroke} strokeDasharray="2 18" />
        <circle cx={tx} cy={ty} r="20" fill="#fff" opacity=".9" />
        <circle cx={tx} cy={ty} r="10" fill={C.gold} />
      </g>
    );
  }
  if (block === "left" || block === "right") {
    const s = block === "left" ? -1 : 1;
    return (
      <g className="bb-ghost pointer-events-none" transform={`translate(${cx} ${cy}) rotate(${angle})`}>
        <path d={`M0 -46 Q${s * 46} -46 ${s * 50} 0`} {...stroke} />
        <path d={`M${s * 36} -12 L${s * 50} 4 L${s * 62} -14`} {...stroke} />
      </g>
    );
  }
  return (
    <g className="bb-ghost pointer-events-none" transform={`translate(${cx} ${cy})`}>
      <circle r="44" fill="none" stroke="#fff" strokeWidth="8" strokeDasharray="6 10" />
      <circle r="30" fill={BLOCK_STYLE[block].color} opacity=".9" />
      <svg x="-22" y="-22" width="44" height="44" viewBox="0 0 60 60">
        <BlockIcon block={block} dir={dir} />
      </svg>
    </g>
  );
}

/* ================================================================== */
/* Rewards                                                              */
/* ================================================================== */

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.6,
        color: [C.gold, C.purple, C.teal, C.pink, "#2EB84B", C.orange][i % 6],
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className="bb-confetti" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}

function StickerReward({ level, isLast, onNext }: { level: Level; isLast: boolean; onNext: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001432]/60 p-4" role="dialog" aria-label="You earned a sticker">
      <div className="bb-pop-in w-full max-w-sm rounded-[36px] bg-gradient-to-b from-white to-[#FFF4C2] p-6 text-center shadow-2xl">
        <div className="mx-auto h-48 w-48 rotate-[-6deg]">
          <StickerArt art={level.sticker.art} />
        </div>
        <p className="mt-2 font-display text-3xl font-extrabold">{level.sticker.label}</p>
        <button
          type="button"
          onClick={() => {
            stopTalking();
            onNext();
          }}
          className="focus-ring bb-go mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#2EB84B] text-white shadow-[0_7px_0_#1E7F33]"
          aria-label={isLast ? "Finish the trip" : "Next level"}
        >
          <svg viewBox="0 0 40 40" className="h-12 w-12" aria-hidden>
            {isLast ? <path d="M8 21 L17 30 L33 11" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M12 8 L32 20 L12 32 Z" fill="#fff" />}
          </svg>
        </button>
      </div>
    </div>
  );
}

function StickerBook({ onHome }: { onHome: () => void }) {
  const progress = useBusProgress();
  const have = progress.done.filter((id) => ALL_IDS.includes(id)).length;
  useEffect(() => {
    void say("common.sticker_book");
  }, []);
  return (
    <div className="rounded-[32px] bg-gradient-to-b from-[#EDE4FF] to-[#FFF4C2] p-4 sm:p-8">
      <Talker fallback="common.sticker_book" />
      <h1 className="mt-5 text-center font-display text-3xl font-extrabold">
        My Sticker Book{" "}
        <span className="text-[#7E57C2]">
          {have} / {ALL_IDS.length}
        </span>
      </h1>
      {have === ALL_IDS.length ? <p className="mt-2 text-center font-display text-2xl font-extrabold text-[#2EB84B]">⭐ Complete! ⭐</p> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {CHAPTERS.map((ch) => (
          <section key={ch.n} className="rounded-3xl bg-white/70 p-4" aria-label={`Trip ${ch.n}: ${ch.title}`}>
            <h2 className="font-display text-lg font-extrabold text-[#001432]/70">
              {CHAPTER_ICON[ch.n - 1]} {ch.title}
            </h2>
            <ul className="mt-2 flex flex-wrap gap-3">
              {ch.levelIds.map((id, i) => {
                const has = progress.done.includes(id);
                return (
                  <li key={id} className="h-20 w-20 sm:h-24 sm:w-24" aria-label={has ? `Sticker ${i + 1} of trip ${ch.n}` : "Sticker to find"}>
                    <StickerArt art={ch.stickers[i]} earned={has} />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={onHome} className="focus-ring bb-go flex h-20 items-center gap-2 rounded-full bg-[#2EB84B] px-8 font-display text-2xl font-extrabold text-white shadow-[0_7px_0_#1E7F33]">
          Keep playing
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Grown-up corner: hold to open                                        */
/* ================================================================== */

const HOLD_MS = 1600;

function GrownUpCorner() {
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState(0);
  const timer = useRef<number | null>(null);
  const started = useRef(0);

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setPct(0);
  };
  const begin = () => {
    stop();
    started.current = Date.now();
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - started.current) / HOLD_MS);
      setPct(p);
      if (p >= 1) {
        stop();
        setOpen(true);
      }
    }, 50);
  };
  useEffect(() => stop, []);

  const r = 29;
  const len = 2 * Math.PI * r;
  return (
    <>
      <button
        type="button"
        aria-label="Grown-up corner: press and hold to open"
        title="Grown-ups: press and hold"
        onPointerDown={begin}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
        className="focus-ring relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white"
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r={r} fill="none" stroke="#ffffff22" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={C.gold} strokeWidth="5" strokeDasharray={len} strokeDashoffset={len * (1 - pct)} className="bb-hold-ring" />
        </svg>
        <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
          <rect x="9" y="18" width="22" height="16" rx="4" fill="currentColor" />
          <path d="M14 18 v-5 a6 6 0 0 1 12 0 v5" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
      </button>
      {open ? <GrownUpPanel onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function GrownUpPanel({ onClose }: { onClose: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const { hasVoices } = useVoiceState();
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#001432]/80 p-4" role="dialog" aria-modal="true" aria-labelledby="grownup-title">
      <div className="my-6 w-full max-w-2xl select-text rounded-3xl bg-white p-6 text-[#001432] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7E57C2]">Grown-up corner</p>
            <h2 id="grownup-title" className="font-display text-2xl font-extrabold">
              What your child is learning
            </h2>
          </div>
          <button type="button" onClick={onClose} className="focus-ring h-12 rounded-full bg-[#001432] px-5 font-bold text-white">
            Close
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#001432]/80">
          Bus Buddies Road Trip is an early coding game for ages 4 to 6. Children plan a trip by putting picture blocks in order, press GO, and watch Bina follow the plan one step at a
          time. Instructions are shown with pictures{hasVoices ? " and spoken aloud, so no reading is needed" : " and in short speech bubbles: read them aloud together"}.
        </p>
        <ol className="mt-4 space-y-3">
          {CHAPTERS.map((ch) => (
            <li key={ch.n} className="rounded-2xl bg-[#F4F6FB] p-3">
              <p className="font-bold">
                Trip {ch.n}: {ch.title} <span className="font-normal text-[#001432]/60">· {ch.learns}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#001432]/75">{ch.grownUp}</p>
            </li>
          ))}
        </ol>
        <h3 className="mt-5 font-bold">How help works</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#001432]/75">
          There is no losing. If the plan goes wrong, Bina stops, says something silly, and the block that caused it glows. After two tries Captain Codey shows a sparkly hint for the
          next move. After four, he offers to place it. Talk it through together: &ldquo;Which way is Bina facing? Where does she need to go next?&rdquo;
        </p>
        <h3 className="mt-5 font-bold">Free and class levels</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#001432]/75">
          Levels 1 to {BUS_FREE_LEVELS} are free for everyone. Levels {BUS_FREE_LEVELS + 1} to {ALL_IDS.length} are part of the Explorers program (K–Grade 1) and open with your class
          password.
        </p>
        <h3 className="mt-5 font-bold">Privacy</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#001432]/75">
          No sign-up and no personal information. Progress and stickers are saved only in this browser on this device.
          {hasVoices ? " Character voices are made with AI text-to-speech." : ""}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href="/programs/explorers/" className="focus-ring rounded-full bg-[#F0D030] px-5 py-3 font-bold">
            Explorers classes (K–Grade 1) →
          </Link>
          {confirm ? (
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirm(false);
              }}
              className="focus-ring rounded-full bg-[#EF5350] px-5 py-3 font-bold text-white"
            >
              Yes, clear all stickers
            </button>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="focus-ring rounded-full border border-[#001432]/20 px-5 py-3 font-bold">
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
