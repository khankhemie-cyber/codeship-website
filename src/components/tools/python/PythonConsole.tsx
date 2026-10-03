"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../launchpad/icons";
import { readAutosave, writeAutosave } from "./autosave";
import type { EditorApi } from "./PythonEditor";
import { PythonRuntime, type RuntimeStatus } from "./runtime";
import { buildShareUrl, createShareLink, readSharedCode, SHARE_URL_LIMIT, TOO_BIG_MESSAGE } from "./share";

/**
 * CODEship Python (/tools/python): one file, checker.py, a Run button and an
 * output panel. A teaching tool for the Engineers programme, so some things
 * are missing on purpose: no autocomplete, no "explain this error", no input().
 *
 * Where work lives (see README "Student tools"):
 *  - Autosave to this browser's localStorage: a crash net within a class.
 *  - The share link (`#c=` fragment): how work moves between classes.
 *  - Download / Open checker.py: the durable backup and portfolio file.
 * Nothing is ever sent to or stored on our server.
 */

const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <div className="h-full bg-[#011735]" aria-hidden="true" />,
});

const FILENAME = "checker.py";
const AUTOSAVE_DELAY = 2000;
const LINK_UPDATE_DELAY = 700;
const SLOW_RUN_HINT_AFTER = 4000;
const MAX_OPEN_BYTES = 512 * 1024;

const STARTER = `# checker.py
# Write your Python here, then press Run.

print("Hello from CODEship!")
`;

const INPUT_HINT = "input() does not work here.";

type Segment = { kind: "out" | "error" | "note"; text: string };
type ShareState = { kind: "link"; url: string; copied: boolean } | { kind: "tooBig"; length: number } | null;
type SaveState = { kind: "none" } | { kind: "link" } | { kind: "saved"; at: number } | { kind: "failed" };

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010F2A]";
const toolBtn = `inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm font-semibold text-[#E8EEF7] hover:bg-white/10 disabled:opacity-40 ${focusRing}`;

function clock(ms: number) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Full label on wide screens, a short one in between, icon only on phones. */
function ToolButton({ icon, label, short, onClick, iconOnlyOnPhone }: { icon: IconName; label: string; short: string; onClick: () => void; iconOnlyOnPhone?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={toolBtn}>
      <span className="text-[#5FC9D4]">
        <Icon name={icon} />
      </span>
      <span aria-hidden="true" className={`${iconOnlyOnPhone ? "hidden sm:inline" : ""} xl:hidden`}>
        {short}
      </span>
      <span aria-hidden="true" className="hidden xl:inline">
        {label}
      </span>
    </button>
  );
}

function Logo() {
  return (
    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
      <span
        className="block h-7 w-6 bg-no-repeat"
        style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }}
      />
    </span>
  );
}

