"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { costumeUrl } from "../../blocks/costumes";
import type { Lang } from "../i18n";

/**
 * Story pieces for CODEship Adventure: the two crew characters, the dialogue
 * box (every line can be read aloud, for children who can't read yet), and
 * the pointing hand that walks a child through their first level.
 */

export type Speaker = "kai" | "bolt";
export type Line = { who: Speaker; en: string; fr: string };

const KAI_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<circle cx="50" cy="42" r="34" fill="#E3F2FD" stroke="#90A4AE" stroke-width="4"/>` +
  `<circle cx="50" cy="44" r="25" fill="#8D5524"/>` +
  `<path d="M26 38q4-20 24-20t24 20q-10-8-24-8t-24 8z" fill="#2B1B10"/>` +
  `<circle cx="41" cy="45" r="4" fill="#1B0F08"/><circle cx="59" cy="45" r="4" fill="#1B0F08"/><circle cx="42.5" cy="43.5" r="1.4" fill="#fff"/><circle cx="60.5" cy="43.5" r="1.4" fill="#fff"/>` +
  `<path d="M42 55q8 7 16 0" fill="none" stroke="#1B0F08" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="34" cy="53" r="4" fill="#E57373" opacity="0.6"/><circle cx="66" cy="53" r="4" fill="#E57373" opacity="0.6"/>` +
  `<path d="M24 26a34 34 0 0 1 22-16" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.8"/>` +
  `<path d="M20 98q0-24 30-24t30 24z" fill="#ECEFF1" stroke="#90A4AE" stroke-width="3"/>` +
  `<rect x="40" y="80" width="20" height="12" rx="3" fill="#D58401"/><circle cx="50" cy="86" r="3" fill="#fff"/></svg>`;

export const CREW: Record<Speaker, { name: string; img: string; colour: string }> = {
  kai: { name: "Captain Kai", img: `data:image/svg+xml;utf8,${encodeURIComponent(KAI_SVG)}`, colour: "#D58401" },
  bolt: { name: "Bolt", img: costumeUrl("robot"), colour: "#138A9A" },
};

/** Read a line aloud with the device's own voice, if it has one. */
export function speak(text: string, lang: Lang) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[…]/g, ","));
    u.lang = lang === "fr" ? "fr-CA" : "en-CA";
    u.rate = 0.92;
    u.pitch = 1.05;
    synth.speak(u);
  } catch {}
}
export const hush = () => {
  try {
    window.speechSynthesis?.cancel();
  } catch {}
};

const UI = {
  en: { next: "Next", go: "Let's go!", listen: "Read it to me" },
  fr: { next: "Suivant", go: "C'est parti !", listen: "Lis-le-moi" },
};

/** A run of story lines, one at a time. Calls onDone after the last. */
export function Dialogue({ lines, lang, onDone, autoRead }: { lines: Line[]; lang: Lang; onDone: () => void; autoRead: boolean }) {
  const [i, setI] = useState(0);
  const line = lines[i];
  const text = line?.[lang] ?? "";
  useEffect(() => {
    if (autoRead && text) speak(text, lang);
  }, [text, lang, autoRead]);
  useEffect(() => hush, []);
  if (!line) return null;
  const who = CREW[line.who];
  const last = i === lines.length - 1;
  const next = () => {
    hush();
    if (last) onDone();
    else setI(i + 1);
  };
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#010F2A]/55 p-3 sm:p-6" role="dialog" aria-label={who.name}>
      <div key={i} className="adv-pop flex w-full max-w-2xl items-end gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={who.img} alt="" className="adv-talk h-24 w-24 shrink-0 rounded-full border-4 bg-white p-1 sm:h-32 sm:w-32" style={{ borderColor: who.colour }} />
        <div className="relative flex-1 rounded-3xl border-4 bg-white p-4 text-[#010F2A] shadow-[0_6px_0_rgba(0,0,0,0.25)]" style={{ borderColor: who.colour }}>
          <p className="mb-1 text-sm font-black uppercase tracking-wide" style={{ color: who.colour }}>
            {who.name}
          </p>
          <p className="text-lg font-bold leading-snug sm:text-2xl">{text}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => speak(text, lang)}
              aria-label={UI[lang].listen}
              title={UI[lang].listen}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E3F2FD] text-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D58401]"
            >
              🔊
            </button>
            <div className="flex gap-1" aria-hidden="true">
              {lines.map((_, k) => (
                <span key={k} className={`h-2 w-2 rounded-full ${k === i ? "bg-[#D58401]" : "bg-[#CFD8DC]"}`} />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              autoFocus
              data-testid="dialogue-next"
              className="flex h-12 items-center gap-2 rounded-full bg-[#43A047] px-6 text-lg font-black text-white shadow-[0_4px_0_#1B5E20] active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4D734]"
            >
              {last ? UI[lang].go : UI[lang].next} ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A pulsing ring and a pointing hand over the element marked
 * data-tut="<target>", with a short spoken hint. Follows the element as the
 * page scrolls or resizes.
 */
export function Pointer({ target, hint, lang, autoRead }: { target: string | null; hint?: string; lang: Lang; autoRead: boolean }) {
  const [box, setBox] = useState<DOMRect | null>(null);
  const measure = useCallback(() => {
    const el = target ? document.querySelector(`[data-tut="${target}"]`) : null;
    setBox(el ? el.getBoundingClientRect() : null);
  }, [target]);
  useLayoutEffect(() => {
    measure();
    const t = window.setInterval(measure, 300);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);
  useEffect(() => {
    if (autoRead && hint) speak(hint, lang);
  }, [hint, lang, autoRead]);
  if (!box) return null;
  return (
    <>
      <div className="pointer-events-none fixed z-30 rounded-2xl ring-4 ring-[#F4D734] adv-ring" style={{ left: box.left - 6, top: box.top - 6, width: box.width + 12, height: box.height + 12 }} />
      <div className="adv-hand pointer-events-none fixed z-30 text-5xl drop-shadow-[0_3px_2px_rgba(0,0,0,0.4)]" style={{ left: box.left + box.width / 2 - 8, top: box.top + box.height * 0.55 }} aria-hidden="true">
        👆
      </div>
      {hint && (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center px-3" role="status">
          <p className="adv-pop rounded-full border-4 border-[#F4D734] bg-[#010F2A] px-5 py-2 text-center text-base font-black text-white shadow-lg sm:text-xl">{hint}</p>
        </div>
      )}
    </>
  );
}

/** Shared keyframes for the adventure screens. */
export const ADVENTURE_CSS = `
@keyframes adv-pop { from { transform: translateY(16px) scale(0.96); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes adv-talk { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg) translateY(-3px); } }
@keyframes adv-hand { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes adv-ring { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.04); } }
@keyframes adv-wobble { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes adv-glow { 0%,100% { filter: drop-shadow(0 0 4px #FFF59D); } 50% { filter: drop-shadow(0 0 14px #FFF59D); } }
.adv-pop { animation: adv-pop 300ms ease-out both; }
.adv-talk { animation: adv-talk 1.8s ease-in-out infinite; }
.adv-hand { animation: adv-hand 1s ease-in-out infinite; }
.adv-ring { animation: adv-ring 1s ease-in-out infinite; }
.adv-wobble { animation: adv-wobble 300ms ease-in-out 2; }
.adv-glow { animation: adv-glow 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .adv-pop, .adv-talk, .adv-hand, .adv-ring, .adv-wobble, .adv-glow { animation: none; } }
`;
