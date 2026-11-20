"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CHAPTERS, LEVELS, levelById, levelsIn, type Block, type Level, type PassengerId } from "@/lib/games/bus/levels";
import { DX, DY, findChar, headings, nextCorrect, run, startState, stateAfter, type Frame } from "@/lib/games/bus/engine";
import { BLOCK_STYLE, BinaFace, BinaSide, BinaTop, BlockIcon, C, Clouds, Codey, PassengerArt, StickerArt, Tile } from "./art";
import { lineSpeaker, lineText, preloadChapter, say, setMuted, sfx, stopTalking, useVoiceState, type Speaker } from "./sound";
import { completeLevel, resetProgress, useBusProgress } from "./store";
import "./bus-buddies.css";

type Screen =
  | { name: "home" }
  | { name: "chapter"; chapter: number }
  | { name: "scene"; chapter: number; kind: "intro" | "outro" }
  | { name: "play"; levelId: string }
  | { name: "stickers" };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const STEP_MS = 650;

/* ================================================================== */
/* Shell                                                                */
/* ================================================================== */

export function BusBuddies() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const progress = useBusProgress();

  // Stop any voice when the screen changes or the game closes.
  useEffect(() => () => stopTalking(), [screen]);

  const openChapter = useCallback(
    (chapter: number) => {
      const ch = CHAPTERS.find((c) => c.n === chapter);
      if (!ch?.ready) {
        void say("common.coming_soon");
        return;
      }
      void preloadChapter(chapter);
      const started = levelsIn(chapter).some((l) => progress.done.includes(l.id));
      setScreen(started ? { name: "chapter", chapter } : { name: "scene", chapter, kind: "intro" });
    },
    [progress.done],
  );

  const play = () => {
    sfx.unlock();
    const next = LEVELS.find((l) => !progress.done.includes(l.id) && CHAPTERS.find((c) => c.n === l.chapter)?.ready);
    openChapter(next?.chapter ?? 1);
  };

  return (
    <div className="bb-root relative min-h-[calc(100vh-10rem)] bg-[#001432] text-[#001432]" onPointerDown={() => sfx.unlock()}>
      <TopBar onHome={screen.name === "home" ? null : () => setScreen({ name: "home" })} />
      <div className="mx-auto max-w-[1180px] px-2 pb-6 sm:px-4">
        {screen.name === "home" ? (
          <Home onPlay={play} onChapter={openChapter} onStickers={() => setScreen({ name: "stickers" })} />
        ) : null}
        {screen.name === "chapter" ? (
          <ChapterScreen
            chapter={screen.chapter}
            onLevel={(id) => setScreen({ name: "play", levelId: id })}
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
                const first = levelsIn(screen.chapter).find((l) => !progress.done.includes(l.id)) ?? levelsIn(screen.chapter)[0];
                setScreen({ name: "play", levelId: first.id });
              } else setScreen({ name: "stickers" });
            }}
          />
        ) : null}
        {screen.name === "play" ? (
          <Play
            key={screen.levelId}
            level={levelById(screen.levelId)!}
            onNext={() => {
              const level = levelById(screen.levelId)!;
              const list = levelsIn(level.chapter);
              const i = list.findIndex((l) => l.id === level.id);
              if (i + 1 < list.length) setScreen({ name: "play", levelId: list[i + 1].id });
              else setScreen({ name: "scene", chapter: level.chapter, kind: "outro" });
            }}
            onChapter={() => setScreen({ name: "chapter", chapter: levelById(screen.levelId)!.chapter })}
          />
        ) : null}
        {screen.name === "stickers" ? <StickerBook onHome={() => setScreen({ name: "home" })} /> : null}
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
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`focus-ring bb-block flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-[0_5px_0_rgba(0,0,0,0.25)] ${className}`}
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

