"use client";

/**
 * Port CODEship: a 3D open-world coding game for Ship It! Arcade.
 *
 * Explore the town, climb anything, and solve everyday problems either by
 * hand or by writing real Python or JavaScript that drives the town's bots.
 * Progress is saved in this browser only (localStorage): no accounts and no
 * personal data leave the device.
 */

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeEditor, type CodeEditorHandle } from "@/components/games/code-editor";
import { completeLevel, getProgress, setCoderName } from "@/lib/games/progress";
import {
  AISLES,
  API_NAMES,
  BLOCK_COLORS,
  LITTER_KINDS,
  MISSIONS,
  makeLitter,
  missingWalls,
  testWorlds,
  type BeachStep,
  type BinName,
  type Block,
  type BlockColor,
  type HomeStep,
  type Lang,
  type Litter,
  type LitterKind,
  type MarketStep,
  type MissionId,
} from "@/lib/games/port/missions";
import type { RunOutcome } from "@/lib/games/port/runner";
import { STARTER_BLOCKS, blocksToJs, blocksToPy } from "@/lib/games/port/blocks";

// Blockly only loads when someone opens the blocks view.
const PortBlocksEditor = dynamic(() => import("./PortBlocksEditor"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-white/70">Loading blocks…</div>,
});

/** How the code panel shows code: drag-and-drop blocks, or typed Python / JavaScript. */
type Editor = "blocks" | Lang;
import type { EngineSave, Focus, Game, Look } from "./engine/Game";
import type { BeachBotStyle } from "./engine/models";
import SignupGate from "./SignupGate";
import { BEACH_TERMINAL, LOOKOUTS, MARKET_TERMINAL, NPCS, PLOT_TERMINAL, type NpcId } from "./engine/layout";

// ---------------------------------------------------------------------------
// Save data

type MissionState = { status: "locked" | "active" | "done"; stars: number; method?: "hand" | "code" | "mixed"; code: Record<Lang, string>; blocks?: unknown };

type Save = {
  v: 1;
  name: string;
  look: Look;
  lang: Lang;
  /** Blocks or typed code; older saves without it start in blocks. */
  editor?: Editor;
  engine: Partial<EngineSave>;
  intro: boolean;
  missions: Record<MissionId, MissionState>;
  blocks: Block[];
  marketServed: number;
  litter: Litter[];
  nextLitterId: number;
  cleanedByHand: number;
  beachBot: BeachBotStyle;
  beachCode: { lang: Lang; code: string } | null;
  lowGraphics: boolean;
  /** Seconds of active play, for the sign-up prompt. */
  playSeconds?: number;
  /** Set once a parent signed up or a class password was entered on this device. */
  signedUp?: "parent" | "student";
};

/** Sign-up is asked for after the first finished challenge or this much play. */
const FREE_PLAY_SECONDS = 15 * 60;

const KEY = "codeship-port-v1";
const ALI_ORDERS = ["cereal", "flour", "mangoes"];

function freshSave(name: string, look: Look): Save {
  const m = (id: MissionId): MissionState => ({ status: "locked", stars: 0, code: { ...MISSIONS[id].starter } });
  return {
    v: 1,
    name,
    look,
    lang: "py",
    editor: "blocks",
    engine: {},
    intro: false,
    missions: { home: m("home"), market: m("market"), beach: m("beach") },
    blocks: [],
    marketServed: 0,
    litter: makeLitter(18, 2026),
    nextLitterId: 1000,
    cleanedByHand: 0,
    beachBot: { wheels: "wheels", color: 0x2fb38f, arm: "claw" },
    beachCode: null,
    lowGraphics: false,
  };
}

function loadSave(): Save | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Save;
    return s?.v === 1 ? s : null;
  } catch {
    return null;
  }
}

function writeSave(s: Save) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: progress lasts for this visit only */
  }
}

// ---------------------------------------------------------------------------
// Look options

const SHIRTS = [0x1f8a9e, 0xe3664f, 0xf5b83d, 0x6c5ce7, 0x27ae60, 0x0a2342];
const SKINS = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x5a3825];
const HAIRS = [0x111111, 0x3b2314, 0x8a4b2a, 0xd9a441, 0xb55239, 0xe8e8e8];
const hex = (n: number) => "#" + n.toString(16).padStart(6, "0");

const BLOCK_SWATCH: Record<BlockColor, string> = {
  brick: "#b5523b",
  wood: "#a4723f",
  stone: "#8d969d",
  white: "#f3f1ea",
  teal: "#1f8a9e",
  yellow: "#f5c33d",
  glass: "#9fd8ef",
};

const BOT_COLORS = [0x2fb38f, 0xe3664f, 0x2f80ed, 0xf5b83d, 0x8e44ad];

// ---------------------------------------------------------------------------

type Dialog = { who: string; text: string; choices: { label: string; act: () => void }[] };
type Feed = { id: number; who: string; text: string; tone: "good" | "bad" | "info" };
type Result = { ok: boolean; title: string; detail: string; error?: string | null; output: string[] };

