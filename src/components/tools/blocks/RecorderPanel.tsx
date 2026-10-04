"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_RECORD_SECONDS, micError, playRecording, Recorder, stopAllSounds, unlockAudio, type MicError } from "./audio";
import type { Strings } from "./i18n";
import type { Recording } from "./model";

/**
 * Record / Stop / Play for one Record block. Three controls only, big and
 * far apart. The adult presses Stop; recording stops by itself at 15 s.
 * Recording again simply replaces the clip, with no warning: the lesson
 * says "you can do it again as many times as you like".
 */

type Props = {
  s: Strings;
  clip: { id: string; rec: Recording } | null;
  onRecorded: (rec: Recording) => void;
  onClose: () => void;
};

export default function RecorderPanel({ s, clip, onRecorded, onClose }: Props) {
  const recorder = useRef<Recorder | null>(null);
  const [state, setState] = useState<"idle" | "recording" | "saving">("idle");
  const [level, setLevel] = useState(0);
  const [loudest, setLoudest] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [error, setError] = useState<MicError | null>(null);

  useEffect(() => () => recorder.current?.cancel(), []);
  useEffect(() => {
    if (state !== "recording") return;
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(t);
  }, [state]);

  const stop = async () => {
    const r = recorder.current;
    if (!r || state !== "recording") return;
    setState("saving");
    try {
      onRecorded(await r.stop());
    } catch (err) {
      setError(micError(err));
    }
    recorder.current = null;
    setLevel(0);
    setState("idle");
  };
  const stopRef = useRef(stop);
  stopRef.current = stop;

  const start = async () => {
    if (state !== "idle") return;
    stopAllSounds();
    setError(null);
    setLoudest(0);
    const r = new Recorder();
    try {
      await r.start(
        (l) => {
          setLevel(l);
          setLoudest((m) => Math.max(m, l));
        },
        () => stopRef.current(),
      );
    } catch (err) {
      setError(micError(err));
      return;
    }
    recorder.current = r;
    setStartedAt(Date.now());
    setNow(Date.now());
    setState("recording");
  };

  const play = () => {
    if (!clip || state !== "idle") return;
    unlockAudio();
    stopAllSounds();
    playRecording(clip.id, clip.rec);
  };

  const left = Math.max(0, MAX_RECORD_SECONDS - Math.floor((now - startedAt) / 1000));
  const quiet = state === "recording" && now - startedAt > 1500 && loudest < 0.08;
  const errorText = error
    ? error.kind === "blocked"
      ? s.micBlocked
      : error.kind === "missing"
        ? s.micMissing
        : s.micFailed(error.detail)
    : null;

  const big = "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full text-sm font-extrabold shadow-lg transition active:scale-95 disabled:opacity-35 sm:h-28 sm:w-28";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3" role="dialog" aria-label={s.recordTitle}>
      <div className="w-full max-w-2xl rounded-2xl border-4 border-[#035762] bg-white p-5 text-[#010F2A] shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">{s.recordTitle}</h2>
          <button type="button" onClick={onClose} disabled={state !== "idle"} className="rounded-lg bg-[#010F2A] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
            {s.done}
          </button>
        </div>

        {/* Far apart on purpose: Record at one end, Play at the other. */}
        <div className="mt-5 flex items-center justify-between px-2 sm:px-8">
          <button type="button" data-testid="rec-record" onClick={start} disabled={state !== "idle"} className={`${big} bg-[#E53935] text-white`}>
            <span aria-hidden="true" className="block h-9 w-9 rounded-full bg-white" />
            {s.recordStart}
          </button>
          <button type="button" data-testid="rec-stop" onClick={stop} disabled={state !== "recording"} className={`${big} bg-[#010F2A] text-white`}>
            <span aria-hidden="true" className="block h-8 w-8 rounded-sm bg-white" />
            {s.recordStop}
          </button>
          <button type="button" data-testid="rec-play" onClick={play} disabled={!clip || state !== "idle"} className={`${big} bg-[#2EB84B] text-white`}>
            <span aria-hidden="true" className="block h-0 w-0 border-y-[18px] border-l-[30px] border-y-transparent border-l-white" />
            {s.recordPlay}
          </button>
        </div>

        {/* Level meter: an adult can see at a glance whether anything is being picked up. */}
        <div className="mt-5 h-5 overflow-hidden rounded-full bg-[#E6ECF4]" aria-hidden="true">
          <div
            data-testid="rec-level"
            className="h-full rounded-full transition-[width] duration-75"
            style={{ width: `${Math.round(level * 100)}%`, background: level > 0.08 ? "#2EB84B" : "#9AA6B8" }}
          />
        </div>
        <p role="status" aria-live="polite" data-testid="rec-status" className="mt-3 min-h-[2.5rem] text-sm font-semibold">
          {errorText ? (
            <span className="text-[#C62828]">{errorText}</span>
          ) : state === "recording" ? (
            <>
              {s.recording(left)}
              {quiet && <span className="ml-2 text-[#C62828]">{s.tooQuiet}</span>}
            </>
          ) : state === "saving" ? (
            "…"
          ) : clip ? (
            s.recordHave((clip.rec.durationMs / 1000).toFixed(1))
          ) : (
            s.recordNone
          )}
        </p>
      </div>
    </div>
  );
}
