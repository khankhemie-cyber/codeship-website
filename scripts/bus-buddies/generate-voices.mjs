#!/usr/bin/env node
/**
 * Bus Buddies Road Trip: builds every spoken line as an MP3, once, at build time.
 * Kids never trigger an API call: the game only plays the files this writes.
 *
 *   ELEVENLABS_API_KEY=... node scripts/bus-buddies/generate-voices.mjs --samples
 *       Voice sample page: 3 designed voices (+ library voices) per character.
 *   node scripts/bus-buddies/generate-voices.mjs --pick bina=A,codey=B,turtle=A,duck=C,owl=B
 *       Saves the voices you chose (from the sample page) into voices.json.
 *   node scripts/bus-buddies/generate-voices.mjs [--chapter 1] [--force] [--dry-run]
 *       Generates game audio for every line in voice-script.json. Only new or
 *       changed lines are sent (text, voice and settings are hashed).
 *
 * Lines: src/lib/games/bus/voice-script.json   Voices: scripts/bus-buddies/voices.json
 * Output: public/ship-it/bus-buddies/audio/ch<N>/<line id>.mp3 (+ manifest.json)
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Node's fetch only honours HTTPS_PROXY when NODE_USE_ENV_PROXY is set.
if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1" } });
  process.exit(r.status ?? 1);
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT_PATH = join(ROOT, "src/lib/games/bus/voice-script.json");
const VOICES_PATH = join(ROOT, "scripts/bus-buddies/voices.json");
const PUBLIC_DIR = join(ROOT, "public/ship-it/bus-buddies");
const AUDIO_DIR = join(PUBLIC_DIR, "audio");
const SAMPLES_DIR = join(PUBLIC_DIR, "voice-samples");
const API = "https://api.elevenlabs.io";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const writeJson = (p, v) => {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
};

const script = readJson(SCRIPT_PATH);
const voices = readJson(VOICES_PATH);

function apiKey() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    console.error("Set ELEVENLABS_API_KEY (an ElevenLabs API key from a paid plan) and run again.");
    process.exit(1);
  }
  return key;
}

async function api(path, { method = "GET", body, query } = {}) {
  const url = new URL(path, API);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method,
      headers: { "xi-api-key": apiKey(), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res;
    const text = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`${method} ${url.pathname} -> ${res.status}: ${text.slice(0, 400)}`);
  }
}

async function tts(voiceId, text, settings) {
  const res = await api(`/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    query: { output_format: voices.outputFormat },
    body: { text, model_id: voices.ttsModel, voice_settings: { ...voices.defaultSettings, ...settings } },
  });
  return Buffer.from(await res.arrayBuffer());
}

/** A character's own lines, joined until there's enough text for a fair sample (the design API needs 100+ characters). */
function sampleText(character) {
  const own = script.lines.filter((l) => l.character === character).map((l) => l.text);
  let text = "";
  for (const line of own) {
    if (text.length >= 140) break;
    text = text ? `${text} ${line}` : line;
  }
  while (text.length < 100) text += " Beep beep! Let's go on a road trip together!";
  return text;
}

async function findLibraryVoice(name) {
  const res = await api("/v1/voices");
  const { voices: list } = await res.json();
  return list.find((v) => v.name.toLowerCase().startsWith(name.toLowerCase()));
}

async function buildSamples() {
  mkdirSync(SAMPLES_DIR, { recursive: true });
  for (const f of readdirSync(SAMPLES_DIR)) if (f.endsWith(".mp3")) unlinkSync(join(SAMPLES_DIR, f));
  const manifest = { generatedAt: new Date().toISOString(), characters: {} };
  for (const [id, cand] of Object.entries(voices.candidates)) {
    const info = script.characters[id];
    const text = sampleText(id);
    const options = [];
    console.log(`\n${info.name}: designing voices…`);
    const res = await api("/v1/text-to-voice/design", {
      method: "POST",
      query: { output_format: voices.outputFormat },
      body: { voice_description: cand.design, model_id: voices.designModel, text, auto_generate_text: false },
    });
    const { previews } = await res.json();
    for (const p of previews.slice(0, 3)) {
      const key = String.fromCharCode(65 + options.length);
      const file = `${id}-${key}.mp3`;
      writeFileSync(join(SAMPLES_DIR, file), Buffer.from(p.audio_base_64 ?? p.audio_base64, "base64"));
      options.push({ key, kind: "designed", file, generatedVoiceId: p.generated_voice_id });
      console.log(`  ${key}: designed voice`);
    }
    for (const name of cand.library ?? []) {
      const v = await findLibraryVoice(name);
      if (!v) {
        console.log(`  (library voice "${name}" not found on this account, skipped)`);
        continue;
      }
      const key = String.fromCharCode(65 + options.length);
      const file = `${id}-${key}.mp3`;
      writeFileSync(join(SAMPLES_DIR, file), await tts(v.voice_id, text));
      options.push({ key, kind: "library", file, voiceId: v.voice_id, voiceName: v.name });
      console.log(`  ${key}: library voice ${v.name}`);
    }
    manifest.characters[id] = { name: info.name, style: info.style, text, options };
  }
  writeJson(join(SAMPLES_DIR, "samples.json"), manifest);
  console.log(`\nSamples written to ${SAMPLES_DIR}. Open /ship-it/bus-buddies/voices/ to listen.`);
}