export default function PythonConsole() {
  const [initialCode, setInitialCode] = useState<string | null>(null);
  const [status, setStatus] = useState<RuntimeStatus>("loading");
  const [statusDetail, setStatusDetail] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [waitingToRun, setWaitingToRun] = useState(false);
  const [slowRun, setSlowRun] = useState(false);
  const [save, setSave] = useState<SaveState>({ kind: "none" });
  const [linkTooBig, setLinkTooBig] = useState(false);
  const [share, setShare] = useState<ShareState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const editorApi = useRef<EditorApi | null>(null);
  const runtimeRef = useRef<PythonRuntime | null>(null);
  const codeRef = useRef("");
  const runningRef = useRef(false);
  const pendingOut = useRef("");
  const flushFrame = useRef(0);
  const autosaveTimer = useRef(0);
  const skipAutosave = useRef(false);
  const linkTimer = useRef(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const outputSectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 2200);
  };

  const pageUrl = () => `${window.location.origin}${window.location.pathname}`;

  // ── Output: stdout arrives in many small chunks; batch them per frame. ──
  const appendOutput = useCallback((text: string) => {
    if (!text) return;
    setSegments((prev) => {
      const last = prev[prev.length - 1];
      if (last?.kind === "out") return [...prev.slice(0, -1), { kind: "out", text: last.text + text }];
      return [...prev, { kind: "out", text }];
    });
  }, []);

  const flushOutput = useCallback(() => {
    cancelAnimationFrame(flushFrame.current);
    flushFrame.current = 0;
    const text = pendingOut.current;
    pendingOut.current = "";
    appendOutput(text);
  }, [appendOutput]);

  // ── Python runtime: boots in a worker as soon as the page opens. ──
  useEffect(() => {
    const runtime = new PythonRuntime({
      onStatus: (s, detail) => {
        setStatus(s);
        if (s === "failed") setStatusDetail(detail ?? null);
        if (s === "running") setWaitingToRun(false);
      },
      onOutput: (text) => {
        pendingOut.current += text;
        if (!flushFrame.current) flushFrame.current = requestAnimationFrame(flushOutput);
      },
    });
    runtimeRef.current = runtime;
    runtime.start();
    return () => runtime.dispose();
  }, [flushOutput]);

  // ── Load: a link wins, then this computer's autosave, then the starter. ──
  useEffect(() => {
    (async () => {
      let code: string | null = null;
      try {
        code = await readSharedCode(window.location.hash);
        if (code !== null) setSave({ kind: "link" });
      } catch {
        setNotice("This link is broken or was cut short, so it could not be opened. Ask for the link again, or open your downloaded checker.py.");
      }
      if (code === null) {
        const saved = readAutosave();
        if (saved) {
          code = saved.code;
          setSave({ kind: "saved", at: saved.savedAt });
        }
      }
      codeRef.current = code ?? STARTER;
      setInitialCode(codeRef.current);
    })();
  }, []);

  // A different link pasted into this tab's address bar.
  useEffect(() => {
    const onHashChange = async () => {
      try {
        const code = await readSharedCode(window.location.hash);
        if (code !== null && code !== codeRef.current) {
          // Opening a link must not overwrite this computer's autosave until the student edits.
          skipAutosave.current = true;
          editorApi.current?.replace(code);
          skipAutosave.current = false;
          setSave({ kind: "link" });
        }
      } catch {
        setNotice("This link is broken or was cut short, so it could not be opened.");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const saveNow = useCallback(() => {
    window.clearTimeout(autosaveTimer.current);
    const at = writeAutosave(codeRef.current);
    setSave(at === null ? { kind: "failed" } : { kind: "saved", at });
  }, []);

  // Every edit: autosave after a quiet spell, and keep the address bar a
  // working link to the latest code (so a refresh, or copying the address
  // bar instead of pressing Share, never loses work).
  const onChange = useCallback(
    (code: string) => {
      codeRef.current = code;
      window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = skipAutosave.current ? 0 : window.setTimeout(saveNow, AUTOSAVE_DELAY);
      window.clearTimeout(linkTimer.current);
      linkTimer.current = window.setTimeout(async () => {
        const url = await buildShareUrl(code, pageUrl());
        if (code !== codeRef.current) return;
        window.history.replaceState(null, "", url);
        setLinkTooBig(url.length > SHARE_URL_LIMIT);
      }, LINK_UPDATE_DELAY);
    },
    [saveNow],
  );

  // Save before the tab goes away, in case it closes inside the debounce.
  useEffect(() => {
    const onHide = () => {
      if (autosaveTimer.current) saveNow();
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [saveNow]);

  // ── Run / Stop ──
  const run = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runningRef.current) return;
    runningRef.current = true;
    pendingOut.current = "";
    setSegments([]);
    setHasRun(true);
    setSlowRun(false);
    // Phones stack the output under the editor: bring it into view.
    if (window.matchMedia("(max-width: 767px)").matches) outputSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setWaitingToRun(!runtime || status !== "ready");
    const slowTimer = window.setTimeout(() => setSlowRun(true), SLOW_RUN_HINT_AFTER);
    const result = await runtime.run(codeRef.current);
    window.clearTimeout(slowTimer);
    runningRef.current = false;
    setSlowRun(false);
    setWaitingToRun(false);
    flushOutput();
    if (!result) return; // Stopped: stop() has already said so.
    const add: Segment[] = [];
    if (result.clipped) add.push({ kind: "note", text: "Output was cut short here because there was so much of it." });
    if (result.error) add.push({ kind: result.error.startsWith(INPUT_HINT) ? "note" : "error", text: result.error });
    if (add.length) setSegments((prev) => [...prev, ...add]);
  }, [flushOutput, status]);

  const stop = () => {
    if (!runningRef.current) return;
    flushOutput();
    runtimeRef.current?.stop();
    setSegments((prev) => [...prev, { kind: "note", text: "Stopped. Python is restarting, so you can run again in a moment." }]);
  };

  // Keep the newest output in view while a program prints.
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [segments]);

  // ── Share ──
  const onShare = async () => {
    const result = await createShareLink(codeRef.current, pageUrl());
    if (!result.ok) {
      setShare({ kind: "tooBig", length: result.length });
      return;
    }
    window.history.replaceState(null, "", result.url);
    let copied = false;
    try {
      await navigator.clipboard.writeText(result.url);
      copied = true;
    } catch {
      // Clipboard blocked: the dialog shows the link selected, ready to copy by hand.
    }
    setShare({ kind: "link", url: result.url, copied });
    requestAnimationFrame(() => shareInputRef.current?.select());
  };

  // ── Download / Open ──
  const onDownload = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([codeRef.current], { type: "text/x-python" }));
    a.download = FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const openFile = async (file: File) => {
    setNotice(null);
    const looksLikePython = /\.py$/i.test(file.name) || file.type.startsWith("text/");
    if (!looksLikePython) {
      setNotice(`"${file.name}" is not a Python file. Open a .py file, like checker.py.`);
      return;
    }
    if (file.size > MAX_OPEN_BYTES) {
      setNotice(`"${file.name}" is too big to open here.`);
      return;
    }
    const text = await file.text();
    const current = codeRef.current;
    if (text === current) return;
    if (current.trim() && current !== STARTER && !window.confirm(`Open ${file.name}? It replaces the code in the editor. (Ctrl+Z undoes this.)`)) return;
    editorApi.current?.replace(text);
    showToast(`Opened ${file.name}`);
  };

  // Drag a .py file anywhere onto the page.
  const dragDepth = useRef(0);
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");
  const dropHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) openFile(file);
    },
  };

  // ── Shortcuts that work wherever focus is. ──
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !(e.ctrlKey || e.metaKey)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        runRef.current();
      } else if (e.key.toLowerCase() === "s") {
        // Ctrl+S would otherwise save this web page. Save here instead, and
        // say honestly where it went.
        e.preventDefault();
        saveNow();
        showToast("Saved on this computer. To keep it, use Share or Download.");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveNow]);

  const running = status === "running" || waitingToRun;
  const statusText =
    status === "failed"
      ? "Python could not load"
      : status === "loading"
        ? "Starting Python…"
        : status === "running"
          ? "Running…"
          : "Python ready";

  const saveText =
    save.kind === "saved"
      ? `Saved on this computer · ${clock(save.at)}`
      : save.kind === "failed"
        ? "Not saved: this browser blocks saving. Use Share or Download to keep your work."
        : save.kind === "link"
          ? "Opened from a link · not saved on this computer yet"
          : "Not saved on this computer yet";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#010F2A] text-[#E8EEF7] md:h-[100dvh]" {...dropHandlers}>
      {/* ───────── Top bar ───────── */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 bg-[#012C61] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
            CODEship <span className="text-[#D58401]">Python</span>
          </h1>
        </div>
        <span className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running || status === "failed"}
            title="Run checker.py (Ctrl+Enter)"
            className={`inline-flex h-10 items-center gap-2 rounded-lg bg-[#D58401] px-5 text-base font-extrabold text-[#010F2A] hover:bg-[#E89512] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            <Icon name="play" />
            {running ? "Running…" : "Run"}
          </button>
          {running && (
            <button
              type="button"
              onClick={stop}
              title="Stop the program"
              className={`inline-flex h-10 items-center gap-2 rounded-lg border border-[#FF8A80]/60 px-3 text-sm font-bold text-[#FFB4AB] hover:bg-[#FF8A80]/10 ${focusRing}`}
            >
              <Icon name="stop" />
              Stop
            </button>
          )}
          <span className="hidden text-xs text-[#A3ADBF] lg:inline">Ctrl+Enter</span>
        </div>
        <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-[#C3CBD8]">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${
              status === "ready" ? "bg-[#3CC6A8]" : status === "failed" ? "bg-[#FF6B6B]" : "animate-pulse bg-[#D58401]"
            }`}
          />
          {statusText}
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ToolButton icon="folderOpen" label="Open .py file" short="Open" onClick={() => fileInputRef.current?.click()} iconOnlyOnPhone />
          <ToolButton icon="download" label="Download checker.py" short="Download" onClick={onDownload} iconOnlyOnPhone />
          <ToolButton icon="link" label="Share link" short="Share" onClick={onShare} />
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,text/x-python,text/plain"
            className="hidden"
            data-testid="file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) openFile(file);
            }}
          />
        </div>
      </header>

      {status === "failed" && (
        <div role="alert" className="bg-[#FF6B6B] px-4 py-2 text-sm font-semibold text-[#010F2A]">
          Python could not load. Check the internet connection, then reload the page. Your code is still here.
          {statusDetail && <span className="block font-mono text-xs font-normal">{statusDetail}</span>}
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-start gap-3 bg-[#D58401] px-4 py-2 text-sm text-[#010F2A]">
          <span className="flex-1 font-semibold">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className={`rounded ${focusRing}`}>
            <Icon name="x" />
          </button>
        </div>
      )}

      {/* ───────── Workspace ───────── */}
      <main className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Editor */}
        <section aria-label="Code editor" className="flex h-[55vh] min-h-[240px] flex-col border-white/10 md:h-auto md:min-h-0 md:border-r">
          <div className="flex items-center border-b border-white/10 bg-[#010F2A]">
            <span className="relative flex items-center gap-2 bg-[#011735] px-4 py-2.5 font-mono text-[15px] font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#D58401]">
              <span className="rounded bg-[#035762] px-1.5 py-0.5 font-sans text-[11px] font-bold text-white" aria-hidden="true">
                PY
              </span>
              {FILENAME}
            </span>
          </div>
          <div className="min-h-0 flex-1 bg-[#011735]">
            {initialCode !== null && <PythonEditor initialCode={initialCode} onChange={onChange} onRun={run} apiRef={editorApi} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 border-t border-white/10 bg-[#010F2A] px-3 py-1.5 text-[13px] text-[#C3CBD8]">
            <span className={`h-2 w-2 shrink-0 rounded-full ${save.kind === "saved" ? "bg-[#3CC6A8]" : "bg-[#A3ADBF]"}`} aria-hidden="true" />
            <span data-testid="save-status">{saveText}</span>
            {linkTooBig && <span className="text-[#F2B347]">· Too big for a share link. Use Download.</span>}
          </div>
        </section>

        {/* Output */}
        <section ref={outputSectionRef} aria-label="Output" className="flex min-h-[60vh] flex-1 flex-col md:min-h-0">
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#010F2A] px-3 py-1.5">
            <span className="mr-auto flex items-center gap-2 py-1 text-sm font-semibold">
              <span className="text-[#C9A7F0]">
                <Icon name="terminal" />
              </span>
              Output
            </span>
            <button
              type="button"
              onClick={() => setSegments([])}
              disabled={segments.length === 0}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-[#C3CBD8] hover:bg-white/10 hover:text-white disabled:opacity-40 ${focusRing}`}
            >
              <Icon name="eraser" />
              Clear output
            </button>
          </div>
          <div
            ref={outputRef}
            role="log"
            aria-live="polite"
            aria-label="Program output"
            data-testid="output"
            className="min-h-0 flex-1 overflow-auto bg-[#00091C] px-4 py-3 font-mono text-[15px] leading-relaxed"
          >
            {!hasRun && segments.length === 0 && (
              <p className="font-sans text-sm text-[#A3ADBF]">
                Press <strong className="text-[#E8EEF7]">Run</strong> (or Ctrl+Enter) to run {FILENAME}. What your program prints appears here.
              </p>
            )}
            {waitingToRun && <p className="font-sans text-sm italic text-[#A3ADBF]">Starting Python… your code runs as soon as it is ready.</p>}
            {segments.map((seg, i) =>
              seg.kind === "out" ? (
                <pre key={i} className="whitespace-pre-wrap break-words font-mono">
                  {seg.text}
                </pre>
              ) : seg.kind === "error" ? (
                <pre
                  key={i}
                  data-testid="error"
                  className="my-2 whitespace-pre-wrap break-words rounded-r border-l-4 border-[#FF6B6B] bg-[#FF6B6B]/10 py-2 pl-3 pr-2 font-mono text-[#FFB4AB]"
                >
                  {seg.text}
                </pre>
              ) : (
                <p key={i} data-testid="note" className="my-2 border-l-4 border-[#D58401] bg-[#D58401]/10 py-2 pl-3 pr-2 font-sans text-sm text-[#F2C67A]">
                  {seg.text}
                </p>
              ),
            )}
            {hasRun && !running && segments.length === 0 && (
              <p className="font-sans text-sm italic text-[#A3ADBF]">Your program ran and printed nothing.</p>
            )}
            {slowRun && running && (
              <p className="mt-2 font-sans text-sm italic text-[#A3ADBF]">Still running… If your program is stuck in a loop, press Stop.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center border-t border-white/10 bg-[#010F2A] px-4 py-2 text-xs">
        <span className="font-display font-extrabold tracking-[0.25em] text-[#D58401]">DREAM. CODE. ACHIEVE.</span>
      </footer>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[#010F2A]/85 p-6">
          <div className="rounded-2xl border-2 border-dashed border-[#D58401] px-8 py-10 text-center">
            <p className="font-display text-xl font-extrabold">Drop your .py file to open it</p>
            <p className="mt-1 text-sm text-[#C3CBD8]">It replaces the code in the editor.</p>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="pointer-events-none fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#035762] px-4 py-2 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {share && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShare(null)}
          onKeyDown={(e) => e.key === "Escape" && setShare(null)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-[#010F2A] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {share.kind === "link" ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#035762] text-white">
                    <Icon name={share.copied ? "check" : "link"} className="h-5 w-5" />
                  </span>
                  <h2 id="share-title" className="font-display text-xl font-extrabold">
                    {share.copied ? "Link copied" : "Your link"}
                  </h2>
                </div>
                <p className="mt-3 text-sm text-[#2E3440]">
                  {share.copied ? "Paste it" : "Copy it and paste it"} somewhere safe, or send it to your instructor. Opening this link brings back this
                  exact code. If you change your code, share a new link.
                </p>
                <input
                  ref={shareInputRef}
                  readOnly
                  value={share.url}
                  aria-label="Share link"
                  data-testid="share-url"
                  onFocus={(e) => e.currentTarget.select()}
                  className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
                />
              </>
            ) : (
              <>
                <h2 id="share-title" className="font-display text-xl font-extrabold">
                  Too big for a link
                </h2>
                <p className="mt-3 text-sm text-[#2E3440]" data-testid="too-big">
                  {TOO_BIG_MESSAGE}
                </p>
              </>
            )}
            <div className="mt-5 flex justify-end gap-2">
              {share.kind === "tooBig" && (
                <button
                  type="button"
                  onClick={() => (onDownload(), setShare(null))}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg bg-[#D58401] px-4 text-sm font-bold text-[#010F2A] ${focusRing}`}
                >
                  <Icon name="download" />
                  Download {FILENAME}
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => setShare(null)}
                className={`inline-flex h-10 items-center rounded-lg bg-[#010F2A] px-5 text-sm font-bold text-white ${focusRing}`}
              >
                {share.kind === "link" ? "Done" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
