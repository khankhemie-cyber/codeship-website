"use client";

import { useEffect, useState } from "react";
import { costumeUrl } from "../blocks/costumes";
import Adventure from "./adventure/Adventure";
import { CREW } from "./adventure/story";
import { STRINGS, type Lang } from "./i18n";
import RocketHop from "./RocketHop";
import SpriteParty from "./SpriteParty";
import StarPath from "./StarPath";

/**
 * CODEship Playground (/tools/playground): short, no-sign-in coding games
 * for warm-ups and filler moments. Each game is linkable on its own
 * (/tools/playground#star-path) so an instructor can put one on the board.
 */

const GAMES = [
  { id: "adventure", key: "adventure", ages: "4–8", icon: "kai", colour: "#283593" },
  { id: "star-path", key: "starPath", ages: "4–7", icon: "robot", colour: "#138A9A" },
  { id: "sprite-party", key: "spriteParty", ages: "6–10", icon: "cat", colour: "#7E57C2" },
  { id: "rocket-hop", key: "rocketHop", ages: "6–12", icon: "star", colour: "#D58401" },
] as const;
type GameId = (typeof GAMES)[number]["id"] | null;

const LANG_KEY = "codeship-playground-lang";

export default function PlaygroundApp() {
  const [lang, setLang] = useState<Lang>("en");
  const [game, setGame] = useState<GameId>(null);
  const s = STRINGS[lang];

  useEffect(() => {
    let l: Lang = navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "fr") l = saved;
    } catch {}
    setLang(l);
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      setGame(GAMES.some((g) => g.id === id) ? (id as GameId) : null);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const open = (id: GameId) => {
    if (id) window.location.hash = id;
    else history.pushState(null, "", window.location.pathname);
    setGame(id);
    window.scrollTo(0, 0);
  };
  const toggleLang = () => {
    const next: Lang = lang === "en" ? "fr" : "en";
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  };

  const current = GAMES.find((g) => g.id === game);

  return (
    <div className="min-h-screen bg-[#010F2A] text-white">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        {current ? (
          <button type="button" onClick={() => open(null)} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]">
            ← {s.back}
          </button>
        ) : (
          <span className="text-2xl" aria-hidden="true">
            🚀
          </span>
        )}
        <h1 className="text-lg font-black sm:text-xl">{current ? s.games[current.key].name : s.title}</h1>
        <button type="button" onClick={toggleLang} className="ml-auto rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]">
          {s.language}
        </button>
      </header>

      {current?.id === "adventure" && <Adventure lang={lang} />}
      {current?.id === "star-path" && <StarPath s={s} />}
      {current?.id === "sprite-party" && <SpriteParty s={s} lang={lang} />}
      {current?.id === "rocket-hop" && <RocketHop s={s} />}

      {!current && (
        <main className="mx-auto max-w-5xl px-4 py-8">
          <p className="mb-6 max-w-2xl text-white/75">{s.tagline}</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {GAMES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => open(g.id)}
                data-testid={`open-${g.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left transition hover:-translate-y-1 hover:border-white/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]"
              >
                <div className="flex h-36 items-center justify-center" style={{ background: g.colour }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.icon === "kai" ? CREW.kai.img : costumeUrl(g.icon)} alt="" className="h-24 w-24 transition group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-black">{s.games[g.key].name}</h2>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold">
                      {s.ages} {g.ages}
                    </span>
                  </div>
                  <p className="text-sm text-white/75">{s.games[g.key].blurb}</p>
                  <p className="mt-auto pt-2 text-xs font-semibold text-[#F4D734]">{s.games[g.key].skills}</p>
                  <span className="mt-2 inline-flex w-fit rounded-full bg-[#F4D734] px-4 py-1.5 text-sm font-black text-[#010F2A]">▶ {s.play}</span>
                </div>
              </button>
            ))}
          </div>
          <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-white/50">{s.moreTools}</h2>
          <div className="flex flex-wrap gap-2">
            {(["blocks", "launchpad", "python"] as const).map((t) => (
              <a key={t} href={`/tools/${t}`} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401]">
                {s.tools[t]}
              </a>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
