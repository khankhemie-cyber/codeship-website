"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  BINS,
  ITEMS,
  MATERIALS,
  NUM_OPS,
  PY_ROUNDS,
  RULE_CATALOG,
  TEXT_OPS,
  TRAIN_ROUNDS,
  predict,
  runRules,
  type Bin,
  type Item,
  type Prediction,
  type PyRound,
  type Rule,
  type RuleChallenge,
  type TrainRound,
} from "@/lib/games/bot";
import { completeLevel, earnBadge, getProgress, starsFor, useProgress } from "@/lib/games/progress";
import { ArcadeTopBar, Confetti, Modal, Pill, RewardLayer, Stars, celebrate } from "./arcade-kit";
import { highlight } from "./code-editor";
import { FREE_LEVELS, LockBadge, UnlockModal, useLevelAccess, usePaidLevels } from "./level-lock";

type Screen =
  | { kind: "hub" }
  | { kind: "py"; round: PyRound }
  | { kind: "train"; round: TrainRound }
  | { kind: "rules"; challenge: RuleChallenge };

function BotAvatar({ mood = "happy", say }: { mood?: "happy" | "thinking" | "proud" | "confused"; say?: string }) {
  const face = { happy: "🤖", thinking: "🤔", proud: "😎", confused: "😵‍💫" }[mood];
  return (
    <div className="flex items-end gap-3">
      <motion.div
        key={mood}
        initial={{ scale: 0.8, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/40 to-sky-500/30 text-4xl shadow-[0_0_30px_-6px_rgba(167,139,250,0.7)]"
        aria-hidden
      >
        {face}
      </motion.div>
      {say ? (
        <motion.p
          key={say}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-lg"
        >
          {say}
        </motion.p>
      ) : null}
    </div>
  );
}

function award(game: "bot", id: string, stars: number) {
  const reward = completeLevel(game, id, stars);
  return reward.xp;
}

function grantBadges(ids: (string | false)[]) {
  window.setTimeout(() => {
    ids.forEach((id) => {
      if (!id) return;
      const b = earnBadge(id);
      if (b) celebrate({ badge: b });
    });
  }, 900);
}

/* ------------------------------------------------------------------ */
/* Hub                                                                  */
/* ------------------------------------------------------------------ */

/** Every Bot Trainer level in play order: the first FREE_LEVELS are free. */
const LEVEL_ORDER = [...PY_ROUNDS.map((r) => r.id), ...TRAIN_ROUNDS.map((r) => r.id), ...RULE_CATALOG.map((c) => c.id)];

function Hub({
  go,
  isPaid,
  askUnlock,
  unlocked,
  ruleChallenges,
}: {
  go: (s: Screen) => void;
  isPaid: (i: number) => boolean;
  askUnlock: () => void;
  unlocked: boolean;
  /** Rule Writer level data, fetched from the server after the class password (null until then). */
  ruleChallenges: RuleChallenge[] | null;
}) {
  const p = useProgress();
  const tracks = [
    {
      title: "Python Warm-Ups",
      emoji: "🐍",
      blurb: "Read real Python and predict what it does. Build your streak!",
      tone: "from-emerald-500/20",
      items: PY_ROUNDS.map((r) => ({ id: r.id, title: r.title, sub: r.concept, emoji: r.emoji, open: () => go({ kind: "py", round: r }) })),
    },
    {
      title: "Train the AI",
      emoji: "🧠",
      blurb: "Teach Sortie the sorting bot with data — then test how smart it got.",
      tone: "from-violet-500/20",
      items: TRAIN_ROUNDS.map((r) => ({ id: r.id, title: r.title, sub: r.concept, emoji: r.emoji, open: () => go({ kind: "train", round: r }) })),
    },
    {
      title: "Rule Writer",
      emoji: "📜",
      blurb: "Program a bot with if / elif / else rules and make every test pass.",
      tone: "from-sky-500/20",
      items: RULE_CATALOG.map((c) => ({
        id: c.id,
        title: c.title,
        sub: c.concept,
        emoji: c.emoji,
        open: () => {
          const challenge = ruleChallenges?.find((x) => x.id === c.id);
          if (challenge) go({ kind: "rules", challenge });
        },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <Pill tone="green">Python & AI · Grades 6–8</Pill>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-none text-white md:text-5xl">Bot Trainer Lab</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Meet <strong className="text-amber">Sortie</strong>, a brand-new robot that wants to help the planet by sorting waste.
            Sortie knows nothing yet. Warm up your Python, then use <em>data</em> and <em>rules</em> to make it smart.
          </p>
        </div>
        <BotAvatar say="Beep boop! Teach me something?" />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {tracks.map((t, ti) => (
          <motion.section
            key={t.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ti * 0.08 }}
            className={`rounded-3xl border border-white/10 bg-gradient-to-b ${t.tone} to-transparent p-5`}
          >
            <p className="text-3xl" aria-hidden>
              {t.emoji}
            </p>
            <h3 className="mt-2 font-display text-3xl text-white">{t.title}</h3>
            <p className="mt-1 text-sm text-white/65">{t.blurb}</p>
            <ul className="mt-4 space-y-2">
              {t.items.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={isPaid(LEVEL_ORDER.indexOf(i.id)) ? askUnlock : i.open}
                    className="focus-ring group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#1b1e33] p-3 text-left transition hover:-translate-y-0.5 hover:border-amber/40"
                  >
                    <span className="text-2xl" aria-hidden>
                      {i.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-white">{i.title}</span>
                      <span className="block truncate text-xs text-white/55">{i.sub}</span>
                    </span>
                    {isPaid(LEVEL_ORDER.indexOf(i.id)) ? <LockBadge /> : <Stars count={starsFor(p, "bot", i.id)} size="text-sm" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </div>
      {!unlocked ? (
        <p className="mt-6 text-sm text-white/55">
          The first {FREE_LEVELS} levels are free.{" "}
          <button type="button" onClick={askUnlock} className="focus-ring rounded font-semibold text-amber underline-offset-4 hover:underline">
            Have a class password? Unlock all {LEVEL_ORDER.length} →
          </button>
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Python quiz                                                          */
/* ------------------------------------------------------------------ */

function PyQuiz({ round, back }: { round: PyRound; back: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState<{ stars: number; xp: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const pz = round.puzzles[i];
  const correct = picked === pz.answer;

  const choose = (o: number) => {
    if (picked !== null && correct) return;
    setPicked(o);
    if (o === pz.answer) setStreak((s) => s + 1);
    else {
      setMistakes((m) => m + 1);
      setStreak(0);
    }
  };

  const next = () => {
    if (i < round.puzzles.length - 1) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    const xp = award("bot", round.id, stars);
    setDone({ stars, xp });
    setConfetti((c) => c + 1);
    const p = getProgress();
    grantBadges([PY_ROUNDS.every((r) => (p.stars[`bot:${r.id}`] ?? 0) > 0) && "pythonista"]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) choose(n - 1);
      if (e.key === "Enter" && picked !== null && correct) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Confetti fire={confetti} />
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={back} className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10">
          ← Lab
        </button>
        <div className="flex items-center gap-1.5" aria-label={`Question ${i + 1} of ${round.puzzles.length}`}>
          {round.puzzles.map((_, n) => (
            <span key={n} className={`h-2 rounded-full transition-all ${n < i ? "w-6 bg-emerald-400" : n === i ? "w-10 bg-amber" : "w-6 bg-white/15"}`} />
          ))}
        </div>
        <motion.span key={streak} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className={`min-w-[64px] text-right text-sm font-bold ${streak >= 2 ? "text-orange-300" : "text-white/40"}`}>
          {streak >= 2 ? `🔥 ${streak}` : `${streak} streak`}
        </motion.span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            {round.emoji} {round.title} · {i + 1}/{round.puzzles.length}
          </p>
          <h2 className="mt-2 font-display text-4xl text-white">{pz.question}</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1120]">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-2 font-mono text-xs text-white/40">main.py</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[15px] leading-7" dangerouslySetInnerHTML={{ __html: highlight(pz.code, ["print", "len", "max", "min", "append"]) }} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {pz.options.map((o, n) => {
              const isPicked = picked === n;
              const reveal = picked !== null && correct && n === pz.answer;
              return (
                <motion.button
                  key={n}
                  type="button"
                  onClick={() => choose(n)}
                  whileTap={{ scale: 0.97 }}
                  animate={isPicked && !correct ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                  className={`focus-ring flex items-center gap-3 rounded-2xl border p-4 text-left font-mono text-sm font-semibold transition ${
                    reveal
                      ? "border-emerald-400 bg-emerald-400/15 text-emerald-200"
                      : isPicked
                      ? "border-orange-400 bg-orange-400/10 text-orange-200"
                      : "border-white/10 bg-white/5 text-white hover:border-white/30"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/30 text-xs text-white/60">{n + 1}</span>
                  {o}
                </motion.button>
              );
            })}
          </div>

          <div aria-live="polite">
            {picked !== null ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-5 rounded-2xl p-4 ${correct ? "bg-emerald-400/10" : "bg-orange-400/10"}`}>
                <p className={`font-bold ${correct ? "text-emerald-300" : "text-orange-300"}`}>{correct ? "✅ Correct!" : "Not quite — try another answer."}</p>
                {correct ? <p className="mt-1 text-sm text-white/80">{pz.explain}</p> : <p className="mt-1 text-sm text-white/70">Trace the code line by line, like the computer does.</p>}
                {correct ? (
                  <button type="button" onClick={next} className="focus-ring mt-3 rounded-xl bg-amber px-5 py-2.5 font-bold text-navy">
                    {i < round.puzzles.length - 1 ? "Next →" : "Finish 🏁"}
                  </button>
                ) : null}
              </motion.div>
            ) : (
              <p className="mt-4 text-xs text-white/40">Tip: press 1–4 to answer, Enter to continue.</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <Modal open={!!done} onClose={back} label="Round complete">
        {done ? (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Round complete</p>
            <h3 className="mt-1 font-display text-5xl">{done.stars === 3 ? "Python pro!" : "Nice work!"}</h3>
            <div className="mt-3">
              <Stars count={done.stars} size="text-5xl" animate />
            </div>
            <p className="mt-3 text-sm text-white/70">{mistakes === 0 ? "Zero mistakes — flawless!" : `${mistakes} wrong guess${mistakes === 1 ? "" : "es"}. Replay for 3 stars!`}</p>
            {done.xp ? <p className="mt-2 font-display text-3xl text-amber">+{done.xp} XP</p> : null}
            <button type="button" onClick={back} className="focus-ring mt-5 w-full rounded-2xl bg-amber px-4 py-3 font-bold text-navy">
              Back to the lab
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Train the AI                                                         */
/* ------------------------------------------------------------------ */

function MaterialChip({ item }: { item: Item }) {
  const m = MATERIALS[item.material];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-semibold text-white/70">
      <span aria-hidden>{m.emoji}</span> {m.label}
    </span>
  );
}

function Train({ round, back }: { round: TrainRound; back: () => void }) {
  const [labels, setLabels] = useState<Record<string, Bin>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const [results, setResults] = useState<Prediction[] | null>(null);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState<{ stars: number; xp: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const pool = round.pool.map((id) => ITEMS[id]);
  const budget = round.budget ?? pool.length;

  const training = useMemo(
    () =>
      round.mode === "label"
        ? pool.filter((i) => labels[i.id]).map((i) => ({ item: i, label: labels[i.id] }))
        : pool.filter((i) => picked.includes(i.id)).map((i) => ({ item: i, label: i.answer })),
    [labels, picked, pool, round.mode]
  );
  const ready = round.mode === "label" ? training.length === pool.length : picked.length === budget;

  const test = () => {
    const preds = predict(training, round.test.map((id) => ITEMS[id]));
    setResults(preds);
    setShown(0);
  };

  useEffect(() => {
    if (!results) return;
    if (shown < results.length) {
      const t = window.setTimeout(() => setShown((s) => s + 1), 550);
      return () => window.clearTimeout(t);
    }
    const right = results.filter((r) => r.correct).length;
    const pct = right / results.length;
    const stars = pct === 1 ? 3 : pct >= 0.66 ? 2 : 1;
    const t = window.setTimeout(() => {
      const xp = award("bot", round.id, stars);
      setDone({ stars, xp });
      if (stars === 3) {
        setConfetti((c) => c + 1);
        grantBadges(["ai-trainer"]);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [results, shown, round.id]);

  const retry = () => {
    setResults(null);
    setDone(null);
    setShown(0);
  };

  const right = results ? results.slice(0, shown).filter((r) => r.correct).length : 0;
  const learned = Array.from(new Map(training.map((t) => [t.item.material, t.label])).entries());

  const botSay = results
    ? shown < results.length
      ? "Hmm, let me think…"
      : right === results.length
      ? "I got them ALL right! You're a great teacher!"
      : "I made some mistakes… maybe my training data had gaps?"
    : round.mode === "label"
    ? training.length === 0
      ? "Show me where each thing goes!"
      : `I've learned ${training.length} example${training.length === 1 ? "" : "s"}!`
    : `Pick ${budget - picked.length} more example${budget - picked.length === 1 ? "" : "s"} to teach me.`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Confetti fire={confetti} />
      <button type="button" onClick={back} className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10">
        ← Lab
      </button>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Pill tone="pink">
            {round.emoji} {round.concept}
          </Pill>
          <h2 className="mt-2 font-display text-5xl leading-none text-white">{round.title}</h2>
          <p className="mt-2 max-w-2xl text-white/75">{round.brief}</p>

          {!results ? (
            <>
              <div className="mt-6 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                  {round.mode === "label" ? "Training data — label each item" : `Choose ${budget} examples to teach`}
                </h3>
                {round.mode === "budget" ? (
                  <span className={`font-display text-2xl ${picked.length === budget ? "text-emerald-300" : "text-amber"}`}>
                    {picked.length}/{budget}
                  </span>
                ) : null}
              </div>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pool.map((item) => {
                  const isPicked = picked.includes(item.id);
                  const label = labels[item.id];
                  return (
                    <motion.li key={item.id} layout className={`rounded-2xl border p-3 transition ${label || isPicked ? "border-amber/40 bg-[#26294a]" : "border-white/10 bg-[#1b1e33]"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl" aria-hidden>
                          {item.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-white">{item.name}</p>
                          <MaterialChip item={item} />
                        </div>
                      </div>
                      {round.mode === "label" ? (
                        <div className="mt-3 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={`Bin for ${item.name}`}>
                          {BINS.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              role="radio"
                              aria-checked={label === b.id}
                              onClick={() => setLabels((l) => ({ ...l, [item.id]: b.id }))}
                              className={`focus-ring rounded-xl border bg-gradient-to-b px-1 py-1.5 text-xs font-bold transition ${
                                label === b.id ? `${b.tone} text-white` : "border-white/10 from-transparent to-transparent text-white/60 hover:text-white"
                              }`}
                            >
                              <span aria-hidden>{b.emoji}</span> {b.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-pressed={isPicked}
                          disabled={!isPicked && picked.length >= budget}
                          onClick={() => setPicked((p) => (isPicked ? p.filter((x) => x !== item.id) : [...p, item.id]))}
                          className={`focus-ring mt-3 w-full rounded-xl border px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                            isPicked ? "border-amber bg-amber text-navy" : "border-white/15 text-white/80 hover:border-amber/50"
                          }`}
                        >
                          {isPicked ? "✓ Teaching this" : `Teach: ${BINS.find((b) => b.id === item.answer)?.emoji} ${item.answer}`}
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={test}
                disabled={!ready}
                className="focus-ring mt-6 rounded-2xl bg-amber px-8 py-3.5 font-display text-2xl text-navy shadow-[0_10px_30px_-10px_rgba(255,215,64,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                🧪 Test the bot
              </button>
              {!ready ? <p className="mt-2 text-xs text-white/45">{round.mode === "label" ? "Label every item first." : `Pick exactly ${budget}.`}</p> : null}
            </>
          ) : (
            <div className="mt-6">
              <div className="flex items-end justify-between">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">Test results — items Sortie has never seen</h3>
                <p className="font-display text-4xl text-amber" aria-live="polite">
                  {Math.round((right / results.length) * 100)}%
                </p>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-emerald-300" animate={{ width: `${(right / results.length) * 100}%` }} />
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {results.slice(0, shown).map((r) => (
                  <motion.li
                    key={r.item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-start gap-3 rounded-2xl border p-3 ${r.correct ? "border-emerald-400/40 bg-emerald-400/10" : "border-orange-400/40 bg-orange-400/10"}`}
                  >
                    <span className="text-4xl" aria-hidden>
                      {r.item.emoji}
                    </span>
                    <div className="min-w-0 text-sm">
                      <p className="font-bold text-white">
                        {r.item.name} {r.correct ? "✅" : "❌"}
                      </p>
                      <p className="text-white/75">
                        {r.guess ? (
                          <>
                            Bot says <strong>{BINS.find((b) => b.id === r.guess)?.emoji} {r.guess}</strong> — it looks like {r.because?.emoji} {r.because?.name} ({MATERIALS[r.item.material].label}).
                          </>
                        ) : (
                          <>🤔 “I’ve never seen {MATERIALS[r.item.material].label} before — I can’t tell!”</>
                        )}
                      </p>
                      {!r.correct ? <p className="mt-1 text-xs text-orange-200">Correct: {BINS.find((b) => b.id === r.item.answer)?.emoji} {r.item.answer}</p> : null}
                    </div>
                  </motion.li>
                ))}
              </ul>
              {shown >= results.length ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-2xl border border-violet-400/30 bg-violet-400/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">💡 What developers learn from this</p>
                  <p className="mt-1 text-white/85">{round.lesson}</p>
                  <button type="button" onClick={retry} className="focus-ring mt-3 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                    ↺ Retrain Sortie
                  </button>
                </motion.div>
              ) : null}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-white/10 bg-[#1b1e33] p-5 lg:sticky lg:top-24" aria-label="What the bot has learned">
          <BotAvatar
            mood={results ? (shown < results.length ? "thinking" : right === results.length ? "proud" : "confused") : "happy"}
            say={botSay}
          />
          <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-white/50">Sortie’s memory</h3>
          {learned.length ? (
            <ul className="mt-2 space-y-1.5 font-mono text-xs">
              {learned.map(([mat, label]) => (
                <motion.li key={mat} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-1.5 text-white/85">
                  <span>
                    {MATERIALS[mat].emoji} {mat}
                  </span>
                  <span>→ {BINS.find((b) => b.id === label)?.emoji} {label}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-white/45">Empty! Sortie hasn’t learned anything yet.</p>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-white/40">
            How Sortie thinks: for each new item, it finds the training example that’s most similar (same material) and copies its label.
            That’s a real AI method called <em>nearest neighbour</em>. Recycling rules differ by city — check yours!
          </p>
        </aside>
      </div>

      <Modal open={!!done} onClose={() => setDone(null)} label="Test complete">
        {done && results ? (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">Accuracy</p>
            <p className="font-display text-7xl text-white">{Math.round((results.filter((r) => r.correct).length / results.length) * 100)}%</p>
            <Stars count={done.stars} size="text-5xl" animate />
            <p className="mt-3 text-sm text-white/75">
              {done.stars === 3 ? "Perfect! Your data taught Sortie everything it needed." : "Look at what Sortie got wrong. What was missing — or mislabelled — in your training data?"}
            </p>
            {done.xp ? <p className="mt-2 font-display text-3xl text-amber">+{done.xp} XP</p> : null}
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setDone(null)} className="focus-ring flex-1 rounded-2xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/10">
                See results
              </button>
              <button type="button" onClick={back} className="focus-ring flex-1 rounded-2xl bg-amber px-4 py-3 font-bold text-navy">
                Back to lab
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rule Writer                                                          */
/* ------------------------------------------------------------------ */

function fmt(v: string | number) {
  return typeof v === "number" ? String(v) : `"${v}"`;
}

function InlineSelect({ value, options, onChange, label, tone }: { value: string; options: string[]; onChange: (v: string) => void; label: string; tone: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`focus-ring mx-0.5 cursor-pointer rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-sm hover:border-amber/60 ${tone}`}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#1b1e33] text-white">
          {o}
        </option>
      ))}
    </select>
  );
}

function RuleWriter({ challenge, back }: { challenge: RuleChallenge; back: () => void }) {
  const [rules, setRules] = useState<Rule[]>(challenge.starter);
  const [elseResult, setElseResult] = useState(challenge.starterElse);
  const [ran, setRan] = useState(false);
  const [done, setDone] = useState<{ stars: number; xp: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const field = challenge.fields[0];
  const ops = field.kind === "number" ? NUM_OPS : TEXT_OPS;

  const outcomes = challenge.cases.map((c) => {
    const got = runRules(rules, elseResult, c.input);
    return { ...c, got, pass: got === c.expect };
  });
  const passing = outcomes.filter((o) => o.pass).length;

  const update = (i: number, patch: Partial<Rule>) => {
    setRan(false);
    setRules((rs) => rs.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  };

  const runTests = () => {
    setRan(true);
    if (passing === outcomes.length) {
      const stars = rules.length <= challenge.parRules ? 3 : 2;
      const xp = award("bot", challenge.id, stars);
      setDone({ stars, xp });
      setConfetti((c) => c + 1);
      const p = getProgress();
      grantBadges([RULE_CATALOG.every((c) => (p.stars[`bot:${c.id}`] ?? 0) > 0) && "rule-maker"]);
    }
  };

  const valueOpts = field.values.map(String);
  const code = `def ${challenge.fnName}(${challenge.param}):`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Confetti fire={confetti} />
      <button type="button" onClick={back} className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10">
        ← Lab
      </button>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <Pill tone="blue">
            {challenge.emoji} {challenge.concept}
          </Pill>
          <h2 className="mt-2 font-display text-5xl leading-none text-white">{challenge.title}</h2>
          <p className="mt-2 text-white/75">{challenge.brief}</p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1120]">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-2 font-mono text-xs text-white/40">bot_rules.py</span>
            </div>
            <div className="space-y-2 overflow-x-auto p-4 font-mono text-sm leading-8 text-white">
              <p>
                <span className="font-semibold text-pink-400">def</span> <span className="text-amber">{challenge.fnName}</span>
                <span className="text-violet-300">(</span>
                <span className="text-sky-200">{challenge.param}</span>
                <span className="text-violet-300">)</span>:
              </p>
              {rules.map((r, i) => (
                <motion.div key={i} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="group pl-6">
                  <div className="flex flex-wrap items-center">
                    <span className="font-semibold text-pink-400">{i === 0 ? "if" : "elif"}</span>&nbsp;
                    <span className="text-sky-200">{challenge.param}</span>
                    <span className="text-violet-300">[</span>
                    <span className="text-emerald-300">&quot;{r.field}&quot;</span>
                    <span className="text-violet-300">]</span>
                    <InlineSelect label={`Rule ${i + 1} comparison`} value={r.op} options={ops} onChange={(v) => update(i, { op: v })} tone="text-slate-200" />
                    <InlineSelect
                      label={`Rule ${i + 1} value`}
                      value={String(r.value)}
                      options={valueOpts}
                      onChange={(v) => update(i, { value: field.kind === "number" ? Number(v) : v })}
                      tone={field.kind === "number" ? "text-orange-300" : "text-emerald-300"}
                    />
                    :
                    <button
                      type="button"
                      onClick={() => {
                        setRan(false);
                        setRules((rs) => rs.filter((_, n) => n !== i));
                      }}
                      disabled={rules.length === 1}
                      aria-label={`Delete rule ${i + 1}`}
                      className="focus-ring ml-2 rounded px-1.5 text-xs text-white/30 hover:bg-red-400/20 hover:text-red-300 disabled:hidden"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="pl-6">
                    <span className="font-semibold text-pink-400">return</span>{" "}
                    <InlineSelect label={`Rule ${i + 1} result`} value={r.result} options={challenge.outputs} onChange={(v) => update(i, { result: v })} tone="text-emerald-300" />
                  </div>
                </motion.div>
              ))}
              <div className="pl-6">
                <button
                  type="button"
                  onClick={() => {
                    setRan(false);
                    setRules((rs) => [...rs, { field: field.key, op: ops[0], value: field.values[0], result: challenge.outputs[0] }]);
                  }}
                  className="focus-ring rounded-lg border border-dashed border-white/20 px-3 py-0.5 text-xs font-semibold text-white/60 hover:border-amber/50 hover:text-amber"
                >
                  + add elif
                </button>
              </div>
              <div className="pl-6">
                <span className="font-semibold text-pink-400">else</span>:
                <div className="pl-6">
                  <span className="font-semibold text-pink-400">return</span>{" "}
                  <InlineSelect label="Else result" value={elseResult} options={challenge.outputs} onChange={(v) => { setRan(false); setElseResult(v); }} tone="text-emerald-300" />
                </div>
              </div>
            </div>
          </div>
          <p className="sr-only">{code}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={runTests} className="focus-ring rounded-2xl bg-amber px-8 py-3.5 font-display text-2xl text-navy shadow-[0_10px_30px_-10px_rgba(255,215,64,0.8)]">
              ▶ Run tests
            </button>
            <span className="text-sm text-white/55">
              ★★★ pass every test using {challenge.parRules} rules or fewer (plus else)
            </span>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-white/10 bg-[#1b1e33] p-5" aria-live="polite" aria-label="Test results">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Tests</h3>
            {ran ? (
              <span className={`font-display text-2xl ${passing === outcomes.length ? "text-emerald-300" : "text-orange-300"}`}>
                {passing}/{outcomes.length} passing
              </span>
            ) : (
              <span className="text-xs text-white/40">Press Run tests</span>
            )}
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {outcomes.map((o, i) => (
              <motion.li
                key={o.label}
                initial={false}
                animate={ran ? { opacity: 1, x: 0 } : { opacity: 0.75 }}
                transition={{ delay: ran ? i * 0.06 : 0 }}
                className={`grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl px-3 py-2 ${
                  !ran ? "bg-black/20" : o.pass ? "bg-emerald-400/10" : "bg-orange-400/10"
                }`}
              >
                <span className="text-white/90">{o.label}</span>
                <span className="font-mono text-xs">
                  {ran ? (o.pass ? "✅ " : "❌ ") : ""}
                  <span className="text-white/50">want</span> <span className="text-emerald-300">{fmt(o.expect)}</span>
                  {ran && !o.pass ? (
                    <>
                      {" "}
                      <span className="text-white/50">got</span> <span className="text-orange-300">{fmt(o.got)}</span>
                    </>
                  ) : null}
                </span>
              </motion.li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-white/40">
            Python checks each <code className="text-pink-300">if</code> / <code className="text-pink-300">elif</code> from top to bottom and returns at the first one that’s True.
            If none match, <code className="text-pink-300">else</code> catches everything left over. Order matters!
          </p>
        </aside>
      </div>

      <Modal open={!!done} onClose={() => setDone(null)} label="All tests passing">
        {done ? (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">All tests passing</p>
            <h3 className="mt-1 font-display text-5xl">{done.stars === 3 ? "Clean code!" : "It works!"}</h3>
            <Stars count={done.stars} size="text-5xl" animate />
            <p className="mt-3 text-sm text-white/75">
              {done.stars === 3 ? "Short, clear rules — exactly how pros write it." : `Can you do it with only ${challenge.parRules} rules? Hint: let else do more work.`}
            </p>
            {done.xp ? <p className="mt-2 font-display text-3xl text-amber">+{done.xp} XP</p> : null}
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setDone(null)} className="focus-ring flex-1 rounded-2xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/10">
                Keep editing
              </button>
              <button type="button" onClick={back} className="focus-ring flex-1 rounded-2xl bg-amber px-4 py-3 font-bold text-navy">
                Back to lab
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function BotTrainer() {
  const [screen, setScreen] = useState<Screen>({ kind: "hub" });
  const [asking, setAsking] = useState(false);
  const access = useLevelAccess("engineers");
  // Rule Writer (levels 6–7) comes from the server only after the class password.
  const paidRules = usePaidLevels<RuleChallenge>("bot", access.unlocked);
  const back = () => setScreen({ kind: "hub" });
  const screenId = screen.kind === "py" || screen.kind === "train" ? screen.round.id : screen.kind === "rules" ? screen.challenge.id : null;
  const screenLocked = screenId !== null && access.isLocked(LEVEL_ORDER.indexOf(screenId));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  return (
    <>
      <ArcadeTopBar title="Bot Trainer" emoji="🤖" semester="Ship It! Arcade · Python & AI" />
      <RewardLayer />
      {screen.kind === "hub" || screenLocked ? (
        <Hub go={setScreen} isPaid={access.isLocked} askUnlock={() => setAsking(true)} unlocked={access.unlocked} ruleChallenges={paidRules.levels} />
      ) : null}
      <UnlockModal open={asking} onClose={() => setAsking(false)} program="engineers" onUnlock={access.markUnlocked} />
      {screen.kind === "py" && !screenLocked ? <PyQuiz key={screen.round.id} round={screen.round} back={back} /> : null}
      {screen.kind === "train" && !screenLocked ? <Train key={screen.round.id} round={screen.round} back={back} /> : null}
      {screen.kind === "rules" && !screenLocked ? <RuleWriter key={screen.challenge.id} challenge={screen.challenge} back={back} /> : null}
    </>
  );
}
