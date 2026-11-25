"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROMPT_CATALOG, PROMPT_FREE_LEVELS, promptStars, type PromptLevel, type PromptStep } from "@/lib/games/prompt";
import { completeLevel, earnBadge, getProgress, starsFor, useProgress } from "@/lib/games/progress";
import { ArcadeTopBar, Confetti, Modal, Pill, RewardLayer, Stars, celebrate } from "./arcade-kit";
import { FREE_LEVELS, LockBadge, UnlockModal, useLevelAccess, usePaidLevels } from "./level-lock";
import { Art, ArtText } from "./art";

/** Ages 7–10 span two programs: either class password unlocks missions 6+. */
const PROGRAMS = ["builders", "developers"] as const;

/* ------------------------------------------------------------------ */
/* Read aloud (young readers): the browser's own speech, no network.    */
/* ------------------------------------------------------------------ */

function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    // Drop emoji so the voice doesn't read them out.
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ""));
    u.rate = 0.95;
    synth.speak(u);
  } catch {
    /* speech not available */
  }
}

function SpeakButton({ text, label = "Read this out loud" }: { text: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label={label}
      title={label}
      className="focus-ring ml-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm hover:bg-white/20"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </svg>
    </button>
  );
}

function Astro({ size = "h-12 w-12 text-3xl" }: { size?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-2xl bg-sky-100 ${size}`} aria-hidden>
      <Art e="🤖" size="80%" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Chat log                                                             */
/* ------------------------------------------------------------------ */

type Line = { id: number; from: "astro" | "kid" | "hint"; text: string };

function ChatLog({ lines }: { lines: Line[] }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines.length]);
  return (
    <div className="space-y-3" aria-live="polite">
      <AnimatePresence initial={false}>
        {lines.map((l) =>
          l.from === "kid" ? (
            <motion.div key={l.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-amber px-4 py-3 text-base font-semibold text-navy shadow">{l.text}</p>
            </motion.div>
          ) : (
            <motion.div key={l.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-end gap-2">
              <Astro size="h-10 w-10 text-2xl" />
              <p
                className={`max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-base shadow ${
                  l.from === "hint" ? "border border-orange-300/40 bg-orange-400/15 text-orange-100" : "bg-white text-navy"
                }`}
              >
                <ArtText text={l.text} />
                <SpeakButton text={l.text} />
              </p>
            </motion.div>
          ),
        )}
      </AnimatePresence>
      <div ref={end} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                                */
/* ------------------------------------------------------------------ */

interface StepProps<S> {
  step: S;
  say: (from: Line["from"], text: string) => void;
  miss: () => void;
  done: () => void;
}

const bigBtn =
  "focus-ring w-full rounded-2xl border-2 px-4 py-4 text-left text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-40";

function ChooseStep({ step, say, miss, done }: StepProps<Extract<PromptStep, { kind: "choose" }>>) {
  const [tried, setTried] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  return (
    <div className="space-y-3">
      <p className="flex items-start text-lg font-bold text-white">
        <span><ArtText text={step.ask} /></span>
        <SpeakButton text={step.ask} />
      </p>
      {step.options.map((o, i) => (
        <motion.button
          key={o.text}
          type="button"
          disabled={locked || tried.includes(i)}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            say("kid", o.text);
            if (o.good) {
              setLocked(true);
              say("astro", o.why);
              window.setTimeout(done, 1100);
            } else {
              miss();
              setTried((t) => [...t, i]);
              say("hint", o.why);
            }
          }}
          className={`${bigBtn} border-white/15 bg-white/5 text-white hover:border-amber/60 hover:bg-white/10`}
        >
          “<ArtText text={o.text} />”
        </motion.button>
      ))}
    </div>
  );
}

function BuildStep({ step, say, miss, done }: StepProps<Extract<PromptStep, { kind: "build" }>>) {
  const [picks, setPicks] = useState<(number | null)[]>(step.slots.map(() => null));
  const [finished, setFinished] = useState(false);
  const ready = picks.every((p) => p !== null);
  const prompt = picks.map((p, i) => (p === null ? "____" : step.slots[i].options[p].text)).join(" ");

  const send = () => {
    const good = picks.filter((p, i) => p !== null && step.slots[i].options[p].good).length;
    say("kid", prompt);
    say(good === step.slots.length ? "astro" : "hint", step.answers[good]);
    if (good === step.slots.length) {
      setFinished(true);
      window.setTimeout(done, 1300);
    } else {
      miss();
      say("hint", "Can you make your prompt clearer? Swap the fuzzy pieces for detailed ones and send again!");
    }
  };

  return (
    <div className="space-y-4">
      <p className="flex items-start text-lg font-bold text-white">
        <span><ArtText text={step.ask} /></span>
        <SpeakButton text={step.ask} />
      </p>
      {step.slots.map((slot, si) => (
        <div key={slot.label} role="radiogroup" aria-label={slot.label}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            <Art e={slot.emoji} size="1.3em" /> {slot.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {slot.options.map((o, oi) => (
              <button
                key={o.text}
                type="button"
                role="radio"
                aria-checked={picks[si] === oi}
                disabled={finished}
                onClick={() => setPicks((ps) => ps.map((p, i) => (i === si ? oi : p)))}
                className={`focus-ring rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                  picks[si] === oi ? "border-amber bg-amber text-navy" : "border-white/15 bg-white/5 text-white hover:border-amber/60"
                }`}
              >
                <ArtText text={o.text} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Your prompt</p>
        <p className="mt-1 text-lg font-semibold text-white">“{prompt}”</p>
      </div>
      <button
        type="button"
        onClick={send}
        disabled={!ready || finished}
        className="focus-ring w-full rounded-2xl bg-amber px-6 py-4 font-display text-xl font-extrabold text-navy shadow-[0_10px_30px_-10px_rgba(255,215,64,0.8)] disabled:opacity-40"
      >
        Send to Astro
      </button>
    </div>
  );
}

function SortStep({ step, say, miss, done }: StepProps<Extract<PromptStep, { kind: "sort" }>>) {
  const [i, setI] = useState(0);
  const item = step.items[i];
  if (!item) return null;
  return (
    <div className="space-y-4">
      <p className="flex items-start text-lg font-bold text-white">
        <span><ArtText text={step.ask} /></span>
        <SpeakButton text={step.ask} />
      </p>
      <p className="text-xs font-semibold text-white/45">
        {i + 1} of {step.items.length}
      </p>
      <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-white p-5 text-center text-lg font-bold text-navy shadow-lg">
        <ArtText text={item.text} />
        <SpeakButton text={item.text} />
      </motion.div>
      <div className="grid grid-cols-2 gap-3">
        {step.bins.map((bin, b) => (
          <motion.button
            key={bin}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (b === item.bin) {
                say("astro", `“${item.text}” goes in ${bin}. ${item.why}`);
                if (i + 1 >= step.items.length) window.setTimeout(done, 1000);
                else setI(i + 1);
              } else {
                miss();
                say("hint", `Hmm, think again about “${item.text}”.`);
              }
            }}
            className="focus-ring rounded-2xl border-2 border-white/15 bg-white/5 px-3 py-5 text-lg font-extrabold text-white hover:border-amber/60 hover:bg-white/10"
          >
            <ArtText text={bin} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SpotStep({ step, say, miss, done }: StepProps<Extract<PromptStep, { kind: "spot" }>>) {
  const [tried, setTried] = useState<number[]>([]);
  const [found, setFound] = useState(false);
  return (
    <div className="space-y-4">
      <p className="flex items-start text-lg font-bold text-white">
        <span><ArtText text={step.ask} /></span>
        <SpeakButton text={step.ask} />
      </p>
      <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-base font-semibold text-emerald-100">
        <ArtText text={step.check} />
        <SpeakButton text={step.check} />
      </div>
      <div className="flex items-start gap-2">
        <Astro size="h-10 w-10 text-2xl" />
        <div className="flex-1 space-y-2 rounded-2xl rounded-bl-sm bg-white p-3">
          {step.astro.map((sentence, si) => (
            <button
              key={sentence}
              type="button"
              disabled={found || tried.includes(si)}
              onClick={() => {
                if (si === step.wrong) {
                  setFound(true);
                  say("astro", step.why);
                  window.setTimeout(done, 1100);
                } else {
                  miss();
                  setTried((t) => [...t, si]);
                  say("hint", `“${sentence}” is true! Check the fact book again.`);
                }
              }}
              className={`focus-ring block w-full rounded-xl px-3 py-2 text-left text-base font-semibold transition ${
                found && si === step.wrong
                  ? "bg-red-100 text-red-700 line-through"
                  : tried.includes(si)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-navy hover:bg-amber/30"
              }`}
            >
              {sentence}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mission                                                              */
/* ------------------------------------------------------------------ */

function Mission({ level, index, onBack, onNext, isLast }: { level: PromptLevel; index: number; onBack: () => void; onNext: () => void; isLast: boolean }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [outcome, setOutcome] = useState<{ stars: number; xp: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const mistakes = useRef(0);
  const lineId = useRef(0);

  const say = useCallback((from: Line["from"], text: string) => {
    setLines((ls) => [...ls, { id: ++lineId.current, from, text }]);
  }, []);

  const step = level.steps[stepIdx];

  // Astro's opening line for each step (once, even if effects re-run).
  const greeted = useRef(-1);
  useEffect(() => {
    if (greeted.current === stepIdx) return;
    greeted.current = stepIdx;
    if (step && step.kind === "choose" && step.astro) say("astro", step.astro);
  }, [step, stepIdx, say]);

  const finish = () => {
    const stars = promptStars(mistakes.current);
    const reward = completeLevel("prompt", level.id, stars);
    setOutcome({ stars, xp: reward.xp });
    setConfetti((c) => c + 1);
    window.setTimeout(() => {
      const p = getProgress();
      const ids = [level.id === "oops-astro" && "fact-checker", PROMPT_CATALOG.every((c) => (p.stars[`prompt:${c.id}`] ?? 0) > 0) && "prompt-pilot"];
      ids.forEach((id) => {
        if (!id) return;
        const b = earnBadge(id);
        if (b) celebrate({ badge: b });
      });
    }, 900);
  };

  const done = () => {
    if (stepIdx + 1 >= level.steps.length) finish();
    else setStepIdx(stepIdx + 1);
  };
  const miss = () => {
    mistakes.current += 1;
  };

  const props = { say, miss, done };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
      <Confetti fire={confetti} />
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10">
          ← Mission map
        </button>
        <span className="text-sm text-white/45">
          Mission {index + 1} of {PROMPT_CATALOG.length}
        </span>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#263063] to-[#1c1f35] p-5">
        <div className="flex items-center gap-3">
          <Art e={level.emoji} size={48} />
          <div>
            <Pill tone="blue">{level.skill}</Pill>
            <h2 className="mt-1 font-display text-3xl font-extrabold leading-none text-white">{level.title}</h2>
          </div>
        </div>
        <p className="mt-3 flex items-start rounded-2xl bg-amber/20 p-3 text-base font-semibold text-amber">
          <span className="flex items-center gap-2"><Art e="💡" size={22} /> Pilot tip: {level.tip}</span>
          <SpeakButton text={level.tip} />
        </p>
        <div className="mt-3 flex gap-1.5" aria-label={`Step ${stepIdx + 1} of ${level.steps.length}`}>
          {level.steps.map((_, n) => (
            <span key={n} className={`h-2 flex-1 rounded-full ${n < stepIdx ? "bg-emerald-400" : n === stepIdx ? "bg-amber" : "bg-white/15"}`} />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <ChatLog lines={lines} />
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-[#1b1e33] p-5">
        {step && !outcome ? (
          <div key={stepIdx}>
            {step.kind === "choose" ? <ChooseStep step={step} {...props} /> : null}
            {step.kind === "build" ? <BuildStep step={step} {...props} /> : null}
            {step.kind === "sort" ? <SortStep step={step} {...props} /> : null}
            {step.kind === "spot" ? <SpotStep step={step} {...props} /> : null}
          </div>
        ) : (
          <p className="text-center text-white/60">Mission complete!</p>
        )}
      </div>

      <Modal open={!!outcome} onClose={() => setOutcome(null)} label="Mission complete">
        {outcome ? (
          <div className="text-center">
            <div className="flex justify-center">
              <Astro size="h-16 w-16 text-4xl" />
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Mission complete</p>
            <h3 className="mt-1 font-display text-4xl font-extrabold">{outcome.stars === 3 ? "Super pilot!" : "Great flying!"}</h3>
            <div className="mt-2">
              <Stars count={outcome.stars} size="text-5xl" animate />
            </div>
            <p className="mt-3 text-base text-white/80">You learned: <strong className="text-white">{level.skill}</strong></p>
            {outcome.stars < 3 ? <p className="mt-1 text-sm text-amber">Play again with fewer tries to earn 3 stars!</p> : null}
            {outcome.xp ? <p className="mt-2 font-display text-3xl text-amber">+{outcome.xp} XP</p> : null}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={onBack} className="focus-ring flex-1 rounded-2xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/10">
                Mission map
              </button>
              <button type="button" onClick={isLast ? onBack : onNext} className="focus-ring flex-1 rounded-2xl bg-amber px-4 py-3 font-bold text-navy">
                {isLast ? "All done!" : "Next mission →"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mission map                                                          */
/* ------------------------------------------------------------------ */

function MissionMap({ onPick, isPaid, unlocked, askUnlock }: { onPick: (i: number) => void; isPaid: (i: number) => boolean; unlocked: boolean; askUnlock: () => void }) {
  const p = useProgress();
  const intro = "Hi pilot! I’m Astro, your AI copilot. Let’s learn to ask great questions, check facts, and grow YOUR ideas!";
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <Pill tone="yellow">AI skills · Ages 7–10</Pill>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-none text-white md:text-5xl">Prompt Pilot</h2>
          <p className="mt-3 max-w-xl text-lg text-white/75">Learn to talk to AI like a pro, and never stop thinking for yourself.</p>
        </div>
        <div className="flex max-w-sm items-end gap-3">
          <Astro size="h-16 w-16 text-4xl" />
          <p className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm font-semibold text-navy shadow-lg">
            {intro}
            <SpeakButton text={intro} />
          </p>
        </div>
      </div>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PROMPT_CATALOG.map((m, i) => {
          const stars = starsFor(p, "prompt", m.id);
          const paid = isPaid(i);
          const locked = paid || (i > 0 && starsFor(p, "prompt", PROMPT_CATALOG[i - 1].id) === 0);
          return (
            <li key={m.id}>
              <motion.button
                type="button"
                disabled={locked && !paid}
                onClick={() => (paid ? askUnlock() : onPick(i))}
                whileHover={locked && !paid ? undefined : { y: -4 }}
                aria-label={`Mission ${i + 1}: ${m.title}, ${m.skill}${paid ? ", class level, needs class password" : locked ? ", locked" : `, ${stars} stars`}`}
                className={`focus-ring flex h-full w-full flex-col items-start rounded-2xl border p-4 text-left transition ${
                  locked && !paid
                    ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-50"
                    : stars
                    ? "border-amber/30 bg-gradient-to-br from-[#2a2d4a] to-[#1d2036] hover:border-amber/60"
                    : paid
                    ? "border-white/10 bg-white/[0.04] hover:border-amber/40"
                    : "border-sky-400/40 bg-gradient-to-br from-[#25305e] to-[#1d2036] shadow-[0_0_30px_-10px_rgba(96,165,250,0.6)] hover:border-sky-300"
                }`}
              >
                <span className="flex w-full items-center justify-between">
                  <Art e={m.emoji} size={40} />
                  {paid ? <Art e="🔑" size={20} /> : locked ? <Art e="🔒" size={20} /> : <Stars count={stars} size="text-base" />}
                </span>
                <span className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-sky-300">{m.skill}</span>
                <span className="mt-0.5 text-lg font-bold text-white">{m.title}</span>
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
      {!unlocked ? (
        <p className="mt-6 text-sm text-white/55">
          Missions 1–{FREE_LEVELS} are free.{" "}
          <button type="button" onClick={askUnlock} className="focus-ring rounded font-semibold text-amber underline-offset-4 hover:underline">
            Have a class password? Unlock all {PROMPT_CATALOG.length} →
          </button>
        </p>
      ) : null}
      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-white/40">
        For grown-ups: Astro is a pretend AI with written answers, so no real AI is used and nothing your child types or taps leaves this page.
        It practises real habits: clear prompts, asking for sources, checking facts, and using AI to grow (not replace) a child’s own thinking.
      </p>
    </div>
  );
}

export function PromptPilot() {
  const [index, setIndex] = useState<number | null>(null);
  const [asking, setAsking] = useState(false);
  const access = useLevelAccess(PROGRAMS);
  const paid = usePaidLevels<PromptLevel>("prompt", access.unlocked);
  const levels: PromptLevel[] = paid.levels ? [...PROMPT_FREE_LEVELS, ...paid.levels] : PROMPT_FREE_LEVELS;
  const current = index === null ? undefined : levels[index];

  useEffect(() => {
    window.scrollTo({ top: 0 });
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }, [index]);

  return (
    <>
      <ArcadeTopBar title="Prompt Pilot" emoji="🤖" semester="Ship It! Arcade · AI skills" />
      <RewardLayer />
      {index === null || access.isLocked(index) ? (
        <MissionMap onPick={setIndex} isPaid={access.isLocked} unlocked={access.unlocked} askUnlock={() => setAsking(true)} />
      ) : !current ? (
        <div className="mx-auto max-w-md px-4 py-24 text-center text-white/70" aria-live="polite">
          {paid.failed ? (
            <>
              <p>We couldn’t load this mission. Check your internet connection and try again.</p>
              <button type="button" onClick={() => setIndex(null)} className="focus-ring mt-4 rounded-xl border border-white/20 px-4 py-2 font-semibold text-white">
                ← Mission map
              </button>
            </>
          ) : (
            <p>Loading mission…</p>
          )}
        </div>
      ) : (
        <Mission
          key={index}
          level={current}
          index={index}
          isLast={index >= PROMPT_CATALOG.length - 1}
          onBack={() => setIndex(null)}
          onNext={() => {
            const next = index + 1;
            if (access.isLocked(next)) {
              setIndex(null);
              setAsking(true);
            } else setIndex(next);
          }}
        />
      )}
      <UnlockModal open={asking} onClose={() => setAsking(false)} program={PROGRAMS} onUnlock={access.markUnlocked} />
    </>
  );
}
