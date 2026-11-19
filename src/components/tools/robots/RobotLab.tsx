"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DEFAULT_LANG, MISSIONS, SEMESTERS, labsPerSemester, type GoalResult, type Lang, type Mission, type Program } from "./missions";
import { REFERENCE } from "./reference";
import { EMPTY_WORKSPACE, blockIcon, blocksToJs } from "./robotBlocks";
import Stage, { FLOOR } from "./Stage";
import type { Frame, SoundEvent, Trace } from "./sim";
import { Sim } from "./sim";
import { Icon } from "../launchpad/icons";
import { deflateRaw, fromBase64Url, inflateRaw, toBase64Url } from "../shared/linkCodec";

const RobotBlocksEditor = dynamic(() => import("./RobotBlocksEditor"), { ssr: false, loading: () => <div className="h-full bg-white" /> });
const RobotCodeEditor = dynamic(() => import("./RobotCodeEditor"), { ssr: false, loading: () => <div className="h-full bg-[var(--rl-editor)]" /> });

/**
 * CODEship Robot Lab: program a simulated robot in Blocks, JavaScript or
 * Python, in the browser, with no account. Work stays in this browser
 * (autosave) and leaves by download or share link, like Launchpad and Python.
 */

type Theme = "dark" | "light";
const THEME_VARS: Record<Theme, CSSProperties> = {
  dark: {
    "--rl-bg": "#001532",
    "--rl-panel": "#00102A",
    "--rl-surface": "#021B38",
    "--rl-border": "rgba(255,255,255,0.1)",
    "--rl-text": "#E6EDF7",
    "--rl-muted": "rgba(230,237,247,0.62)",
    "--rl-hover": "rgba(255,255,255,0.08)",
    "--rl-stage": "#0B2142",
    "--rl-editor": "#011735",
  } as CSSProperties,
  light: {
    "--rl-bg": "#FFFFFF",
    "--rl-panel": "#F3F5F9",
    "--rl-surface": "#FFFFFF",
    "--rl-border": "#DFE3EB",
    "--rl-text": "#001532",
    "--rl-muted": "#5A6478",
    "--rl-hover": "rgba(0,21,50,0.06)",
    "--rl-stage": "#E3E8F0",
    "--rl-editor": "#FFFFFF",
  } as CSSProperties,
};

const PROGRAM_STYLE: Record<Program, { colour: string; grades: string; label: string }> = {
  Explorers: { colour: "#D58401", grades: "K to Gr 1", label: "Explorers" },
  Builders: { colour: "#0F6F7C", grades: "Gr 2 to 3", label: "Builders" },
  Developers: { colour: "#6E43A8", grades: "Gr 4 to 5", label: "Developers" },
  Engineers: { colour: "#2B3A9E", grades: "Gr 6 to 8", label: "Engineers" },
  Everyone: { colour: "#1E7A4C", grades: "All ages", label: "Free build" },
};
const PROGRAMS: Program[] = ["Explorers", "Builders", "Developers", "Engineers", "Everyone"];

const LANGS: { id: Lang; label: string; badge: string; badgeClass: string }[] = [
  { id: "blocks", label: "Blocks", badge: "▦", badgeClass: "bg-[#D58401] text-[#001532]" },
  { id: "js", label: "JavaScript", badge: "JS", badgeClass: "bg-[#F4D734] text-[#001532]" },
  { id: "py", label: "Python", badge: "PY", badgeClass: "bg-[#0F6F7C] text-white" },
];

const STORE = "codeship-robotlab-v1";
const SHARE_KEY = "r=";
/** Real-time limit for one run in the worker (a loop that never calls the robot). */
const RUN_TIMEOUT_MS = 12000;

type Saved = { code: Record<string, string>; blocks: Record<string, unknown>; mission: string; lang: Lang; theme: Theme; done: string[]; seen: boolean };
const FRESH: Saved = { code: {}, blocks: {}, mission: MISSIONS[0].id, lang: "blocks", theme: "dark", done: [], seen: false };

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return { ...FRESH, ...JSON.parse(raw) };
  } catch {}
  return { ...FRESH };
}
function persist(s: Saved) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {}
}
const keyOf = (m: string, l: Lang) => `${m}:${l}`;

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D734]";
const pillBtn = `inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--rl-border)] px-3 text-sm font-semibold text-[var(--rl-text)] hover:bg-[var(--rl-hover)] ${focusRing}`;
const iconBtn = `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--rl-border)] text-[var(--rl-text)] hover:bg-[var(--rl-hover)] ${focusRing}`;

// ---------------------------------------------------------------- sound

