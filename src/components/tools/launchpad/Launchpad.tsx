"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  buildDocument,
  buildPopoutPage,
  decodeFiles,
  downloadFile,
  encodeFiles,
  HASH_KEY,
  loadLocalFiles,
  LONG_LINK,
  readHash,
  readJSON,
  SETTINGS_KEY,
  STORAGE_KEY,
  writeJSON,
  type Files,
  type Lang,
  type LogLine,
} from "./lib";
import { DEFAULT_TEMPLATE, TEMPLATES } from "./templates";
import { STRINGS, type UiLang } from "./i18n";
import { Icon, type IconName } from "./icons";
import type { EditorApi } from "./CodeEditor";

/**
 * CODEship Launchpad: the student HTML/CSS/JS editor (/tools/launchpad).
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

const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => <div className="h-full bg-[var(--pg-surface)]" aria-hidden="true" />,
});

type Theme = "dark" | "light";
type Device = "desktop" | "tablet" | "phone";
type ConsoleSize = "collapsed" | "open" | "expanded";
type Menu = "templates" | "share" | "lang" | "more" | null;

type Settings = {
  theme: Theme;
  lang: UiLang;
  fontSize: number;
  wrap: boolean;
  autoRun: boolean;
  split: number;
};

const DEFAULT_SETTINGS: Settings = { theme: "dark", lang: "en", fontSize: 15, wrap: false, autoRun: true, split: 50 };

const FILE_TABS: { id: Lang; name: string; badge: string; color: string }[] = [
  { id: "html", name: "index.html", badge: "<>", color: "bg-[#138A9A] text-white" },
  { id: "css", name: "styles.css", badge: "#", color: "bg-[#6E43A8] text-white" },
  { id: "js", name: "script.js", badge: "JS", color: "bg-[#F4D734] text-[#001532]" },
];

const DEVICE_WIDTH: Record<Device, number | null> = { desktop: null, tablet: 768, phone: 390 };

const THEME_VARS: Record<Theme, CSSProperties> = {
  dark: {
    "--pg-bg": "#001532",
    "--pg-panel": "#00102A",
    "--pg-surface": "#021B38",
    "--pg-menu": "#0A2648",
    "--pg-border": "rgba(255,255,255,0.1)",
    "--pg-text": "#E6EDF7",
    "--pg-muted": "rgba(230,237,247,0.62)",
    "--pg-hover": "rgba(255,255,255,0.08)",
    "--pg-stage": "#0B2142",
  } as CSSProperties,
  light: {
    "--pg-bg": "#FFFFFF",
    "--pg-panel": "#F3F5F9",
    "--pg-surface": "#FFFFFF",
    "--pg-menu": "#FFFFFF",
    "--pg-border": "#DFE3EB",
    "--pg-text": "#001532",
    "--pg-muted": "#5A6478",
    "--pg-hover": "rgba(0,21,50,0.06)",
    "--pg-stage": "#E8ECF3",
  } as CSSProperties,
};

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D734]";
const iconBtn = `inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--pg-muted)] hover:text-[var(--pg-text)] hover:bg-[var(--pg-hover)] disabled:opacity-40 ${focusRing}`;
const pillBtn = `inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--pg-border)] px-3 text-sm font-semibold text-[var(--pg-text)] hover:bg-[var(--pg-hover)] ${focusRing}`;

function IconButton({
  icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={`${iconBtn} ${active ? "!bg-[var(--pg-hover)] !text-[var(--pg-text)] ring-1 ring-[#138A9A]" : ""}`}
    >
      <Icon name={icon} />
    </button>
  );
}

function Dropdown({
  open,
  onToggle,
  button,
  label,
  align = "right",
  children,
  width = "w-64",
}: {
  open: boolean;
  onToggle: () => void;
  button: ReactNode;
  label: string;
  align?: "left" | "right";
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="relative" data-menu-root>
      <button type="button" onClick={onToggle} aria-haspopup="menu" aria-expanded={open} aria-label={label} title={label} className={pillBtn}>
        {button}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full z-40 mt-2 ${width} max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-[var(--pg-border)] bg-[var(--pg-menu)] p-1.5 shadow-2xl`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  hint,
  onClick,
  checked,
}: {
  icon?: IconName;
  label: string;
  hint?: string;
  onClick: () => void;
  checked?: boolean;
}) {
  return (
    <button
      type="button"
      role={checked === undefined ? "menuitem" : "menuitemradio"}
      aria-checked={checked}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--pg-text)] hover:bg-[var(--pg-hover)] ${focusRing}`}
    >
      {icon && (
        <span className="mt-0.5 text-[#138A9A]">
          <Icon name={icon} />
        </span>
      )}
      <span className="flex-1">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-xs text-[var(--pg-muted)]">{hint}</span>}
      </span>
      {checked && (
        <span className="mt-0.5 text-[#138A9A]">
          <Icon name="check" />
        </span>
      )}
    </button>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="CODEship Academy">
      {/* The brain mark is the left part of the header logo (which has a white
          background), shown on a white app-icon tile so it reads on both themes. */}
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <span
          className="block h-7 w-6 bg-no-repeat"
          style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }}
        />
      </span>
      <span className="hidden font-display text-base font-extrabold tracking-tight text-[var(--pg-text)] lg:inline">
        CODE<span className="font-bold">ship</span>
      </span>
    </div>
  );
}