function Portrait({ who, talking }: { who: Speaker; talking: boolean }) {
  if (who === "codey") return <Codey talking={talking} />;
  if (who === "bina") return <BinaFace talking={talking} />;
  return <PassengerArt id={who} talking={talking} />;
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
        <Portrait who={who} talking={talking} />
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

function Home({ onPlay, onChapter, onStickers }: { onPlay: () => void; onChapter: (n: number) => void; onStickers: () => void }) {
  const progress = useBusProgress();
  return (
    <div className="overflow-hidden rounded-[32px] bg-gradient-to-b from-[#BDE8FF] via-[#DFF4FF] to-[#B8E59A] p-4 sm:p-8">
      <div className="grid items-center gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="bb-drive-in">
          <div className="bb-float">
            <BinaSide mood="happy" riders={["turtle", "duck", "owl"]} driving />
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
            const levels = levelsIn(ch.n);
            const done = levels.length > 0 && levels.every((l) => progress.done.includes(l.id));
            return (
              <li key={ch.n} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onChapter(ch.n)}
                  aria-label={`Trip ${ch.n}: ${ch.title}${ch.ready ? "" : " (coming soon)"}`}
                  className={`focus-ring bb-block relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 text-4xl shadow-[0_6px_0_rgba(0,0,0,0.2)] ${
                    ch.ready ? "border-[#F0D030] bg-white" : "border-white/70 bg-white/60 grayscale"
                  }`}
                >
                  <span aria-hidden>{CHAPTER_ICON[i]}</span>
                  <span className="absolute -top-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#001432] text-base font-extrabold text-[#F0D030]">
                    {ch.n}
                  </span>
                  {!ch.ready ? <span className="absolute -bottom-1 -right-1 text-2xl" aria-hidden>🔒</span> : null}
                  {done ? <span className="absolute -bottom-1 -right-1 text-2xl" aria-hidden>⭐</span> : null}
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
          onClick={() => {
            onStickers();
          }}
          className="focus-ring bb-block flex h-20 items-center gap-3 rounded-full bg-[#7E57C2] px-6 font-display text-2xl font-extrabold text-white shadow-[0_6px_0_#5B3D99]"
        >
          <span className="text-4xl" aria-hidden>
            📒
          </span>
          Stickers <span className="rounded-full bg-white/25 px-3 py-1 text-lg">{progress.stickers.length}</span>
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Chapter: pick a level                                                */
/* ================================================================== */

function ChapterScreen({ chapter, onLevel, onStory }: { chapter: number; onLevel: (id: string) => void; onStory: () => void }) {
  const progress = useBusProgress();
  const ch = CHAPTERS.find((c) => c.n === chapter)!;
  const levels = levelsIn(chapter);
  const nextId = levels.find((l) => !progress.done.includes(l.id))?.id;
  useEffect(() => {
    void say("common.pick_chapter");
  }, []);
  return (
    <div className="rounded-[32px] bg-gradient-to-b from-[#BDE8FF] to-[#B8E59A] p-4 sm:p-8">
      <Talker fallback="common.pick_chapter" />
      <h1 className="mt-5 text-center font-display text-3xl font-extrabold">
        Trip {ch.n}: {ch.title}
      </h1>
      <ol className="mt-6 flex flex-wrap items-center justify-center gap-5">
        {levels.map((l, i) => {
          const done = progress.done.includes(l.id);
          const open = done || i === 0 || progress.done.includes(levels[i - 1].id);
          return (
            <li key={l.id}>
              <button
                type="button"
                disabled={!open}
                onClick={() => onLevel(l.id)}
                aria-label={`Level ${i + 1}: ${l.title}${done ? " (done)" : ""}`}
                className={`focus-ring bb-block relative h-32 w-32 rounded-full bg-white p-2 shadow-[0_6px_0_rgba(0,0,0,0.2)] disabled:opacity-40 ${l.id === nextId ? "bb-pulse" : ""}`}
              >
                {done ? (
                  <StickerArt art={l.sticker.art} />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-[#FFF4C2] font-display text-5xl font-extrabold text-[#001432]">{i + 1}</span>
                )}
                {!open ? <span className="absolute -bottom-1 -right-1 text-3xl" aria-hidden>🔒</span> : null}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={onStory} className="focus-ring bb-block flex h-16 items-center gap-2 rounded-full bg-white px-5 font-bold shadow-[0_5px_0_rgba(0,0,0,0.15)]">
          <span className="text-3xl" aria-hidden>
            📖
          </span>
          Watch the story
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Story scenes                                                         */
/* ================================================================== */

function Scene({ chapter, kind, onDone }: { chapter: number; kind: "intro" | "outro"; onDone: () => void }) {
  const ch = CHAPTERS.find((c) => c.n === chapter)!;
  const lines = kind === "intro" ? ch.intro : ch.outro;
  const [i, setI] = useState(0);
  const [ended, setEnded] = useState(false);
  const v = useVoiceState();

  useEffect(() => {
    void preloadChapter(chapter);
    if (kind === "outro") sfx.cheer();
  }, [chapter, kind]);

  useEffect(() => {
    let alive = true;
    void say(lines[i]).then(async () => {
      await sleep(350);
      if (!alive) return;
      if (i + 1 < lines.length) setI(i + 1);
      else setEnded(true);
    });
    return () => {
      alive = false;
    };
  }, [i, lines]);

  const who = v.speaker ?? lineSpeaker(lines[i]);
  const riders: PassengerId[] = kind === "outro" ? ["turtle", "duck", "owl"] : [];
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#9AD8FF] via-[#D7F0FF] to-[#FFF1C9]">
      {kind === "outro" ? <Confetti /> : null}
      <svg viewBox="0 0 800 200" className="absolute inset-x-0 bottom-0 w-full" preserveAspectRatio="none" aria-hidden>
        <path d="M0 120 Q200 60 400 110 T800 90 V200 H0 Z" fill="#9BD67A" />
        <path d="M0 160 Q300 120 800 150 V200 H0 Z" fill="#7CC35E" />
        <rect x="0" y="165" width="800" height="26" fill={C.road} />
        <path d="M0 178 H800" stroke="#fff" strokeWidth="3" strokeDasharray="20 18" />
      </svg>
      <div className="absolute right-[8%] top-6 h-20 w-20 rounded-full bg-[#FFE066] shadow-[0_0_60px_20px_#FFE06688]" aria-hidden />
      <div className="relative grid min-h-[520px] grid-rows-[auto_1fr] gap-4 p-4 sm:p-8">
        <div className="mx-auto w-full max-w-2xl">
          <Talker fallback={lines[i]} />
        </div>
        <div className="flex items-end justify-center gap-4 pb-6">
          <div className="bb-drive-in w-[min(560px,70%)]">
            <BinaSide talking={who === "bina" && !!v.speaker} mood={kind === "outro" ? "happy" : "idle"} riders={riders} driving={!ended && kind === "intro" && i === 0} />
          </div>
        </div>
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

/* ================================================================== */
/* Playing a level                                                      */
/* ================================================================== */

interface BusView {
  x: number;
  y: number;
  angle: number;
  mood?: "wobble" | "happy";
}

function Play({ level, onNext, onChapter }: { level: Level; onNext: () => void; onChapter: () => void }) {
  const start = useMemo(() => startState(level), [level]);
  const [program, setProgram] = useState<Block[]>([]);
  const [bus, setBus] = useState<BusView>({ x: start.x, y: start.y, angle: start.angle });
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [blame, setBlame] = useState<number | null>(null);
  const [aboard, setAboard] = useState<PassengerId[]>(level.riding);
  const [boarding, setBoarding] = useState<PassengerId | null>(null);
  const [woken, setWoken] = useState<PassengerId[]>([]);
  const [honking, setHonking] = useState(false);
  const [fails, setFails] = useState(0);
  const [won, setWon] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const alive = useRef(true);
  const levelNo = levelsIn(level.chapter).findIndex((l) => l.id === level.id) + 1;

  useEffect(() => {
    alive.current = true;
    void preloadChapter(level.chapter);
    void (async () => {
      await say(level.prompt);
      for (const p of level.passengers) if (p.waitingLine && alive.current) await say(p.waitingLine);
    })();
    return () => {
      alive.current = false;
      stopTalking();
    };
  }, [level]);

  const resetBus = () => {
    setBus({ x: start.x, y: start.y, angle: start.angle });
    setAboard(level.riding);
    setWoken([]);
    setBlame(null);
    setActive(null);
  };

  const full = program.length >= level.maxBlocks;
  const dirs = useMemo(() => headings(level, program), [level, program]);
  const edit = (next: Block[]) => {
    if (running || won) return;
    resetBus();
    setProgram(next);
  };
  const add = (b: Block) => {
    if (full) {
      void say("common.full");
      sfx.boing();
      return;
    }
    sfx.pop();
    edit([...program, b]);
  };

  const hint = fails >= 2 && !running && !won ? nextCorrect(level, program) : null;
  const ghost = hint ? stateAfter(level, level.solution.slice(0, hint.index)) : null;
  const canHelp = fails >= 4 && !running && !won && !!hint;

  const go = async () => {
    if (running || won) return;
    sfx.unlock();
    if (!program.length) {
      void say("common.add_blocks");
      return;
    }
    stopTalking();
    resetBus();
    setRunning(true);
    await sleep(250);
    const result = run(level, program);
    let riding = [...level.riding];
    for (const f of result.frames) {
      if (!alive.current) return;
      setActive(f.index);
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

  async function animateFrame(f: Frame) {
    if (f.bump) {
      sfx.vroom();
      setBus({ x: f.x + (f.bump.x - f.x) * 0.38, y: f.y + (f.bump.y - f.y) * 0.38, angle: f.angle });
      await sleep(380);
      sfx.boing();
      setBus({ x: f.x, y: f.y, angle: f.angle, mood: "wobble" });
      await sleep(500);
      return;
    }
    if (f.block === "forward") sfx.vroom();
    if (f.block === "left" || f.block === "right") sfx.turn();
    if (f.block === "honk") {
      sfx.honk();
      setHonking(true);
      setTimeout(() => setHonking(false), 700);
    }
    if (f.woke) setWoken((w) => [...w, f.woke!]);
    setBus({ x: f.x, y: f.y, angle: f.angle });
    await sleep(STEP_MS);
  }

  const help = () => {
    if (!hint) return;
    sfx.pop();
    edit([...program.slice(0, hint.index), hint.block]);
    void say("common.help_done");
  };

  return (
    <div className="rounded-[32px] bg-gradient-to-b from-[#BDE8FF] to-[#D9F2C8] p-3 sm:p-5">
      {won ? <Confetti /> : null}
      <div className="mb-3 flex items-center gap-3">
        <button type="button" onClick={onChapter} className="focus-ring flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-2" aria-label="All levels in this trip">
          {levelsIn(level.chapter).map((l, i) => (
            <span key={l.id} className={`h-4 w-4 rounded-full ${i + 1 === levelNo ? "bg-[#7E57C2] ring-4 ring-[#7E57C2]/30" : i + 1 < levelNo ? "bg-[#2EB84B]" : "bg-[#001432]/20"}`} />
          ))}
        </button>
        <p className="truncate font-display text-lg font-extrabold text-[#001432]/80">{level.title}</p>
      </div>

      <div className="grid gap-4 [@media(orientation:landscape)_and_(min-width:860px)]:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
        {/* Map */}
        <div className="mx-auto w-full max-w-[min(100%,46vh)] [@media(orientation:landscape)]:max-w-[min(100%,72vh)]">
          <MapView level={level} bus={bus} aboard={aboard} boarding={boarding} woken={woken} honking={honking} ghost={ghost ? { ...ghost, block: hint!.block } : null} />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <Talker fallback={level.prompt} promptId={level.prompt} />

          <div className="flex items-center gap-2 rounded-3xl bg-white/60 p-2">
            <div className="w-28 shrink-0" aria-label={`On the bus: ${aboard.length ? aboard.join(", ") : "nobody yet"}`}>
              <BinaSide riders={aboard} mood={bus.mood === "happy" ? "happy" : bus.mood === "wobble" ? "confused" : "idle"} />
            </div>
            <ProgramStrip program={program} dirs={dirs} max={level.maxBlocks} active={active} blame={blame} hintIndex={hint && hint.index < program.length ? hint.index : null} onRemove={(i) => {
              sfx.remove();
              edit(program.filter((_, j) => j !== i));
            }} />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-wrap gap-3" role="group" aria-label="Blocks">
              {level.blocks.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => add(b)}
                  disabled={running || won}
                  aria-label={`Add ${BLOCK_STYLE[b].label}`}
                  className={`focus-ring bb-block h-20 w-20 rounded-2xl p-2 shadow-[0_6px_0_rgba(0,0,0,0.25)] disabled:opacity-50 ${hint?.block === b ? "bb-pulse" : ""}`}
                  style={{ background: BLOCK_STYLE[b].color }}
                >
                  <BlockIcon block={b} dir={dirs[program.length]} />
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <RoundButton label="Take away the last block" onClick={() => program.length && (sfx.remove(), edit(program.slice(0, -1)))} className="bg-white text-[#001432]">
                <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
                  <path d="M16 10 L6 20 L16 30 M7 20 H26 q8 0 8 8" stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </RoundButton>
              <button
                type="button"
                onClick={go}
                disabled={running || won}
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
              Add the next block for me
            </button>
          ) : null}
        </div>
      </div>

      {showSticker ? (
        <StickerReward level={level} isLast={levelNo === levelsIn(level.chapter).length} onNext={onNext} />
      ) : null}
    </div>
  );
}

function ProgramStrip({
  program,
  dirs,
  max,
  active,
  blame,
  hintIndex,
  onRemove,
}: {
  program: Block[];
  dirs: number[];
  max: number;
  active: number | null;
  blame: number | null;
  hintIndex: number | null;
  onRemove: (i: number) => void;
}) {
  return (
    <ol className="flex flex-1 flex-wrap gap-2" aria-label="Your program">
      {Array.from({ length: max }, (_, i) => {
        const b = program[i];
        if (!b) {
          return (
            <li key={i} className={`h-16 w-16 rounded-2xl border-4 border-dashed border-[#001432]/20 ${i === program.length ? "bg-white/70" : ""}`} aria-hidden />
          );
        }
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Step ${i + 1}: ${BLOCK_STYLE[b].label}. Tap to take it away.`}
              className={`focus-ring bb-block bb-pop-in relative h-16 w-16 rounded-2xl p-1.5 shadow-[0_4px_0_rgba(0,0,0,0.25)] ${active === i ? "bb-running" : ""} ${
                blame === i || hintIndex === i ? "bb-blame" : ""
              }`}
              style={{ background: BLOCK_STYLE[b].color }}
            >
              <BlockIcon block={b} dir={dirs[i]} />
            </button>
          </li>
        );
      })}
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
  ghost,
}: {
  level: Level;
  bus: BusView;
  aboard: PassengerId[];
  boarding: PassengerId | null;
  woken: PassengerId[];
  honking: boolean;
  ghost: { x: number; y: number; dir: number; angle: number; block: Block } | null;
}) {
  const rows = level.map.length;
  const cols = level.map[0].length;
  const stops = level.passengers.map((p) => p.stop).join("");
  const near = (x: number, y: number) => Math.abs(Math.round(bus.x) - x) + Math.abs(Math.round(bus.y) - y) === 1;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border-[6px] border-white shadow-xl" style={{ aspectRatio: `${cols} / ${rows}` }}>
      <svg viewBox={`0 0 ${cols * 100} ${rows * 100}`} className="block h-full w-full" role="img" aria-label="Map of the road">
        {level.map.map((row, y) => [...row].map((_, x) => <Tile key={`${x}-${y}`} map={level.map} x={x} y={y} stops={stops} waving={row[x] === "c" && near(x, y)} />))}

        <Clouds width={cols * 100} />

        {/* Friends waiting at their stops */}
        {level.passengers.map((p) => {
          if (aboard.includes(p.id) && boarding !== p.id) return null;
          const at = findChar(level, p.stop)!;
          const asleep = p.needs === "honk" && !woken.includes(p.id);
          return (
            <svg key={p.id} x={at.x * 100 + 12} y={at.y * 100 - 18} width="76" height="76" viewBox="0 0 100 100" overflow="visible">
              <g className={boarding === p.id ? "bb-boarding" : asleep ? "" : "bb-waiting-pass"}>
                <PassengerArt id={p.id} asleep={asleep} />
              </g>
            </svg>
          );
        })}

        {/* Hint: a sparkly ghost arrow for the next move */}
        {ghost ? <GhostArrow {...ghost} /> : null}

        {/* Bina */}
        <g className={`bb-bus ${bus.mood === "wobble" ? "bb-wobble" : bus.mood === "happy" ? "bb-happy" : ""}`} style={{ transform: `translate(${bus.x * 100 + 50}px, ${bus.y * 100 + 50}px) rotate(${bus.angle}deg)` }}>
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
      <circle r="26" fill={C.gold} opacity=".85" />
      <path d="M-12 -6 h6 l10 -8 v28 l-10 -8 h-6 Z" fill={C.navy} />
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
  useEffect(() => {
    void say("common.sticker_book");
  }, []);
  return (
    <div className="rounded-[32px] bg-gradient-to-b from-[#EDE4FF] to-[#FFF4C2] p-4 sm:p-8">
      <Talker fallback="common.sticker_book" />
      <h1 className="mt-5 text-center font-display text-3xl font-extrabold">My Sticker Book</h1>
      <div className="mt-5 space-y-5">
        {CHAPTERS.map((ch) => {
          const levels = levelsIn(ch.n);
          const slots = levels.length || 3;
          return (
            <section key={ch.n} className="rounded-3xl bg-white/70 p-4" aria-label={`Trip ${ch.n}: ${ch.title}`}>
              <h2 className="font-display text-lg font-extrabold text-[#001432]/70">
                {CHAPTER_ICON[ch.n - 1]} {ch.title}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-3">
                {Array.from({ length: slots }, (_, i) => {
                  const l = levels[i];
                  const has = !!l && progress.stickers.includes(l.sticker.id);
                  return (
                    <li key={i} className="h-24 w-24" aria-label={has ? l.sticker.label : "Sticker to find"}>
                      <StickerArt art={l?.sticker.art ?? "bina"} earned={has} />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
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
          time. No reading needed: every instruction is spoken and shown with pictures.
        </p>
        <ol className="mt-4 space-y-3">
          {CHAPTERS.map((ch) => (
            <li key={ch.n} className="rounded-2xl bg-[#F4F6FB] p-3">
              <p className="font-bold">
                Trip {ch.n}: {ch.title} <span className="font-normal text-[#001432]/60">· {ch.learns}</span>
                {!ch.ready ? <span className="ml-2 rounded-full bg-[#F0D030] px-2 py-0.5 text-xs">coming soon</span> : null}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#001432]/75">{ch.grownUp}</p>
            </li>
          ))}
        </ol>
        <h3 className="mt-5 font-bold">How help works</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#001432]/75">
          There is no losing. If the plan goes wrong, Bina stops, says something silly, and the block that caused it glows. After two tries Captain Codey shows a sparkly arrow for the
          next move. After four, he offers to place the next block. Talk it through together: &ldquo;Which way is Bina facing? Where does she need to go next?&rdquo;
        </p>
        <h3 className="mt-5 font-bold">Privacy</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#001432]/75">
          No sign-up and no personal information. Progress and stickers are saved only in this browser on this device. Character voices are made with AI text-to-speech.
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
