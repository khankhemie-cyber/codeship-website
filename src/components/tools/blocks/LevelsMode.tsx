"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../launchpad/icons";
import { playCheer, playPop, stopAllSounds, unlockAudio } from "./audio";
import type { LabelMode } from "./blockDefs";
import type { EditorApi } from "./BlocksEditor";
import { costumeUrl } from "./costumes";
import { Engine } from "./engine";
import type { Strings, UiLang } from "./i18n";
import { HERO_ID, LEVELS, LevelRules, levelById, levelProject, levelThings, starterScripts, type Level } from "./levels";
import type { Project, Scripts } from "./model";
import { LEVEL_PROMPTS, canSpeak, speak } from "./levelPrompts";
import Stage from "./Stage";

/**
 * Levels: get your character to the goal. A level picker grouped by
 * semester (every level always open), and the level itself: the child's
 * blocks on the left, the level on the right.
 *
 * No hints, ever: a program that falls short just stops. Finishing shows a
 * celebration and the next level. Finished levels and each level's blocks
 * are remembered in this browser only.
 */

const BlocksEditor = dynamic(() => import("./BlocksEditor"), {
  ssr: false,
  loading: () => <div className="h-full bg-[#F4F7FB]" aria-hidden="true" />,
});

const PROGRESS_KEY = "codeship-blocks-levels";
const SEMESTER_COLOURS = ["#D58401", "#035762", "#4E2B6F", "#012C61"];

type Progress = { done: Record<string, true>; blocks: Record<string, Scripts> };

function readProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return { done: p.done ?? {}, blocks: p.blocks ?? {} };
  } catch {
    return { done: {}, blocks: {} };
  }
}
function writeProgress(p: Progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {}
}

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010F2A]";
const ctrlBtn = `inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-sm font-semibold text-white hover:bg-white/10 ${focusRing}`;

type Props = { s: Strings; lang: UiLang; mode: LabelMode };