export default function Launchpad() {
  const [files, setFiles] = useState<Files | null>(null);
  const [active, setActive] = useState<Lang>("html");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [preview, setPreview] = useState({ doc: "", runId: 0 });
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [consoleSize, setConsoleSize] = useState<ConsoleSize>("open");
  const [device, setDevice] = useState<Device>("desktop");
  const [expanded, setExpanded] = useState<"editor" | "preview" | null>(null);
  const [previewHidden, setPreviewHidden] = useState(false);
  const [mobileView, setMobileView] = useState<"code" | "preview">("code");
  const [menu, setMenu] = useState<Menu>(null);
  const [linkLength, setLinkLength] = useState(0);
  const [share, setShare] = useState<{ url: string; copied: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shareInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const editorApi = useRef<EditorApi | null>(null);
  const lastDocRef = useRef("");
  const settingsLoaded = useRef(false);

  const s = STRINGS[settings.lang];
  const dark = settings.theme === "dark";
  const updateSettings = (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch }));

  // Auto-run skips re-rendering when nothing changed; the Run button forces it.
  const run = useCallback((f: Files, force = true) => {
    const doc = buildDocument(f, true);
    if (!force && doc === lastDocRef.current) return;
    lastDocRef.current = doc;
    setLogs([]);
    setPreview((p) => ({ doc, runId: p.runId + 1 }));
  }, []);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 1800);
  };

  // Settings are per device; read after mount so server and client render the same markup.
  useEffect(() => {
    const saved = readJSON<Partial<Settings>>(SETTINGS_KEY);
    const lang: UiLang = saved?.lang ?? (navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en");
    setSettings({ ...DEFAULT_SETTINGS, ...saved, lang });
    settingsLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!settingsLoaded.current) return;
    writeJSON(SETTINGS_KEY, settings);
    document.documentElement.lang = settings.lang;
  }, [settings]);

  // Load: link first, then this device's last session, then the starter.
  useEffect(() => {
    const load = async () => {
      const code = readHash();
      let loaded: Files | null = null;
      if (code) {
        try {
          loaded = await decodeFiles(code);
        } catch {
          setNotice("brokenLink");
        }
      }
      const initial = loaded ?? loadLocalFiles() ?? DEFAULT_TEMPLATE;
      setFiles(initial);
      run(initial);
    };
    load();
    // Pasting a different Launchpad link into this tab's address bar.
    const onHashChange = () => {
      const code = readHash();
      if (!code) return;
      decodeFiles(code)
        .then((f) => {
          setFiles(f);
          run(f);
        })
        .catch(() => setNotice("brokenLinkShort"));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [run]);

  // Save every change into the URL and this device, and re-run if auto-run is on.
  useEffect(() => {
    if (!files) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      writeJSON(STORAGE_KEY, files);
      const code = await encodeFiles(files);
      if (cancelled) return;
      window.history.replaceState(null, "", `#${HASH_KEY}${code}`);
      setLinkLength(window.location.href.length);
      if (settings.autoRun) run(files, false);
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [files, settings.autoRun, run]);

  // Console messages from the preview. Only trust our own iframe.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || d.__codeship !== 1 || typeof d.text !== "string") return;
      if (d.level === "clear") {
        setLogs([]);
        return;
      }
      const level = ["log", "info", "warn", "error"].includes(d.level) ? d.level : "log";
      const line = typeof d.line === "number" && d.line > 0 ? d.line : undefined;
      setLogs((prev) => [...prev.slice(-199), { level, text: d.text.slice(0, 5000), line }]);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Close menus on outside click or Escape.
  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: PointerEvent) => {
      if (!(e.target as Element).closest("[data-menu-root]")) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const update = useCallback((lang: Lang, value: string) => setFiles((f) => (f && f[lang] !== value ? { ...f, [lang]: value } : f)), []);

  const onShare = async () => {
    if (!files) return;
    setMenu(null);
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
    setMenu(null);
    downloadFile("my-codeship-page.html", buildDocument(files, false));
  };

  const onOpenTab = () => {
    if (!files) return;
    const url = URL.createObjectURL(new Blob([buildPopoutPage(files, s.title)], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const onCopyCode = async () => {
    if (!files) return;
    try {
      await navigator.clipboard.writeText(files[active]);
      showToast(s.copied);
    } catch {
      // Nothing to fall back to; students can still select and copy by hand.
    }
  };

  const isPristine = (f: Files) => TEMPLATES.some((t) => t.files.html === f.html && t.files.css === f.css && t.files.js === f.js);

  const loadTemplate = (f: Files, confirmText: string) => {
    setMenu(null);
    if (files && !isPristine(files) && !window.confirm(confirmText)) return;
    setFiles(f);
    setActive("html");
    run(f);
  };

  const goToLine = (line: number) => {
    setExpanded((e) => (e === "preview" ? null : e));
    setMobileView("code");
    setActive("js");
    // Runs once the editor shows script.js (immediately if it already does).
    requestAnimationFrame(() => editorApi.current?.revealLine("js", line));
  };

  // Shortcuts that also work when focus is outside the editor.
  const runRef = useRef(() => {});
  const shareRef = useRef(() => {});
  runRef.current = () => files && run(files);
  shareRef.current = onShare;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        runRef.current();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        shareRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Draggable split between code and preview.
  const onDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    const rect = mainRef.current?.getBoundingClientRect();
    if (!rect) return;
    const move = (ev: PointerEvent) => {
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      updateSettings({ split: Math.round(Math.min(80, Math.max(20, pct))) });
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const errorCount = logs.filter((l) => l.level === "error").length;
  const showEditor = expanded !== "preview";
  const showPreview = expanded !== "editor" && !previewHidden;
  const deviceWidth = DEVICE_WIDTH[device];
  const noticeText = notice === "brokenLink" ? s.brokenLink : notice === "brokenLinkShort" ? s.brokenLinkShort : null;

  return (
    <div
      style={THEME_VARS[settings.theme]}
      className="flex h-[100dvh] flex-col bg-[var(--pg-bg)] text-[var(--pg-text)]"
    >
      {/* ───────── Top bar ───────── */}
      <header className="flex flex-wrap items-center gap-2 border-b border-[var(--pg-border)] px-3 py-2 sm:gap-3 sm:px-4">
        <Logo />
        <h1 className="mr-1 font-display text-lg font-extrabold tracking-tight sm:text-xl">
          <span className="text-[var(--pg-text)]">{s.titleLead}</span>
          <span className="text-[#F4D734]">{s.titleAccent}</span>
        </h1>
        <span className="hidden h-6 w-px bg-[var(--pg-border)] sm:block" aria-hidden="true" />
        <button
          type="button"
          onClick={() => files && run(files)}
          title={s.runHint}
          className={`inline-flex h-9 items-center gap-2 rounded-lg bg-[#F4D734] px-4 text-sm font-extrabold text-[#001532] shadow-[0_0_0_1px_rgba(0,0,0,0.05)] hover:bg-[#FFE34D] active:translate-y-px ${focusRing}`}
        >
          <Icon name="rocket" />
          {s.run}
        </button>
        <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-[var(--pg-muted)]">
          <input
            type="checkbox"
            role="switch"
            checked={settings.autoRun}
            onChange={(e) => updateSettings({ autoRun: e.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-6 w-11 rounded-full bg-[var(--pg-hover)] ring-1 ring-[var(--pg-border)] transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-[#138A9A] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#F4D734]"
          />
          <span className="hidden sm:inline">{s.autoRun}</span>
        </label>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Dropdown
            open={menu === "templates"}
            onToggle={() => setMenu(menu === "templates" ? null : "templates")}
            label={s.templates}
            button={
              <>
                <span className="text-[#138A9A]">
                  <Icon name="missions" />
                </span>
                <span className="hidden md:inline">{s.templates}</span>
              </>
            }
          >
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-[var(--pg-muted)]">{s.templatesHint}</p>
            {TEMPLATES.map((t) => (
              <MenuItem key={t.id} label={s.templateNames[t.id]} onClick={() => loadTemplate(t.files, s.templateConfirm)} />
            ))}
          </Dropdown>

          <Dropdown
            open={menu === "share"}
            onToggle={() => setMenu(menu === "share" ? null : "share")}
            label={s.share}
            width="w-72"
            button={
              <>
                <span className="text-[#138A9A]">
                  <Icon name="share" />
                </span>
                <span className="hidden md:inline">{s.share}</span>
                <Icon name="chevronDown" className="hidden h-3.5 w-3.5 md:block" />
              </>
            }
          >
            <MenuItem icon="link" label={s.copyLink} hint={s.copyLinkHint} onClick={onShare} />
            <MenuItem icon="download" label={s.downloadHtml} hint={s.downloadHtmlHint} onClick={onDownload} />
          </Dropdown>

          <button
            type="button"
            onClick={() => updateSettings({ theme: dark ? "light" : "dark" })}
            title={s.theme}
            aria-label={s.theme}
            className={`${pillBtn} !px-2.5`}
          >
            <Icon name={dark ? "sun" : "moon"} />
          </button>

          <Dropdown
            open={menu === "lang"}
            onToggle={() => setMenu(menu === "lang" ? null : "lang")}
            label={s.language}
            width="w-44"
            button={
              <>
                <span className="font-bold">{settings.lang.toUpperCase()}</span>
                <Icon name="chevronDown" className="h-3.5 w-3.5" />
              </>
            }
          >
            <MenuItem label="English" checked={settings.lang === "en"} onClick={() => (updateSettings({ lang: "en" }), setMenu(null))} />
            <MenuItem label="Français" checked={settings.lang === "fr"} onClick={() => (updateSettings({ lang: "fr" }), setMenu(null))} />
          </Dropdown>

          <Dropdown
            open={menu === "more"}
            onToggle={() => setMenu(menu === "more" ? null : "more")}
            label={s.more}
            width="w-72"
            button={<Icon name="more" />}
          >
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
              <span className="text-[#138A9A]">
                <Icon name="type" />
              </span>
              <span className="flex-1 font-semibold">{s.fontSize}</span>
              <button
                type="button"
                aria-label="−"
                onClick={() => updateSettings({ fontSize: Math.max(11, settings.fontSize - 1) })}
                className={`${iconBtn} border border-[var(--pg-border)] font-bold`}
              >
                −
              </button>
              <span className="w-6 text-center tabular-nums" aria-live="polite">
                {settings.fontSize}
              </span>
              <button
                type="button"
                aria-label="+"
                onClick={() => updateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })}
                className={`${iconBtn} border border-[var(--pg-border)] font-bold`}
              >
                +
              </button>
            </div>
            <MenuItem icon="wrap" label={s.wordWrap} checked={settings.wrap} onClick={() => updateSettings({ wrap: !settings.wrap })} />
            <MenuItem icon="restart" label={s.startOver} onClick={() => loadTemplate(DEFAULT_TEMPLATE, s.startOverConfirm)} />
            <div className="mt-1 flex gap-3 border-t border-[var(--pg-border)] px-3 pb-1 pt-2.5 text-xs text-[var(--pg-muted)]">
              <span className="mt-0.5 text-[#138A9A]">
                <Icon name="keyboard" />
              </span>
              <span>{s.shortcuts}</span>
            </div>
          </Dropdown>
        </div>
      </header>

      {noticeText && (
        <div role="status" className="flex items-start gap-3 bg-[#F4D734] px-4 py-2 text-sm text-[#001532]">
          <span className="flex-1">{noticeText}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label={s.dismiss} className="font-bold">
            <Icon name="x" />
          </button>
        </div>
      )}

      {/* Phone: one pane at a time */}
      <div className="flex border-b border-[var(--pg-border)] bg-[var(--pg-panel)] p-1.5 md:hidden" role="tablist" aria-label={`${s.code} / ${s.preview}`}>
        {(["code", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={mobileView === v}
            onClick={() => setMobileView(v)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-semibold ${
              mobileView === v ? "bg-[var(--pg-bg)] text-[var(--pg-text)] shadow" : "text-[var(--pg-muted)]"
            } ${focusRing}`}
          >
            <Icon name={v === "code" ? "code" : "eye"} />
            {v === "code" ? s.code : s.preview}
            {v === "preview" && errorCount > 0 && <span className="rounded bg-red-500 px-1.5 text-xs text-white">{errorCount}</span>}
          </button>
        ))}
      </div>

      {/* ───────── Workspace ───────── */}
      <div ref={mainRef} className="relative flex min-h-0 flex-1">
        {/* Editor */}
        {showEditor && (
          <section
            aria-label={s.code}
            // Phones always show one full-width pane; the split only applies from md up.
            className={`${mobileView === "code" ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col md:flex ${
              showPreview ? "md:flex-none md:basis-[var(--pg-split)]" : ""
            }`}
            style={{ "--pg-split": `${settings.split}%` } as CSSProperties}
          >
            <div className="flex items-stretch border-b border-[var(--pg-border)] bg-[var(--pg-panel)]">
              <div role="tablist" aria-label="Files" className="flex min-w-0 flex-1 overflow-x-auto">
                {FILE_TABS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active === f.id}
                    onClick={() => setActive(f.id)}
                    className={`relative flex shrink-0 items-center gap-2 border-r border-[var(--pg-border)] px-3 py-2.5 text-sm sm:px-4 font-semibold transition-colors ${
                      active === f.id
                        ? "bg-[var(--pg-surface)] text-[var(--pg-text)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#F4D734]"
                        : "text-[var(--pg-muted)] hover:text-[var(--pg-text)]"
                    } ${focusRing}`}
                  >
                    <span className={`hidden h-5 min-w-5 items-center sm:inline-flex justify-center rounded px-1 font-mono text-[10px] font-bold ${f.color}`} aria-hidden="true">
                      {f.badge}
                    </span>
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-0.5 px-2">
                <IconButton icon="undo" label={s.undo} onClick={() => editorApi.current?.undo()} />
                <IconButton icon="redo" label={s.redo} onClick={() => editorApi.current?.redo()} />
                <IconButton icon="copy" label={s.copyCode} onClick={onCopyCode} />
                <span className="hidden md:inline-flex">
                  <IconButton
                    icon={expanded === "editor" ? "minimize" : "maximize"}
                    label={expanded === "editor" ? s.exitExpand : s.expand}
                    onClick={() => setExpanded(expanded === "editor" ? null : "editor")}
                  />
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-[var(--pg-surface)]">
              {files && (
                <CodeEditor
                  files={files}
                  active={active}
                  dark={dark}
                  fontSize={settings.fontSize}
                  wrap={settings.wrap}
                  label={FILE_TABS.find((f) => f.id === active)!.name}
                  onChange={update}
                  onRun={() => runRef.current()}
                  onSave={() => shareRef.current()}
                  apiRef={editorApi}
                />
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-[var(--pg-border)] bg-[var(--pg-panel)] px-3 py-1 text-xs text-[var(--pg-muted)]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#138A9A]" aria-hidden="true" />
              <span className="truncate">
                {s.savedNote}
                {linkLength > LONG_LINK && <span className="text-[#F4D734]"> {s.longLink}</span>}
              </span>
            </div>
          </section>
        )}

        {/* Divider */}
        {showEditor && showPreview && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={s.resize}
            aria-valuenow={settings.split}
            aria-valuemin={20}
            aria-valuemax={80}
            tabIndex={0}
            onPointerDown={onDividerPointerDown}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") updateSettings({ split: Math.max(20, settings.split - 5) });
              if (e.key === "ArrowRight") updateSettings({ split: Math.min(80, settings.split + 5) });
            }}
            className={`group relative hidden w-1.5 shrink-0 cursor-col-resize bg-[var(--pg-border)] hover:bg-[#138A9A] md:block ${
              dragging ? "bg-[#138A9A]" : ""
            } ${focusRing}`}
          >
            <span className="absolute inset-y-0 -left-1.5 -right-1.5" aria-hidden="true" />
          </div>
        )}

        {/* Preview + console */}
        {showPreview && (
          <section
            aria-label={s.preview}
            className={`${mobileView === "preview" ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col md:flex`}
          >
            <div className="flex items-center gap-1 border-b border-[var(--pg-border)] bg-[var(--pg-panel)] px-3 py-1.5">
              <span className="mr-auto flex items-center gap-2 text-sm font-semibold">
                <span className="text-[#138A9A]">
                  <Icon name="eye" />
                </span>
                {s.preview}
                {deviceWidth && <span className="font-normal text-[var(--pg-muted)]">{deviceWidth}px</span>}
              </span>
              <div className="mr-1 hidden items-center gap-0.5 rounded-lg border border-[var(--pg-border)] p-0.5 sm:flex" role="group" aria-label="Screen size">
                <IconButton icon="monitor" label={s.desktop} active={device === "desktop"} onClick={() => setDevice("desktop")} />
                <IconButton icon="tablet" label={s.tablet} active={device === "tablet"} onClick={() => setDevice("tablet")} />
                <IconButton icon="phone" label={s.mobile} active={device === "phone"} onClick={() => setDevice("phone")} />
              </div>
              <IconButton icon="refresh" label={s.refresh} onClick={() => files && run(files)} />
              <IconButton icon="external" label={s.openTab} onClick={onOpenTab} />
              <span className="hidden md:inline-flex">
                <IconButton
                  icon={expanded === "preview" ? "minimize" : "maximize"}
                  label={expanded === "preview" ? s.exitExpand : s.expand}
                  onClick={() => setExpanded(expanded === "preview" ? null : "preview")}
                />
              </span>
              {!expanded && (
                <span className="hidden md:inline-flex">
                  <IconButton icon="chevronRight" label={s.hidePreview} onClick={() => setPreviewHidden(true)} />
                </span>
              )}
            </div>

            <div className={`flex min-h-0 flex-1 justify-center overflow-auto ${deviceWidth ? "bg-[var(--pg-stage)] p-3" : "bg-white"}`}>
              <iframe
                ref={iframeRef}
                key={preview.runId}
                title={s.previewTitle}
                srcDoc={preview.doc}
                sandbox="allow-scripts allow-modals allow-forms allow-pointer-lock"
                style={deviceWidth ? { width: deviceWidth, maxWidth: "100%" } : undefined}
                className={`h-full w-full shrink-0 border-0 bg-white ${deviceWidth ? "rounded-lg shadow-xl ring-1 ring-black/10" : ""} ${
                  dragging ? "pointer-events-none" : ""
                }`}
              />
            </div>

            {/* Console */}
            <div
              className={`flex flex-col border-t border-[var(--pg-border)] bg-[var(--pg-panel)] ${
                consoleSize === "expanded" ? "h-[55%]" : consoleSize === "open" ? "h-44" : ""
              }`}
            >
              <div className="flex items-center gap-1 px-3 py-1">
                <button
                  type="button"
                  onClick={() => setConsoleSize(consoleSize === "collapsed" ? "open" : "collapsed")}
                  aria-expanded={consoleSize !== "collapsed"}
                  className={`mr-auto flex items-center gap-2 rounded py-1 text-sm font-semibold ${focusRing}`}
                >
                  <span style={{ color: dark ? "#B79CFF" : "#6E43A8" }}>
                    <Icon name="terminal" />
                  </span>
                  {s.console}
                  {errorCount > 0 && (
                    <span className="rounded bg-red-500 px-1.5 text-xs font-bold text-white">{s.errors(errorCount)}</span>
                  )}
                  {errorCount === 0 && logs.length > 0 && (
                    <span className="rounded bg-[var(--pg-hover)] px-1.5 text-xs text-[var(--pg-muted)]">{logs.length}</span>
                  )}
                </button>
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLogs([])}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-[var(--pg-muted)] hover:bg-[var(--pg-hover)] hover:text-[var(--pg-text)] ${focusRing}`}
                  >
                    <Icon name="eraser" />
                    {s.clear}
                  </button>
                )}
                {consoleSize !== "collapsed" && (
                  <IconButton
                    icon={consoleSize === "expanded" ? "minimize" : "maximize"}
                    label={consoleSize === "expanded" ? s.shrinkConsole : s.expandConsole}
                    onClick={() => setConsoleSize(consoleSize === "expanded" ? "open" : "expanded")}
                  />
                )}
                <IconButton
                  icon={consoleSize === "collapsed" ? "chevronUp" : "chevronDown"}
                  label={consoleSize === "collapsed" ? s.openConsole : s.collapseConsole}
                  onClick={() => setConsoleSize(consoleSize === "collapsed" ? "open" : "collapsed")}
                />
              </div>
              {consoleSize !== "collapsed" && (
                <div role="log" aria-live="polite" className="min-h-0 flex-1 overflow-auto px-3 pb-2 font-mono text-[13px] leading-5">
                  {logs.length === 0 ? (
                    <p className="pt-1 font-sans text-sm text-[var(--pg-muted)]">
                      {s.consoleEmptyBefore}{" "}
                      <code className="rounded bg-[var(--pg-hover)] px-1.5 py-0.5 font-mono text-[var(--pg-text)]">console.log(&quot;Hello&quot;)</code>{" "}
                      {s.consoleEmptyAfter}
                    </p>
                  ) : (
                    logs.map((l, i) => {
                      const tone =
                        l.level === "error"
                          ? "border-l-red-500 bg-red-500/10 text-red-600"
                          : l.level === "warn"
                            ? "border-l-[#F4D734] bg-[#F4D734]/10"
                            : "border-l-transparent";
                      const text = (
                        <pre className="whitespace-pre-wrap break-words font-mono" style={l.level === "error" && dark ? { color: "#FF9AA2" } : undefined}>
                          {l.text}
                        </pre>
                      );
                      return (
                        <div key={i} className={`flex items-start gap-2 border-b border-l-2 border-b-[var(--pg-border)] py-1 pl-2 ${tone}`}>
                          <div className="min-w-0 flex-1">{text}</div>
                          {l.line && (
                            <button
                              type="button"
                              onClick={() => goToLine(l.line!)}
                              title={s.goToLine(l.line)}
                              className={`shrink-0 rounded px-1.5 font-sans text-xs font-semibold text-[#138A9A] underline-offset-2 hover:underline ${focusRing}`}
                            >
                              script.js:{l.line}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Re-open a hidden preview */}
        {previewHidden && !expanded && (
          <button
            type="button"
            onClick={() => setPreviewHidden(false)}
            title={s.showPreview}
            className={`absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-1 rounded-l-lg bg-[#138A9A] px-2 py-3 text-white shadow-lg md:flex ${focusRing}`}
          >
            <Icon name="chevronLeft" />
            <span className="sr-only">{s.showPreview}</span>
            <Icon name="eye" />
          </button>
        )}
      </div>

      {toast && (
        <div role="status" className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#138A9A] px-4 py-2 text-sm font-semibold text-white shadow-xl">
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-[#001532] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#138A9A] text-white">
                <Icon name={share.copied ? "check" : "link"} className="h-5 w-5" />
              </span>
              <h2 id="share-title" className="font-display text-xl font-extrabold">
                {share.copied ? s.linkCopied : s.yourLink}
              </h2>
            </div>
            <p className="mt-3 text-sm text-[#2E3440]">{s.shareBody}</p>
            <input
              ref={shareInputRef}
              readOnly
              value={share.url}
              aria-label={s.projectLink}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            />
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setShare(null)}
                className={`inline-flex h-10 items-center rounded-lg bg-[#001532] px-5 text-sm font-bold text-white ${focusRing}`}
              >
                {s.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
