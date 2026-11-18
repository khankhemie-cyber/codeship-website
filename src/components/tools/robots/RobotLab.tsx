"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LANG, MISSIONS, missionById, type GoalResult, type Lang, type Mission, type Program } from "./missions";
import { REFERENCE } from "./reference";
import { EMPTY_WORKSPACE, blocksToJs } from "./robotBlocks";
import { FLOOR } from "./Stage";
import Stage from "./Stage";
import type { Frame, Trace } from "./sim";
import { Sim } from "./sim";
import { deflateRaw, fromBase64Url, inflateRaw, toBase64Url } from "../shared/linkCodec";

const RobotBlocksEditor = dynamic(() => import("./RobotBlocksEditor"), { ssr: false, loading: () => <div className="h-full bg-white" /> });
const RobotCodeEditor = dynamic(() => import("./RobotCodeEditor"), { ssr: false, loading: () => <div className="h-full bg-[#011735]" /> });

/**
 * CODEship Robot Lab: program a simulated robot in Blocks, JavaScript or
 * Python, in the browser, with no account. Work stays in this browser
 * (autosave) and leaves by download or share link, like Launchpad and Python.
 */

const LANG_LABEL: Record<Lang, string> = { blocks: "Blocks", js: "JavaScript", py: "Python" };
const PROGRAMS: Program[] = ["Explorers", "Builders", "Developers", "Engineers", "Everyone"];
const STORE = "codeship-robotlab-v1";
const SHARE_KEY = "r=";
/** Real-time limit for one run in the worker (a loop that never calls the robot). */
const RUN_TIMEOUT_MS = 12000;

type Saved = { code: Record<string, string>; blocks: Record<string, unknown>; mission: string; lang: Lang };

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return { code: {}, blocks: {}, mission: MISSIONS[0].id, lang: "blocks", ...JSON.parse(raw) };
  } catch {}
  return { code: {}, blocks: {}, mission: MISSIONS[0].id, lang: "blocks" };
}
function persist(s: Saved) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {}
}

const keyOf = (m: string, l: Lang) => `${m}:${l}`;

// ---------------------------------------------------------------- sound

