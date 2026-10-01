"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Student HTML/CSS/JS playground (/tools/web-playground).
 *
 * Progress lives in the page's own URL: every edit is compressed into the
 * `#code=` hash, so the address bar is always a link back to the student's
 * latest work (bookmark it, or share it with a teacher). The hash is never
 * sent to the server, so nothing is stored on our side. A localStorage copy
 * restores work when the bare URL is reopened on the same device.
 *
 * Student code runs in an iframe sandboxed WITHOUT allow-same-origin, so it
 * cannot read this site's cookies, storage, or DOM.
 */

type Lang = "html" | "css" | "js";
type Files = Record<Lang, string>;
type LogLine = { level: "log" | "info" | "warn" | "error"; text: string };

const STORAGE_KEY = "codeship-web-playground";
const HASH_KEY = "code=";
const LONG_LINK = 8000;

const TABS: { id: Lang; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "js", label: "JavaScript" },
];

const STARTER: Files = {
  html: `<h1>Hello, CODEship!</h1>
<p>Edit the code on the left and watch this page change.</p>
<button id="launch">Launch the rocket</button>
<p id="message"></p>
`,
  css: `body {
  font-family: system-ui, sans-serif;
  background: #0A2342;
  color: white;
  text-align: center;
  padding: 40px;
}

button {
  background: #F4D734;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  cursor: pointer;
}
`,
  js: `const button = document.getElementById("launch");
const message = document.getElementById("message");

button.addEventListener("click", () => {
  message.textContent = "3... 2... 1... Liftoff!";
  console.log("The button was clicked");
});
`,
};

// Captures console output and runtime errors inside the preview and posts
// them to the parent page. Kept ES5 so it runs whatever students write.
// JS_START/JS_LINES are filled in so error line numbers match the JS tab.
const CONSOLE_SHIM = `(function(){
function fmt(v){try{if(typeof v==="string")return v;if(v instanceof Error)return v.name+": "+v.message;if(typeof v==="function")return String(v);if(typeof Element!=="undefined"&&v instanceof Element)return v.outerHTML.slice(0,300);var s=JSON.stringify(v,null,2);return s===undefined?String(v):s;}catch(e){return String(v);}}
function send(level,args){try{parent.postMessage({__codeship:1,level:level,text:Array.prototype.map.call(args,fmt).join(" ")},"*");}catch(e){}}
["log","info","warn","error"].forEach(function(l){var o=console[l];console[l]=function(){send(l,arguments);if(o)o.apply(console,arguments);};});
window.addEventListener("error",function(e){var n=e.lineno-JS_START+1;send("error",[(e.message||"Error")+(n>0&&n<=JS_LINES?" (JavaScript line "+n+")":"")]);});
window.addEventListener("unhandledrejection",function(e){send("error",["Unhandled promise rejection: "+fmt(e.reason)]);});
})();`;

