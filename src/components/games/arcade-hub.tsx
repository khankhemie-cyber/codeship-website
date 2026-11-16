"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BADGES, rankFor, setCoderName, useProgress, type GameId, type Progress } from "@/lib/games/progress";
import { ROVER_CATALOG } from "@/lib/games/rover";
import { PY_ROUNDS, RULE_CATALOG, TRAIN_ROUNDS } from "@/lib/games/bot";
import { MISSIONS } from "@/lib/games/studio";
import { Pill, RewardLayer, XpMeter, useDevFact } from "./arcade-kit";
import { FREE_LEVELS } from "./level-lock";

interface ArcadeGame {
  game: GameId;
  title: string;
  emoji: string;
  href: string;
  grades: string;
  language: string;
  pitch: string;
  levels: string[];
  gradient: string;
  glow: string;
  teaches: string[];
}

const ARCADE_GAMES: ArcadeGame[] = [
  {
    game: "rover",
    title: "Rover Rescue",
    emoji: "🛰️",
    href: "/ship-it/rover-rescue/",
    grades: "Grades 4–8",
    language: "JavaScript",
    pitch: "A rover is stranded on the moon. Type real JavaScript to guide it home. Each mission unlocks a new coding superpower.",
    levels: ROVER_CATALOG.map((l) => l.id),
    gradient: "from-[#2b3a8f] via-[#25306b] to-[#1b1e33]",
    glow: "shadow-[0_30px_80px_-30px_rgba(96,165,250,0.7)]",
    teaches: ["Sequencing", "Loops", "Functions", "Conditionals", "While loops", "Variables", "Debugging"],
  },
  {
    game: "studio",
    title: "App Studio",
    emoji: "📱",
    href: "/ship-it/app-studio/",
    grades: "Grades 4–8",
    language: "App design + JavaScript",
    pitch: "Build your own app. Add buttons and variables, make them react to taps, see the real code, then download your app to share.",
    levels: MISSIONS.map((m) => m.id),
    gradient: "from-[#8f2b6b] via-[#5e2757] to-[#1b1e33]",
    glow: "shadow-[0_30px_80px_-30px_rgba(244,114,182,0.7)]",
    teaches: ["Events", "Variables", "Lists", "User input", "Conditions", "Shipping an app"],
  },
  {
    game: "bot",
    title: "Bot Trainer",
    emoji: "🤖",
    href: "/ship-it/bot-trainer/",
    grades: "Grades 6–8",
    language: "Python + AI",
    pitch: "Warm up with Python, then train Sortie the sorting robot with data and discover how AI really learns, and how it gets biased.",
    levels: [...PY_ROUNDS.map((r) => r.id), ...TRAIN_ROUNDS.map((r) => r.id), ...RULE_CATALOG.map((r) => r.id)],
    gradient: "from-[#4b2b8f] via-[#33276b] to-[#1b1e33]",
    glow: "shadow-[0_30px_80px_-30px_rgba(167,139,250,0.7)]",
    teaches: ["Python basics", "Lists & loops", "Training data", "AI bias", "if / elif / else"],
  },
];

function starsIn(p: Progress, g: ArcadeGame) {
  return g.levels.reduce((s, id) => s + (p.stars[`${g.game}:${id}`] ?? 0), 0);
}

function NameTag() {
  const p = useProgress();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  useEffect(() => setDraft(p.coderName), [p.coderName]);

  if (editing || !p.coderName) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCoderName(draft.trim());
          setEditing(false);
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <label htmlFor="coder-name" className="text-sm font-semibold text-white/70">
          Pick a coder name:
        </label>
        <input
          id="coder-name"
          value={draft}
          maxLength={24}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. PixelNinja"
          className="w-44 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber"
        />
        <button type="submit" className="focus-ring rounded-xl bg-amber px-3 py-2 text-sm font-bold text-navy">
          Save
        </button>
        <span className="w-full text-[11px] text-white/40">Use a fun nickname, not your real name.</span>
      </form>
    );
  }
  return (
    <p className="text-lg text-white/80">
      Welcome back, <strong className="text-amber">{p.coderName}</strong>!{" "}
      <button type="button" onClick={() => setEditing(true)} className="focus-ring rounded text-xs text-white/40 underline hover:text-white">
        change
      </button>
    </p>
  );
}

