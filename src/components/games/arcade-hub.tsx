"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BADGES, rankFor, setCoderName, useProgress, type GameId, type Progress } from "@/lib/games/progress";
import { ROVER_CATALOG } from "@/lib/games/rover";
import { PY_ROUNDS, RULE_CATALOG, TRAIN_ROUNDS } from "@/lib/games/bot";
import { MISSIONS } from "@/lib/games/studio";
import { PROMPT_CATALOG } from "@/lib/games/prompt";
import { BUS_FREE_LEVELS, BUS_LEVEL_IDS } from "@/lib/games/bus/levels";
import { RewardLayer, XpMeter, useDevFact } from "./arcade-kit";
import { FREE_LEVELS } from "./level-lock";
import { ArcadeIntro, BRAND } from "./arcade-intro";

interface ArcadeGame {
  game: GameId;
  title: string;
  emoji: string;
  href: string;
  grades: string;
  language: string;
  pitch: string;
  levels: string[];
  teaches: string[];
  /** Free levels, when not the arcade default (FREE_LEVELS). */
  free?: number;
  /** Card thumbnail, a real screenshot of the game (public/arcade). */
  thumb: string;
  /** Lowest and highest school grade the game suits (K = 0). */
  gradeRange: [number, number];
  /** Topic filter chip this game belongs to. */
  topic: Topic;
  /** Card accent colour. */
  accent: string;
  isNew?: boolean;
}

type Topic = "Blocks" | "JavaScript" | "AI" | "Python";

/** Grade chips, each in its CODEship level colour. */
const GRADE_FILTERS: { label: string; range: [number, number]; color: string; ink: string }[] = [
  { label: "K–Grade 1", range: [0, 1], color: BRAND.yellow, ink: BRAND.navy },
  { label: "Grades 2–3", range: [2, 3], color: BRAND.tealDark, ink: "#fff" },
  { label: "Grades 4–5", range: [4, 5], color: BRAND.purple, ink: "#fff" },
  { label: "Grades 6–8", range: [6, 8], color: BRAND.navy, ink: "#fff" },
];
const TOPICS: Topic[] = ["Blocks", "JavaScript", "AI", "Python"];
const TOPIC_COLOR: Record<Topic, string> = { Blocks: BRAND.yellow, JavaScript: BRAND.purple, AI: BRAND.tealDark, Python: BRAND.navy };

const ARCADE_GAMES: ArcadeGame[] = [
  {
    game: "port",
    title: "Port CODEship",
    emoji: "⚓",
    href: "/ship-it/port-codeship/",
    grades: "Grades 4–8",
    language: "3D open world · Python or JavaScript",
    pitch: "Explore a 3D seaside town, climb anything, and build your house. Then code robots in real Python or JavaScript to help the shop, clean the beach and more.",
    levels: ["home", "market", "beach"],
    teaches: ["Loops", "Functions", "Dictionaries", "while loops", "if / elif / else", "Automation"],
    free: 3,
    thumb: "/arcade/port.jpg",
    gradeRange: [4, 8],
    topic: "Python",
    accent: BRAND.teal,
    isNew: true,
  },
  {
    game: "bus",
    title: "Bus Buddies Road Trip",
    emoji: "🚌",
    href: "/ship-it/bus-buddies/",
    grades: "Ages 4–6",
    language: "Picture blocks · no reading needed",
    pitch: "Put picture blocks in order to drive Bina the Bus. Pick up friends, cross the Big Lake and get to a surprise party.",
    levels: BUS_LEVEL_IDS,
    teaches: ["Sequencing", "Debugging", "Waiting", "Loops", "Planning a route"],
    free: BUS_FREE_LEVELS,
    thumb: "/arcade/bus.jpg",
    gradeRange: [0, 1],
    topic: "Blocks",
    accent: BRAND.yellow,
    isNew: true,
  },
  {
    game: "rover",
    title: "Rover Rescue",
    emoji: "🛰️",
    href: "/ship-it/rover-rescue/",
    grades: "Grades 4–8",
    language: "JavaScript",
    pitch: "A rover is stranded on the moon. Type real JavaScript to guide it home. Each mission unlocks a new coding superpower.",
    levels: ROVER_CATALOG.map((l) => l.id),
    teaches: ["Sequencing", "Loops", "Functions", "Conditionals", "While loops", "Variables", "Debugging"],
    thumb: "/arcade/rover.jpg",
    gradeRange: [4, 8],
    topic: "JavaScript",
    accent: BRAND.purple,
  },
  {
    game: "prompt",
    title: "Prompt Pilot",
    emoji: "🧑‍✈️",
    href: "/ship-it/prompt-pilot/",
    grades: "Ages 7–10",
    language: "AI skills",
    pitch: "Team up with Astro, an AI copilot. Learn to ask clear questions, ask for sources, catch AI mistakes, and grow your own ideas.",
    levels: PROMPT_CATALOG.map((m) => m.id),
    teaches: ["Clear prompts", "Asking for sources", "Fact-checking AI", "Growing ideas", "Spotting gaps"],
    thumb: "/arcade/prompt.jpg",
    gradeRange: [2, 5],
    topic: "AI",
    accent: BRAND.teal,
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
    teaches: ["Events", "Variables", "Lists", "User input", "Conditions", "Shipping an app"],
    thumb: "/arcade/studio.jpg",
    gradeRange: [4, 8],
    topic: "JavaScript",
    accent: BRAND.yellow,
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
    teaches: ["Python basics", "Lists & loops", "Training data", "AI bias", "if / elif / else"],
    thumb: "/arcade/bot.jpg",
    gradeRange: [6, 8],
    topic: "Python",
    accent: BRAND.navy,
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
          className="w-40 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber"
        />
        <button type="submit" className="focus-ring rounded-full bg-amber px-4 py-2 text-sm font-bold text-navy">
          Save
        </button>
        <span className="w-full text-xs text-white/50">Use a fun nickname, not your real name.</span>
      </form>
    );
  }
  return (
    <p className="text-base text-white/80">
      Welcome back, <strong className="text-amber">{p.coderName}</strong>!{" "}
      <button type="button" onClick={() => setEditing(true)} className="focus-ring rounded text-xs text-white/50 underline hover:text-white">
        change
      </button>
    </p>
  );
}