export default function LevelsMode({ s, lang, mode }: Props) {
  const [levelId, setLevelId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>({ done: {}, blocks: {} });
  const [won, setWon] = useState(false);
  const [armed, setArmed] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [speechOk, setSpeechOk] = useState(false);
  const [, setFrame] = useState(0);
  const engineRef = useRef<Engine | null>(null);
  const rulesRef = useRef<LevelRules | null>(null);
  const projectRef = useRef<Project | null>(null);
  const editorApi = useRef<EditorApi | null>(null);
  const saveTimer = useRef(0);
  const wonRef = useRef(false);

  useEffect(() => {
    setProgress(readProgress());
    setSpeechOk(canSpeak());
    return () => {
      if (canSpeak()) window.speechSynthesis.cancel();
    };
  }, []);

  // Exposed for the acceptance tests (scripts/blocks/test-blocks-e2e.mjs).
  useEffect(() => {
    (window as unknown as { __codeshipLevels?: object }).__codeshipLevels = {
      engine: () => engineRef.current,
      project: () => projectRef.current,
    };
  }, []);

  const level = levelId ? levelById(levelId) : undefined;

  const startLevel = useCallback((l: Level) => {
    stopAllSounds();
    // Read the task aloud straight away (this runs inside the tap that opened the level,
    // which browsers require before they will speak).
    const prompt = LEVEL_PROMPTS[l.id]?.[lang];
    if (prompt) speak(prompt, lang);
    setPromptOpen(true);
    const saved = readProgress().blocks[l.id];
    const project = levelProject(l, saved ?? starterScripts(l));
    const rules = new LevelRules(l);
    projectRef.current = project;
    rulesRef.current = rules;
    engineRef.current = new Engine(
      project,
      {
        sound: () => playPop(),
        canEnter: rules.canEnter,
        afterReset: rules.afterReset,
        changed: () => setFrame((f) => f + 1),
      },
      performance.now(),
    );
    wonRef.current = false;
    setWon(false);
    setArmed(false);
    setLevelId(l.id);
  }, [lang]);

  // Drive the engine; check the goal after every tick.
  useEffect(() => {
    if (!levelId) return;
    let raf = 0;
    const loop = () => {
      const e = engineRef.current;
      const r = rulesRef.current;
      if (e && r) {
        e.tick(performance.now());
        if (!wonRef.current && r.check(e.states, () => (playPop(), setFrame((f) => f + 1)))) {
          wonRef.current = true;
          e.stopAll();
          playCheer();
          setWon(true);
          setProgress((p) => {
            const next = { ...p, done: { ...p.done, [levelId]: true as const } };
            writeProgress(next);
            return next;
          });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [levelId]);

  const hero = projectRef.current?.pages[0].actors.find((a) => a.id === HERO_ID);

  const onScripts = useCallback(
    (scripts: Scripts) => {
      if (!hero || !levelId) return;
      hero.scripts = scripts;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        const p = readProgress();
        p.blocks[levelId] = scripts;
        writeProgress(p);
      }, 800);
    },
    [hero, levelId],
  );

  const replay = () => {
    unlockAudio();
    stopAllSounds();
    wonRef.current = false;
    setWon(false);
    engineRef.current?.greenFlag();
  };

  const resetLevel = () => {
    if (!level) return;
    if (!armed) return setArmed(true);
    const p = readProgress();
    delete p.blocks[level.id];
    writeProgress(p);
    startLevel(level);
  };

  // ── Picker ──
  if (!level) {
    return (
      <main className="min-h-0 flex-1 overflow-auto px-4 py-4" data-testid="level-picker">
        <h2 className="font-display text-2xl font-extrabold">{s.levels}</h2>
        <p className="mt-1 text-sm text-white/70">{s.progressHere}</p>
        <div className="mt-4 space-y-4">
          {[1, 2, 3, 4].map((sem) => {
            const levels = LEVELS.filter((l) => l.semester === sem);
            return (
              <section key={sem} className="rounded-2xl border-l-8 bg-white/[0.05] p-3" style={{ borderColor: SEMESTER_COLOURS[sem - 1] }}>
                <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={costumeUrl(levels[0].hero)} alt="" className="h-full w-full" />
                  </span>
                  {s.semesterN(sem)}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {levels.map((l) => {
                    const done = progress.done[l.id];
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => startLevel(l)}
                        data-testid={`level-${l.id}`}
                        aria-label={`${s.levelLabel(l.semester, l.number)}${done ? ` · ${s.levelDone}` : ""}`}
                        className={`relative flex h-20 w-20 flex-col items-center justify-center rounded-2xl text-3xl font-extrabold shadow-md transition active:scale-95 ${
                          done ? "bg-[#D58401] text-[#010F2A]" : "bg-white text-[#010F2A]"
                        } ${focusRing}`}
                      >
                        {l.number}
                        {done && (
                          <span aria-hidden="true" className="absolute -right-2 -top-2 text-2xl drop-shadow">
                            ⭐
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    );
  }

  // ── Playing a level ──
  const engine = engineRef.current;
  const project = projectRef.current;
  const things = levelThings(level);
  const goal = things.find((t) => t.kind === "goal");
  const apples = things.filter((t) => t.kind === "item");
  const next = LEVELS[LEVELS.findIndex((l) => l.id === level.id) + 1];
  const prompt = LEVEL_PROMPTS[level.id]?.[lang] ?? "";
  const speakButton = (big: boolean) =>
    speechOk && (
      <button
        type="button"
        onClick={() => speak(prompt, lang)}
        data-testid={big ? "prompt-speak" : "prompt-speak-again"}
        aria-label={s.readToMe}
        title={s.readToMe}
        className={`flex shrink-0 items-center justify-center rounded-full bg-[#035762] text-white shadow active:scale-95 ${big ? "h-16 w-16 text-3xl" : "h-11 w-11 text-xl"} ${focusRing}`}
      >
        <span aria-hidden="true">🔊</span>
      </button>
    );

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#0A2648] px-3 py-2">
        <button type="button" onClick={() => setLevelId(null)} className={ctrlBtn} data-testid="all-levels" aria-label={s.allLevels} title={s.allLevels}>
          <span aria-hidden="true" className="grid grid-cols-2 gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="block h-2 w-2 rounded-sm bg-white" />
            ))}
          </span>
          <span className="hidden sm:inline">{s.allLevels}</span>
        </button>
        <span className="rounded-lg px-3 py-2 font-display text-base font-extrabold text-[#010F2A]" style={{ background: SEMESTER_COLOURS[level.semester - 1] === "#D58401" ? "#D58401" : "#E6ECF4" }} data-testid="level-label">
          {s.levelLabel(level.semester, level.number)}
        </span>
        <button
          type="button"
          onClick={replay}
          title={s.greenFlag}
          aria-label={s.greenFlag}
          data-testid="green-flag"
          className={`flex h-11 w-14 items-center justify-center rounded-xl bg-[#2EB84B] shadow active:translate-y-px ${focusRing}`}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path d="M5 22V3" stroke="#010F2A" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M5 3h13l-3 4.5 3 4.5H5z" fill="#fff" stroke="#010F2A" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => (stopAllSounds(), engine?.stopAll())}
          title={s.stop}
          aria-label={s.stop}
          data-testid="stop"
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[#E53935] shadow active:translate-y-px ${focusRing}`}
        >
          <span aria-hidden="true" className="block h-5 w-5 rounded-sm bg-white" />
        </button>
        <button type="button" onClick={() => editorApi.current?.undo()} className={ctrlBtn} aria-label={s.undo} title={s.undo}>
          <Icon name="undo" className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => editorApi.current?.redo()} className={ctrlBtn} aria-label={s.redo} title={s.redo}>
          <Icon name="redo" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={resetLevel}
          className={`ml-auto ${ctrlBtn} ${armed ? "!bg-[#E53935]" : ""}`}
          title={armed ? s.tapAgainToStartOver : s.resetLevel}
          aria-label={s.resetLevel}
        >
          <Icon name="restart" className="h-5 w-5" />
          <span className="hidden md:inline">{armed ? s.tapAgainToStartOver : s.resetLevel}</span>
        </button>
      </div>

      {/* The task, always in view: tap the speaker to hear it again. */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#FFF8E6] px-3 py-2 text-[#010F2A]" data-testid="prompt-strip">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 ring-2 ring-[#D58401]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={costumeUrl(level.hero)} alt="" className="h-full w-full" />
        </span>
        <p className="flex-1 text-lg font-extrabold leading-snug sm:text-xl" lang={lang}>
          <Readable text={prompt} />
        </p>
        {speakButton(false)}
      </div>

      <div className="flex min-h-0 flex-1 flex-col-reverse md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,min(46%,600px))]">
        <section className="flex h-[70vh] min-h-[320px] flex-col md:h-auto md:min-h-0" aria-label={s.blocksFor}>
          <div className="flex items-center gap-3 border-b-4 border-[#D58401] bg-[#0A2648] px-3 py-1.5">
            <span className="text-sm font-semibold text-white/80">{s.blocksFor}</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 ring-4 ring-[#D58401]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={costumeUrl(level.hero)} alt={level.hero} className="h-full w-full" />
            </span>
            <span className="ml-auto" />
            <button type="button" onClick={() => editorApi.current?.zoom(-1)} aria-label={s.zoomOut} className={`h-10 w-10 rounded-lg bg-white/10 text-xl font-bold ${focusRing}`}>
              −
            </button>
            <button type="button" onClick={() => editorApi.current?.zoom(1)} aria-label={s.zoomIn} className={`h-10 w-10 rounded-lg bg-white/10 text-xl font-bold ${focusRing}`}>
              +
            </button>
          </div>
          <div className="relative min-h-0 flex-1 border-x-4 border-b-4 border-[#D58401]">
            {hero && (
              <BlocksEditor
                lang={lang}
                mode={mode}
                semester={level.semester}
                palette={level.palette}
                pageCount={1}
                actorKey={`level:${level.id}`}
                scripts={hero.scripts}
                clipIds={EMPTY}
                onChange={onScripts}
                onRecordBlock={() => {}}
                apiRef={editorApi}
              />
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-2 border-white/10 bg-[#010F2A] p-2 md:border-l">
          <div className="relative min-h-[200px] flex-1">
            {engine && project && (
              <Stage
                background={level.background}
                actors={project.pages[0].actors}
                characters={project.characters}
                states={engine.states}
                selectedId={HERO_ID}
                running={engine.isRunning()}
                fixed
                onTap={(id) => {
                  unlockAudio();
                  if (id === HERO_ID) engine.tap(id);
                }}
                onPlace={() => {}}
              />
            )}
          </div>
          {/* The goal, in pictures: get here, collecting every apple. */}
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-2" aria-label={s.goal}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={costumeUrl(level.hero)} alt="" className="h-full w-full" />
            </span>
            <span aria-hidden="true" className="text-2xl font-extrabold text-[#D58401]">
              →
            </span>
            {apples.map((a) => (
              <span key={a.id} className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 ${engine?.states.get(a.id)?.visible === false ? "opacity-30" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={costumeUrl("apple")} alt="" className="h-full w-full" />
              </span>
            ))}
            {apples.length > 0 && (
              <span aria-hidden="true" className="text-2xl font-extrabold text-[#D58401]">
                →
              </span>
            )}
            {goal && (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 ring-4 ring-[#D58401]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={costumeUrl(goal.costume)} alt="" className="h-full w-full" />
              </span>
            )}
          </div>
        </section>
      </div>

      {promptOpen && !won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010F2A]/70 p-4" role="dialog" aria-label={s.levelLabel(level.semester, level.number)} data-testid="level-prompt">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-center text-[#010F2A] shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[#586173]">{s.levelLabel(level.semester, level.number)}</p>
            <div className="mt-3 flex items-center justify-center gap-4" aria-hidden="true">
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F4F7FB] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={costumeUrl(level.hero)} alt="" className="h-full w-full" />
              </span>
              <span className="text-4xl font-extrabold text-[#D58401]">→</span>
              {goal && (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F4F7FB] p-2 ring-4 ring-[#D58401]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={costumeUrl(goal.costume)} alt="" className="h-full w-full" />
                </span>
              )}
            </div>
            <p className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl" lang={lang} data-testid="prompt-text">
              <Readable text={prompt} />
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              {speakButton(true)}
              <button
                type="button"
                autoFocus
                onClick={() => setPromptOpen(false)}
                data-testid="prompt-go"
                className={`flex h-16 min-w-32 items-center justify-center gap-2 rounded-2xl bg-[#2EB84B] px-6 text-2xl font-extrabold text-white shadow-lg active:scale-95 ${focusRing}`}
              >
                {s.go} <span aria-hidden="true">➜</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010F2A]/70 p-4" role="dialog" aria-label={s.wellDone} data-testid="level-won">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-center text-[#010F2A] shadow-2xl">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {Array.from({ length: 14 }, (_, i) => (
                <span
                  key={i}
                  className="absolute text-2xl"
                  style={{ left: `${(i * 37) % 100}%`, top: "-10%", animation: `cb-fall ${1.6 + (i % 5) * 0.3}s ease-in ${(i % 7) * 0.12}s infinite` }}
                >
                  {i % 3 === 0 ? "⭐" : i % 3 === 1 ? "✨" : "🎉"}
                </span>
              ))}
            </div>
            <div className="text-7xl" aria-hidden="true">
              ⭐
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold">{s.wellDone}</h2>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button type="button" onClick={replay} className="flex h-16 min-w-16 flex-col items-center justify-center rounded-2xl bg-[#E6ECF4] px-3 text-xs font-bold" aria-label={s.again}>
                <Icon name="restart" className="h-7 w-7" />
                {s.again}
              </button>
              <button type="button" onClick={() => setLevelId(null)} className="flex h-16 min-w-16 flex-col items-center justify-center rounded-2xl bg-[#E6ECF4] px-3 text-xs font-bold" aria-label={s.allLevels}>
                <span aria-hidden="true" className="grid grid-cols-2 gap-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="block h-2.5 w-2.5 rounded-sm bg-[#010F2A]" />
                  ))}
                </span>
                {s.allLevels}
              </button>
              {next && (
                <button
                  type="button"
                  autoFocus
                  onClick={() => startLevel(next)}
                  data-testid="next-level"
                  className="flex h-20 min-w-24 flex-col items-center justify-center rounded-2xl bg-[#2EB84B] px-4 text-sm font-extrabold text-white shadow-lg"
                  aria-label={s.nextLevel}
                >
                  <span aria-hidden="true" className="text-4xl leading-none">
                    ➜
                  </span>
                  {s.nextLevel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const EMPTY = new Set<string>();

/** Keeps hyphenated words ("Montre-toi", "Cache-toi") on one line, so a beginning reader sees the whole word. */
function Readable({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
        </span>
      ))}
    </>
  );
}
