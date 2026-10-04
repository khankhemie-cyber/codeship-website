/**
 * Sound for CODEship Blocks: the built-in Pop, playing recordings, and the
 * recorder behind the Record block.
 *
 * Everything plays through one Web Audio context, unlocked by the first tap
 * on the page, so sounds that fire after a Wait or a message still play on
 * iPad Safari (which blocks <audio> playback that isn't directly tapped).
 *
 * Recordings are saved as 16 kHz mono WAV. That is bigger than the browser's
 * own format, but every browser plays it: Chromebooks record WebM/Opus and
 * iPads record MP4/AAC, and neither reliably plays the other's. Quiet
 * recordings (the commonest failure with young children) are boosted to a
 * normal level, up to 8x.
 */

import type { Recording } from "./model";

export const MAX_RECORD_SECONDS = 15;
const SAMPLE_RATE = 16000;
const MAX_BOOST = 8;

let ctx: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer>>();

function audioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Call from a tap/click handler so later, timer-driven sounds are allowed to play. */
export function unlockAudio() {
  const c = audioContext();
  if (c.state === "suspended") c.resume().catch(() => {});
}

export function playPop() {
  const c = audioContext();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.16);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.6, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.22);
}

function decode(clipId: string, dataUrl: string): Promise<AudioBuffer> {
  let p = buffers.get(clipId);
  if (!p) {
    p = fetch(dataUrl)
      .then((r) => r.arrayBuffer())
      .then((b) => audioContext().decodeAudioData(b));
    buffers.set(clipId, p);
  }
  return p;
}

let playing: AudioBufferSourceNode[] = [];

export function playRecording(clipId: string, rec: Recording) {
  decode(clipId, rec.data)
    .then((buffer) => {
      const src = audioContext().createBufferSource();
      src.buffer = buffer;
      src.connect(audioContext().destination);
      src.onended = () => (playing = playing.filter((s) => s !== src));
      playing.push(src);
      src.start();
    })
    .catch(() => {
      // A damaged clip plays as silence rather than stopping the class.
    });
}

export function stopAllSounds() {
  for (const s of playing) {
    try {
      s.stop();
    } catch {}
  }
  playing = [];
}

// ── Recording ──

export type MicError = { kind: "blocked" | "missing" | "failed"; detail: string };

export function micError(err: unknown): MicError {
  const name = (err as { name?: string })?.name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError") return { kind: "blocked", detail: name };
  if (name === "NotFoundError" || name === "OverconstrainedError") return { kind: "missing", detail: name };
  if (typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia) return { kind: "missing", detail: "no getUserMedia" };
  return { kind: "failed", detail: name || String((err as Error)?.message ?? err) };
}

export async function openMic(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("no getUserMedia"), { name: "NotFoundError" });
  return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
}

/** Ask for the microphone once (before class), then let it go. */
export async function setUpMic(): Promise<void> {
  const stream = await openMic();
  stream.getTracks().forEach((t) => t.stop());
}

export class Recorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private meterTimer = 0;
  private stopTimer = 0;
  private stopped: Promise<Blob> | null = null;

  /** Starts recording. onLevel gets 0..1 about 20 times a second; onAutoStop fires at the cap. */
  async start(onLevel: (level: number) => void, onAutoStop: () => void) {
    unlockAudio();
    this.stream = await openMic();
    const c = audioContext();
    const analyser = c.createAnalyser();
    analyser.fftSize = 1024;
    c.createMediaStreamSource(this.stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    this.meterTimer = window.setInterval(() => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      onLevel(Math.min(1, Math.sqrt(sum / buf.length) * 6));
    }, 50);

    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream);
    this.recorder.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    const rec = this.recorder;
    this.stopped = new Promise((resolve) => {
      rec.onstop = () => resolve(new Blob(this.chunks, { type: rec.mimeType }));
    });
    rec.start(250);
    this.stopTimer = window.setTimeout(onAutoStop, MAX_RECORD_SECONDS * 1000);
  }

  /** Stops and returns the recording as WAV. */
  async stop(): Promise<Recording> {
    window.clearInterval(this.meterTimer);
    window.clearTimeout(this.stopTimer);
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    const blob = await (this.stopped ?? Promise.reject(new Error("not recording")));
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    return toWav(blob);
  }

  cancel() {
    window.clearInterval(this.meterTimer);
    window.clearTimeout(this.stopTimer);
    try {
      if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    } catch {}
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}

async function toWav(blob: Blob): Promise<Recording> {
  const decoded = await audioContext().decodeAudioData(await blob.arrayBuffer());
  const seconds = Math.min(decoded.duration, MAX_RECORD_SECONDS);
  const frames = Math.max(1, Math.ceil(seconds * SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, SAMPLE_RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const mono = (await offline.startRendering()).getChannelData(0);

  let peak = 0;
  for (const v of mono) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? Math.min(MAX_BOOST, 0.9 / peak) : 1;

  const out = new DataView(new ArrayBuffer(44 + frames * 2));
  const str = (o: number, s: string) => [...s].forEach((ch, i) => out.setUint8(o + i, ch.charCodeAt(0)));
  str(0, "RIFF");
  out.setUint32(4, 36 + frames * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, 1, true);
  out.setUint32(24, SAMPLE_RATE, true);
  out.setUint32(28, SAMPLE_RATE * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  str(36, "data");
  out.setUint32(40, frames * 2, true);
  for (let i = 0; i < frames; i++) {
    const v = Math.max(-1, Math.min(1, mono[i] * gain));
    out.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  const bytes = new Uint8Array(out.buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  return { mime: "audio/wav", data: `data:audio/wav;base64,${btoa(bin)}`, durationMs: Math.round(seconds * 1000) };
}
