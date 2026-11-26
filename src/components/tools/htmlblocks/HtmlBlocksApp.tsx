"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Icon } from "../launchpad/icons";
import {
  CARD_HELP,
  CARD_LABELS,
  COLOURS,
  FONT_SIZES,
  MAX_PAGES,
  MAX_TEXT,
  PREVIEW_CSS,
  ROBOTS,
  STAGES,
  VOID,
  addPage,
  linkTargets,
  moveCard,
  newCard,
  pageHtml,
  paletteFor,
  parseProject,
  placeCard,
  readabilityWarning,
  robotDataUrl,
  starterProject,
  takeCard,
  targetsFor,
  updateCard,
  type Card,
  type CardKind,
  type Page,
  type Project,
  type Stage,
  type StyleTarget,
} from "./model";

/**
 * CODEship HTML Blocks (/tools/html-blocks): Builders learners build a real
 * web page from tag cards. Each card shows its opening tag (green) and
 * closing tag (red), the words go in the middle, and the page appears live
 * next to the HTML it makes. "Pictures only" hides the adult word labels,
 * like CODEship Blocks. No accounts: each semester's page autosaves in this
 * browser, and can be saved to a file.
 *
 * Drag a card from the palette onto the page, or tap it to add it at the
 * end. Drag a card back to the palette (or press its x) to remove it.
 */

const STORE = "codeship-htmlblocks-v1";
type Labels = "words" | "icons";
type Saved = { stage: Stage; labels: Labels; projects: Partial<Record<Stage, Project>> };

const OPEN = "#15803D";
const CLOSE = "#B91C1C";
const CSS_INK = "#0F6F7C";
const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D030]";
const btn = `inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold ${focusRing}`;

const KIND_COLOUR: Record<CardKind, string> = {
  h1: "#001432",
  h2: "#12306B",
  p: "#2563A8",
  img: "#6B3FA0",
  ul: "#0F6F7C",
  li: "#0A8A99",
  a: "#B45309",
  style: "#8A6D00",
};

// ---------------------------------------------------------------- pictures for each card

const ICONS: Record<CardKind, ReactNode> = {
  h1: <path d="M4 5h16M12 5v15M8 20h8" strokeWidth="3" />,
  h2: <path d="M6 8h12M12 8v11M9 19h6" strokeWidth="2.4" />,
  p: <path d="M4 6h16M4 10h16M4 14h16M4 18h10" />,
  img: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m4 19 6-6 4 4 2-2 4 4" />
    </>
  ),
  ul: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeWidth="2.6" />,
  li: <path d="M10 12h10M5 12h.01" strokeWidth="3" />,
  a: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  style: <path d="M18 3a3 3 0 0 1 3 3c0 2-3 5-7 9l-3-3c4-4 7-9 7-9zM10 13l3 3c-1 3-3 5-7 5 0-3 1-7 4-8z" />,
};

function KindIcon({ kind, className = "h-6 w-6" }: { kind: CardKind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[kind]}
    </svg>
  );
}

