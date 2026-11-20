"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bus Buddies: voice sample page (/ship-it/bus-buddies/voices/, noindex).
 * Plays the samples written by `generate-voices.mjs --samples` and turns the
 * choices into the `--pick` string that saves them.
 */
interface SampleOption {
  key: string;
  kind: "designed" | "library";
  file: string;
  voiceName?: string;
}
interface SampleCharacter {
  name: string;
  style: string;
  text: string;
  options: SampleOption[];
}
interface Manifest {
  generatedAt: string;
  characters: Record<string, SampleCharacter>;
}

const BASE = "/ship-it/bus-buddies/voice-samples/";
const STORE = "bus-buddies-voice-picks";
const FACE: Record<string, string> = { bina: "🚌", codey: "🧑‍✈️", turtle: "🐢", duck: "🦆", owl: "🦉" };

export function VoiceSamples() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [missing, setMissing] = useState(false);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`${BASE}samples.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setManifest)
      .catch(() => setMissing(true));
    try {
      const saved = window.localStorage.getItem(STORE);
      if (saved) setPicks(JSON.parse(saved));
    } catch {}
  }, []);

  const choose = (id: string, key: string) => {
    const next = { ...picks, [id]: key };
    setPicks(next);
    try {
      window.localStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  };

  const play = (file: string) => {
    audio.current?.pause();
    if (playing === file) {
      setPlaying(null);
      return;
    }
    const a = new Audio(BASE + file);
    a.onended = () => setPlaying(null);
    audio.current = a;
    setPlaying(file);
    a.play().catch(() => setPlaying(null));
  };

  const ids = manifest ? Object.keys(manifest.characters) : [];
  const pickString = ids.filter((id) => picks[id]).map((id) => `${id}=${picks[id]}`).join(",");
  const done = ids.length > 0 && ids.every((id) => picks[id]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F0D030]">Bus Buddies Road Trip · for grown-ups</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Pick the voices</h1>
      <p className="mt-3 max-w-2xl text-white/75">
        Each character has three designed voices (A–C), and Bina and Captain Codey also have a ready-made library voice. Every sample reads that
        character&rsquo;s real lines. Pick one per character, then send the pick list below.
      </p>

      {missing ? (
        <p className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5 text-white/80">
          No samples yet. Run <code className="text-[#F0D030]">node scripts/bus-buddies/generate-voices.mjs --samples</code> with an ElevenLabs API key.
        </p>
      ) : null}

      <div className="mt-8 space-y-5">
        {ids.map((id) => {
          const c = manifest!.characters[id];
          return (
            <section key={id} className="rounded-3xl border border-white/10 bg-[#001432] p-5" aria-labelledby={`h-${id}`}>
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F0D030]/15 text-4xl" aria-hidden>
                  {FACE[id] ?? "🎙️"}
                </span>
                <div>
                  <h2 id={`h-${id}`} className="font-display text-2xl font-extrabold">
                    {c.name}
                  </h2>
                  <p className="text-sm text-white/65">Wanted: {c.style}</p>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-white/5 px-4 py-2 text-sm italic text-white/70">&ldquo;{c.text}&rdquo;</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {c.options.map((o) => {
                  const chosen = picks[id] === o.key;
                  return (
                    <div key={o.key} className={`rounded-2xl border p-3 ${chosen ? "border-[#F0D030] bg-[#F0D030]/10" : "border-white/10 bg-white/[0.03]"}`}>
                      <p className="text-sm font-bold">
                        Voice {o.key}{" "}
                        <span className="font-normal text-white/55">{o.kind === "library" ? `· library: ${o.voiceName}` : "· designed"}</span>
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => play(o.file)}
                          className="focus-ring flex h-16 flex-1 items-center justify-center rounded-xl bg-[#14b8a6] text-lg font-extrabold text-[#001432]"
                          aria-label={`${playing === o.file ? "Stop" : "Play"} ${c.name} voice ${o.key}`}
                        >
                          {playing === o.file ? "■ Stop" : "▶ Play"}
                        </button>
                        <button
                          type="button"
                          onClick={() => choose(id, o.key)}
                          aria-pressed={chosen}
                          className={`focus-ring h-16 rounded-xl px-4 font-bold ${chosen ? "bg-[#F0D030] text-[#001432]" : "border border-white/20 text-white"}`}
                        >
                          {chosen ? "✓ Picked" : "Pick"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {ids.length ? (
        <div className="sticky bottom-4 mt-8 rounded-3xl border border-[#F0D030]/40 bg-[#1b1e33] p-5 shadow-2xl">
          <p className="font-bold">{done ? "All picked! Send this to your developer:" : `Picked ${Object.keys(picks).filter((k) => ids.includes(k)).length} of ${ids.length}`}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="flex-1 rounded-xl bg-black/30 px-3 py-3 text-[#F0D030]">{pickString || "…"}</code>
            <button
              type="button"
              disabled={!pickString}
              onClick={() => {
                navigator.clipboard?.writeText(pickString).then(() => setCopied(true), () => {});
              }}
              className="focus-ring h-12 rounded-xl bg-[#F0D030] px-5 font-bold text-[#001432] disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
