/**
 * Runs a CODEship Blocks project. Pure logic, no DOM: the page drives it with
 * real time (tick(performance.now())), the acceptance tests drive it with
 * virtual time, and both see exactly the same behaviour.
 *
 * Every stack runs as its own thread (a generator). A thread yields how long
 * its current block takes; the scheduler wakes it when that time has passed.
 * Time accumulates from when each block was due, not from when the browser
 * got round to it, so runs are deterministic.
 *
 * Behaviour the Explorers lesson plans depend on (do not "improve"):
 *  - Nothing runs without a Start block. An empty Repeat, a Send Message
 *    nobody listens for, a Go to Page to a page that doesn't exist, a Record
 *    with no recording: all do nothing, silently.
 *  - Hide never deletes. A hidden character can still be tapped (that is how
 *    a "Show" at the top of a tap stack brings it back), still runs its
 *    blocks, but doesn't bump.
 *  - Arriving on a page puts every character on it back on its starting
 *    square, size and visibility, then runs that page's Green Flag stacks.
 *    The stage itself has no way back: a Go to Page without a Go Home is a
 *    dead end on purpose.
 *  - Go to Page waits for the other characters on the current page to finish
 *    what they are doing (up to PAGE_WAIT_LIMIT), so a message sent just
 *    before turning the page plays out in full.
 *  - A bump is a visible character arriving on the same square as another
 *    visible character. Size doesn't count, so squares stay countable.
 */

import {
  GRID_COLS,
  GRID_ROWS,
  SIZE_STEPS,
  type BlockJson,
  type MessageColour,
  type Project,
} from "./model";

export const TIMING = {
  move: 300,
  say: 1500,
  pop: 300,
  grow: 300,
  hideShow: 100,
  second: 1000,
};
export const PAGE_WAIT_LIMIT = 10000;

export type ActorState = {
  x: number;
  y: number;
  /** Size step: 0 is the starting size, -SIZE_STEPS..SIZE_STEPS. */
  level: number;
  visible: boolean;
  bubble: string | null;
};

export type EngineHooks = {
  /** A built-in sound (only "pop" today). */
  sound?: (name: "pop") => void;
  /** Play a recording; return its length in ms (0 if missing). */
  playRecording?: (clipId: string) => number;
  /** Something visible changed. */
  changed?: () => void;
};

type PageRequest = { page: number; home: boolean };
type Step = number | PageRequest;

type Thread = {
  actorId: string;
  hat: BlockJson;
  gen: Generator<Step, void, void>;
  wakeAt: number;
  pending: (PageRequest & { since: number }) | null;
  done: boolean;
};

const HATS = new Set(["start_tap", "start_flag", "start_bump", "start_message"]);

export class Engine {
  project: Project;
  hooks: EngineHooks;
  page = 0;
  now = 0;
  states = new Map<string, ActorState>();
  private threads: Thread[] = [];

  constructor(project: Project, hooks: EngineHooks = {}, now = 0) {
    this.project = project;
    this.hooks = hooks;
    this.now = now;
    this.resetPage();
  }

  // ── Controls ──

  /** The green flag: put this page's characters back, then run its Green Flag stacks. */
  greenFlag() {
    this.stopAll();
    this.resetPage();
    this.startHats((b) => b.type === "start_flag");
    this.changed();
  }

  stopAll() {
    this.threads = [];
    this.changed();
  }

  /** Show a page in the editor without running anything (the adult's page tabs). */
  showPage(index: number) {
    this.stopAll();
    this.page = Math.max(0, Math.min(this.project.pages.length - 1, index));
    this.resetPage();
    this.changed();
  }

  /** A child tapped a character on the stage (visible or hiding). */
  tap(actorId: string) {
    this.startHats((b) => b.type === "start_tap", actorId);
    this.changed();
  }

  isRunning() {
    return this.threads.some((t) => !t.done);
  }

  /** Characters on the current page, in drawing order. */
  actors() {
    return this.project.pages[this.page]?.actors ?? [];
  }

  /** Put the current page's characters back where they start (after editing positions). */
  resetPage() {
    this.states = new Map();
    for (const a of this.actors()) this.states.set(a.id, { x: a.x, y: a.y, level: 0, visible: true, bubble: null });
  }

  // ── Scheduler ──