let audio: AudioContext | null = null;
function sound(kind: "beep" | "clap") {
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    if (kind === "beep") {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = "square";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      o.connect(g).connect(audio.destination);
      o.start(now);
      o.stop(now + 0.2);
    } else {
      const len = Math.floor(audio.sampleRate * 0.12);
      const buf = audio.createBuffer(1, len, audio.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = audio.createBufferSource();
      const g = audio.createGain();
      g.gain.value = 0.35;
      src.buffer = buf;
      src.connect(g).connect(audio.destination);
      src.start(now);
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

function Player({ mission, trace, playKey, speed, onEnd }: { mission: Mission; trace: Trace | null; playKey: number; speed: number; onEnd: () => void }) {
  const idle = useMemo(() => new Sim(mission.world).frames[0], [mission]);
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    tRef.current = 0;
    setT(0);
    if (!trace) return;
    let raf = 0;
    let last = performance.now();
    let soundIdx = 0;
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const prev = tRef.current;
      const next = Math.min(trace.endTime, prev + dt * speedRef.current);
      while (soundIdx < trace.sounds.length && trace.sounds[soundIdx].t <= next) {
        if (trace.sounds[soundIdx].t >= prev - 0.001) sound(trace.sounds[soundIdx].kind);
        soundIdx++;
      }
      tRef.current = next;
      setT(next);
      if (next >= trace.endTime) {
        endRef.current();
        return;
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
    pts.push({ x: frame.x, y: frame.y });
    return pts;
  }, [frames, i, frame]);
  const clapNow = Boolean(trace?.sounds.some((sd) => sd.kind === "clap" && t >= sd.t && t - sd.t < 0.8));
  const sn = frame.sensors;
  const logNow = trace ? trace.log.filter((l) => l.t <= t + 0.001) : [];

  return (
    <div className="flex flex-col gap-2">
      <Stage world={mission.world} frame={frame} trail={trail} clapNow={clapNow} />
      <dl className="grid grid-cols-3 gap-1.5 text-[12px] sm:grid-cols-6" aria-label="Sensors">
        <Reading label="Time" value={`${t.toFixed(1)} s`} />
        <Reading label="Distance" value={`${sn.distance} cm`} warn={sn.obstacle} />
        <Reading label="Light" value={String(sn.light)} />
        <Reading label="Line L / R" value={`${sn.lineLeft ? "●" : "○"} ${sn.lineRight ? "●" : "○"}`} />
        <Reading label="Floor" value={sn.colour} swatch={FLOOR[sn.colour]} />
        <Reading label="Object" value={frame.carrying ? "holding" : sn.itemColour} swatch={sn.itemColour !== "none" ? FLOOR[sn.itemColour] : undefined} />
      </dl>
      <span className="sr-only" aria-live="polite">{logNow.length ? logNow[logNow.length - 1].text : ""}</span>
    </div>
  );
}

function Reading({ label, value, warn, swatch }: { label: string; value: string; warn?: boolean; swatch?: string }) {
  return (
    <div className={`rounded-md px-2 py-1 ${warn ? "bg-[#5A1E1E]" : "bg-[#011735]"}`}>
      <dt className="text-[10px] uppercase tracking-wide text-[#8FA0BA]">{label}</dt>
      <dd className="flex items-center gap-1 font-mono font-semibold text-[#E8EEF7]">
        {swatch && <span className="inline-block h-3 w-3 rounded-sm border border-white/40" style={{ background: swatch }} aria-hidden="true" />}
        {value}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------- data tab

function DataView({ trace }: { trace: Trace | null }) {
  const rows = trace?.data ?? [];
  if (!rows.length) return <p className="p-3 text-sm text-[#A3ADBF]">No data yet. Use record(&quot;light&quot;, light()) in your program, then Run.</p>;
  const numeric = rows.filter((r) => typeof r.value === "number") as { t: number; name: string; value: number }[];
  const vals = numeric.map((r) => r.value);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
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
    <div className="flex flex-col gap-2 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-3 text-[#C3CBD8]">
        <span>{rows.length} readings</span>
        {vals.length > 0 && (
          <span>
            mean {mean.toFixed(1)} · max {Math.max(...vals)} · min {Math.min(...vals)}
          </span>
        )}
        <button onClick={csv} className="ml-auto rounded-md bg-[#035762] px-3 py-1 font-semibold text-white hover:bg-[#0A7C8A]">
          Download CSV
        </button>
      </div>
      {vals.length > 1 && (
        <svg viewBox={`0 0 ${vals.length * 10} 60`} className="h-24 w-full rounded bg-[#011735]" preserveAspectRatio="none" role="img" aria-label="Chart of recorded readings">
          {vals.map((v, i) => {
            const h = ((v - Math.min(min, 0)) / (max - Math.min(min, 0) || 1)) * 56;
            return <rect key={i} x={i * 10 + 1.5} y={58 - h} width={7} height={h} fill="#F0D030" />;
          })}
        </svg>
      )}
      <table className="w-full text-left font-mono text-[12px]">
        <thead className="text-[#8FA0BA]">
          <tr>
            <th className="py-1">time (s)</th>
            <th>name</th>
            <th>value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/5">
              <td className="py-0.5">{r.t}</td>
              <td>{r.name}</td>
              <td>{String(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- page

type Status = "idle" | "loading" | "running" | "playing" | "done";

export default function RobotLab() {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [mission, setMission] = useState<Mission>(MISSIONS[0]);
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
  const [tab, setTab] = useState<"mission" | "console" | "data" | "reference">("mission");
  const [showJs, setShowJs] = useState(false);
  const [notice, setNotice] = useState("");
  const worker = useRef<Worker | null>(null);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pyReady = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

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
      pyReady.current = pyReady.current || lang === "py";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startWorker();
    return () => worker.current?.terminate();
  }, [startWorker]);

  // --- load: share link first, then autosave
  useEffect(() => {
    const s = loadSaved();
    setSaved(s);
    const fromHash = async () => {
      const i = location.hash.indexOf(SHARE_KEY);
      if (i < 0) return false;
      try {
        const bytes = await inflateRaw(fromBase64Url(location.hash.slice(i + SHARE_KEY.length)));
        const p = JSON.parse(new TextDecoder().decode(bytes));
        const m = missionById(p.m);
        const l: Lang = ["blocks", "js", "py"].includes(p.l) ? p.l : DEFAULT_LANG[m.program];
        open(m, l, s, l === "blocks" ? p.b : p.c);
        setNotice("Opened a shared robot program. It replaces this mission's saved work in this browser once you change it.");
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
        const m = missionById(params.get("m") ?? s.mission);
        const l = (params.get("lang") as Lang) ?? (params.get("m") ? DEFAULT_LANG[m.program] : s.lang);
        open(m, ["blocks", "js", "py"].includes(l) ? l : "blocks", s);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function open(m: Mission, l: Lang, s: Saved | null = saved, override?: unknown) {
    const st = s ?? loadSaved();
    setMission(m);
    setLang(l);
    if (l === "blocks") setBlocks(override ?? st.blocks[m.id] ?? EMPTY_WORKSPACE);
    else setCode(typeof override === "string" ? override : st.code[keyOf(m.id, l)] ?? m.starter[l]);
    setDocKey(`${m.id}:${l}:${Date.now()}`);
    setTrace(null);
    setError(null);
    setResult(null);
    setStatus("idle");
    if (l === "py") worker.current?.postMessage({ type: "warm" });
    const next = { ...st, mission: m.id, lang: l };
    setSaved(next);
    persist(next);
  }

  // --- autosave on edit
  const saveCode = (v: string) => {
    setCode(v);
    setSaved((s) => {
      if (!s) return s;
      const next = { ...s, code: { ...s.code, [keyOf(mission.id, lang)]: v } };
      persist(next);
      return next;
    });
  };
  const saveBlocks = (v: unknown) => {
    setBlocks(v);
    setSaved((s) => {
      if (!s) return s;
      const next = { ...s, blocks: { ...s.blocks, [mission.id]: v } };
      persist(next);
      return next;
    });
  };

  const js = useMemo(() => (lang === "blocks" ? blocksToJs(blocks) : ""), [lang, blocks]);

  // --- run / stop
  const run = () => {
    sound("beep"); // unlocks audio on this tap (quietly replaced by real beeps)
    const program = lang === "blocks" ? js : code;
    if (lang === "blocks" && !program.trim()) {
      setError('Join blocks under "when Run is pressed". Only blocks joined to it will run.');
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
    setTrace(null);
  };

  const onEnd = useCallback(() => {
    setStatus("done");
    setTrace((tr) => {
      if (tr) {
        const r = mission.check(tr, mission.world);
        setResult(mission.id === "sandbox" ? null : r);
        if (tr.data.length) setTab("data");
        else if (tr.log.length) setTab("console");
        else setTab("mission");
      }
      return tr;
    });
  }, [mission]);

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
        open(missionById(p.mission ?? mission.id), "blocks", saved, p.blocks);
        saveBlocks(p.blocks);
        return;
      } catch {
        setNotice("That file isn't a Robot Lab blocks file.");
        return;
      }
    }
    const l: Lang = file.name.endsWith(".py") ? "py" : "js";
    open(mission, l, saved, text);
    saveCode(text);
  };

  const busy = status === "running" || status === "loading";
  const missionList = (
    <select
      aria-label="Mission"
      value={mission.id}
      onChange={(e) => open(missionById(e.target.value), lang)}
      className="max-w-[16rem] rounded-md border border-white/15 bg-[#011735] px-2 py-1.5 text-sm font-semibold text-white"
    >
      {PROGRAMS.map((p) => (
        <optgroup key={p} label={p === "Everyone" ? "Free build" : p}>
          {MISSIONS.filter((m) => m.program === p).map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#010F2A] text-[#E8EEF7] md:h-[100dvh]">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 bg-[#012C61] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <span className="block h-7 w-6 bg-no-repeat" style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }} />
          </span>
          <h1 className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
            CODEship <span className="text-[#D58401]">Robot Lab</span>
          </h1>
        </div>
        {missionList}
        <div role="tablist" aria-label="Coding language" className="flex rounded-md bg-[#011735] p-0.5">
          {(["blocks", "js", "py"] as Lang[]).map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={lang === l}
              onClick={() => l !== lang && open(mission, l)}
              className={`rounded px-2.5 py-1 text-sm font-semibold ${lang === l ? "bg-[#D58401] text-[#010F2A]" : "text-[#C3CBD8] hover:text-white"}`}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {busy || status === "playing" ? (
            <button onClick={stop} className="rounded-md bg-[#FF6B6B] px-4 py-1.5 text-sm font-bold text-[#010F2A]">
              Stop
            </button>
          ) : (
            <button onClick={run} className="rounded-md bg-[#F0D030] px-5 py-1.5 text-sm font-extrabold text-[#010F2A] hover:bg-[#FFE14D]">
              Run
            </button>
          )}
          <button onClick={share} className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/10">
            Share link
          </button>
          <button onClick={download} className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/10">
            Download
          </button>
          <button onClick={() => fileInput.current?.click()} className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/10">
            Open
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
        <div role="status" className="flex items-start gap-3 bg-[#D58401] px-4 py-2 text-sm text-[#010F2A]">
          <span className="flex-1 break-all font-semibold">{notice}</span>
          <button onClick={() => setNotice("")} className="font-bold" aria-label="Close message">
            ×
          </button>
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <section aria-label="Program" className="flex h-[60vh] min-h-[320px] flex-col border-white/10 md:h-auto md:min-h-0 md:border-r">
          <div className="min-h-0 flex-1">
            {lang === "blocks" ? (
              <RobotBlocksEditor value={blocks} docKey={docKey} onChange={saveBlocks} />
            ) : (
              <RobotCodeEditor lang={lang} value={code} docKey={docKey} onChange={saveCode} onRun={run} />
            )}
          </div>
          {lang === "blocks" && (
            <div className="border-t border-white/10 bg-[#010F2A]">
              <button onClick={() => setShowJs((v) => !v)} className="w-full px-3 py-1.5 text-left text-[13px] font-semibold text-[#C3CBD8] hover:text-white" aria-expanded={showJs}>
                {showJs ? "Hide" : "Peek at"} the real code
              </button>
              {showJs && <pre className="max-h-48 overflow-auto bg-[#011735] px-3 py-2 font-mono text-[13px] text-[#E6EDF7]">{js || "// Nothing joined to \"when Run is pressed\" yet."}</pre>}
            </div>
          )}
          <p className="border-t border-white/10 bg-[#010F2A] px-3 py-1.5 text-[12px] text-[#8FA0BA]">Saved in this browser as you work. Use Download or Share link to take it with you.</p>
        </section>

        <section aria-label="Robot" className="flex min-h-0 flex-col gap-3 overflow-y-auto p-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#D58401]">
              {mission.program === "Everyone" ? "Free build" : `${mission.program} · ${mission.fits}`}
            </p>
            <h2 className="text-lg font-extrabold">{mission.title}</h2>
            <p className="text-sm text-[#C3CBD8]">{mission.goal}</p>
          </div>

          {(status === "loading" || status === "running") && (
            <p role="status" className="rounded-md bg-[#011735] px-3 py-2 text-sm text-[#C3CBD8]">
              {status === "loading" ? statusText || "Loading Python (first run only)…" : "Running…"}
            </p>
          )}
          {error && (
            <div role="alert" className="whitespace-pre-wrap rounded-md bg-[#5A1E1E] px-3 py-2 font-mono text-[13px] text-[#FFD5D5]">
              {error}
            </div>
          )}
          {result && (
            <div role="status" className={`rounded-md px-3 py-2 text-sm font-semibold ${result.ok ? "bg-[#1E5631] text-[#D7F5DF]" : "bg-[#3A2A05] text-[#F8E3A3]"}`}>
              {result.ok ? "Goal reached. " : "Not yet. "}
              {result.message}
            </div>
          )}
          {trace?.stoppedReason && status === "done" && <p className="rounded-md bg-[#011735] px-3 py-2 text-sm text-[#C3CBD8]">{trace.stoppedReason}</p>}

          <Player mission={mission} trace={trace} playKey={playKey} speed={speed} onEnd={onEnd} />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-[#8FA0BA]">Speed</span>
            {[1, 2, 4].map((s) => (
              <button key={s} onClick={() => setSpeed(s)} aria-pressed={speed === s} className={`rounded px-2 py-0.5 font-semibold ${speed === s ? "bg-[#035762] text-white" : "bg-[#011735] text-[#C3CBD8]"}`}>
                {s}×
              </button>
            ))}
            {trace && status === "done" && (
              <button
                onClick={() => {
                  setResult(null);
                  setStatus("playing");
                  setPlayKey((k) => k + 1);
                }}
                className="ml-auto rounded bg-[#011735] px-3 py-0.5 font-semibold text-[#C3CBD8] hover:text-white"
              >
                Replay
              </button>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-[#010F2A]">
            <div role="tablist" className="flex border-b border-white/10 text-sm">
              {(["mission", "console", "data", "reference"] as const).map((k) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-3 py-2 font-semibold capitalize ${tab === k ? "text-white shadow-[inset_0_-2px_0_#D58401]" : "text-[#8FA0BA] hover:text-white"}`}>
                  {k === "mission" ? "Hint" : k}
                  {k === "console" && trace?.log.length ? ` (${trace.log.length})` : ""}
                  {k === "data" && trace?.data.length ? ` (${trace.data.length})` : ""}
                </button>
              ))}
            </div>
            {tab === "mission" && <p className="p-3 text-sm text-[#C3CBD8]">{mission.hint}</p>}
            {tab === "console" && (
              <pre className="max-h-64 overflow-auto p-3 font-mono text-[13px] text-[#E6EDF7]">
                {trace?.log.length ? trace.log.map((l) => `[${l.t.toFixed(1)}s] ${l.text}`).join("\n") : lang === "py" ? "print() output appears here." : "console.log() output appears here."}
              </pre>
            )}
            {tab === "data" && <DataView trace={trace} />}
            {tab === "reference" && (
              <table className="w-full text-left text-[13px]">
                <tbody>
                  {REFERENCE.map((r) => (
                    <tr key={r.js} className="border-t border-white/5 align-top">
                      <td className="whitespace-nowrap px-3 py-1 font-mono text-[#5FD4DE]">{lang === "py" ? r.py : r.js}</td>
                      <td className="px-2 py-1 text-[#C3CBD8]">{r.does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