/** Empty-place picture: a dashed card with an arrow dropping in, so it reads without words. */
function DropHere({ kind, big = false }: { kind: CardKind; big?: boolean }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex items-center justify-center rounded-xl border-2 border-dashed ${big ? "h-20 w-28" : "h-11 w-16"}`} style={{ borderColor: KIND_COLOUR[kind], color: KIND_COLOUR[kind] }}>
      <KindIcon kind={kind} className={big ? "h-8 w-8 opacity-60" : "h-5 w-5 opacity-60"} />
      <svg viewBox="0 0 24 24" className={`absolute ${big ? "-top-5 h-8 w-8" : "-top-4 h-6 w-6"}`} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12m-5-5 5 5 5-5" />
      </svg>
    </span>
  );
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

function Tag({ kind, close = false }: { kind: string; close?: boolean }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 font-mono text-[13px] font-bold text-white"
      style={{ background: close ? CLOSE : OPEN }}
      title={close ? "closing tag" : "opening tag"}
    >
      {close ? `</${kind}>` : `<${kind}>`}
    </span>
  );
}

// ---------------------------------------------------------------- saving

function loadSaved(): Saved {
  const fresh: Saved = { stage: 1, labels: "words", projects: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "null");
    if (!raw) return fresh;
    const projects: Saved["projects"] = {};
    for (const s of STAGES) {
      const p = parseProject(raw.projects?.[s.id]);
      if (p) projects[s.id] = { ...p, stage: s.id };
    }
    return { stage: STAGES.some((s) => s.id === raw.stage) ? raw.stage : 1, labels: raw.labels === "icons" ? "icons" : "words", projects };
  } catch {
    return fresh;
  }
}

// ---------------------------------------------------------------- the app

type Target = { zone: "body" | "styles" | string; beforeId?: string };
type Dragging = { from: "palette"; kind: CardKind } | { from: "page"; id: string };

export default function HtmlBlocksApp() {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [savedAt, setSavedAt] = useState<string>("");
  const [dropAt, setDropAt] = useState<Target | null>(null);
  const [overPalette, setOverPalette] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const dragging = useRef<Dragging | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => setSaved(loadSaved()), []);

  const stage = saved?.stage ?? 1;
  const labels = saved?.labels ?? "words";
  const project = useMemo(() => saved?.projects[stage] ?? starterProject(stage), [saved, stage]);
  const page = project.pages[Math.min(pageIndex, project.pages.length - 1)];
  const words = labels === "words";

  const write = useCallback((next: Saved) => {
    setSaved(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
      setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    } catch {
      setSavedAt("");
      setMessage("This browser won't save here. Use Save file to keep your work.");
    }
  }, []);

  const setProject = (p: Project) => saved && write({ ...saved, projects: { ...saved.projects, [stage]: p } });
  const setPage = (pg: Page) => setProject({ ...project, pages: project.pages.map((x) => (x.id === pg.id ? pg : x)) });

  // ---- adding, moving and removing cards

  const add = (kind: CardKind, target?: Target) => {
    const card = newCard(kind, stage);
    put(page, card, target);
  };

  const put = (from: Page, card: Card, target?: Target) => {
    let index: number | undefined;
    let list: string | undefined;
    if (target && target.zone !== "body" && target.zone !== "styles") list = target.zone;
    if (target?.beforeId) {
      const container = card.kind === "style" ? from.styles : list ? from.cards.find((c) => c.id === list)?.items ?? [] : from.cards;
      const i = container.findIndex((c) => c.id === target.beforeId);
      if (i >= 0) index = i;
    } else if (list) {
      index = from.cards.find((c) => c.id === list)?.items?.length;
    }
    // A list item dropped between page cards goes into the list just above it.
    if (card.kind === "li" && !list && target?.zone === "body") {
      const until = target.beforeId ? from.cards.findIndex((c) => c.id === target.beforeId) : from.cards.length;
      list = from.cards.slice(0, until < 0 ? from.cards.length : until).filter((c) => c.kind === "ul").pop()?.id;
      index = undefined;
    }
    // Only list items go inside a list.
    if (card.kind !== "li" && card.kind !== "style" && list) {
      const i = from.cards.findIndex((c) => c.id === list);
      index = i + 1;
    }
    const r = placeCard(from, card, index, list);
    if (!r.ok) setMessage(r.message);
    else setMessage("");
    setPage(r.page);
  };

  const remove = (id: string) => {
    const r = takeCard(page, id);
    if (r) setPage(r.page);
  };

  const onDragStartPalette = (e: DragEvent, kind: CardKind) => {
    dragging.current = { from: "palette", kind };
    e.dataTransfer.setData("text/plain", kind);
    e.dataTransfer.effectAllowed = "copyMove";
  };
  const onDragStartCard = (e: DragEvent, id: string) => {
    e.stopPropagation();
    dragging.current = { from: "page", id };
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };
  const over = (e: DragEvent, target: Target) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDropAt((d) => (d && d.zone === target.zone && d.beforeId === target.beforeId ? d : target));
  };
  const drop = (e: DragEvent, target: Target) => {
    e.preventDefault();
    e.stopPropagation();
    const d = dragging.current;
    dragging.current = null;
    setDropAt(null);
    if (!d) return;
    if (d.from === "palette") return add(d.kind, target);
    if (d.id === target.beforeId) return;
    const taken = takeCard(page, d.id);
    if (!taken) return;
    if (taken.card.kind === "ul" && target.zone === taken.card.id) return;
    put(taken.page, taken.card, target);
  };
  const endDrag = () => {
    dragging.current = null;
    setDropAt(null);
    setOverPalette(false);
  };

  // ---- preview: links to the learner's own pages switch pages; nothing else navigates.

  const previewHtml = useMemo(() => pageHtml(project, page, { images: "preview" }).replace("<head>", `<head>\n<style>${PREVIEW_CSS}</style>`), [project, page]);
  const codeText = useMemo(() => pageHtml(project, page, { images: "text" }), [project, page]);

  const wirePreview = () => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    doc.addEventListener("click", (e) => {
      const a = (e.target as Element)?.closest?.("a");
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute("href");
      const i = project.pages.findIndex((p) => p.file === href);
      if (i >= 0) setPageIndex(i);
    });
  };

  // ---- files

  const download = (name: string, body: string, type: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const savePageFile = () => download(page.file, pageHtml(project, page, { images: "preview" }), "text/html");
  const saveProjectFile = () => download(`${project.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "my-website"}.htmlblocks.json`, JSON.stringify(project, null, 1), "application/json");
  const openFile = async (f: File) => {
    try {
      const p = parseProject(JSON.parse(await f.text()));
      if (!p || !saved) throw new Error();
      write({ ...saved, stage: p.stage, projects: { ...saved.projects, [p.stage]: p } });
      setPageIndex(0);
      setMessage(`Opened "${p.title}".`);
    } catch {
      setMessage("That file isn't a CODEship HTML Blocks project.");
    }
  };
  const startOver = () => {
    if (!saved || !window.confirm("Start this semester's page again? The cards on it will be removed.")) return;
    write({ ...saved, projects: { ...saved.projects, [stage]: starterProject(stage) } });
    setPageIndex(0);
  };

  // Exposed for the browser acceptance tests.
  useEffect(() => {
    (window as unknown as { __htmlBlocks?: object }).__htmlBlocks = { project: () => project, code: () => codeText };
  }, [project, codeText]);

  if (!saved) return <div className="min-h-[100dvh] bg-[#001432]" aria-busy="true" />;

  const palette = paletteFor(stage);
  const targets = linkTargets(project);
  const styleTargets = targetsFor(stage);
  const line = (show: boolean) => (show ? <div className="my-1 h-1 rounded bg-[#F0D030]" aria-hidden="true" /> : null);

  // ---- one card on the page

  const move = (id: string, by: -1 | 1) => {
    const r = moveCard(page, id, by);
    setMessage(r.ok ? "" : r.message);
    if (r.ok) setPage(r.page);
  };
  // Every control is at least 44 px, for small fingers and touch screens.
  const ctl = `inline-flex h-11 w-11 items-center justify-center rounded-lg ${focusRing}`;
  const controls = (c: Card) => (
    <span className="ml-auto flex shrink-0 items-center gap-0.5">
      <button type="button" onClick={() => move(c.id, -1)} aria-label="Move up" title="Move up" data-testid="move-up" className={`${ctl} text-[#586173] hover:bg-black/5`}>
        <Icon name="chevronUp" className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => move(c.id, 1)} aria-label="Move down" title="Move down" data-testid="move-down" className={`${ctl} text-[#586173] hover:bg-black/5`}>
        <Icon name="chevronDown" className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => remove(c.id)} aria-label="Remove card" title="Remove card" className={`${ctl} text-[#B91C1C] hover:bg-red-50`}>
        <Icon name="x" className="h-5 w-5" />
      </button>
    </span>
  );

  const textInput = (c: Card) => (
    <input
      value={c.text ?? ""}
      maxLength={MAX_TEXT}
      onChange={(e) => setPage(updateCard(page, c.id, { text: e.target.value }))}
      aria-label={`${CARD_LABELS[c.kind]} words`}
      data-testid={`text-${c.kind}`}
      className={`h-11 min-w-0 flex-1 rounded-md border border-[#C9D2DE] bg-white px-2 text-[15px] text-[#001432] ${c.kind === "h1" ? "font-extrabold" : c.kind === "h2" ? "font-bold" : ""} ${focusRing}`}
    />
  );

  const cardShell = (c: Card, body: ReactNode, zone: Target["zone"]) => (
    <div key={c.id}>
      {line(dropAt?.zone === zone && dropAt.beforeId === c.id)}
      <div
        draggable
        onDragStart={(e) => onDragStartCard(e, c.id)}
        onDragEnd={endDrag}
        onDragOver={(e) => over(e, { zone, beforeId: c.id })}
        onDrop={(e) => drop(e, { zone, beforeId: c.id })}
        data-testid={`card-${c.kind}`}
        className="flex cursor-grab flex-wrap items-center gap-2 rounded-xl border-2 bg-white px-2 py-2 shadow-sm active:cursor-grabbing"
        style={{ borderColor: KIND_COLOUR[c.kind] }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: KIND_COLOUR[c.kind] }} title={CARD_LABELS[c.kind]}>
          <KindIcon kind={c.kind} className="h-5 w-5" />
        </span>
        {words && <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#586173]">{CARD_LABELS[c.kind]}</span>}
        {body}
        {controls(c)}
      </div>
    </div>
  );

  const renderCard = (c: Card, zone: Target["zone"]): ReactNode => {
    switch (c.kind) {
      case "h1":
      case "h2":
      case "p":
      case "li":
        return cardShell(
          c,
          <>
            <Tag kind={c.kind} />
            {textInput(c)}
            <Tag kind={c.kind} close />
          </>,
          zone,
        );
      case "a":
        return cardShell(
          c,
          <>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[13px] font-bold text-white" style={{ background: OPEN }} title="opening tag">
              {"<a href=\""}
              <select
                value={c.href ?? "#"}
                onChange={(e) => setPage(updateCard(page, c.id, { href: e.target.value }))}
                aria-label="Where the link goes"
                data-testid="link-href"
                className="h-10 rounded bg-white px-1 font-mono text-[13px] text-[#001432]"
              >
                {targets.map((t) => (
                  <option key={t.href} value={t.href}>
                    {words ? t.label : t.href}
                  </option>
                ))}
              </select>
              {"\">"}
            </span>
            {textInput(c)}
            <Tag kind="a" close />
          </>,
          zone,
        );
      case "img":
        return cardShell(
          c,
          <>
            <span className="inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 font-mono text-[13px] font-bold text-white" style={{ background: OPEN }} title="opening tag (img has no closing tag)">
              {"<img>"}
            </span>
            <span className="flex flex-wrap gap-1" role="radiogroup" aria-label="Which robot picture">
              {ROBOTS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={c.image === r.id}
                  aria-label={r.alt}
                  title={r.alt}
                  onClick={() => setPage(updateCard(page, c.id, { image: r.id }))}
                  className={`h-11 w-11 overflow-hidden rounded-lg border-2 ${c.image === r.id ? "border-[#F0D030] ring-2 ring-[#001432]" : "border-transparent"} ${focusRing}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={robotDataUrl(r.id)} alt="" className="h-full w-full" />
                </button>
              ))}
            </span>
            {words && <span className="text-xs text-[#586173]">no closing tag</span>}
          </>,
          zone,
        );
      case "ul":
        return (
          <div key={c.id}>
            {line(dropAt?.zone === zone && dropAt.beforeId === c.id)}
            <div
              draggable
              onDragStart={(e) => onDragStartCard(e, c.id)}
              onDragEnd={endDrag}
              onDragOver={(e) => over(e, { zone, beforeId: c.id })}
              onDrop={(e) => drop(e, { zone, beforeId: c.id })}
              data-testid="card-ul"
              className="cursor-grab rounded-xl border-2 bg-white px-2 py-2 shadow-sm"
              style={{ borderColor: KIND_COLOUR.ul }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: KIND_COLOUR.ul }} title={CARD_LABELS.ul}>
                  <KindIcon kind="ul" className="h-5 w-5" />
                </span>
                {words && <span className="text-xs font-bold uppercase tracking-wide text-[#586173]">{CARD_LABELS.ul}</span>}
                <Tag kind="ul" />
                {controls(c)}
              </div>
              <div
                onDragOver={(e) => over(e, { zone: c.id })}
                onDrop={(e) => drop(e, { zone: c.id })}
                data-testid="list-zone"
                className="my-2 ml-6 min-h-[48px] space-y-1 rounded-lg border-2 border-dashed border-[#9FC7CC] p-2"
              >
                {(c.items ?? []).map((li) => renderCard(li, c.id))}
                {line(dropAt?.zone === c.id && !dropAt.beforeId)}
                {!(c.items ?? []).length && (
                  <p className="flex items-center gap-2 text-sm text-[#586173]">
                    <DropHere kind="li" /> {words ? "Put list items here" : ""}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => put(page, newCard("li", stage), { zone: c.id })}
                  aria-label="Add a list item to this list"
                  title="Add a list item to this list"
                  data-testid="add-li"
                  className={`inline-flex h-11 items-center gap-1 rounded-lg border-2 border-dashed px-3 text-sm font-bold ${focusRing}`}
                  style={{ borderColor: KIND_COLOUR.li, color: KIND_COLOUR.li }}
                >
                  + <KindIcon kind="li" className="h-5 w-5" /> {words ? "List item" : ""}
                </button>
              </div>
              <Tag kind="ul" close />
            </div>
          </div>
        );
      case "style":
        return cardShell(
          c,
          <span className="flex flex-wrap items-center gap-2 font-mono text-[14px]" style={{ color: CSS_INK }}>
            <select
              value={c.target}
              onChange={(e) => setPage(updateCard(page, c.id, { target: e.target.value as StyleTarget }))}
              aria-label="Which tag to style"
              data-testid="style-target"
              className="h-11 rounded border border-[#C9D2DE] bg-white px-1 font-mono font-bold"
            >
              {styleTargets.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <b>{"{"}</b>
            <span className="flex items-center gap-1">
              color:
              <span className="flex flex-wrap gap-0.5" role="radiogroup" aria-label="Colour">
                {COLOURS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    role="radio"
                    aria-checked={c.color === col.name}
                    aria-label={col.name}
                    title={col.name}
                    onClick={() => setPage(updateCard(page, c.id, { color: col.name }))}
                    className={`h-11 w-11 rounded-full border-2 ${c.color === col.name ? "border-[#001432] ring-4 ring-[#F0D030]" : "border-[#C9D2DE]"} ${focusRing}`}
                    style={{ background: col.hex }}
                  />
                ))}
              </span>
              {words && <span className="font-bold">{c.color};</span>}
            </span>
            <label className="flex items-center gap-1">
              font-size:
              <select
                value={c.fontSize}
                onChange={(e) => setPage(updateCard(page, c.id, { fontSize: Number(e.target.value) }))}
                aria-label="Font size"
                data-testid="style-size"
                className="h-11 rounded border border-[#C9D2DE] bg-white px-1 font-mono font-bold"
              >
                {FONT_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}px
                  </option>
                ))}
              </select>
              ;
            </label>
            <b>{"}"}</b>
            {readabilityWarning(c) && (
              <span role="note" data-testid="contrast-warning" title={readabilityWarning(c)!} className="flex basis-full items-center gap-2 rounded-lg bg-[#FFF4D6] px-2 py-1 font-sans text-sm font-semibold text-[#7A4B00]">
                <WarnIcon />
                {words ? readabilityWarning(c) : <span className="sr-only">{readabilityWarning(c)}</span>}
              </span>
            )}
          </span>,
          zone,
        );
    }
  };

  // ---- colour-coded HTML text

  const codeView = codeText.split("\n").map((ln, i) => {
    const parts = ln.split(/(<\/?[a-zA-Z!][^>]*>)/g).filter(Boolean);
    return (
      <div key={i}>
        {parts.map((p, k) =>
          p.startsWith("</") ? (
            <span key={k} style={{ color: "#FF8A80" }}>{p}</span>
          ) : p.startsWith("<!") ? (
            <span key={k} className="text-white/50">{p}</span>
          ) : p.startsWith("<") ? (
            <span key={k} style={{ color: "#7EE2A0" }}>{p}</span>
          ) : /^\s+[a-z0-9-]+:|^\s+[a-z0-9]+ \{|^\s+\}$/.test(p) ? (
            <span key={k} style={{ color: "#7FD7E0" }}>{p}</span>
          ) : (
            <span key={k}>{p}</span>
          ),
        )}
        {"\n"}
      </div>
    );
  });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F4F7FB] text-[#001432] lg:h-[100dvh]" onDragEnd={endDrag}>
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#001432] px-3 py-2 text-white">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
          <span className="block h-8 w-7 bg-no-repeat" style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }} />
        </span>
        <h1 className="font-display text-lg font-extrabold sm:text-xl">
          CODEship <span className="text-[#F0D030]">HTML Blocks</span>
        </h1>
        <label className="ml-2 flex items-center gap-2 text-sm font-semibold">
          <span className="hidden sm:inline">Builders</span>
          <select
            value={stage}
            onChange={(e) => {
              write({ ...saved, stage: Number(e.target.value) as Stage });
              setPageIndex(0);
              setMessage("");
            }}
            data-testid="set-stage"
            aria-label="Semester"
            className="h-11 rounded-md bg-white px-2 text-[#001432]"
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}: {s.project}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold" title="Block labels (for the adult)">
          <span className="hidden md:inline">Labels</span>
          <select value={labels} onChange={(e) => write({ ...saved, labels: e.target.value === "icons" ? "icons" : "words" })} data-testid="set-labels" aria-label="Card labels" className="h-11 rounded-md bg-white px-2 text-[#001432]">
            <option value="words">Pictures and words</option>
            <option value="icons">Pictures only</option>
          </select>
        </label>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="hidden text-xs text-white/60 xl:inline" data-testid="saved-at">
            {savedAt ? `Saved on this computer · ${savedAt}` : "Saves on this computer as you work"}
          </span>
          <button type="button" onClick={savePageFile} className={`${btn} bg-[#F0D030] text-[#001432] hover:bg-[#F5DD55]`} title="Download this page as an .html file">
            <Icon name="download" className="h-5 w-5" /> <span className="hidden sm:inline">Download page</span>
          </button>
          <button type="button" onClick={saveProjectFile} className={`${btn} bg-white/10 hover:bg-white/20`} title="Save the whole project to a file">
            Save file
          </button>
          <button type="button" onClick={() => fileInput.current?.click()} className={`${btn} bg-white/10 hover:bg-white/20`} aria-label="Open a saved file" title="Open a saved file">
            <Icon name="folderOpen" className="h-5 w-5" />
          </button>
          <button type="button" onClick={startOver} className={`${btn} bg-white/10 hover:bg-white/20`} aria-label="Start over" title="Start over">
            <Icon name="restart" className="h-5 w-5" />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) openFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      {message && (
        <div role="status" className="flex items-start gap-3 bg-[#F0D030] px-4 py-2 text-sm font-semibold text-[#001432]">
          <span className="flex-1">{message}</span>
          <button type="button" onClick={() => setMessage("")} aria-label="Close message">
            <Icon name="x" />
          </button>
        </div>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* Palette: drag a card onto the page, or tap it. Drop a page card here to remove it. */}
        <aside
          aria-label="Tag cards"
          onDragOver={(e) => {
            if (dragging.current?.from !== "page") return;
            e.preventDefault();
            setOverPalette(true);
          }}
          onDragLeave={() => setOverPalette(false)}
          onDrop={(e) => {
            e.preventDefault();
            const d = dragging.current;
            endDrag();
            if (d?.from === "page") remove(d.id);
          }}
          className={`border-b border-[#DFE3EB] bg-white p-3 lg:overflow-auto lg:border-b-0 lg:border-r ${overPalette ? "bg-red-50" : ""}`}
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#586173]">{words ? "Tag cards: drag or tap" : ""}</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1" data-testid="palette">
            {palette.map((kind) => (
              <button
                key={kind}
                type="button"
                draggable
                onDragStart={(e) => onDragStartPalette(e, kind)}
                onDragEnd={endDrag}
                onClick={() => add(kind)}
                title={`${CARD_LABELS[kind]}: ${CARD_HELP[kind]}`}
                aria-label={`Add ${CARD_LABELS[kind]}`}
                data-testid={`palette-${kind}`}
                className={`flex items-center gap-2 rounded-xl border-2 bg-white px-2 py-2 text-left shadow-sm hover:-translate-y-px ${focusRing}`}
                style={{ borderColor: KIND_COLOUR[kind] }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: KIND_COLOUR[kind] }}>
                  <KindIcon kind={kind} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  {words && <span className="text-sm font-extrabold leading-tight">{CARD_LABELS[kind]}</span>}
                  <span className="flex flex-wrap gap-1">
                    {kind === "style" ? (
                      <span className="font-mono text-[13px] font-bold" style={{ color: CSS_INK }}>
                        {"h1 { color }"}
                      </span>
                    ) : (
                      <>
                        <Tag kind={kind} />
                        {!VOID.includes(kind) && <Tag kind={kind} close />}
                      </>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {overPalette && <p className="mt-3 text-sm font-bold text-[#B91C1C]">Let go to remove the card</p>}
          <p className="mt-4 text-xs leading-snug text-[#586173]">
            <span className="font-bold" style={{ color: OPEN }}>Green</span> tags open. <span className="font-bold" style={{ color: CLOSE }}>Red</span> tags close.
          </p>
        </aside>

        {/* The page being built */}
        <section aria-label="My page" className="flex min-h-[360px] flex-col lg:min-h-0 lg:overflow-auto">
          {stage === 5 && (
            <div className="flex flex-wrap items-center gap-1 border-b border-[#DFE3EB] bg-white px-3 pt-2" role="tablist" aria-label="Pages">
              {project.pages.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === pageIndex}
                  onClick={() => setPageIndex(i)}
                  data-testid={`page-tab-${i}`}
                  className={`min-h-11 rounded-t-lg px-3 py-2 text-sm font-bold ${i === pageIndex ? "bg-[#F4F7FB] text-[#001432]" : "text-[#586173] hover:text-[#001432]"} ${focusRing}`}
                >
                  {p.name} <span className="font-mono text-xs font-normal text-[#586173]">{p.file}</span>
                </button>
              ))}
              {project.pages.length < MAX_PAGES && (
                <button type="button" onClick={() => setProject(addPage(project))} className={`ml-1 h-11 rounded-lg px-3 text-sm font-bold text-[#0F6F7C] hover:bg-[#E6F4F5] ${focusRing}`}>
                  + Page
                </button>
              )}
            </div>
          )}
          <div className="flex-1 space-y-3 p-3">
            {stage >= 2 && (
              <div
                onDragOver={(e) => over(e, { zone: "styles" })}
                onDrop={(e) => drop(e, { zone: "styles" })}
                data-testid="style-zone"
                className="rounded-xl border-2 border-dashed border-[#E5D27A] bg-[#FFFBEA] p-2"
              >
                <Tag kind="style" />
                <div className="my-2 ml-4 space-y-1">
                  {page.styles.map((s) => renderCard(s, "styles"))}
                  {line(dropAt?.zone === "styles" && !dropAt.beforeId)}
                  {!page.styles.length && (
                    <p className="flex items-center gap-2 text-sm text-[#8A6D00]">
                      <DropHere kind="style" /> {words ? "Style (CSS) cards go here" : ""}
                    </p>
                  )}
                </div>
                <Tag kind="style" close />
              </div>
            )}
            <div
              onDragOver={(e) => over(e, { zone: "body" })}
              onDrop={(e) => drop(e, { zone: "body" })}
              data-testid="body-zone"
              className="min-h-[200px] rounded-xl border-2 border-dashed border-[#9FB0C8] bg-white/60 p-2"
            >
              <Tag kind="body" />
              <div className="my-2 ml-4 space-y-2">
                {page.cards.map((c) => renderCard(c, "body"))}
                {line(dropAt?.zone === "body" && !dropAt.beforeId)}
                {!page.cards.length && (
                  <p className="flex flex-col items-center gap-2 py-6 text-center text-sm text-[#586173]">
                    <DropHere kind="p" big /> {words ? "Drag a tag card here" : ""}
                  </p>
                )}
              </div>
              <Tag kind="body" close />
            </div>
            <p className="text-xs text-[#586173]">Keep private things off your page: no last name, address, school, phone number or photos of you.</p>
          </div>
        </section>

        {/* Live page and its HTML */}
        <section aria-label="Preview" className="flex min-h-[420px] flex-col border-t border-[#DFE3EB] bg-white lg:min-h-0 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 border-b border-[#DFE3EB] px-3 py-2 text-sm font-bold">
            <Icon name="monitor" className="h-4 w-4" /> {words ? "My page" : ""} <span className="font-mono text-xs font-normal text-[#586173]">{page.file}</span>
            <button type="button" onClick={() => setShowCode((v) => !v)} aria-expanded={showCode} className={`ml-auto inline-flex h-11 items-center gap-1 rounded-md px-3 text-xs hover:bg-black/5 ${focusRing}`}>
              <Icon name="code" className="h-4 w-4" /> {showCode ? "Hide" : "Show"} HTML
            </button>
          </div>
          <iframe ref={frame} title="Live preview of my page" sandbox="allow-same-origin" srcDoc={previewHtml} onLoad={wirePreview} className="min-h-[220px] w-full flex-1 bg-white" data-testid="preview" />
          {showCode && (
            <pre aria-label="HTML code" data-testid="code" className="max-h-[45%] min-h-[160px] overflow-auto bg-[#001432] px-4 py-3 font-mono text-[13px] leading-relaxed text-white">
              {codeView}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}