  tick(now: number) {
    this.now = Math.max(this.now, now);
    let dirty = false;
    for (let guard = 0; guard < 10000; guard++) {
      const t = this.threads.find((th) => !th.done && !th.pending && th.wakeAt <= this.now);
      if (!t) break;
      dirty = true;
      const r = t.gen.next();
      if (r.done) {
        t.done = true;
      } else if (typeof r.value === "number") {
        t.wakeAt += r.value;
      } else {
        t.pending = { ...r.value, since: this.now };
      }
    }
    this.threads = this.threads.filter((t) => !t.done);

    // Page turns happen once everyone else on this page has finished.
    const request = this.threads.find((t) => t.pending);
    if (request?.pending) {
      const others = this.threads.some((t) => !t.pending);
      if (!others || this.now - request.pending.since >= PAGE_WAIT_LIMIT) {
        this.enterPage(request.pending.page, request.pending.home);
        dirty = true;
        this.tick(this.now);
      }
    }
    if (dirty) this.changed();
  }

  // ── Internals ──

  private changed() {
    this.hooks.changed?.();
  }

  private enterPage(index: number, home: boolean) {
    this.threads = [];
    this.page = home ? 0 : index;
    this.resetPage();
    this.startHats((b) => b.type === "start_flag");
  }

  private scriptsOf(actorId: string): BlockJson[] {
    const actor = this.actors().find((a) => a.id === actorId);
    return (actor?.scripts.blocks?.blocks ?? []).filter((b) => HATS.has(b.type));
  }

  /** Start matching hat stacks; a stack that is already running is left alone. */
  private startHats(match: (hat: BlockJson) => boolean, onlyActor?: string) {
    for (const actor of this.actors()) {
      if (onlyActor && actor.id !== onlyActor) continue;
      for (const hat of this.scriptsOf(actor.id)) {
        if (!match(hat)) continue;
        if (this.threads.some((t) => t.hat === hat && !t.done)) continue;
        this.threads.push({
          actorId: actor.id,
          hat,
          gen: this.runStack(actor.id, hat.next?.block),
          wakeAt: this.now,
          pending: null,
          done: false,
        });
      }
    }
  }

  private *runStack(actorId: string, first: BlockJson | undefined): Generator<Step, void, void> {
    for (let b = first; b; b = b.next?.block) {
      const s = this.states.get(actorId);
      if (!s) return; // character was removed while running
      switch (b.type) {
        case "move_right":
        case "move_left":
        case "move_up":
        case "move_down": {
          const dx = b.type === "move_right" ? 1 : b.type === "move_left" ? -1 : 0;
          const dy = b.type === "move_down" ? 1 : b.type === "move_up" ? -1 : 0;
          s.x = Math.min(GRID_COLS - 1, Math.max(0, s.x + dx));
          s.y = Math.min(GRID_ROWS - 1, Math.max(0, s.y + dy));
          this.changed();
          yield TIMING.move;
          this.checkBump(actorId);
          break;
        }
        case "say":
          s.bubble = String(b.fields?.TEXT ?? "");
          this.changed();
          yield TIMING.say;
          break;
        case "record": {
          const ms = b.data && this.project.recordings[b.data] ? (this.hooks.playRecording?.(b.data) ?? 0) : 0;
          yield ms;
          break;
        }
        case "pop":
          this.hooks.sound?.("pop");
          yield TIMING.pop;
          break;
        case "grow":
        case "shrink":
          s.level = Math.max(-SIZE_STEPS, Math.min(SIZE_STEPS, s.level + (b.type === "grow" ? 1 : -1)));
          this.changed();
          yield TIMING.grow;
          break;
        case "hide":
        case "show":
          s.visible = b.type === "show";
          this.changed();
          yield TIMING.hideShow;
          break;
        case "wait":
          yield Math.max(0, Number(b.fields?.N ?? 1)) * TIMING.second;
          break;
        case "repeat": {
          const n = Math.max(0, Number(b.fields?.N ?? 1));
          const body = b.inputs?.DO?.block;
          if (body) for (let i = 0; i < n; i++) yield* this.runStack(actorId, body);
          break;
        }
        case "go_page": {
          const target = Number(b.fields?.PAGE ?? 1) - 1;
          if (target >= 0 && target < this.project.pages.length) yield { page: target, home: false };
          break;
        }
        case "go_home":
          yield { page: 0, home: true };
          break;
        case "send_message": {
          const colour = String(b.fields?.COLOUR ?? "") as MessageColour;
          this.startHats((hat) => hat.type === "start_message" && String(hat.fields?.COLOUR) === colour);
          yield 0;
          break;
        }
        default:
          // A block this version doesn't know: skip it rather than stop the class.
          break;
      }
    }
  }

  private checkBump(actorId: string) {
    const me = this.states.get(actorId);
    if (!me?.visible) return;
    for (const [otherId, other] of this.states) {
      if (otherId === actorId || !other.visible || other.x !== me.x || other.y !== me.y) continue;
      this.startHats((b) => b.type === "start_bump", actorId);
      this.startHats((b) => b.type === "start_bump", otherId);
    }
  }
}
