/**
 * Talks to the Pyodide worker (public/py/worker.js). Python runs off the
 * page's main thread, so a student's infinite loop never freezes the tab:
 * stop() terminates the worker and boots a fresh one (fast after the first
 * load, because the runtime files are in the browser cache).
 */

import pyodidePackage from "pyodide/package.json";

// Bump when public/py/worker.js or runner.py change, so browsers refetch them.
const RUNNER_VERSION = "1";
const PYODIDE_DIR = `/py/pyodide-${pyodidePackage.version}/`;
const WORKER_URL = `/py/worker.js?pyodide=${encodeURIComponent(PYODIDE_DIR)}&v=${RUNNER_VERSION}`;

export type RuntimeStatus = "loading" | "ready" | "running" | "failed";

export type RunResult = {
  /** The real Python traceback text (student frames only), the input() message, or null. */
  error: string | null;
  /** True if output was cut at the worker's safety limit. */
  clipped: boolean;
  ms: number;
};

type Callbacks = {
  onStatus: (status: RuntimeStatus, detail?: string) => void;
  onOutput: (text: string) => void;
};

export class PythonRuntime {
  private worker: Worker | null = null;
  private ready = false;
  private queued: string | null = null;
  private nextId = 1;
  private current: { id: number; resolve: (r: RunResult | null) => void } | null = null;

  constructor(private callbacks: Callbacks) {}

  start() {
    this.ready = false;
    this.callbacks.onStatus("loading");
    const worker = new Worker(WORKER_URL, { type: "module" });
    worker.onmessage = (e: MessageEvent) => this.onMessage(e.data);
    worker.onerror = (e) => {
      e.preventDefault();
      if (!this.ready) this.callbacks.onStatus("failed", e.message || "The Python worker could not start.");
    };
    this.worker = worker;
  }

  /** Runs code; resolves null if the run was stopped. */
  run(code: string): Promise<RunResult | null> {
    this.current?.resolve(null);
    return new Promise((resolve) => {
      const id = this.nextId++;
      this.current = { id, resolve };
      if (this.ready) this.post(id, code);
      else this.queued = code;
    });
  }

  stop() {
    this.dispose();
    this.start();
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.queued = null;
    this.current?.resolve(null);
    this.current = null;
  }

  private post(id: number, code: string) {
    this.callbacks.onStatus("running");
    this.worker?.postMessage({ type: "run", id, code });
  }

  private onMessage(msg: { type: string; [key: string]: unknown }) {
    switch (msg.type) {
      case "ready":
        this.ready = true;
        if (this.queued !== null && this.current) {
          const code = this.queued;
          this.queued = null;
          this.post(this.current.id, code);
        } else {
          this.callbacks.onStatus("ready");
        }
        break;
      case "loadError":
        this.callbacks.onStatus("failed", String(msg.message));
        break;
      case "out":
        this.callbacks.onOutput(String(msg.text));
        break;
      case "done":
        if (this.current && this.current.id === msg.id) {
          this.current.resolve({ error: (msg.error as string | null) ?? null, clipped: Boolean(msg.clipped), ms: Number(msg.ms) });
          this.current = null;
        }
        this.callbacks.onStatus("ready");
        break;
    }
  }
}