function buildDocument(files: Files, withShim: boolean): string {
  // A literal "</script>" or "</style>" in student code would end our wrapper tag early.
  const css = files.css.replace(/<\/style/gi, "<\\/style");
  const js = files.js.replace(/<\/script/gi, "<\\/script");
  const head = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${withShim ? "<script>@@SHIM@@</script>\n" : ""}<style>
${css}
</style>
</head>
<body>
${files.html}
<script>
`;
  const jsStart = head.split("\n").length;
  // Shim joined onto one line so it doesn't shift the line count above.
  const shim = CONSOLE_SHIM.replace(/\n/g, "").replace(/JS_START/g, String(jsStart)).replace(/JS_LINES/g, String(js.split("\n").length));
  return `${head.replace("@@SHIM@@", () => shim)}${js}
</script>
</body>
</html>`;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: TransformStream): Promise<Uint8Array> {
  const piped = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

// Link format: "1" + base64url(deflate-raw(json)), or "0" + base64url(json)
// on browsers without CompressionStream.
async function encodeFiles(files: Files): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify({ h: files.html, c: files.css, j: files.js }));
  try {
    return "1" + toBase64Url(await pipe(bytes, new CompressionStream("deflate-raw")));
  } catch {
    return "0" + toBase64Url(bytes);
  }
}

async function decodeFiles(code: string): Promise<Files> {
  let bytes = fromBase64Url(code.slice(1));
  if (code[0] === "1") bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
  else if (code[0] !== "0") throw new Error("Unknown link format");
  const data = JSON.parse(new TextDecoder().decode(bytes));
  return { html: String(data.h ?? ""), css: String(data.c ?? ""), js: String(data.j ?? "") };
}

function readHash(): string | null {
  const hash = window.location.hash.slice(1);
  return hash.startsWith(HASH_KEY) ? hash.slice(HASH_KEY.length) : null;
}

function loadLocal(): Files | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return { html: String(data.html ?? ""), css: String(data.css ?? ""), js: String(data.js ?? "") };
  } catch {
    return null;
  }
}

function saveLocal(files: Files) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {
    // Private mode or storage blocked: the link still holds the work.
  }
}

/* ------------------------------------------------------------------ */

function CodeEditor({
  value,
  onChange,
  label,
  onRun,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  onRun: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const escapedRef = useRef(false);
  const lineCount = value.split("\n").length;

  // execCommand keeps the browser's undo history intact; fall back to a
  // direct edit where it isn't supported.
  const insert = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    if (!document.execCommand("insertText", false, text)) {
      const { selectionStart: s, selectionEnd: e } = el;
      const next = value.slice(0, s) + text + value.slice(e);
      onChange(next);
      requestAnimationFrame(() => el.setSelectionRange(s + text.length, s + text.length));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
      return;
    }
    // Tab indents; pressing Escape first lets Tab move focus out, so
    // keyboard users are never trapped in the editor.
    const escaped = escapedRef.current;
    escapedRef.current = e.key === "Escape";
    if (e.key === "Tab" && !escaped && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      insert("  ");
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const el = e.currentTarget;
      const lineStart = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, el.selectionStart))?.[0] ?? "";
      const before = value[el.selectionStart - 1];
      const extra = before === "{" || before === "(" || before === "[" ? "  " : "";
      e.preventDefault();
      insert("\n" + indent + extra);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 bg-[#0B1B33] font-mono text-[13px] leading-5">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="select-none overflow-hidden py-3 pl-3 pr-2 text-right text-[#5C7090] bg-[#081529]"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        aria-label={`${label} code`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }}
        aria-describedby="editor-help"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        wrap="off"
        className="flex-1 min-w-0 resize-none bg-transparent py-3 px-3 text-[#E6EDF7] caret-[#F4D734] outline-none whitespace-pre overflow-auto"
      />
    </div>
  );
}

export default function WebPlayground() {
  const [files, setFiles] = useState<Files | null>(null);
  const [tab, setTab] = useState<Lang>("html");
  const [preview, setPreview] = useState({ doc: "", runId: 0 });
  const [autoRun, setAutoRun] = useState(true);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [linkLength, setLinkLength] = useState(0);
  const [share, setShare] = useState<{ url: string; copied: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shareInputRef = useRef<HTMLInputElement>(null);

  // Auto-run skips re-rendering when nothing changed; the Run button forces it.
  const lastDocRef = useRef("");
  const run = useCallback((f: Files, force = true) => {
    const doc = buildDocument(f, true);
    if (!force && doc === lastDocRef.current) return;
    lastDocRef.current = doc;
    setLogs([]);
    setPreview((p) => ({ doc, runId: p.runId + 1 }));
  }, []);

  // Load: link first, then this device's last session, then the starter.
  useEffect(() => {
    const load = async () => {
      const code = readHash();
      let loaded: Files | null = null;
      if (code) {
        try {
          loaded = await decodeFiles(code);
        } catch {
          setNotice("That link looks incomplete or broken, so we opened your last saved work instead.");
        }
      }
      const initial = loaded ?? loadLocal() ?? STARTER;
      setFiles(initial);
      run(initial);
    };
    load();
    // Pasting a different playground link into this tab's address bar.
    const onHashChange = () => {
      const code = readHash();
      if (!code) return;
      decodeFiles(code)
        .then((f) => {
          setFiles(f);
          run(f);
        })
        .catch(() => setNotice("That link looks incomplete or broken."));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [run]);

  // Save every change into the URL and this device, and re-run if auto-run is on.
  useEffect(() => {
    if (!files) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      saveLocal(files);
      const code = await encodeFiles(files);
      if (cancelled) return;
      window.history.replaceState(null, "", `#${HASH_KEY}${code}`);
      setLinkLength(window.location.href.length);
      if (autoRun) run(files, false);
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [files, autoRun, run]);

  // Console messages from the preview. Only trust our own iframe.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || d.__codeship !== 1 || typeof d.text !== "string") return;
      const level = ["log", "info", "warn", "error"].includes(d.level) ? d.level : "log";
      setLogs((prev) => [...prev.slice(-199), { level, text: d.text.slice(0, 5000) }]);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const update = (lang: Lang, value: string) => setFiles((f) => (f ? { ...f, [lang]: value } : f));

  const onShare = async () => {
    if (!files) return;
    const url = `${window.location.origin}${window.location.pathname}#${HASH_KEY}${await encodeFiles(files)}`;
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      // Clipboard blocked: the dialog shows the link selected for manual copy.
    }
    setShare({ url, copied });
    requestAnimationFrame(() => shareInputRef.current?.select());
  };

  const onDownload = () => {
    if (!files) return;
    const blob = new Blob([buildDocument(files, false)], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-codeship-page.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const onReset = () => {
    if (!window.confirm("Start over with the example project? Your current code will be replaced.")) return;
    setFiles(STARTER);
    run(STARTER);
  };

  const errorCount = logs.filter((l) => l.level === "error").length;
  const btn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D734]";

  return (
    <div className="flex flex-col min-h-[100dvh] md:h-[100dvh] bg-[#0A2342] text-white">
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-3 mr-auto">
          <Image
            src="/logo-nav.png"
            alt="CODEship Academy"
            width={120}
            height={120}
            className="h-8 w-auto object-contain bg-white p-0.5"
            priority
          />
          <h1 className="font-display text-lg font-bold tracking-tight">Web Playground</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => files && run(files)}
            className={`${btn} bg-[#F4D734] text-[#0A2342] border-[#F4D734] hover:bg-[#ffe34d]`}
            title="Run (Ctrl + Enter)"
          >
            ▶ Run
          </button>
          <label className="inline-flex items-center gap-1.5 text-sm text-white/80 select-none px-1">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="accent-[#F4D734]"
            />
            Auto-run
          </label>
          <button type="button" onClick={onShare} className={`${btn} border-white/30 hover:bg-white/10`}>
            Save link
          </button>
          <button type="button" onClick={onDownload} className={`${btn} border-white/30 hover:bg-white/10`}>
            Download
          </button>
          <button type="button" onClick={onReset} className={`${btn} border-white/30 hover:bg-white/10`}>
            Start over
          </button>
        </div>
      </header>

      {notice && (
        <div role="status" className="flex items-start gap-3 px-4 py-2 text-sm bg-[#F4D734] text-[#0A2342]">
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <main className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Editor */}
        <section className="flex flex-col h-[60vh] md:h-auto md:w-1/2 min-h-0 border-b md:border-b-0 md:border-r border-white/10">
          <div role="tablist" aria-label="Code files" className="flex bg-[#081529]">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-[#F4D734] text-white bg-[#0B1B33]"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {files ? (
            <CodeEditor
              key={tab}
              label={TABS.find((t) => t.id === tab)!.label}
              value={files[tab]}
              onChange={(v) => update(tab, v)}
              onRun={() => run(files)}
            />
          ) : (
            <div className="flex-1 bg-[#0B1B33]" aria-hidden="true" />
          )}
          <p id="editor-help" className="px-3 py-1.5 text-xs text-white/60 bg-[#081529]">
            Your work is saved in this page&apos;s link. Bookmark it or use <strong>Save link</strong> to keep your
            progress.
            {linkLength > LONG_LINK && (
              <span className="text-[#F4D734]">
                {" "}
                This project&apos;s link is very long; also use Download to keep a copy.
              </span>
            )}
          </p>
        </section>

        {/* Preview + console */}
        <section className="flex flex-col h-[75vh] md:h-auto md:w-1/2 min-h-0">
          <div className="flex-1 min-h-0 bg-white">
            <iframe
              ref={iframeRef}
              key={preview.runId}
              title="Preview of your page"
              srcDoc={preview.doc}
              sandbox="allow-scripts allow-modals allow-forms allow-pointer-lock"
              className="w-full h-full border-0 bg-white"
            />
          </div>
          <div className="border-t border-white/10 bg-[#081529]">
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
              <button
                type="button"
                onClick={() => setShowConsole((v) => !v)}
                aria-expanded={showConsole}
                className="font-semibold uppercase tracking-wide text-white/70 hover:text-white"
              >
                {showConsole ? "▾" : "▸"} Console
              </button>
              {errorCount > 0 && (
                <span className="bg-red-500 text-white px-1.5">
                  {errorCount} error{errorCount === 1 ? "" : "s"}
                </span>
              )}
              {logs.length > 0 && (
                <button type="button" onClick={() => setLogs([])} className="ml-auto text-white/50 hover:text-white">
                  Clear
                </button>
              )}
            </div>
            {showConsole && (
              <div
                role="log"
                aria-live="polite"
                className="h-32 overflow-auto px-3 pb-2 font-mono text-xs leading-5"
              >
                {logs.length === 0 ? (
                  <p className="text-white/40">Messages from console.log() show up here.</p>
                ) : (
                  logs.map((l, i) => (
                    <pre
                      key={i}
                      className={`whitespace-pre-wrap break-words border-b border-white/5 py-0.5 ${
                        l.level === "error" ? "text-red-300" : l.level === "warn" ? "text-yellow-200" : "text-white/85"
                      }`}
                    >
                      {l.text}
                    </pre>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {share && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShare(null)}
        >
          <div className="w-full max-w-lg bg-white text-[#0A2342] p-5" onClick={(e) => e.stopPropagation()}>
            <h2 id="share-title" className="font-display text-lg font-bold">
              {share.copied ? "Link copied!" : "Your project link"}
            </h2>
            <p className="mt-1 text-sm text-[#2E3440]">
              This link holds your code. Open it any time to keep working, or send it to your teacher. If you change
              your code later, save a new link.
            </p>
            <input
              ref={shareInputRef}
              readOnly
              value={share.url}
              aria-label="Project link"
              onFocus={(e) => e.currentTarget.select()}
              className="mt-3 w-full border border-gray-300 px-2 py-1.5 font-mono text-xs"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setShare(null)}
                className={`${btn} bg-[#0A2342] text-white border-[#0A2342]`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