export function ArcadeHub() {
  const p = useProgress();
  const { current, index } = rankFor(p.xp);
  const fact = useDevFact();

  return (
    <div className="relative overflow-hidden bg-[#161827] text-white">
      <RewardLayer />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #fff8 50%, transparent 51%), radial-gradient(1px 1px at 70% 20%, #fff6 50%, transparent 51%), radial-gradient(1.5px 1.5px at 40% 70%, #fff5 50%, transparent 51%), radial-gradient(1px 1px at 85% 60%, #fff7 50%, transparent 51%), radial-gradient(1px 1px at 10% 85%, #fff5 50%, transparent 51%)",
          backgroundSize: "380px 380px",
        }}
      />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#3F51B5]/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-40 h-[420px] w-[420px] rounded-full bg-pink-500/15 blur-3xl" aria-hidden />

      <section className="relative mx-auto max-w-6xl px-4 pb-6 pt-12 md:px-6 md:pt-16">
        <div className="grid items-end gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <Pill tone="yellow">Free to start · No sign-up · Grades 4–8</Pill>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 font-display text-5xl font-extrabold leading-[0.95] text-white md:text-7xl">
              Ship It! <span className="bg-gradient-to-r from-amber to-pink-400 bg-clip-text text-transparent">Arcade</span>
            </motion.h1>
            <p className="mt-4 max-w-xl text-lg text-white/75">
              Free coding games for kids. Pick a game, write real code and build something in about an hour. Nothing to install, nothing to buy.
            </p>
            <div className="mt-6">
              <NameTag />
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber/40 to-pink-400/30 text-4xl" aria-hidden>
                {current.emoji}
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Rank {index + 1}</p>
                <p className="font-display text-2xl font-extrabold text-white">{current.title}</p>
              </div>
            </div>
            <div className="mt-4">
              <XpMeter />
            </div>
            <p className="mt-3 text-xs text-white/45">🔒 Progress saves on this device only: no account and no personal info.</p>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-8 md:px-6" aria-labelledby="games-heading">
        <h2 id="games-heading" className="sr-only">
          Choose a game
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {ARCADE_GAMES.map((g, i) => {
            const stars = starsIn(p, g);
            const max = g.levels.length * 3;
            return (
              <motion.div key={g.game} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} whileHover={{ y: -6 }}>
                <Link href={g.href} className={`focus-ring group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b ${g.gradient} p-6 ${g.glow}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber">{g.grades}</p>
                      <p className="text-sm font-semibold text-white/70">{g.language}</p>
                    </div>
                    <span className="text-6xl drop-shadow-lg transition group-hover:rotate-6" aria-hidden>
                      {g.emoji}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-4xl font-extrabold leading-none text-white">{g.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{g.pitch}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {g.teaches.slice(0, 5).map((t) => (
                      <li key={t}>
                        <Pill>{t}</Pill>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <div className="flex items-center justify-between text-xs font-semibold text-white/60">
                      <span>
                        ★ {stars} / {max}
                      </span>
                      <span>{Math.round((stars / max) * 100)}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/30">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber to-emerald-300 transition-all" style={{ width: `${(stars / max) * 100}%` }} />
                    </div>
                    <p className="mt-3 text-[11px] font-semibold text-white/55">
                      {g.levels.length > FREE_LEVELS
                        ? `Levels 1–${FREE_LEVELS} free · 🔑 class password unlocks all ${g.levels.length}`
                        : `All ${g.levels.length} levels free`}
                    </p>
                    <span className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-amber py-3 font-display text-xl font-extrabold text-navy transition group-hover:brightness-110">
                      {stars ? "Continue" : "Play now"} <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-10 md:px-6" aria-labelledby="badges-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="badges-heading" className="font-display text-3xl font-extrabold text-white">
            Badge wall
          </h2>
          <p className="text-sm text-white/55">
            {p.badges.length} / {BADGES.length} unlocked · each badge is worth +100 XP
          </p>
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {BADGES.map((b) => {
            const has = p.badges.includes(b.id);
            return (
              <li key={b.id} className={`rounded-2xl border p-4 text-center transition ${has ? "border-amber/40 bg-gradient-to-b from-amber/15 to-transparent" : "border-white/10 bg-white/[0.03]"}`}>
                <span className={`text-4xl ${has ? "" : "opacity-25 grayscale"}`} aria-hidden>
                  {b.emoji}
                </span>
                <p className={`mt-2 text-sm font-bold ${has ? "text-white" : "text-white/45"}`}>{b.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-white/45">{b.description}</p>
                <span className="sr-only">{has ? "Unlocked" : "Locked"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center text-white/70">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber">Did you know?</p>
          <p className="mt-1 text-lg">{fact}</p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#1b1e33] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber">For teachers</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-white">Run a Ship It! session with your class</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Each game fits a single class period. It runs in any modern browser, including Chromebooks, with no accounts, so students can start right away.
              Rover Rescue has an <strong className="text-white">Instructor mode</strong> that unlocks every mission for live demos.
            </p>
            <Link href="/schools/" className="focus-ring mt-4 inline-block rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
              Bring CODEship to your school →
            </Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#1b1e33] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber">What each game teaches</p>
            <dl className="mt-3 space-y-3 text-sm">
              {ARCADE_GAMES.map((g) => (
                <div key={g.game}>
                  <dt className="font-bold text-white">
                    {g.emoji} {g.title} <span className="font-normal text-white/50">· {g.grades}</span>
                  </dt>
                  <dd className="text-white/65">{g.teaches.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-r from-[#3F51B5]/40 to-pink-500/20 p-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="font-display text-2xl font-extrabold text-white">Loved it? Keep building with a real instructor.</p>
            <p className="text-sm text-white/70">Small, inclusive classes from K to Grade 8, in Oshawa and live online across Canada.</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-2">
            <Link href="/programs/developers/" className="focus-ring rounded-2xl bg-amber px-5 py-3 font-bold text-navy">
              Developers · Grades 4–5
            </Link>
            <Link href="/programs/engineers/" className="focus-ring rounded-2xl border border-white/25 px-5 py-3 font-bold text-white hover:bg-white/10">
              Engineers · Grades 6–8
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