let audio: AudioContext | null = null;
const NOTE_HZ: Record<string, number> = { C: 523.25, D: 587.33, E: 659.25, F: 698.46, G: 783.99, A: 880, B: 987.77, C2: 1046.5 };
function tone(ac: AudioContext, at: number, freq: number, dur: number, type: OscillatorType, vol: number, glideTo?: number) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, at + dur);
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(ac.destination);
  o.start(at);
  o.stop(at + dur + 0.02);
}
function noise(ac: AudioContext, at: number, dur: number, vol: number) {
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g).connect(ac.destination);
  src.start(at);
}
function sound(kind: SoundEvent["kind"] | "win", note?: string) {
  try {
    audio ??= new AudioContext();
    const ac = audio;
    const now = ac.currentTime;
    switch (kind) {
      case "clap":
        return noise(ac, now, 0.12, 0.35);
      case "beep":
        return tone(ac, now, 880, 0.2, "square", 0.07);
      case "note":
        return tone(ac, now, NOTE_HZ[note ?? "C"] ?? 523, 0.42, "triangle", 0.16);
      case "collect":
        tone(ac, now, 1046, 0.12, "sine", 0.1);
        return tone(ac, now + 0.08, 1568, 0.18, "sine", 0.1);
      case "launch":
        noise(ac, now, 1.6, 0.25);
        return tone(ac, now, 90, 1.6, "sawtooth", 0.06, 400);
      case "spray":
        return noise(ac, now, 0.9, 0.12);
      case "toss":
        return tone(ac, now, 500, 0.4, "sine", 0.08, 1200);
      case "photo":
        return noise(ac, now, 0.05, 0.3);
      case "unlock":
        tone(ac, now, 660, 0.15, "square", 0.06);
        return tone(ac, now + 0.15, 990, 0.25, "square", 0.06);
      case "win":
        [523, 659, 784, 1047].forEach((f, i) => tone(ac, now + i * 0.11, f, 0.2, "triangle", 0.12));
        return;
    }
  } catch {}
}

// ---------------------------------------------------------------- player

function frameAt(frames: Frame[], t: number): number {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 9) * 0.07,
        colour: ["#F0D030", "#D58401", "#0F6F7C", "#6E43A8", "#E53935", "#43A047"][i % 6],
        rot: (i * 47) % 360,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      <style>{`@keyframes rl-fall{0%{transform:translateY(-20px) rotate(0)}100%{transform:translateY(420px) rotate(540deg);opacity:0}}`}</style>
      {bits.map((b, i) => (
        <span key={i} className="absolute top-0 block h-2.5 w-1.5 rounded-sm" style={{ left: `${b.left}%`, background: b.colour, transform: `rotate(${b.rot}deg)`, animation: `rl-fall 1.6s ease-in ${b.delay}s forwards` }} />
      ))}
    </div>
  );
}

function SensorChip({ icon, label, value, warn, swatch }: { icon: string; label: string; value: string; warn?: boolean; swatch?: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${warn ? "border-[#FF6B6B] bg-[#FF6B6B]/15" : "border-[var(--rl-border)] bg-[var(--rl-surface)]"}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F6F7C]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={blockIcon(icon)} alt="" className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--rl-muted)]">{label}</dt>
        <dd className="flex items-center gap-1 truncate font-mono text-[13px] font-bold text-[var(--rl-text)]">
          {swatch && <span className="inline-block h-3 w-3 rounded-sm border border-black/20" style={{ background: swatch }} aria-hidden="true" />}
          {value}
        </dd>
      </div>
    </div>
  );
}

const LED_SWATCH: Record<string, string> = { red: "#FF3B3B", green: "#3DDC6A", blue: "#3BA4FF", yellow: "#FFE14D", white: "#FFFFFF", purple: "#C774FF" };

type PlayerProps = {
  mission: Mission;
  trace: Trace | null;
  playKey: number;
  speed: number;
  setSpeed: (n: number) => void;
  result: GoalResult | null;
  onEnd: () => void;
  onNext: () => void;
  onDismiss: () => void;
};