export default function PortCodeship() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const bigMapRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const saveRef = useRef<Save | null>(null);
  const carryRef = useRef<{ kind: "litter" | "product"; name: string; litter?: Litter } | null>(null);
  const busyRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);
  const editorRef = useRef<CodeEditorHandle>(null);

  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<"title" | "play">("title");
  const [save, setSaveState] = useState<Save | null>(null);
  const [existing, setExisting] = useState<Save | null>(null);
  const [name, setName] = useState("");
  const [look, setLook] = useState<Look>({ shirt: SHIRTS[0], skin: SKINS[2], hair: HAIRS[0] });
  const [focus, setFocus] = useState<Focus>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [feed, setFeed] = useState<Feed[]>([]);
  const [panel, setPanel] = useState<MissionId | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);
  const [watching, setWatching] = useState<MissionId | null>(null);
  const [speed, setSpeed] = useState(1);
  const [pyStatus, setPyStatus] = useState("");
  const [building, setBuilding] = useState(false);
  const [buildColor, setBuildColorState] = useState<BlockColor>("brick");
  const [bits, setBits] = useState<number[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [workshop, setWorkshop] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [touch, setTouch] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [carry, setCarryState] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [goalHidden, setGoalHidden] = useState(false);

  const update = useCallback((fn: (s: Save) => Save) => {
    const cur = saveRef.current;
    if (!cur) return;
    const next = fn(cur);
    saveRef.current = next;
    setSaveState(next);
    writeSave(next);
  }, []);

  const say = useCallback((who: string, text: string, tone: Feed["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setFeed((f) => [...f.slice(-4), { id, who, text, tone }]);
    window.setTimeout(() => setFeed((f) => f.filter((x) => x.id !== id)), 6000);
  }, []);

  const setCarry = useCallback((c: typeof carryRef.current) => {
    carryRef.current = c;
    setCarryState(c ? c.name : null);
    gameRef.current?.setCarry(c ? { kind: c.kind, name: c.name } : null);
  }, []);

  // -------------------------------------------------------------------------
  // Interaction rules: what E does near each thing

  const label = useCallback((id: string): string | null => {
    const s = saveRef.current;
    if (!s || busyRef.current) return null;
    const carrying = carryRef.current;
    const [kind, a, b] = id.split(":");
    const m = s.missions;
    if (id === "build") return s.intro ? "" : null;
    if (kind === "npc") {
      const n = NPCS[a as NpcId];
      if (a === "ali" && carrying?.kind === "product") return `Give ${carrying.name} to Mrs. Ali`;
      return `Talk to ${n.name}`;
    }
    if (kind === "term") {
      const st = m[a as MissionId]?.status;
      if (!st || st === "locked") return null;
      return `Program the ${MISSIONS[a as MissionId].bot}`;
    }
    if (kind === "grab") {
      if (m.market.status !== "active" || carrying) return null;
      return `Grab ${AISLES[Number(a) - 1][Number(b) - 1]} (aisle ${a}, shelf ${b})`;
    }
    if (kind === "litter") {
      if (m.beach.status === "locked" || carrying) return null;
      const l = s.litter.find((q) => q.id === Number(a));
      return l ? `Pick up the ${l.kind}` : null;
    }
    if (kind === "bin") {
      if (carrying?.kind !== "litter") return null;
      return `Put the ${carrying.name} in ${a}`;
    }
    if (kind === "lookout") {
      if (gameRef.current?.getSave().lit.includes(a)) return null;
      return `Light the ${LOOKOUTS.find((l) => l.id === a)?.name} lookout`;
    }
    return null;
  }, []);

  const openPanel = useCallback((id: MissionId) => {
    setPanel(id);
    setResult(null);
    setShowHint(false);
    gameRef.current?.setEnabled(false);
    if (saveRef.current?.editor === "py") workerRef.current?.postMessage({ type: "warm" });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    gameRef.current?.setEnabled(true);
  }, []);

  const showDialog = useCallback((d: Dialog) => {
    gameRef.current?.setEnabled(false);
    setDialog(d);
  }, []);

  const finishMission = useCallback(
    (id: MissionId, method: "hand" | "code" | "mixed") => {
      const s = saveRef.current!;
      const prev = s.missions[id];
      const stars = method === "code" ? 3 : method === "mixed" ? 2 : 1;
      const nextId: MissionId | null = id === "home" ? "market" : id === "market" ? "beach" : null;
      update((q) => ({
        ...q,
        missions: {
          ...q.missions,
          [id]: { ...q.missions[id], status: "done", stars: Math.max(prev.stars, stars), method: stars >= prev.stars ? method : prev.method },
          ...(nextId && q.missions[nextId].status === "locked" ? { [nextId]: { ...q.missions[nextId], status: "active" } } : {}),
        },
      }));
      completeLevel("port", id, stars);
      if (prev.status !== "done") say("Port CODEship", `Mission complete: ${MISSIONS[id].title}! ${"★".repeat(stars)}${"☆".repeat(3 - stars)}`, "good");
    },
    [say, update]
  );

  const interact = useCallback(
    (id: string) => {
      const s = saveRef.current;
      const g = gameRef.current;
      if (!s || !g) return;
      const [kind, a, b] = id.split(":");
      const m = s.missions;

      if (id === "npc:ada") {
        if (!s.intro) {
          const lines = [
            `Welcome to Port CODEship, ${s.name}! I'm Captain Ada. This is the CODEship's home port, and everything here runs on code. The townsfolk could use a coder like you.`,
            "First things first: you need a home. Your plot is just east of the square. Follow the gold marker.",
            "You can build it block by block by hand (press B on your plot), or program the Builder Bot at the terminal to do it for you. Your choice!",
            "One more tip: you can climb almost anything. Walk into a wall and keep moving forward. Climb the 3 lookout towers to see the whole town.",
          ];
          let i = 0;
          const step = () => {
            if (i < lines.length - 1) {
              i++;
              showDialog({ who: "Captain Ada", text: lines[i], choices: [{ label: i === lines.length - 1 ? "Let's go!" : "Next", act: step }] });
            } else {
              update((q) => ({ ...q, intro: true, missions: { ...q.missions, home: { ...q.missions.home, status: "active" } } }));
              closeDialog();
            }
          };
          showDialog({
            who: "Captain Ada",
            text: lines[0],
            choices: [
              { label: "Next", act: step },
              { label: "Skip, I'll explore", act: () => { i = lines.length; step(); } },
            ],
          });
          return;
        }
        const next = m.home.status !== "done" ? "Your house won't build itself… unless you code it to! Head east to your plot." : m.market.status !== "done" ? "Mrs. Ali at the Fresh Market needs help. It's west along Main Street." : m.beach.status !== "done" ? "Kofi says the beach is a mess. Head south down Harbour Road." : "You've helped everyone so far. Try lighting all the lookouts and finding every bit hidden on the rooftops!";
        showDialog({ who: "Captain Ada", text: next, choices: [{ label: "OK", act: closeDialog }] });
        return;
      }
      if (id === "npc:rosa") {
        const done = m.home.status === "done";
        showDialog({
          who: "Rosa",
          text: done
            ? "Great house! Press B any time to keep building: add a door, windows, a second floor. Right-click or Shift-click removes a block."
            : "Hi neighbour! The walls need to be 6 blocks by 5, and 3 blocks high: 54 blocks. By hand, press B and click. Or program the Builder Bot at the terminal: a loop does it in a few lines.",
          choices: [
            ...(s.intro ? [{ label: "Program the Builder Bot", act: () => { closeDialog(); openPanel("home"); } }] : []),
            ...(s.intro ? [{ label: "Build by hand", act: () => { closeDialog(); g.toggleBuild(true); } }] : []),
            { label: "Bye", act: closeDialog },
          ],
        });
        return;
      }
      if (id === "npc:ali") {
        if (m.market.status === "locked") {
          showDialog({ who: "Mrs. Ali", text: "Welcome to the Fresh Market! Come back once you've settled into your new home.", choices: [{ label: "OK", act: closeDialog }] });
          return;
        }
        const carrying = carryRef.current;
        const want = ALI_ORDERS[s.marketServed];
        if (carrying?.kind === "product") {
          if (m.market.status === "active" && carrying.name === want) {
            setCarry(null);
            const served = s.marketServed + 1;
            update((q) => ({ ...q, marketServed: served }));
            if (served >= ALI_ORDERS.length) {
              finishMission("market", "hand");
              showDialog({
                who: "Mrs. Ali",
                text: "That's everything, thank you! But I'm not the only one who can't reach the top shelf: the market gets hundreds of customers a day. If you program the Ladder Bot, it can help everyone, all day long.",
                choices: [
                  { label: "Program the Ladder Bot", act: () => { closeDialog(); openPanel("market"); } },
                  { label: "Maybe later", act: closeDialog },
                ],
              });
            } else say("Mrs. Ali", `Perfect, thank you! Next I need ${ALI_ORDERS[served]}.`, "good");
          } else {
            setCarry(null);
            say("Mrs. Ali", want ? `That's ${carrying.name}, dear. I need ${want}. I'll put it back for you.` : "Thank you, but I have everything I need!", "bad");
          }
          return;
        }
        if (m.market.status === "done") {
          showDialog({ who: "Mrs. Ali", text: "Thanks to you, everyone gets their shopping now. You can always improve the Ladder Bot's code at the terminal.", choices: [{ label: "Bye", act: closeDialog }] });
          return;
        }
        showDialog({
          who: "Mrs. Ali",
          text:
            s.marketServed === 0
              ? "Oh, hello! I can't reach the high shelves. I need cereal, flour and mangoes. Could you climb up and get them? The signs above each aisle say what's on every shelf. Or… the shop's Ladder Bot just needs someone to program it."
              : `You're doing great! Next I need ${want}.`,
          choices: [
            { label: "I'll get them by hand", act: () => { closeDialog(); say("Tip", "Read the aisle signs, then walk into a shelf and climb (hold forward). Press E to grab.", "info"); } },
            { label: "Program the Ladder Bot", act: () => { closeDialog(); openPanel("market"); } },
          ],
        });
        return;
      }
      if (id === "npc:kofi") {
        if (m.beach.status === "locked") {
          showDialog({ who: "Kofi", text: "Hey! I'm the lifeguard here. Enjoy the beach! Mrs. Ali at the market might need a hand, though.", choices: [{ label: "OK", act: closeDialog }] });
          return;
        }
        if (m.beach.status === "done") {
          showDialog({
            who: "Kofi",
            text: s.beachCode ? "Your Beach Bot cleans up every time the tide comes in. Best beach on the island!" : "The beach is clean… for now. The tide keeps bringing more. A Beach Bot would clean up every tide without you lifting a finger.",
            choices: [
              { label: s.beachCode ? "Improve the Beach Bot" : "Build a Beach Bot", act: () => { closeDialog(); setWorkshop(true); g.setEnabled(false); } },
              { label: "Bye", act: closeDialog },
            ],
          });
          return;
        }
        showDialog({
          who: "Kofi",
          text: `Look at this beach! ${s.litter.length} pieces of litter, and every tide washes up more. Some goes in recycling, some in compost, and the rest in garbage. You could clean it up by hand… or design a robot and code it to clean up for good.`,
          choices: [
            { label: "Build a robot", act: () => { closeDialog(); setWorkshop(true); g.setEnabled(false); } },
            { label: "Clean by hand", act: () => { closeDialog(); say("Tip", "Walk up to litter and press E to pick it up, then take it to the right bin on the boardwalk.", "info"); } },
          ],
        });
        return;
      }
      if (kind === "term") {
        openPanel(a as MissionId);
        return;
      }
      if (kind === "grab") {
        const product = AISLES[Number(a) - 1][Number(b) - 1];
        setCarry({ kind: "product", name: product });
        say("You", `Got the ${product}. Take it to Mrs. Ali.`, "info");
        return;
      }
      if (kind === "litter") {
        const l = s.litter.find((q) => q.id === Number(a));
        if (!l) return;
        g.removeLitter(l.id);
        update((q) => ({ ...q, litter: q.litter.filter((x) => x.id !== l.id) }));
        setCarry({ kind: "litter", name: l.kind, litter: l });
        return;
      }
      if (kind === "bin") {
        const c = carryRef.current;
        if (!c || c.kind !== "litter") return;
        const right = LITTER_KINDS[c.name as LitterKind] as BinName;
        if (right !== a) {
          say("Kofi", `Not quite! A ${c.name} goes in ${right === "recycling" ? "recycling" : right}.`, "bad");
          return;
        }
        setCarry(null);
        const cleaned = s.cleanedByHand + 1;
        update((q) => ({ ...q, cleanedByHand: cleaned }));
        const left = saveRef.current!.litter.length;
        if (left === 0 && m.beach.status === "active") {
          finishMission("beach", "hand");
          showDialog({
            who: "Kofi",
            text: `You did it: ${cleaned} pieces, all by hand! But watch: the next tide will bring more. A Beach Bot could clean up every single tide, forever.`,
            choices: [
              { label: "Build a Beach Bot", act: () => { closeDialog(); setWorkshop(true); g.setEnabled(false); } },
              { label: "Later", act: closeDialog },
            ],
          });
        } else say("Kofi", `Nice sorting! ${left} left.`, "good");
        return;
      }
      if (kind === "lookout") {
        busyRef.current = true;
        g.setEnabled(false);
        g.lightLookout(a).then(() => {
          busyRef.current = false;
          g.setEnabled(true);
          update((q) => ({ ...q, engine: g.getSave() }));
          const lit = g.getSave().lit.length;
          say("Port CODEship", `${LOOKOUTS.find((l) => l.id === a)?.name} lookout lit! (${lit}/${LOOKOUTS.length})`, "good");
        });
      }
    },
    [closeDialog, finishMission, openPanel, say, setCarry, showDialog, update]
  );

  // -------------------------------------------------------------------------
  // Running code

  const ensureWorker = useCallback(() => {
    if (!workerRef.current) {
      const w = new Worker(new URL("./port.worker.ts", import.meta.url), { type: "module" });
      w.addEventListener("message", (e: MessageEvent) => {
        if (e.data?.type === "status") setPyStatus(e.data.text);
      });
      workerRef.current = w;
    }
    return workerRef.current;
  }, []);

  const runInWorker = useCallback(
    (mission: MissionId, lang: Lang, code: string, worlds: unknown[]): Promise<RunOutcome[] | string> => {
      const w = ensureWorker();
      const id = ++runIdRef.current;
      return new Promise((resolve) => {
        // Loading Python can take a while the first time; running code should not.
        let limit = window.setTimeout(() => onTimeout(), lang === "py" ? 60000 : 8000);
        const onTimeout = () => {
          w.removeEventListener("message", onMsg);
          w.terminate();
          workerRef.current = null;
          resolve("Your program took too long and was stopped. Is there a loop that never ends?");
        };
        const onMsg = (e: MessageEvent) => {
          const d = e.data;
          if (d?.type === "status" && d.text === "" && lang === "py") {
            window.clearTimeout(limit);
            limit = window.setTimeout(onTimeout, 10000);
          }
          if (d?.id !== id) return;
          window.clearTimeout(limit);
          w.removeEventListener("message", onMsg);
          resolve(d.type === "done" ? (d.results as RunOutcome[]) : `Something went wrong: ${d.message}`);
        };
        w.addEventListener("message", onMsg);
        w.postMessage({ type: "run", id, mission, lang, code, worlds });
      });
    },
    [ensureWorker]
  );

  const liveWorld = useCallback((id: MissionId): unknown => {
    const s = saveRef.current!;
    if (id === "home") return { blocks: gameRef.current?.getBlocks() ?? s.blocks };
    if (id === "market") return { orders: ALI_ORDERS };
    return { litter: s.litter };
  }, []);

  const addTide = useCallback(
    (count: number) => {
      const s = saveRef.current!;
      const fresh = makeLitter(count, s.nextLitterId * 7 + 3, s.nextLitterId);
      const litter = [...s.litter, ...fresh].slice(-30);
      update((q) => ({ ...q, litter, nextLitterId: q.nextLitterId + count }));
      gameRef.current?.setLitter(litter);
      return litter;
    },
    [update]
  );

  const runCode = useCallback(async () => {
    const s = saveRef.current;
    const g = gameRef.current;
    if (!s || !g || !panel || running) return;
    const id = panel;
    const blocksMode = (s.editor ?? "blocks") === "blocks";
    const lang: Lang = blocksMode ? "js" : s.lang;
    const code = blocksMode ? blocksToJs(s.missions[id].blocks ?? STARTER_BLOCKS[id]) : s.missions[id].code[s.lang];
    if (!code.trim()) {
      setResult({ ok: false, title: "Nothing to run yet", detail: 'Snap your blocks under "when Run is pressed".', output: [] });
      return;
    }
    setRunning(true);
    setResult(null);
    if (id === "beach" && s.litter.length === 0) addTide(8);
    const worlds = [liveWorld(id), ...testWorlds(id)];
    const out = await runInWorker(id, lang, code, worlds);
    if (typeof out === "string") {
      setRunning(false);
      setResult({ ok: false, title: "Program stopped", detail: out, output: [] });
      return;
    }
    const [live, ...tests] = out;
    // Watch the bot do it in the world.
    setPanel(null);
    setWatching(id);
    busyRef.current = true;
    g.setEnabled(false);
    g.watch(id);
    if (id === "home") await g.playHome(live.steps as HomeStep[]);
    else if (id === "market") await g.playMarket(live.steps as MarketStep[]);
    else {
      await g.playBeach(live.steps as BeachStep[]);
      const picked = new Set((live.steps as BeachStep[]).filter((st) => st.t === "pick").map((st) => (st as { id: number }).id));
      update((q) => ({ ...q, litter: q.litter.filter((l) => !picked.has(l.id)) }));
    }
    g.watch(null);
    g.timeScale = 1;
    setSpeed(1);
    busyRef.current = false;
    setWatching(null);
    if (id === "home") update((q) => ({ ...q, blocks: g.getBlocks() }));

    const failedTest = tests.find((t) => t.error || t.stopped || !t.check.passed);
    const liveOk = !live.error && !live.stopped && live.check.passed;
    let r: Result;
    if (live.error || live.stopped) {
      r = { ok: false, title: "Your program hit a problem", detail: live.stopped ?? "Fix the error, then run it again.", error: live.error, output: live.output };
    } else if (!liveOk) {
      r = { ok: false, title: "Not quite yet", detail: live.check.message, output: live.output };
    } else if (failedTest) {
      const why = failedTest.error ?? failedTest.stopped ?? failedTest.check.message;
      const where = id === "market" ? "with a new set of customers" : id === "beach" ? "on the next tide" : "on an empty plot";
      r = { ok: false, title: "It worked here, but not everywhere", detail: `We also tested your code ${where}: ${why}`, output: live.output };
      if (id === "home") {
        finishMission("home", "mixed");
        r.title = "House complete! Can your code do it alone?";
      }
    } else {
      r = { ok: true, title: `${MISSIONS[id].bot} programmed! ★★★`, detail: live.check.message + " It also passed every test.", output: live.output };
      finishMission(id, "code");
      if (id === "beach") update((q) => ({ ...q, beachCode: { lang, code } }));
    }
    setRunning(false);
    setResult(r);
    setPanel(id);
  }, [addTide, finishMission, liveWorld, panel, runInWorker, running, update]);

  // Tides: litter keeps washing up once the beach mission starts.
  useEffect(() => {
    if (screen !== "play") return;
    const t = window.setInterval(async () => {
      const s = saveRef.current;
      const g = gameRef.current;
      if (!s || !g || s.missions.beach.status === "locked") return;
      if (busyRef.current) return;
      const litter = addTide(5);
      say("Kofi", "The tide washed up 5 more pieces of litter.", "info");
      if (s.beachCode && !busyRef.current) {
        const out = await runInWorker("beach", s.beachCode.lang, s.beachCode.code, [{ litter }]);
        if (typeof out === "string" || busyRef.current) return;
        say("Beach Bot", "Tide's in! Cleaning up…", "good");
        busyRef.current = true;
        await g.playBeach(out[0].steps as BeachStep[]);
        busyRef.current = false;
        const picked = new Set((out[0].steps as BeachStep[]).filter((st) => st.t === "pick").map((st) => (st as { id: number }).id));
        update((q) => ({ ...q, litter: q.litter.filter((l) => !picked.has(l.id)) }));
      }
    }, 90000);
    return () => window.clearInterval(t);
  }, [addTide, runInWorker, say, screen, update]);

  // -------------------------------------------------------------------------
  // Engine lifecycle

  useEffect(() => {
    const existingSave = loadSave();
    setExisting(existingSave);
    setName(existingSave?.name || getProgress().coderName || "");
    if (existingSave) setLook(existingSave.look);
    setTouch(window.matchMedia?.("(pointer: coarse)").matches ?? false);
    let disposed = false;
    (async () => {
      const { Game } = await import("./engine/Game");
      if (disposed || !canvasRef.current) return;
      try {
        const g = new Game(
          canvasRef.current,
          {
            label: (id) => label(id),
            interact: (id) => interactRef.current(id),
            focus: (f) => setFocus(f),
            bits: (b) => {
              setBits(b);
              say("Port CODEship", `Found a bit! (${b.length}/${g.totalBits})`, "good");
              const s = saveRef.current;
              if (s) {
                const next = { ...s, engine: g.getSave() };
                saveRef.current = next;
                writeSave(next);
              }
            },
            blocksChanged: (blocks) => {
              update((q) => ({ ...q, blocks }));
              const s = saveRef.current;
              if (s && s.missions.home.status === "active" && missingWalls(blocks).length === 0 && !busyRef.current) finishMission("home", "hand");
            },
            buildMode: (on) => setBuilding(on),
            mouseLook: (on) => setLooking(on),
            say: (who, text, tone) => say(who, text, tone),
          },
          existingSave?.look ?? { shirt: SHIRTS[0], skin: SKINS[2], hair: HAIRS[0] }
        );
        gameRef.current = g;
        if (process.env.NODE_ENV !== "production") (window as unknown as { __port?: Game }).__port = g;
        g.attract();
        setReady(true);
      } catch {
        setWebglError(true);
      }
    })();
    return () => {
      disposed = true;
      gameRef.current?.dispose();
      gameRef.current = null;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gateBlocking = useRef(false);
  const interactRef = useRef(interact);
  interactRef.current = interact;

  const start = (s: Save) => {
    const g = gameRef.current;
    if (!g) return;
    saveRef.current = s;
    setSaveState(s);
    writeSave(s);
    setCoderName(s.name);
    g.setLook(s.look);
    g.load(s.engine);
    g.setBlocks(s.blocks);
    g.setLitter(s.litter);
    g.setBeachBotStyle(s.beachBot);
    g.setLowGraphics(s.lowGraphics);
    setBits(s.engine.bits ?? []);
    g.setEnabled(true);
    setScreen("play");
    canvasRef.current?.focus();
  };

  // Autosave the player's position.
  useEffect(() => {
    if (screen !== "play") return;
    const t = window.setInterval(() => {
      const g = gameRef.current;
      if (g && saveRef.current) update((q) => ({ ...q, engine: g.getSave() }));
    }, 5000);
    return () => window.clearInterval(t);
  }, [screen, update]);

  // Sign-up: needed after the first finished challenge or 15 minutes of play.
  const missionsDone = save ? (Object.values(save.missions) as MissionState[]).filter((m) => m.status === "done").length : 0;
  const gateReason: "challenge" | "time" | null =
    !save || save.signedUp ? null : missionsDone > 0 ? "challenge" : (save.playSeconds ?? 0) >= FREE_PLAY_SECONDS ? "time" : null;
  const gateOpen = screen === "play" && gateReason !== null && !watching;
  gateBlocking.current = gateOpen;

  useEffect(() => {
    if (gateOpen) {
      setPanel(null);
      setDialog(null);
      setPaused(false);
      setMapOpen(false);
      gameRef.current?.toggleBuild(false);
      gameRef.current?.setEnabled(false);
    }
  }, [gateOpen]);

  // Count active play time (tab visible, nothing blocking the game).
  useEffect(() => {
    if (screen !== "play") return;
    const t = window.setInterval(() => {
      const s = saveRef.current;
      if (!s || s.signedUp || document.visibilityState !== "visible" || !gameRef.current?.enabled) return;
      update((q) => ({ ...q, playSeconds: (q.playSeconds ?? 0) + 5 }));
    }, 5000);
    return () => window.clearInterval(t);
  }, [screen, update]);

  // Enrolled students who already used their class password here skip sign-up.
  useEffect(() => {
    if (screen !== "play" || !saveRef.current || saveRef.current.signedUp) return;
    let cancelled = false;
    Promise.all(
      ["explorers", "builders", "developers", "engineers"].map((p) =>
        fetch(`/api/workbooks/session/?program=${p}`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : { ok: false }))
          .then((d: { ok?: boolean }) => Boolean(d.ok))
          .catch(() => false)
      )
    ).then((ok) => {
      if (!cancelled && ok.some(Boolean)) update((q) => ({ ...q, signedUp: "student" }));
    });
    return () => {
      cancelled = true;
    };
  }, [screen, update]);

  // Quest marker, NPC alerts and the objective line.
  const objective = useMemo(() => {
    if (!save) return { text: "", target: null as null | { x: number; z: number; y?: number } };
    const m = save.missions;
    if (!save.intro) return { text: "Talk to Captain Ada in the Town Square.", target: NPCS.ada };
    if (m.home.status !== "done") return { text: "Build the walls of your house: 6 × 5 blocks, 3 high. By hand (B) or by coding the Builder Bot.", target: PLOT_TERMINAL };
    if (m.market.status !== "done") {
      if (carry && ALI_ORDERS.includes(carry)) return { text: `Bring the ${carry} to Mrs. Ali.`, target: NPCS.ali };
      const want = ALI_ORDERS[save.marketServed];
      return { text: save.marketServed ? `Mrs. Ali still needs ${want}. Or program the Ladder Bot.` : "Help Mrs. Ali at the Fresh Market (west on Main Street).", target: save.marketServed ? MARKET_TERMINAL : NPCS.ali };
    }
    if (m.beach.status !== "done") return { text: `Clean up the beach: ${save.litter.length} pieces of litter. By hand, or build a Beach Bot.`, target: m.beach.status === "active" && save.litter.length < 18 ? BEACH_TERMINAL : NPCS.kofi };
    const lit = gameRef.current?.getSave().lit.length ?? 0;
    return { text: `Free roam! Light all the lookouts (${lit}/${LOOKOUTS.length}) and find every bit. More of Port CODEship opens soon.`, target: null };
  }, [save, carry]);

  useEffect(() => {
    const g = gameRef.current;
    if (!g || !save) return;
    g.setMarker(goalHidden ? null : objective.target);
    g.setNpcAlert("ada", !save.intro);
    g.setNpcAlert("ali", save.missions.market.status === "active" && save.marketServed === 0);
    g.setNpcAlert("kofi", save.missions.beach.status === "active" && save.cleanedByHand === 0 && !save.beachCode);
    g.setNpcAlert("rosa", save.missions.home.status === "active");
  }, [objective, save, goalHidden]);

  // Minimap and big map
  useEffect(() => {
    if (screen !== "play") return;
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 90) return;
      last = t;
      const g = gameRef.current;
      if (!g) return;
      const markers = objective.target ? [{ x: objective.target.x, z: objective.target.z, color: "#f5c33d" }] : [];
      const mini = miniRef.current?.getContext("2d");
      if (mini) g.drawMap(mini, miniRef.current!.width, miniRef.current!.height, "mini", markers);
      const big = bigMapRef.current?.getContext("2d");
      if (big && mapOpen) g.drawMap(big, bigMapRef.current!.width, bigMapRef.current!.height, "full", markers);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [screen, objective, mapOpen]);

  // Keyboard shortcuts for the overlays.
  useEffect(() => {
    if (screen !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
        if (e.key === "Escape" && panel && t.tagName !== "TEXTAREA") {
          setPanel(null);
          gameRef.current?.setEnabled(true);
        }
        return;
      }
      if (gateBlocking.current) return;
      if (e.code === "KeyM" && !panel && !dialog) {
        setMapOpen((o) => !o);
      }
      if (e.code === "KeyG" && carryRef.current && !panel && !dialog) dropCarry();
      if (e.code === "Escape") {
        // The Esc that turns off mouse-look shouldn't also open the menu.
        if (gameRef.current?.justUnlocked() || gateBlocking.current) return;
        if (mapOpen) setMapOpen(false);
        else if (dialog) closeDialog();
        else if (workshop) {
          setWorkshop(false);
          gameRef.current?.setEnabled(true);
        }
        else if (panel) {
          setPanel(null);
          gameRef.current?.setEnabled(true);
        } else if (building) gameRef.current?.toggleBuild(false);
        else {
          setPaused((p) => {
            gameRef.current?.setEnabled(p);
            return !p;
          });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // dropCarry only reads refs and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, panel, dialog, mapOpen, building, workshop, closeDialog]);

  /** Put down whatever you're carrying: litter goes back on the sand, products back on the shelf. */
  function dropCarry() {
    const c = carryRef.current;
    if (!c) return;
    if (c.kind === "litter" && c.litter) {
      const back = c.litter;
      update((q) => ({ ...q, litter: [...q.litter, back] }));
      gameRef.current?.setLitter(saveRef.current!.litter);
      say("You", `Put the ${c.name} back down. You can come back to it any time.`, "info");
    } else say("You", `Put the ${c.name} back on the shelf.`, "info");
    setCarry(null);
  }

  const closePanel = () => {
    setPanel(null);
    setResult(null);
    gameRef.current?.setEnabled(true);
  };

  const setCode = (v: string) => {
    if (!panel) return;
    const lang = saveRef.current!.lang;
    update((q) => ({ ...q, missions: { ...q.missions, [panel]: { ...q.missions[panel], code: { ...q.missions[panel].code, [lang]: v } } } }));
  };

  const editor: Editor = save?.editor ?? "blocks";
  const [blocksVersion, setBlocksVersion] = useState(0);
  const setEditor = (e: Editor) => {
    update((q) => ({ ...q, editor: e, lang: e === "blocks" ? q.lang : e }));
    if (e === "py") ensureWorker().postMessage({ type: "warm" });
  };
  const resetCode = () => {
    if (!panel) return;
    if (editor === "blocks") {
      update((q) => ({ ...q, missions: { ...q.missions, [panel]: { ...q.missions[panel], blocks: undefined } } }));
      setBlocksVersion((v) => v + 1);
    } else setCode(MISSIONS[panel].starter[saveRef.current!.lang]);
  };


  // -------------------------------------------------------------------------
  // Render

  const mission = panel ? MISSIONS[panel] : null;
  const playing = screen === "play";

  return (
    <div className="fixed inset-0 z-[30] select-none overflow-hidden bg-[#0d1b2a] font-sans text-white">
      <canvas ref={canvasRef} tabIndex={0} className="block h-full w-full touch-none outline-none" aria-label="Port CODEship 3D world" />

      {webglError && (
        <div className="absolute inset-0 grid place-items-center bg-[#0d1b2a] p-6 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold">Port CODEship needs 3D graphics</h1>
            <p className="mt-2 text-white/80">This browser couldn&apos;t start WebGL. Try Chrome or Edge, or turn on hardware acceleration in your browser settings.</p>
            <Link href="/ship-it/" className="mt-4 inline-block rounded-full bg-amber px-5 py-2 font-bold text-navy">Back to the Arcade</Link>
          </div>
        </div>
      )}

      {/* Title screen */}
      {!playing && !webglError && (
        <div className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-[#0d1b2a]/70 via-[#0d1b2a]/30 to-[#0d1b2a]/80 px-4 py-8">
          <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-5">
            <div>
              <Link href="/ship-it/" className="text-sm font-semibold text-white/70 hover:text-white">← Ship It! Arcade</Link>
              <h1 className="mt-2 text-5xl font-extrabold tracking-tight drop-shadow sm:text-6xl">Port CODEship</h1>
              <p className="mt-2 text-lg text-white/90 drop-shadow">Explore a whole town, climb anything, and fix real problems with real code: Python or JavaScript.</p>
            </div>
            <div className="rounded-2xl bg-[#0d1b2a]/85 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur">
              {existing && !confirmNew ? (
                <div className="grid gap-3">
                  <p className="text-white/80">Welcome back, <strong className="text-white">{existing.name}</strong>!</p>
                  <button disabled={!ready} onClick={() => start(existing)} className="rounded-xl bg-amber px-5 py-3 text-lg font-extrabold text-navy disabled:opacity-50">
                    {ready ? "Continue" : "Loading the town…"}
                  </button>
                  <button onClick={() => setConfirmNew(true)} className="text-sm font-semibold text-white/70 underline hover:text-white">Start a new game</button>
                </div>
              ) : (
                <form
                  className="grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!ready) return;
                    start(freshSave(name.trim() || "Coder", look));
                  }}
                >
                  {existing && <p className="rounded-lg bg-[#e3664f]/20 p-3 text-sm">Starting over replaces {existing.name}&apos;s saved game in this browser.</p>}
                  <label className="grid gap-1">
                    <span className="text-sm font-semibold text-white/80">Coder name (not your real name)</span>
                    <input id="bay-name" value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="e.g. PixelFox" className="rounded-lg bg-white/10 px-3 py-2 text-lg outline-none ring-1 ring-white/20 focus:ring-amber" />
                  </label>
                  <Swatches label="Hoodie" options={SHIRTS} value={look.shirt} onPick={(shirt) => { setLook({ ...look, shirt }); gameRef.current?.setLook({ ...look, shirt }); }} />
                  <Swatches label="Skin" options={SKINS} value={look.skin} onPick={(skin) => setLook({ ...look, skin })} />
                  <Swatches label="Hair" options={HAIRS} value={look.hair} onPick={(hair) => setLook({ ...look, hair })} />
                  <button type="submit" disabled={!ready} className="rounded-xl bg-amber px-5 py-3 text-lg font-extrabold text-navy disabled:opacity-50">
                    {ready ? "Start exploring" : "Loading the town…"}
                  </button>
                  {existing && <button type="button" onClick={() => setConfirmNew(false)} className="text-sm text-white/70 underline">Keep my saved game</button>}
                </form>
              )}
              <Controls />
            </div>
            <p className="text-xs text-white/60">Your progress saves in this browser only. Nothing about you leaves your device.</p>
          </div>
        </div>
      )}

      {playing && (
        <>
          {/* Objective + bits */}
          <div className="absolute left-3 top-3 max-w-[min(420px,calc(100vw-170px))] rounded-xl bg-[#0d1b2a]/80 px-4 py-3 shadow-lg ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber">{goalHidden ? "Exploring freely" : "Objective"}</div>
              <button onClick={() => setGoalHidden((h) => !h)} className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold hover:bg-white/20">
                {goalHidden ? "Show goal" : "Hide goal"}
              </button>
            </div>
            {!goalHidden && <p className="text-sm leading-snug sm:text-base">{objective.text}</p>}
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/70">
              <span>◆ {bits.length}/{gameRef.current?.totalBits ?? 0} bits</span>
              {(["home", "market", "beach"] as MissionId[]).map((id) => (
                <span key={id} className="hidden sm:inline">
                  {MISSIONS[id].bot}: {save?.missions[id].status === "done" ? "★".repeat(save.missions[id].stars) + "☆".repeat(3 - save.missions[id].stars) : save?.missions[id].status === "active" ? "in progress" : "locked"}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
            <button onClick={() => setMapOpen(true)} aria-label="Open map" className="overflow-hidden rounded-full shadow-lg ring-2 ring-white/70">
              <canvas ref={miniRef} width={150} height={150} className="block h-[110px] w-[110px] sm:h-[150px] sm:w-[150px]" />
            </button>
            <div className="flex gap-2">
              <HudButton onClick={() => setMapOpen(true)}>Map (M)</HudButton>
              <HudButton onClick={() => { setPaused(true); gameRef.current?.setEnabled(false); }}>Menu</HudButton>
            </div>
          </div>

          {/* Interaction prompt */}
          {focus && !dialog && !panel && (
            <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 sm:bottom-24">
              <div className="flex items-center gap-2 rounded-full bg-[#0d1b2a]/90 px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-white/20 sm:text-base">
                <kbd className="rounded-md bg-amber px-2 py-0.5 font-mono text-navy">E</kbd>
                {focus.label}
              </div>
            </div>
          )}
          {carry && !dialog && !panel && (
            <div className="absolute bottom-40 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 py-1 pl-3 pr-1 text-sm font-bold text-navy sm:bottom-36">
              Carrying: {carry}
              <button onClick={dropCarry} className="rounded-full bg-navy px-3 py-1 text-xs text-white">Put down (G)</button>
            </div>
          )}

          {/* Mouse-look hint */}
          {!touch && !panel && !dialog && !building && !paused && !mapOpen && !watching && (
            <div className="pointer-events-none absolute left-1/2 top-3 hidden -translate-x-1/2 rounded-full bg-[#0d1b2a]/75 px-3 py-1 text-xs font-semibold text-white/85 md:block">
              {looking ? "Move the mouse to look around · Esc frees your mouse" : "Click the world to look around with your mouse"}
            </div>
          )}

          {/* Feed */}
          <div className="pointer-events-none absolute bottom-24 left-3 flex max-w-[min(380px,70vw)] flex-col gap-1.5 sm:bottom-4">
            {feed.map((f) => (
              <div key={f.id} className={`rounded-lg px-3 py-2 text-sm shadow ring-1 ${f.tone === "good" ? "bg-emerald-900/90 ring-emerald-400/40" : f.tone === "bad" ? "bg-rose-900/90 ring-rose-400/40" : "bg-[#0d1b2a]/90 ring-white/15"}`}>
                <strong className="text-amber">{f.who}:</strong> {f.text}
              </div>
            ))}
          </div>

          {/* Build toolbar */}
          {building && (
            <div className="absolute bottom-4 left-1/2 flex max-w-[calc(100vw-24px)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#0d1b2a]/90 p-3 shadow-xl ring-1 ring-white/15">
              <span className="text-sm font-bold">Build mode</span>
              {BLOCK_COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={`${c} blocks`}
                  onClick={() => { setBuildColorState(c); gameRef.current?.setBuildColor(c); }}
                  className={`h-8 w-8 rounded-md ring-2 ${buildColor === c ? "ring-amber" : "ring-white/20"}`}
                  style={{ background: BLOCK_SWATCH[c] }}
                />
              ))}
              <span className="text-xs text-white/70">Click: place · Right-click / Shift-click: remove · Drag: look · {save?.blocks.length ?? 0} blocks</span>
              <button onClick={() => gameRef.current?.toggleBuild(false)} className="rounded-lg bg-amber px-3 py-1.5 text-sm font-bold text-navy">Done (B)</button>
            </div>
          )}

          {/* Watching a bot */}
          {watching && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#0d1b2a]/90 px-4 py-2 shadow-xl ring-1 ring-white/20">
              <span className="text-sm font-semibold">{MISSIONS[watching].bot} is running your code…</span>
              <button onClick={() => { if (gameRef.current) gameRef.current.timeScale = 1000; }} className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">Finish now</button>
              {[1, 3, 8].map((v) => (
                <button key={v} onClick={() => { setSpeed(v); if (gameRef.current) gameRef.current.timeScale = v; }} className={`rounded-full px-3 py-1 text-sm font-bold ${speed === v ? "bg-amber text-navy" : "bg-white/10"}`}>
                  {v}×
                </button>
              ))}
            </div>
          )}

          {/* Touch controls */}
          {touch && !panel && !dialog && (
            <TouchControls
              onMove={(x, y) => gameRef.current?.setTouch(x, y)}
              onButton={(b, d) => gameRef.current?.setTouchButton(b, d)}
              onAct={() => gameRef.current?.pressInteract()}
              onBuild={() => gameRef.current?.toggleBuild()}
            />
          )}

          {/* Dialogue */}
          {dialog && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-6">
              <div className="w-full max-w-2xl rounded-2xl bg-[#0d1b2a]/95 p-5 shadow-2xl ring-1 ring-white/15">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-extrabold uppercase tracking-wider text-amber">{dialog.who}</div>
                  <button onClick={closeDialog} aria-label="Leave the conversation" className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold hover:bg-white/20">Leave (Esc)</button>
                </div>
                <p className="mt-1 text-base leading-relaxed sm:text-lg">{dialog.text}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {dialog.choices.map((c, i) => (
                    <button key={c.label} autoFocus={i === 0} onClick={c.act} className={`rounded-xl px-4 py-2 font-bold ${i === 0 ? "bg-amber text-navy" : "bg-white/10 hover:bg-white/20"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Beach Bot workshop */}
          {workshop && save && (
            <div className="absolute inset-0 grid place-items-center bg-black/50 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-[#0d1b2a] p-5 shadow-2xl ring-1 ring-white/15">
                <h2 className="text-2xl font-extrabold">Design your Beach Bot</h2>
                <p className="mt-1 text-sm text-white/75">Pick its parts. Treads handle soft sand but are slower; wheels are fast. Then write the code that tells it what to do.</p>
                <div className="mt-4 grid gap-4">
                  <Choice label="Drive" options={[["wheels", "Wheels (fast)"], ["treads", "Treads (steady)"]]} value={save.beachBot.wheels} onPick={(v) => { const b = { ...save.beachBot, wheels: v as "wheels" | "treads" }; update((q) => ({ ...q, beachBot: b })); gameRef.current?.setBeachBotStyle(b); }} />
                  <Choice label="Arm" options={[["claw", "Claw"], ["scoop", "Scoop"]]} value={save.beachBot.arm} onPick={(v) => { const b = { ...save.beachBot, arm: v as "claw" | "scoop" }; update((q) => ({ ...q, beachBot: b })); gameRef.current?.setBeachBotStyle(b); }} />
                  <Swatches label="Paint" options={BOT_COLORS} value={save.beachBot.color} onPick={(color) => { const b = { ...save.beachBot, color }; update((q) => ({ ...q, beachBot: b })); gameRef.current?.setBeachBotStyle(b); }} />
                </div>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => { setWorkshop(false); openPanel("beach"); }} className="rounded-xl bg-amber px-4 py-2 font-bold text-navy">Write its code</button>
                  <button onClick={() => { setWorkshop(false); gameRef.current?.setEnabled(true); }} className="rounded-xl bg-white/10 px-4 py-2 font-bold">Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Code panel */}
          {mission && save && (
            <div className="absolute inset-y-0 right-0 flex w-full flex-col bg-[#111427]/95 backdrop-blur shadow-2xl ring-1 ring-white/10 sm:w-[min(780px,68vw)]">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber">{mission.bot} terminal</div>
                  <h2 className="text-xl font-extrabold">{mission.title}</h2>
                  <p className="mt-1 text-sm text-white/80">{mission.goal}</p>
                </div>
                <button onClick={closePanel} aria-label="Close code panel" className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold hover:bg-white/20">Close</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <div className="flex rounded-lg bg-white/10 p-1" role="group" aria-label="How to code">
                    {(["blocks", "py", "js"] as Editor[]).map((l) => (
                      <button key={l} onClick={() => setEditor(l)} aria-pressed={editor === l} className={`rounded-md px-3 py-1 text-sm font-bold ${editor === l ? "bg-amber text-navy" : "text-white/80"}`}>
                        {l === "blocks" ? "Blocks" : l === "py" ? "Python" : "JavaScript"}
                      </button>
                    ))}
                  </div>
                  <button onClick={resetCode} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">Reset</button>
                  <button onClick={() => setShowHint((h) => !h)} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">{showHint ? "Hide hint" : "Hint"}</button>
                </div>
                {showHint && <p className="mb-3 rounded-lg bg-amber/15 p-3 text-sm text-amber">{mission.hint}</p>}
                {editor === "blocks" ? (
                  <>
                    <div className="h-[min(460px,55vh)] overflow-hidden rounded-2xl ring-1 ring-white/10">
                      <PortBlocksEditor
                        mission={mission.id}
                        value={save.missions[mission.id].blocks}
                        version={blocksVersion}
                        onChange={(w) => update((q) => ({ ...q, missions: { ...q.missions, [mission.id]: { ...q.missions[mission.id], blocks: w } } }))}
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/60">Drag blocks from the left and snap them under &ldquo;when Run is pressed&rdquo;. Drag a block back to the left to delete it.</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-semibold text-white/80">See your blocks as Python</summary>
                      <div className="mt-2">
                        <CodeEditor value={blocksToPy(save.missions[mission.id].blocks ?? STARTER_BLOCKS[mission.id])} onChange={() => {}} readOnly commands={API_NAMES[mission.id]} label="Your blocks as Python" minLines={4} />
                      </div>
                    </details>
                  </>
                ) : (
                  <CodeEditor ref={editorRef} value={save.missions[mission.id].code[save.lang]} onChange={setCode} commands={API_NAMES[mission.id]} label={`${mission.bot} code`} minLines={14} />
                )}
                <div className="mt-3 flex items-center gap-3">
                  <button onClick={runCode} disabled={running} className="rounded-xl bg-emerald-400 px-6 py-2.5 text-lg font-extrabold text-[#06130b] disabled:opacity-50">
                    {running ? "Running…" : "▶ Run"}
                  </button>
                  {pyStatus && <span className="text-sm text-white/70">{pyStatus}</span>}
                </div>
                {result && (
                  <div className={`mt-4 rounded-xl p-4 ring-1 ${result.ok ? "bg-emerald-900/50 ring-emerald-400/40" : "bg-rose-950/60 ring-rose-400/30"}`}>
                    <div className="font-extrabold">{result.title}</div>
                    <p className="mt-1 text-sm text-white/85">{result.detail}</p>
                    {result.error && <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 font-mono text-xs text-rose-200">{result.error}</pre>}
                    {result.output.length > 0 && <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-white/80">{result.output.join("\n")}</pre>}
                  </div>
                )}
                {editor !== "blocks" && <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-white/60">Bot commands (click to add)</h3>}
                <ul className={`mt-2 grid gap-1.5 ${editor === "blocks" ? "hidden" : ""}`}>
                  {mission.api.map((a) => (
                    <li key={a.sig}>
                      <button
                        onClick={() => editorRef.current?.insert(a.sig.split(" / ")[0] + (save.lang === "js" ? ";" : ""))}
                        className="w-full rounded-lg bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                      >
                        <code className="font-mono text-sm text-amber">{a.sig}</code>
                        <span className="ml-2 text-sm text-white/70">{a.doc}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Big map */}
          {mapOpen && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 p-4" onClick={() => setMapOpen(false)}>
              <div className="rounded-2xl bg-[#0d1b2a] p-3 shadow-2xl ring-1 ring-white/15" onClick={(e) => e.stopPropagation()}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <h2 className="font-extrabold">Map of Port CODEship</h2>
                  <button onClick={() => setMapOpen(false)} className="rounded-lg bg-white/10 px-3 py-1 text-sm font-bold">Close (M)</button>
                </div>
                <canvas ref={bigMapRef} width={640} height={600} className="block h-auto max-h-[75vh] w-[min(640px,85vw)] rounded-lg" />
                <p className="mt-2 text-xs text-white/70">Gold dot: your objective. Triangles: lookouts (gold when lit).</p>
              </div>
            </div>
          )}

          {gateOpen && gateReason && (
            <SignupGate
              reason={gateReason}
              onDone={(how) => {
                update((q) => ({ ...q, signedUp: how }));
                say("Port CODEship", how === "parent" ? "Thanks for signing up! Keep exploring." : "Welcome back, CODEship student!", "good");
                gameRef.current?.setEnabled(true);
              }}
            />
          )}

          {/* Pause menu */}
          {paused && save && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 p-4">
              <div className="w-full max-w-md rounded-2xl bg-[#0d1b2a] p-5 shadow-2xl ring-1 ring-white/15">
                <h2 className="text-2xl font-extrabold">Paused</h2>
                <Controls />
                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    id="bay-low-gfx"
                    type="checkbox"
                    checked={save.lowGraphics}
                    onChange={(e) => {
                      update((q) => ({ ...q, lowGraphics: e.target.checked }));
                      gameRef.current?.setLowGraphics(e.target.checked);
                    }}
                  />
                  Low graphics (faster on older Chromebooks)
                </label>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button autoFocus onClick={() => { setPaused(false); gameRef.current?.setEnabled(true); }} className="rounded-xl bg-amber px-4 py-2 font-bold text-navy">Resume</button>
                  <Link href="/ship-it/" onClick={() => gameRef.current && update((q) => ({ ...q, engine: gameRef.current!.getSave() }))} className="rounded-xl bg-white/10 px-4 py-2 font-bold">Save &amp; exit</Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small pieces

function HudButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full bg-[#0d1b2a]/85 px-3 py-1.5 text-xs font-bold shadow ring-1 ring-white/15 hover:bg-[#0d1b2a]">
      {children}
    </button>
  );
}

function Swatches({ label, options, value, onPick }: { label: string; options: number[]; value: number; onPick: (v: number) => void }) {
  return (
    <div className="grid gap-1">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button type="button" key={o} aria-label={`${label} colour ${hex(o)}`} aria-pressed={o === value} onClick={() => onPick(o)} className={`h-9 w-9 rounded-full ring-2 ${o === value ? "ring-amber ring-offset-2 ring-offset-[#0d1b2a]" : "ring-white/20"}`} style={{ background: hex(o) }} />
        ))}
      </div>
    </div>
  );
}

function Choice({ label, options, value, onPick }: { label: string; options: [string, string][]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="grid gap-1">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, text]) => (
          <button type="button" key={v} aria-pressed={v === value} onClick={() => onPick(v)} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${v === value ? "bg-amber text-navy" : "bg-white/10"}`}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Controls() {
  const rows: [string, string][] = [
    ["W A S D / arrows", "Move"],
    ["Click the world", "Look around with the mouse (Esc frees it)"],
    ["Drag / trackpad swipe", "Turn the view (scroll to zoom)"],
    ["Space", "Jump (off a wall, too)"],
    ["Shift", "Sprint"],
    ["Walk into a wall", "Climb it (W up, S down)"],
    ["E", "Talk, use, pick up"],
    ["G", "Put down what you're carrying"],
    ["B", "Build mode on your plot"],
    ["M / Esc", "Map / menu"],
  ];
  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer font-semibold text-white/80">Controls</summary>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-mono text-amber">{k}</dt>
            <dd className="text-white/80">{v}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function TouchControls({ onMove, onButton, onAct, onBuild }: { onMove: (x: number, y: number) => void; onButton: (b: "jump" | "sprint", d: boolean) => void; onAct: () => void; onBuild: () => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const move = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    setKnob({ x, y });
    onMove(x, y);
    onButton("sprint", l > 0.95);
  };
  const end = () => {
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
    onButton("sprint", false);
  };
  return (
    <>
      <div
        ref={base}
        className="absolute bottom-6 left-6 h-32 w-32 touch-none rounded-full bg-white/15 ring-2 ring-white/30"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e); }}
        onPointerMove={(e) => e.buttons && move(e)}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="absolute h-14 w-14 rounded-full bg-white/70" style={{ left: `calc(50% - 28px + ${knob.x * 40}px)`, top: `calc(50% - 28px + ${knob.y * 40}px)` }} />
      </div>
      <div className="absolute bottom-6 right-6 grid grid-cols-2 gap-3">
        <button className="h-16 w-16 touch-none rounded-full bg-white/20 font-bold ring-2 ring-white/40" onPointerDown={onBuild}>B</button>
        <button className="h-16 w-16 touch-none rounded-full bg-amber/90 font-bold text-navy" onPointerDown={onAct}>E</button>
        <button className="col-span-2 h-14 touch-none rounded-full bg-white/25 font-bold ring-2 ring-white/40" onPointerDown={() => onButton("jump", true)} onPointerUp={() => onButton("jump", false)} onPointerLeave={() => onButton("jump", false)}>
          Jump
        </button>
      </div>
    </>
  );
}