async function pick(spec) {
  const manifest = readJson(join(SAMPLES_DIR, "samples.json"));
  for (const pair of spec.split(",")) {
    const [id, key] = pair.split("=").map((s) => s.trim());
    const opt = manifest.characters[id]?.options.find((o) => o.key === key?.toUpperCase());
    if (!opt) throw new Error(`No sample "${key}" for "${id}"`);
    let voiceId = opt.voiceId;
    if (opt.kind === "designed") {
      // Saves the designed voice to the ElevenLabs account so it can be reused for every line.
      const res = await api("/v1/text-to-voice", {
        method: "POST",
        body: {
          voice_name: `Bus Buddies - ${manifest.characters[id].name}`,
          voice_description: voices.candidates[id].design,
          generated_voice_id: opt.generatedVoiceId,
        },
      });
      voiceId = (await res.json()).voice_id;
    }
    voices.picked[id] = { voiceId, sample: key.toUpperCase(), kind: opt.kind, ...(opt.voiceName ? { voiceName: opt.voiceName } : {}) };
    console.log(`${id}: sample ${key.toUpperCase()} -> voice ${voiceId}`);
  }
  writeJson(VOICES_PATH, voices);
}

const hashOf = (line, voice) =>
  createHash("sha256")
    .update(JSON.stringify([line.text, voice.voiceId, voices.ttsModel, voices.outputFormat, voices.defaultSettings, voice.settings ?? {}]))
    .digest("hex")
    .slice(0, 16);

async function buildGameAudio() {
  const chapter = option("chapter");
  const manifestPath = join(AUDIO_DIR, "manifest.json");
  const manifest = existsSync(manifestPath) ? readJson(manifestPath) : { lines: {} };
  const wanted = script.lines.filter((l) => chapter === undefined || String(l.chapter) === chapter);
  const missing = [...new Set(wanted.map((l) => l.character))].filter((c) => !voices.picked[c]);
  if (missing.length) {
    console.error(`No voice picked yet for: ${missing.join(", ")}. Run --samples, then --pick.`);
    process.exit(1);
  }
  let made = 0;
  for (const line of wanted) {
    const voice = voices.picked[line.character];
    const hash = hashOf(line, voice);
    const rel = `ch${line.chapter}/${line.id}.mp3`;
    const file = join(AUDIO_DIR, rel);
    if (!flag("force") && manifest.lines[line.id]?.hash === hash && existsSync(file)) continue;
    console.log(`${flag("dry-run") ? "would generate" : "generating"} ${rel}: "${line.text}"`);
    if (!flag("dry-run")) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, await tts(voice.voiceId, line.text, voice.settings));
      manifest.lines[line.id] = { file: rel, hash };
      made++;
    }
  }
  // Drop entries (and files) for lines that were deleted from the script.
  const ids = new Set(script.lines.map((l) => l.id));
  for (const [id, entry] of Object.entries(manifest.lines)) {
    if (ids.has(id)) continue;
    if (!flag("dry-run")) {
      try {
        unlinkSync(join(AUDIO_DIR, entry.file));
      } catch {}
      delete manifest.lines[id];
    }
    console.log(`removed ${entry.file} (line no longer in the script)`);
  }
  if (!flag("dry-run")) writeJson(manifestPath, manifest);
  console.log(`\nDone: ${made} line(s) generated.`);
}

try {
  if (flag("samples")) await buildSamples();
  else if (option("pick")) await pick(option("pick"));
  else await buildGameAudio();
} catch (err) {
  console.error(String(err?.message ?? err));
  process.exit(1);
}