function Player({ mission, trace, playKey, speed, setSpeed, result, onEnd, onNext, onDismiss }: PlayerProps) {
  const idle = useMemo(() => new Sim(mission.world).frames[0], [mission]);
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const tRef = useRef(0);
  const pausedRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  pausedRef.current = paused;
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  const ended = useRef(false);

  useEffect(() => {
    tRef.current = 0;
    setT(0);
    setPaused(false);
    ended.current = false;
    if (!trace) return;
    let raf = 0;
    let last = performance.now();
    let soundIdx = 0;
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) {
        const prev = tRef.current;
        const next = Math.min(trace.endTime, prev + dt * speedRef.current);
        while (soundIdx < trace.sounds.length && trace.sounds[soundIdx].t <= next) {
          if (trace.sounds[soundIdx].t >= prev - 0.001) sound(trace.sounds[soundIdx].kind, trace.sounds[soundIdx].note);
          soundIdx++;
        }
        tRef.current = next;
        setT(next);
        if (next >= trace.endTime && !ended.current) {
          ended.current = true;
          endRef.current();
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [trace, playKey]);

  const frames = useMemo(() => trace?.frames ?? [idle], [trace, idle]);
  const i = trace ? frameAt(frames, t) : 0;
  const frame = frames[i];
  const trail = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let k = 0; k <= i; k += 2) pts.push({ x: frames[k].x, y: frames[k].y });
    pts.push({ x: frames[i].x, y: frames[i].y });
    return pts;
  }, [frames, i]);
  const clapNow = Boolean(trace?.sounds.some((sd) => sd.kind === "clap" && t >= sd.t && t - sd.t < 0.8));
  const sn = frame.sensors;
  const end = trace?.endTime ?? 0;
  const atEnd = trace !== null && t >= end;

  const seek = (v: number) => {
    tRef.current = v;
    setT(v);
    setPaused(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-2xl bg-[var(--rl-stage)] p-2 sm:p-3">
        <Stage world={mission.world} scene={mission.scene} frame={frame} trail={trail} frames={trace?.frames} index={i} sounds={trace?.sounds} clapNow={clapNow} />
        {result?.ok && atEnd && (
          <>
            <Confetti />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div role="status" className="max-w-sm rounded-2xl bg-white p-5 text-center text-[#001532] shadow-2xl ring-4 ring-[#F0D030]">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0D030]">
                  <Icon name="check" className="h-8 w-8" />
                </div>
                <p className="font-display text-xl font-extrabold">Mission complete!</p>
                <p className="mt-1 text-sm text-[#3A4659]">{result.message}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={onDismiss} className={`rounded-lg border border-[#DFE3EB] px-3 py-1.5 text-sm font-semibold hover:bg-[#F3F5F9] ${focusRing}`}>
                    Keep improving
                  </button>
                  <button onClick={onNext} className={`rounded-lg bg-[#2EB84B] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#28A443] ${focusRing}`}>
                    Next mission →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (!trace) return;
            if (atEnd) {
              seek(0);
              setPaused(false);
            } else setPaused((p) => !p);
          }}
          disabled={!trace}
          aria-label={!trace || paused || atEnd ? "Play" : "Pause"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F6F7C] text-white disabled:opacity-40 ${focusRing}`}
        >
          {!trace || paused || atEnd ? (
            <Icon name={atEnd ? "restart" : "play"} className="h-4 w-4" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(end, 0.01)}
          step={0.05}
          value={Math.min(t, end)}
          disabled={!trace}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Timeline"
          className="h-2 min-w-0 flex-1 cursor-pointer accent-[#D58401] disabled:opacity-40"
        />
        <span className="shrink-0 whitespace-nowrap text-right font-mono text-xs text-[var(--rl-muted)]">
          {t.toFixed(1)} / {end.toFixed(1)}s
        </span>
        <div className="flex shrink-0 rounded-lg border border-[var(--rl-border)] p-0.5" role="group" aria-label="Speed">
          {[1, 2, 4].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} aria-pressed={speed === s} className={`rounded-md px-2 py-0.5 text-xs font-bold ${speed === s ? "bg-[#D58401] text-[#001532]" : "text-[var(--rl-muted)] hover:text-[var(--rl-text)]"}`}>
              {s}×
            </button>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Sensors">
        <SensorChip icon="eye" label="Distance" value={`${sn.distance} cm`} warn={sn.obstacle} />
        <SensorChip icon="bulb" label="Light level" value={`${sn.light} / 100`} />
        <SensorChip icon="forward" label="Line L / R" value={`${sn.lineLeft ? "●" : "○"}  ${sn.lineRight ? "●" : "○"}`} />
        <SensorChip icon="drop" label="Floor" value={sn.colour} swatch={FLOOR[sn.colour]} />
        <SensorChip icon="grab" label="Object" value={frame.carrying ? "holding" : sn.itemColour} swatch={sn.itemColour !== "none" ? FLOOR[sn.itemColour] : undefined} />
        <SensorChip icon="screen" label="Robot light" value={frame.led} swatch={LED_SWATCH[frame.led]} />
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------- data tab

function DataView({ trace }: { trace: Trace | null }) {
  const rows = trace?.data ?? [];
  if (!rows.length)
    return (
      <p className="p-4 text-sm text-[var(--rl-muted)]">
        No data yet. Add <code className="rounded bg-[var(--rl-hover)] px-1.5 py-0.5 font-mono">record(&quot;light&quot;, light())</code> to your program, then Run.
      </p>
    );
  const vals = rows.filter((r) => typeof r.value === "number").map((r) => r.value as number);
  const max = Math.max(...vals, 1);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const csv = () => {
    const text = "time_s,name,value\n" + rows.map((r) => `${r.t},${r.name},${r.value}`).join("\n") + "\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.download = "robot-data.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {[
          ["Readings", String(rows.length)],
          ["Mean", mean.toFixed(1)],
          ["Max", vals.length ? String(Math.max(...vals)) : "-"],
          ["Min", vals.length ? String(Math.min(...vals)) : "-"],
        ].map(([k, v]) => (
          <span key={k} className="rounded-lg bg-[var(--rl-hover)] px-2.5 py-1">
            <span className="text-[var(--rl-muted)]">{k} </span>
            <b className="font-mono">{v}</b>
          </span>
        ))}
        <button onClick={csv} className={`ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#0F6F7C] px-3 py-1.5 font-semibold text-white hover:bg-[#0A7C8A] ${focusRing}`}>
          <Icon name="download" /> CSV
        </button>
      </div>
      {vals.length > 1 && (
        <svg viewBox={`0 0 ${vals.length * 10} 64`} className="h-28 w-full rounded-lg bg-[var(--rl-panel)] ring-1 ring-[var(--rl-border)]" preserveAspectRatio="none" role="img" aria-label="Chart of recorded readings">
          {vals.map((v, i) => {
            const h = (Math.max(0, v) / max) * 58;
            return <rect key={i} x={i * 10 + 1.5} y={62 - h} width={7} height={h} rx={1.5} fill="#D58401" />;
          })}
        </svg>
      )}
      <div className="max-h-48 overflow-auto rounded-lg ring-1 ring-[var(--rl-border)]">
        <table className="w-full text-left font-mono text-[12px]">
          <thead className="sticky top-0 bg-[var(--rl-panel)] text-[var(--rl-muted)]">
            <tr>
              <th className="px-3 py-1.5">time (s)</th>
              <th>name</th>
              <th>value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[var(--rl-border)]">
                <td className="px-3 py-1">{r.t}</td>
                <td>{r.name}</td>
                <td>{String(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- mission gallery

const SEMESTER_NAME: Record<string, string> = { S1: "Semester 1", S2: "Semester 2", S3: "Semester 3", S4: "Semester 4", Capstone: "Capstone" };

/** "Semester 1 · Lab 2 of 4" for a mission. */
export function labLabel(m: Mission) {
  if (!m.semester) return "";
  return `${SEMESTER_NAME[m.semester]} · Lab ${m.lab} of ${labsPerSemester(m.program)}`;
}

function MissionGallery({ missions, current, done, onPick, onClose }: { missions: Mission[]; current: string; done: string[]; onPick: (m: Mission) => void; onClose: () => void }) {
  const programs = PROGRAMS.filter((p) => missions.some((m) => m.program === p));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#000814]/70 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Choose a mission">
      <div className="w-full max-w-6xl rounded-2xl bg-[var(--rl-bg)] p-4 text-[var(--rl-text)] shadow-2xl ring-1 ring-[var(--rl-border)] sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Choose a mission</h2>
            <p className="text-sm text-[var(--rl-muted)]">One mission for each Robot Lab class. The last one in each semester is the big challenge.</p>
          </div>
          <button onClick={onClose} className={`${iconBtn} ml-auto shrink-0`} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {programs.map((p) => {
          const list = missions.filter((m) => m.program === p);
          const st = PROGRAM_STYLE[p];
          const groups = p === "Everyone" ? [list] : SEMESTERS.map((sem) => list.filter((m) => m.semester === sem));
          return (
            <section key={p} className="mb-7" aria-label={st.label}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: st.colour }} />
                {st.label} <span className="font-semibold normal-case tracking-normal text-[var(--rl-muted)]">· {st.grades}</span>
                {p !== "Everyone" && (
                  <span className="ml-auto flex items-center gap-2 text-xs font-bold normal-case tracking-normal text-[var(--rl-muted)]">
                    <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-[var(--rl-hover)] sm:block">
                      <span className="block h-full rounded-full bg-[#2EB84B]" style={{ width: `${(list.filter((m) => done.includes(m.id)).length / list.length) * 100}%` }} />
                    </span>
                    {list.filter((m) => done.includes(m.id)).length} of {list.length} done
                  </span>
                )}
              </h3>
              {groups.map((group, gi) =>
                group.length ? (
                  <div key={gi} className="mb-4">
                    {group[0].semester && (
                      <h4 className="mb-2 flex items-baseline gap-2 text-[13px] font-extrabold">
                        {SEMESTER_NAME[group[0].semester]}
                        <span className="font-semibold text-[var(--rl-muted)]">· {group[0].fits.replace(/^(S\d|Capstone) /, "")}</span>
                        <span className="ml-auto text-xs font-bold text-[var(--rl-muted)]">
                          {group.filter((m) => done.includes(m.id)).length} of {group.length} done
                        </span>
                      </h4>
                    )}
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                      {group.map((m) => {
                        const isDone = done.includes(m.id);
                        const challenge = m.semester && m.lab === labsPerSemester(m.program);
                        return (
                          <button
                            key={m.id}
                            onClick={() => onPick(m)}
                            title={m.goal}
                            className={`group flex flex-col overflow-hidden rounded-xl border bg-[var(--rl-surface)] text-left transition hover:-translate-y-0.5 hover:shadow-xl ${m.id === current ? "border-[#D58401] ring-2 ring-[#D58401]" : "border-[var(--rl-border)]"} ${focusRing}`}
                          >
                            <div className="relative p-1.5" style={{ background: st.colour }}>
                              <div className="overflow-hidden rounded-md ring-1 ring-white/30">
                                <Stage world={m.world} scene={m.scene} frame={new Sim(m.world).frames[0]} thumbnail />
                              </div>
                              {m.semester && (
                                <span className={`absolute left-2.5 top-2.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold shadow ${challenge ? "bg-[#F0D030] text-[#001532]" : "bg-[#001532]/85 text-white"}`}>
                                  {challenge ? "★ Challenge" : `Lab ${m.lab}`}
                                </span>
                              )}
                              {isDone && (
                                <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full bg-[#2EB84B] p-0.5 text-white shadow" aria-label="Done">
                                  <Icon name="check" className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5 p-2">
                              <span className="font-display text-[13px] font-extrabold leading-tight">{m.title}</span>
                              <span className="line-clamp-2 text-[11px] leading-snug text-[var(--rl-muted)]">{m.goal}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null,
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- page

type Status = "idle" | "loading" | "running" | "playing" | "done";

export default function RobotLab({ programs }: { programs: Program[] }) {
  // Each class password opens its own program's missions (plus Free build).
  const available = useMemo(() => MISSIONS.filter((m) => m.program === "Everyone" || programs.includes(m.program)), [programs]);
  const pick = (id: string | null | undefined) => available.find((m) => m.id === id) ?? available[0];
  const [saved, setSaved] = useState<Saved>(FRESH);
  const [mission, setMission] = useState<Mission>(() => MISSIONS.find((m) => programs.includes(m.program)) ?? MISSIONS[0]);
  const [lang, setLang] = useState<Lang>("blocks");
  const [docKey, setDocKey] = useState("init");
  const [code, setCode] = useState("");
  const [blocks, setBlocks] = useState<unknown>(EMPTY_WORKSPACE);
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("");
  const [trace, setTrace] = useState<Trace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GoalResult | null>(null);
  const [playKey, setPlayKey] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState<"hint" | "console" | "data" | "reference">("hint");
  const [showJs, setShowJs] = useState(false);
  const [notice, setNotice] = useState("");
  const [gallery, setGallery] = useState(false);
  const [ready, setReady] = useState(false);
  const worker = useRef<Worker | null>(null);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pyReady = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const theme = saved.theme;
  const dark = theme === "dark";

  const update = useCallback((patch: Partial<Saved>) => {
    setSaved((s) => {
      const next = { ...s, ...patch };
      persist(next);
      return next;
    });
  }, []);

  // --- worker
  const startWorker = useCallback(() => {
    worker.current?.terminate();
    const w = new Worker(new URL("./robot.worker.ts", import.meta.url), { type: "module" });
    w.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "status") {
        setStatusText(msg.text);
        if (msg.text === "") pyReady.current = true;
        return;
      }
      if (msg.id !== runId.current) return;
      if (timer.current) clearTimeout(timer.current);
      if (msg.type === "failed") {
        setStatus("idle");
        setError(msg.message);
        return;
      }
      setStatusText("");
      setError(msg.error);
      setTrace(msg.trace);
      setResult(null);
      setPlayKey((k) => k + 1);
      setStatus("playing");
    };
    worker.current = w;
    pyReady.current = false;
    return w;
  }, []);

  useEffect(() => {
    startWorker();
    return () => worker.current?.terminate();
  }, [startWorker]);

  // --- load: share link first, then the address (?m=), then autosave
  useEffect(() => {
    const s = loadSaved();
    setSaved(s);
    const fromHash = async () => {
      const i = location.hash.indexOf(SHARE_KEY);
      if (i < 0) return false;
      try {
        const bytes = await inflateRaw(fromBase64Url(location.hash.slice(i + SHARE_KEY.length)));
        const p = JSON.parse(new TextDecoder().decode(bytes));
        const m = pick(p.m);
        const l: Lang = ["blocks", "js", "py"].includes(p.l) ? p.l : DEFAULT_LANG[m.program];
        open(m, l, s, l === "blocks" ? p.b : p.c);
        setNotice("Opened a shared robot program. Your changes save in this browser.");
        history.replaceState(null, "", location.pathname + location.search);
        return true;
      } catch {
        setNotice("That share link is damaged or incomplete, so it couldn't be opened.");
        return false;
      }
    };
    fromHash().then((ok) => {
      if (!ok) {
        const params = new URLSearchParams(location.search);
        const m = pick(params.get("m") ?? s.mission);
        const l = (params.get("lang") as Lang) ?? (params.get("m") ? DEFAULT_LANG[m.program] : s.lang);
        open(m, ["blocks", "js", "py"].includes(l) ? l : "blocks", s);
        if (!s.seen && !params.get("m")) setGallery(true);
      }
      setReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function open(m: Mission, l: Lang, s: Saved = saved, override?: unknown) {
    setMission(m);
    setLang(l);
    if (l === "blocks") setBlocks(override ?? s.blocks[m.id] ?? EMPTY_WORKSPACE);
    else setCode(typeof override === "string" ? override : s.code[keyOf(m.id, l)] ?? m.starter[l]);
    setDocKey(`${m.id}:${l}:${Date.now()}`);
    setTrace(null);
    setError(null);
    setResult(null);
    setStatus("idle");
    setTab("hint");
    if (l === "py") worker.current?.postMessage({ type: "warm" });
    const next = { ...s, mission: m.id, lang: l };
    setSaved(next);
    persist(next);
  }

  const saveCode = (v: string) => {
    setCode(v);
    setSaved((s) => {
      const next = { ...s, code: { ...s.code, [keyOf(mission.id, lang)]: v } };
      persist(next);
      return next;
    });
  };
  const saveBlocks = (v: unknown) => {
    setBlocks(v);
    setSaved((s) => {
      const next = { ...s, blocks: { ...s.blocks, [mission.id]: v } };
      persist(next);
      return next;
    });
  };

  const js = useMemo(() => (lang === "blocks" ? blocksToJs(blocks) : ""), [lang, blocks]);

  // --- run / stop / reset
  const run = () => {
    const program = lang === "blocks" ? js : code;
    if (lang === "blocks" && !program.trim()) {
      setError('Snap blocks under "when Run is pressed". Only blocks joined to it will run.');
      return;
    }
    const id = ++runId.current;
    setError(null);
    setResult(null);
    setTrace(null);
    setStatus(lang === "py" && !pyReady.current ? "loading" : "running");
    worker.current?.postMessage({ type: "run", id, lang: lang === "py" ? "py" : "js", code: program, world: mission.world });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        if (runId.current !== id) return;
        startWorker();
        if (lang === "py") worker.current?.postMessage({ type: "warm" });
        setStatus("idle");
        setError("Your program ran for a long time without moving the robot, so it was stopped. Look for a loop that never ends, and make sure the robot does something inside it.");
      },
      lang === "py" && !pyReady.current ? 90000 : RUN_TIMEOUT_MS,
    );
  };

  const stop = () => {
    runId.current++;
    if (timer.current) clearTimeout(timer.current);
    if (status === "running" || status === "loading") {
      startWorker();
      if (lang === "py") worker.current?.postMessage({ type: "warm" });
    }
    setStatus("idle");
  };

  const reset = () => {
    stop();
    setTrace(null);
    setResult(null);
    setError(null);
  };

  const onEnd = useCallback(() => {
    setStatus("done");
    setTrace((tr) => {
      if (tr) {
        const r = mission.check(tr, mission.world);
        if (mission.id !== "sandbox") {
          setResult(r);
          if (r.ok) {
            sound("win");
            setSaved((s) => {
              if (s.done.includes(mission.id)) return s;
              const next = { ...s, done: [...s.done, mission.id] };
              persist(next);
              return next;
            });
          }
        }
        if (tr.data.length) setTab("data");
        else if (tr.log.length) setTab("console");
      }
      return tr;
    });
  }, [mission]);

  const nextMission = () => {
    const i = available.findIndex((m) => m.id === mission.id);
    const m = available[(i + 1) % available.length];
    open(m, m.program === mission.program ? lang : DEFAULT_LANG[m.program]);
  };

  // --- share / download / open
  const share = async () => {
    const payload = JSON.stringify({ v: 1, m: mission.id, l: lang, ...(lang === "blocks" ? { b: blocks } : { c: code }) });
    const url = `${location.origin}${location.pathname}#${SHARE_KEY}${toBase64Url(await deflateRaw(new TextEncoder().encode(payload)))}`;
    if (url.length > 8000) {
      setNotice("This program is too big to share as a link. Use Download instead.");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Share link copied. Anyone with the link can open a copy of this program. No account needed.");
    } catch {
      setNotice(`Copy this link: ${url}`);
    }
  };
  const download = () => {
    const name = lang === "py" ? `${mission.id}.py` : lang === "js" ? `${mission.id}.js` : `${mission.id}.robot.json`;
    const body = lang === "blocks" ? JSON.stringify({ codeshipRobotLab: 1, mission: mission.id, blocks }, null, 1) : code;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const openFile = async (file: File) => {
    const text = await file.text();
    if (file.name.endsWith(".json")) {
      try {
        const p = JSON.parse(text);
        open(pick(p.mission ?? mission.id), "blocks", saved, p.blocks);
        saveBlocks(p.blocks);
      } catch {
        setNotice("That file isn't a Robot Lab blocks file.");
      }
      return;
    }
    const l: Lang = file.name.endsWith(".py") ? "py" : "js";
    open(mission, l, saved, text);
    saveCode(text);
  };

  const busy = status === "running" || status === "loading";
  const st = PROGRAM_STYLE[mission.program];
  const fileName = lang === "py" ? "robot.py" : lang === "js" ? "robot.js" : "robot blocks";

  return (
    <div style={THEME_VARS[theme]} className="flex min-h-[100dvh] flex-col bg-[var(--rl-bg)] text-[var(--rl-text)] md:h-[100dvh]">
      <header className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--rl-border)] px-3 py-2 sm:px-4 ${dark ? "bg-[#012C61]" : "bg-white"}`}>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
            <span className="block h-7 w-6 bg-no-repeat" style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }} />
          </span>
          <h1 className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
            CODEship <span className="text-[#D58401]">Robot Lab</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {busy || status === "playing" ? (
            <button onClick={stop} aria-label="Stop" title="Stop" className={`flex h-10 w-12 items-center justify-center rounded-xl bg-[#E53935] text-white shadow-[0_3px_0_#A32420] active:translate-y-0.5 active:shadow-none ${focusRing}`}>
              <Icon name="stop" className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={run} aria-label="Run" title="Run (Ctrl+Enter)" className={`flex h-10 items-center gap-2 rounded-xl bg-[#2EB84B] px-4 text-base font-extrabold text-white shadow-[0_3px_0_#1E8A35] hover:bg-[#33C553] active:translate-y-0.5 active:shadow-none ${focusRing}`}>
              <Icon name="play" className="h-5 w-5" /> Run
            </button>
          )}
          <button onClick={reset} aria-label="Reset robot" title="Reset robot" className={`flex h-10 w-12 items-center justify-center rounded-xl bg-[#F2B347] text-[#001532] shadow-[0_3px_0_#C98A1F] active:translate-y-0.5 active:shadow-none ${focusRing}`}>
            <Icon name="restart" className="h-5 w-5" />
          </button>
        </div>

        <button onClick={() => setGallery(true)} className={pillBtn}>
          <Icon name="missions" /> Missions
          {saved.done.length > 0 && <span className="rounded-full bg-[#2EB84B] px-1.5 text-[11px] font-bold text-white">{saved.done.length}</span>}
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={share} className={pillBtn}>
            <Icon name="share" /> <span className="hidden sm:inline">Share</span>
          </button>
          <button onClick={download} className={iconBtn} aria-label="Download" title="Download">
            <Icon name="download" />
          </button>
          <button onClick={() => fileInput.current?.click()} className={iconBtn} aria-label="Open a file" title="Open a file">
            <Icon name="folderOpen" />
          </button>
          <button onClick={() => update({ theme: dark ? "light" : "dark" })} className={iconBtn} aria-label={dark ? "Light theme" : "Dark theme"} title={dark ? "Light theme" : "Dark theme"}>
            <Icon name={dark ? "sun" : "moon"} />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".js,.py,.json,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) openFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      {notice && (
        <div role="status" className="flex items-start gap-3 bg-[#F4D734] px-4 py-2 text-sm text-[#001532]">
          <span className="flex-1 break-all font-semibold">{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Close message">
            <Icon name="x" />
          </button>
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
        <section aria-label="Program" className="flex h-[62vh] min-h-[340px] flex-col border-[var(--rl-border)] md:h-auto md:min-h-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-[var(--rl-border)] bg-[var(--rl-panel)] pr-3">
            <div role="tablist" aria-label="Coding language" className="flex">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  role="tab"
                  aria-selected={lang === l.id}
                  onClick={() => l.id !== lang && open(mission, l.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold ${lang === l.id ? "bg-[var(--rl-editor)] text-[var(--rl-text)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#D58401]" : "text-[var(--rl-muted)] hover:text-[var(--rl-text)]"} ${focusRing}`}
                >
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${l.badgeClass}`} aria-hidden="true">
                    {l.badge}
                  </span>
                  {l.label}
                </button>
              ))}
            </div>
            <span className="ml-auto hidden font-mono text-xs text-[var(--rl-muted)] sm:inline">{fileName}</span>
          </div>
          <div className="min-h-0 flex-1">
            {lang === "blocks" ? (
              <RobotBlocksEditor value={blocks} docKey={`${docKey}:${theme}`} dark={dark} onChange={saveBlocks} />
            ) : (
              <RobotCodeEditor lang={lang} value={code} docKey={`${docKey}:${theme}`} dark={dark} onChange={saveCode} onRun={run} />
            )}
          </div>
          {lang === "blocks" && (
            <div className="border-t border-[var(--rl-border)] bg-[var(--rl-panel)]">
              <button onClick={() => setShowJs((v) => !v)} aria-expanded={showJs} className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-[var(--rl-muted)] hover:text-[var(--rl-text)] ${focusRing}`}>
                <Icon name="code" /> {showJs ? "Hide" : "Peek at"} the real code
                <Icon name={showJs ? "chevronDown" : "chevronUp"} className="ml-auto h-4 w-4" />
              </button>
              {showJs && <pre className="max-h-48 overflow-auto bg-[var(--rl-editor)] px-4 py-2 font-mono text-[13px]">{js || '// Nothing snapped under "when Run is pressed" yet.'}</pre>}
            </div>
          )}
        </section>

        <section aria-label="Robot" className="flex min-h-0 flex-col gap-3 overflow-y-auto bg-[var(--rl-panel)] p-3 sm:p-4">
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--rl-border)] bg-[var(--rl-surface)] p-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: st.colour }}>
              <Icon name="missions" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#D58401]">
                {st.label} · {st.grades}
                {mission.semester ? ` · ${labLabel(mission)} · ${mission.fits.replace(/^(S\d|Capstone) /, "")}` : ""}
              </p>
              <h2 className="font-display text-lg font-extrabold leading-tight">
                {mission.title}
                {saved.done.includes(mission.id) && (
                  <span className="ml-2 inline-flex -translate-y-0.5 items-center gap-1 rounded-full bg-[#2EB84B] px-2 py-0.5 align-middle text-[11px] font-bold text-white">
                    <Icon name="check" className="h-3 w-3" /> Done
                  </span>
                )}
              </h2>
              <p className="text-sm text-[var(--rl-muted)]">{mission.goal}</p>
            </div>
          </div>

          {(status === "loading" || status === "running") && (
            <p role="status" className="flex items-center gap-2 rounded-xl bg-[var(--rl-surface)] px-3 py-2 text-sm text-[var(--rl-muted)] ring-1 ring-[var(--rl-border)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#2EB84B]" />
              {status === "loading" ? statusText || "Loading Python (first run only)…" : "Running your program…"}
            </p>
          )}
          {error && (
            <div role="alert" className="whitespace-pre-wrap rounded-xl border border-[#FF6B6B]/60 bg-[#FF6B6B]/15 px-3 py-2 font-mono text-[13px] text-[var(--rl-text)]">
              {error}
            </div>
          )}
          {result && !result.ok && (
            <div role="status" className="rounded-xl border border-[#F2B347]/70 bg-[#F2B347]/15 px-3 py-2 text-sm font-semibold">
              <span className="text-[#D58401]">Not yet. </span>
              {result.message}
            </div>
          )}
          {trace?.stoppedReason && status === "done" && <p className="rounded-xl bg-[var(--rl-surface)] px-3 py-2 text-sm text-[var(--rl-muted)] ring-1 ring-[var(--rl-border)]">{trace.stoppedReason}</p>}

          <Player mission={mission} trace={trace} playKey={playKey} speed={speed} setSpeed={setSpeed} result={result} onEnd={onEnd} onNext={nextMission} onDismiss={() => setResult(null)} />

          <div className="overflow-hidden rounded-2xl border border-[var(--rl-border)] bg-[var(--rl-surface)]">
            <div role="tablist" className="flex overflow-x-auto border-b border-[var(--rl-border)] text-sm">
              {(
                [
                  ["hint", "Hint"],
                  ["console", `Console${trace?.log.length ? ` (${trace.log.length})` : ""}`],
                  ["data", `Data${trace?.data.length ? ` (${trace.data.length})` : ""}`],
                  ["reference", "Robot functions"],
                ] as const
              ).map(([k, labelText]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`shrink-0 px-3.5 py-2.5 font-semibold ${tab === k ? "text-[var(--rl-text)] shadow-[inset_0_-2px_0_#D58401]" : "text-[var(--rl-muted)] hover:text-[var(--rl-text)]"} ${focusRing}`}>
                  {labelText}
                </button>
              ))}
            </div>
            {tab === "hint" && (
              <div className="flex gap-3 p-4 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4D734]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={blockIcon("bulb", "#001532")} alt="" className="h-5 w-5" />
                </span>
                <p className="text-[var(--rl-muted)]">{mission.hint}</p>
              </div>
            )}
            {tab === "console" && (
              <pre className="max-h-64 overflow-auto p-4 font-mono text-[13px]">
                {trace?.log.length ? trace.log.map((l) => `[${l.t.toFixed(1)}s] ${l.text}`).join("\n") : lang === "py" ? "print() output appears here." : "console.log() output appears here."}
              </pre>
            )}
            {tab === "data" && <DataView trace={trace} />}
            {tab === "reference" && (
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-left text-[13px]">
                  <tbody>
                    {REFERENCE.map((r) => (
                      <tr key={r.js} className="border-t border-[var(--rl-border)] align-top first:border-t-0">
                        <td className="whitespace-nowrap px-4 py-1.5 font-mono font-semibold text-[#0F8C9A]">{lang === "py" ? r.py : r.js}</td>
                        <td className="px-2 py-1.5 text-[var(--rl-muted)]">{r.does}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="flex items-center gap-3 border-t border-[var(--rl-border)] bg-[var(--rl-panel)] px-3 py-1.5 text-[12px] text-[var(--rl-muted)]">
        <span className="h-2 w-2 rounded-full bg-[#2EB84B]" aria-hidden="true" />
        Saved in this browser. Use Share or Download to take it with you.
        <span className="ml-auto hidden font-display text-[11px] font-extrabold tracking-[0.3em] text-[#D58401] sm:inline">DREAM. CODE. ACHIEVE.</span>
      </footer>

      {gallery && ready && (
        <MissionGallery
          missions={available}
          current={mission.id}
          done={saved.done}
          onClose={() => {
            setGallery(false);
            update({ seen: true });
          }}
          onPick={(m) => {
            setGallery(false);
            open(m, m.id === mission.id ? lang : DEFAULT_LANG[m.program], { ...saved, seen: true });
          }}
        />
      )}
    </div>
  );
}