function freeLine(g: ArcadeGame) {
  const free = g.free ?? FREE_LEVELS;
  return g.levels.length > free ? `Levels 1–${free} free · class password unlocks all ${g.levels.length}` : `All ${g.levels.length} levels free`;
}

function Chip({ active, onClick, children, color = BRAND.navy, ink = "#fff" }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string; ink?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={active ? { backgroundColor: color, borderColor: color, color: ink } : { borderColor: `${color}55` }}
      className={`focus-ring rounded-full border-2 px-4 py-2 text-sm font-bold transition ${active ? "shadow-md" : "bg-white text-[#001532] hover:shadow"}`}
    >
      {children}
    </button>
  );
}

function GameCard({ g, stars, featured = false }: { g: ArcadeGame; stars: number; featured?: boolean }) {
  const max = g.levels.length * 3;
  return (
    <Link
      href={g.href}
      className={`focus-ring group flex h-full overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl ${
        featured ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/10] md:w-3/5 md:aspect-auto" : "aspect-[16/10]"}`} style={{ backgroundColor: g.accent }}>
        <Image src={g.thumb} alt={`${g.title} game screen`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"} />
        {g.isNew && <span className="absolute left-3 top-3 rounded-full bg-[#F4D734] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#001532] shadow">New</span>}
        <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: g.accent }} aria-hidden />
        <span className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg transition group-hover:rotate-6" aria-hidden>
          {g.emoji}
        </span>
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-8 md:justify-center" : ""}`}>
        <p className="text-sm font-bold" style={{ color: g.accent === BRAND.yellow ? BRAND.tealDark : g.accent }}>
          {g.grades} <span className="text-gray-400">|</span> {g.language}
        </p>
        <h3 className={`mt-2 font-display font-extrabold leading-tight text-[#001532] ${featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>{g.title}</h3>
        <p className={`mt-2 text-gray-600 ${featured ? "text-lg" : "text-base"}`}>{g.pitch}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {g.teaches.slice(0, featured ? 5 : 3).map((t) => (
            <li key={t} className="rounded-full bg-[#F4F1EA] px-3 py-1 text-xs font-bold text-[#001532]">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-5">
          {stars > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>★ {stars} / {max} stars</span>
                <span>{Math.round((stars / max) * 100)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-amber to-emerald-400" style={{ width: `${(stars / max) * 100}%` }} />
              </div>
            </div>
          )}
          <p className="text-xs font-semibold text-gray-500">{freeLine(g)}</p>
          <span className="mt-3 flex items-center justify-center gap-2 rounded-full bg-amber py-3 font-display text-lg font-extrabold text-navy transition group-hover:brightness-105">
            {stars ? "Continue" : "Play"} <span aria-hidden className="transition group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ArcadeHub() {
  const p = useProgress();
  const { current, index } = rankFor(p.xp);
  const fact = useDevFact();
  const [grade, setGrade] = useState<number | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  const featured = ARCADE_GAMES.find((g) => g.isNew) ?? ARCADE_GAMES[0];
  const filtering = grade !== null || topic !== null;
  const shown = ARCADE_GAMES.filter((g) => {
    if (topic && g.topic !== topic) return false;
    if (grade !== null) {
      const [lo, hi] = GRADE_FILTERS[grade].range;
      if (g.gradeRange[1] < lo || g.gradeRange[0] > hi) return false;
    }
    return filtering || g !== featured;
  });

  return (
    <div className="relative overflow-hidden bg-[#FAF8F4] text-[#001532]">
      <RewardLayer />

      <ArcadeIntro games={ARCADE_GAMES.length} />

      {/* ── Player strip ── */}
      <section className="relative overflow-hidden bg-[#FFF8E1]">
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1.3fr_1fr] md:px-6">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }}>
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">Made by CODEship teachers, for kids.</h2>
            <p className="mt-3 max-w-xl text-lg text-gray-700">Pick a game, write real code and build something in about an hour.</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {[
                ["Free to start", BRAND.yellow, BRAND.navy],
                ["No sign-up", BRAND.tealDark, "#fff"],
                ["About an hour each", BRAND.purple, "#fff"],
                ["Works on Chromebooks", BRAND.navy, "#fff"],
              ].map(([t, bg, ink]) => (
                <li key={t} className="rounded-full px-4 py-2 text-sm font-bold" style={{ backgroundColor: bg, color: ink }}>
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Player card */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="rounded-3xl p-6 text-white shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.purple})` }}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl" style={{ backgroundColor: `${BRAND.yellow}33` }} aria-hidden>
                {current.emoji}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Your rank · {index + 1}</p>
                <p className="font-display text-2xl font-extrabold">{current.title}</p>
              </div>
            </div>
            <div className="mt-4">
              <XpMeter />
            </div>
            <div className="mt-5">
              <NameTag />
            </div>
            <p className="mt-4 text-xs text-white/60">🔒 Progress saves on this device only. No account, no personal info.</p>
          </motion.div>
        </div>
      </section>

      {/* ── Catalog ── */}
      <section id="games" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 md:px-6" aria-labelledby="games-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="games-heading" className="font-display text-3xl font-extrabold md:text-4xl">
            Choose a game
          </h2>
          <p className="text-sm font-semibold text-gray-500">
            {filtering ? `${shown.length} of ${ARCADE_GAMES.length} games` : `${ARCADE_GAMES.length} games`}
          </p>
        </div>

        {/* Filters */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by grade">
            <span className="w-16 text-sm font-bold text-gray-500">Grade</span>
            <Chip active={grade === null} onClick={() => setGrade(null)}>
              All
            </Chip>
            {GRADE_FILTERS.map((f, i) => (
              <Chip key={f.label} active={grade === i} color={f.color} ink={f.ink} onClick={() => setGrade(grade === i ? null : i)}>
                {f.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by topic">
            <span className="w-16 text-sm font-bold text-gray-500">Topic</span>
            <Chip active={topic === null} onClick={() => setTopic(null)}>
              All
            </Chip>
            {TOPICS.map((t) => (
              <Chip key={t} active={topic === t} color={TOPIC_COLOR[t]} ink={t === "Blocks" ? BRAND.navy : "#fff"} onClick={() => setTopic(topic === t ? null : t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>

        {!filtering && (
          <motion.div className="mt-8" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: BRAND.purple }}>★ Featured · New game</p>
            <GameCard g={featured} stars={starsIn(p, featured)} featured />
          </motion.div>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {shown.map((g, i) => (
            <motion.div
              key={g.game}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (i % 3) * 0.08, type: "spring", stiffness: 110, damping: 16 }}
            >
              <GameCard g={g} stars={starsIn(p, g)} />
            </motion.div>
          ))}
        </div>
        {shown.length === 0 && (
          <p className="mt-6 rounded-3xl bg-white p-8 text-center text-lg text-gray-600">
            No game matches both filters yet.{" "}
            <button type="button" className="font-bold text-[#0F6F7C] underline" onClick={() => { setGrade(null); setTopic(null); }}>
              Show all games
            </button>
          </p>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-4 md:px-6">
          {[
            ["1", "Pick a game", "Choose by grade or topic. Every game starts easy."],
            ["2", "Write real code", "Blocks, JavaScript or Python, with hints when you're stuck."],
            ["3", "Earn stars and badges", "Each level gives up to 3 stars. Badges add XP to your rank."],
            ["4", "Keep going in class", "A class password unlocks every level for CODEship students."],
          ].map(([n, t, d], i) => (
            <motion.div key={n} className="flex gap-4" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-xl font-extrabold"
                style={{ backgroundColor: [BRAND.yellow, BRAND.tealDark, BRAND.purple, BRAND.navy][i], color: i === 0 ? BRAND.navy : "#fff" }}
              >
                {n}
              </span>
              <div>
                <h3 className="font-display text-lg font-extrabold">{t}</h3>
                <p className="mt-1 text-base text-gray-600">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Badges ── */}
      <section className="bg-[#F1ECF9]">
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6" aria-labelledby="badges-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="badges-heading" className="font-display text-3xl font-extrabold">
            Badge wall
          </h2>
          <p className="text-sm font-semibold text-gray-500">
            {p.badges.length} / {BADGES.length} unlocked · each badge is worth +100 XP
          </p>
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {BADGES.map((b) => {
            const has = p.badges.includes(b.id);
            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (BADGES.indexOf(b) % 7) * 0.04 }}
                className={`rounded-2xl p-4 text-center ${has ? "bg-[#FFF4C7] ring-2 ring-amber" : "bg-white ring-1 ring-black/5"}`}
              >
                <span className={`text-4xl ${has ? "" : "opacity-30 grayscale"}`} aria-hidden>
                  {b.emoji}
                </span>
                <p className={`mt-2 text-sm font-bold ${has ? "text-[#001532]" : "text-gray-500"}`}>{b.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-gray-500">{b.description}</p>
                <span className="sr-only">{has ? "Unlocked" : "Locked"}</span>
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-8 rounded-3xl bg-[#E9F7F8] p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">Did you know?</p>
          <p className="mt-1 text-lg">{fact}</p>
        </div>
      </div>
      </section>

      {/* ── Teachers + parents ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">For teachers</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">Run a Ship It! session with your class</h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              Each game fits a single class period. It runs in any modern browser, including Chromebooks, with no accounts, so students can start right away.
              Rover Rescue has an <strong className="text-[#001532]">Instructor mode</strong> that unlocks every mission for live demos.
            </p>
            <Link href="/schools/" className="focus-ring mt-4 inline-block rounded-full border-2 border-[#001532] px-5 py-2 text-sm font-bold hover:bg-[#001532] hover:text-white">
              Bring CODEship to your school →
            </Link>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">What each game teaches</p>
            <dl className="mt-3 space-y-3 text-sm">
              {ARCADE_GAMES.map((g) => (
                <div key={g.game}>
                  <dt className="font-bold">
                    {g.emoji} {g.title} <span className="font-normal text-gray-500">· {g.grades}</span>
                  </dt>
                  <dd className="text-gray-600">{g.teaches.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div style={{ background: `linear-gradient(120deg, ${BRAND.navy}, ${BRAND.purple} 60%, ${BRAND.teal})` }} className="mt-8 flex flex-col items-center gap-4 rounded-3xl p-8 text-center text-white md:flex-row md:justify-between md:text-left">
          <div>
            <p className="font-display text-2xl font-extrabold">Loved it? Keep building with a real instructor.</p>
            <p className="text-base text-white/70">Small classes from K to Grade 8, in Oshawa and live online.</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-2">
            <Link href="/#book" className="focus-ring rounded-full bg-amber px-6 py-3 font-bold text-navy">
              Find your child&apos;s level
            </Link>
            <Link href="/programs/camps/#march-break" className="focus-ring rounded-full border-2 border-white/40 px-6 py-3 font-bold text-white hover:bg-white/10">
              March Break camp
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
