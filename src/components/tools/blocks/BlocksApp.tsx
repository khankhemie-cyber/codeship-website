"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "../launchpad/icons";
import { playPop, playRecording, setUpMic, stopAllSounds, unlockAudio, micError } from "./audio";
import type { LabelMode } from "./blockDefs";
import type { EditorApi } from "./BlocksEditor";
import { BACKGROUNDS, COSTUMES, costumeUrl } from "./costumes";
import { Engine } from "./engine";
import { createProjectLink, downloadProject, projectFileName, readAutosave, readProjectFile, readProjectLink, writeAutosave } from "./files";
import { STRINGS, type UiLang } from "./i18n";
import { GRID_COLS, GRID_ROWS, newId, emptyScripts, starterProject, type Project, type Recording, type Scripts } from "./model";
import RecorderPanel from "./RecorderPanel";
import Stage from "./Stage";

/**
 * CODEship Blocks (/tools/blocks): visual block coding for the Explorers
 * programme (ages 5–7). Children build with pictures; the instructor does
 * all saving, typing and settings.
 *
 * See model.ts (project format), engine.ts (how blocks run), files.ts
 * (where work lives) and blockDefs.ts (the twenty blocks).
 */

const BlocksEditor = dynamic(() => import("./BlocksEditor"), {
  ssr: false,
  loading: () => <div className="h-full bg-[#F4F7FB]" aria-hidden="true" />,
});

const SETTINGS_KEY = "codeship-blocks-settings";
const AUTOSAVE_DELAY = 2000;

// Navy text on gold and pale blocks (their fields are tagged in BlocksEditor),
// and a flash on the "Blocks for" bar whenever the selected character changes.
const PAGE_CSS = `
.cb-dark-text text.blocklyText { fill: #010F2A !important; }
.blocklyText { font-weight: 700; }
@keyframes cb-flash { 0% { background-color: #D58401; } 100% { background-color: #0A2648; } }
`;

type Settings = { lang: UiLang; mode: LabelMode; semester: number };
type SaveState = { kind: "none" } | { kind: "link" } | { kind: "file" } | { kind: "saved"; at: number } | { kind: "failed" };
type LinkDialog = { url: string; copied: boolean } | { error: string } | null;

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010F2A]";
const toolBtn = `inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40 ${focusRing}`;

function clock(ms: number) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function ToolButton({ icon, label, onClick, testId, hideLabel }: { icon: IconName; label: string; onClick: () => void; testId?: string; hideLabel?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} data-testid={testId} className={toolBtn}>
      <Icon name={icon} className="h-5 w-5" />
      <span aria-hidden="true" className={hideLabel ? "hidden xl:inline" : "hidden md:inline"}>
        {label}
      </span>
    </button>
  );
}

function readSettings(): Settings {
  const fallback: Settings = { lang: navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en", mode: "words", semester: 0 };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

export default function BlocksApp() {
  const projectRef = useRef<Project | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [, setVersion] = useState(0);
  const [, setFrame] = useState(0);
  const [settings, setSettings] = useState<Settings>({ lang: "en", mode: "words", semester: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>({ kind: "none" });
  const [recordFor, setRecordFor] = useState<{ blockId: string; clipId: string | null } | null>(null);
  const [menu, setMenu] = useState<"settings" | "addCharacter" | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [linkDialog, setLinkDialog] = useState<LinkDialog>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const editorApi = useRef<EditorApi | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef(0);
  const skipAutosave = useRef(true);
  const frameRequested = useRef(false);
  const lastPage = useRef(0);

  const s = STRINGS[settings.lang];
  const project = projectRef.current;
  const engine = engineRef.current;
  const bump = () => setVersion((v) => v + 1);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 2200);
  };

  // ── Settings (per device) ──
  useEffect(() => setSettings(readSettings()), []);
  const updateSettings = (patch: Partial<Settings>) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  useEffect(() => {
    document.documentElement.lang = settings.lang;
  }, [settings.lang]);

  // ── Project + engine ──
  const pickActor = useCallback((pageIndex: number, preferCharacter?: string) => {
    const actors = projectRef.current?.pages[pageIndex]?.actors ?? [];
    const match = preferCharacter ? actors.find((a) => a.characterId === preferCharacter) : undefined;
    setSelectedId((match ?? actors[0])?.id ?? null);
  }, []);

  const loadProject = useCallback(
    (p: Project) => {
      engineRef.current?.stopAll();
      stopAllSounds();
      projectRef.current = p;
      engineRef.current = new Engine(
        p,
        {
          sound: () => playPop(),
          playRecording: (id) => {
            const rec = projectRef.current?.recordings[id];
            if (!rec) return 0;
            playRecording(id, rec);
            return rec.durationMs;
          },
          changed: () => {
            if (frameRequested.current) return;
            frameRequested.current = true;
            requestAnimationFrame(() => {
              frameRequested.current = false;
              setFrame((f) => f + 1);
            });
          },
        },
        performance.now(),
      );
      lastPage.current = 0;
      pickActor(0);
      bump();
    },
    [pickActor],
  );

  // Load: a link first, then this computer's autosave, then a fresh project.
  useEffect(() => {
    (async () => {
      let p: Project | null = null;
      try {
        p = await readProjectLink(window.location.hash);
        if (p) setSave({ kind: "link" });
      } catch {
        setNotice(STRINGS.en.brokenLink);
      }
      if (!p) {
        const saved = await readAutosave();
        if (saved) {
          p = saved.project;
          setSave({ kind: "saved", at: saved.savedAt });
        }
      }
      loadProject(p ?? starterProject());
    })();
  }, [loadProject]);

  useEffect(() => {
    const onHash = async () => {
      try {
        const p = await readProjectLink(window.location.hash);
        if (p) {
          skipAutosave.current = true;
          setSave({ kind: "link" });
          loadProject(p);
        }
      } catch {
        setNotice(STRINGS[settings.lang].brokenLink);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [loadProject, settings.lang]);

  // Drive the engine with real time.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const e = engineRef.current;
      if (e) {
        e.tick(performance.now());
        if (e.page !== lastPage.current) {
          // A Go to Page / Go Home: follow it in the building area too.
          const prevChar = projectRef.current?.pages[lastPage.current]?.actors.find((a) => a.id === selectedIdRef.current)?.characterId;
          lastPage.current = e.page;
          pickActor(e.page, prevChar);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pickActor]);
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  // ── Saving ──
  const saveNow = useCallback(async () => {
    window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = 0;
    if (!projectRef.current) return;
    const at = await writeAutosave(projectRef.current);
    setSave(at === null ? { kind: "failed" } : { kind: "saved", at });
  }, []);

  const edited = useCallback(() => {
    skipAutosave.current = false;
    window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(saveNow, AUTOSAVE_DELAY);
    bump();
  }, [saveNow]);

  useEffect(() => {
    const onHide = () => {
      if (autosaveTimer.current && !skipAutosave.current) saveNow();
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [saveNow]);

  const onSaveFile = () => {
    if (!projectRef.current) return;
    downloadProject(projectRef.current);
    showToast(projectFileName(projectRef.current));
    if (!skipAutosave.current) saveNow();
  };

  const openFile = async (file: File) => {
    let p: Project;
    try {
      p = await readProjectFile(file);
    } catch {
      setNotice(s.notAProject);
      return;
    }
    const cur = projectRef.current;
    const hasWork = cur && cur.pages.some((pg) => pg.actors.some((a) => (a.scripts.blocks?.blocks?.length ?? 0) > 0));
    if (hasWork && !window.confirm(s.openConfirm)) return;
    skipAutosave.current = true;
    setSave({ kind: "file" });
    loadProject(p);
  };

  const onCopyLink = async () => {
    if (!projectRef.current) return;
    const r = await createProjectLink(projectRef.current, `${location.origin}${location.pathname}`);
    if (!r.ok) {
      setLinkDialog({ error: r.reason === "recordings" ? s.linkHasRecordings : s.linkTooBig });
      return;
    }
    let copied = false;
    try {
      await navigator.clipboard.writeText(r.url);
      copied = true;
    } catch {}
    setLinkDialog({ url: r.url, copied });
  };

  // ── Editing ──
  const page = project && engine ? project.pages[engine.page] : null;
  const selected = page?.actors.find((a) => a.id === selectedId) ?? null;
  const running = engine?.isRunning() ?? false;

  const onScripts = useCallback(
    (scripts: Scripts) => {
      const p = projectRef.current;
      const e = engineRef.current;
      const actor = p && e ? p.pages[e.page]?.actors.find((a) => a.id === selectedIdRef.current) : null;
      if (!actor) return;
      actor.scripts = scripts;
      edited();
    },
    [edited],
  );

  const onRecorded = (rec: Recording) => {
    const p = projectRef.current;
    if (!p || !recordFor) return;
    const id = newId("r");
    p.recordings[id] = rec;
    editorApi.current?.setClip(recordFor.blockId, id);
    setRecordFor({ ...recordFor, clipId: id });
    edited();
  };

  const selectActor = (id: string) => {
    if (id !== selectedId) setSelectedId(id);
    setArmed(null);
  };

  const goToPage = (i: number) => {
    if (!engine || !project) return;
    stopAllSounds();
    const prevChar = selected?.characterId;
    engine.showPage(i);
    lastPage.current = engine.page;
    pickActor(engine.page, prevChar);
    setArmed(null);
    bump();
  };

  const addPage = () => {
    if (!project) return;
    project.pages.push({ id: newId("p"), background: "grass", actors: [] });
    edited();
    goToPage(project.pages.length - 1);
  };

  const removePage = (i: number) => {
    if (!project || i === 0) return;
    if (armed !== `page:${i}`) return setArmed(`page:${i}`);
    project.pages.splice(i, 1);
    edited();
    goToPage(Math.min(i, project.pages.length - 1));
  };

  const freeSquare = () => {
    const taken = new Set(page?.actors.map((a) => `${a.x},${a.y}`));
    for (let y = 1; y < GRID_ROWS; y++) for (let x = 1; x < GRID_COLS; x++) if (!taken.has(`${x},${y}`)) return { x, y };
    return { x: 0, y: 0 };
  };

  const addActor = (characterId: string | null, costume: string) => {
    if (!project || !page || !engine) return;
    let charId = characterId;
    if (!charId) {
      charId = newId("c");
      project.characters.push({ id: charId, costume });
    }
    const actor = { id: newId("a"), characterId: charId, ...freeSquare(), scripts: emptyScripts() };
    page.actors.push(actor);
    engine.stopAll();
    engine.resetPage();
    setSelectedId(actor.id);
    setMenu(null);
    edited();
  };

  const removeActor = (id: string) => {
    if (!project || !page || !engine) return;
    if (armed !== `actor:${id}`) return setArmed(`actor:${id}`);
    const actor = page.actors.find((a) => a.id === id);
    page.actors = page.actors.filter((a) => a.id !== id);
    if (actor && !project.pages.some((pg) => pg.actors.some((a) => a.characterId === actor.characterId))) {
      project.characters = project.characters.filter((c) => c.id !== actor.characterId);
    }
    engine.stopAll();
    engine.resetPage();
    setArmed(null);
    pickActor(engine.page);
    edited();
  };

  const onTap = (id: string) => {
    unlockAudio();
    selectActor(id);
    engine?.tap(id);
  };

  const onPlace = (id: string, x: number, y: number) => {
    const actor = page?.actors.find((a) => a.id === id);
    if (!actor || !engine) return;
    actor.x = x;
    actor.y = y;
    engine.resetPage();
    edited();
  };

  const onGreenFlag = () => {
    unlockAudio();
    stopAllSounds();
    engine?.greenFlag();
  };
  const onStop = () => {
    stopAllSounds();
    engine?.stopAll();
  };

  const onMicSetup = async () => {
    setMenu(null);
    try {
      await setUpMic();
      setNotice(s.micReady);
    } catch (err) {
      const e = micError(err);
      setNotice(e.kind === "blocked" ? s.micBlocked : e.kind === "missing" ? s.micMissing : s.micFailed(e.detail));
    }
  };

  // Close menus on outside tap / Escape.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => !(e.target as Element).closest("[data-menu]") && setMenu(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const clipKey = Object.keys(project?.recordings ?? {}).sort().join(",");
  const clipIds = useMemo(() => new Set(clipKey ? clipKey.split(",") : []), [clipKey]);

  // Exposed for the acceptance tests (scripts/blocks/test-blocks-e2e.mjs).
  useEffect(() => {
    (window as unknown as { __codeshipBlocks?: object }).__codeshipBlocks = {
      project: () => projectRef.current,
      engine: () => engineRef.current,
    };
  }, []);

  const saveText =
    save.kind === "saved"
      ? s.savedHere(clock(save.at))
      : save.kind === "failed"
        ? s.saveFailed
        : save.kind === "link"
          ? s.openedFromLink
          : save.kind === "file"
            ? s.openedFromFile
            : s.notSavedYet;

  const costumeOfActor = (characterId: string) => project?.characters.find((c) => c.id === characterId)?.costume ?? "robot";
  const otherCharacters = project?.characters.filter((c) => !page?.actors.some((a) => a.characterId === c.id)) ?? [];
  const recordingClip = recordFor?.clipId && project?.recordings[recordFor.clipId] ? { id: recordFor.clipId, rec: project.recordings[recordFor.clipId] } : null;

  return (
    <div
      className="flex min-h-[100dvh] flex-col bg-[#010F2A] text-white md:h-[100dvh]"
      onPointerDownCapture={unlockAudio}
      onDragOver={(e) => {
        if (!Array.from(e.dataTransfer.types).includes("Files")) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragOver(false)}
      onDrop={(e) => {
        if (!Array.from(e.dataTransfer.types).includes("Files")) return;
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) openFile(f);
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      {/* ───────── Top bar ───────── */}
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#012C61] px-3 py-2">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
          <span className="block h-8 w-7 bg-no-repeat" style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }} />
        </span>
        <h1 className="mr-1 font-display text-lg font-extrabold sm:text-xl">
          CODEship <span className="text-[#D58401]">{s.title}</span>
        </h1>
        <button
          type="button"
          onClick={onGreenFlag}
          title={s.greenFlag}
          aria-label={s.greenFlag}
          data-testid="green-flag"
          className={`flex h-12 w-14 items-center justify-center rounded-xl bg-[#2EB84B] shadow active:translate-y-px ${focusRing}`}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
            <path d="M5 22V3" stroke="#010F2A" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M5 3h13l-3 4.5 3 4.5H5z" fill="#fff" stroke="#010F2A" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onStop}
          title={s.stop}
          aria-label={s.stop}
          data-testid="stop"
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[#E53935] shadow active:translate-y-px ${focusRing}`}
        >
          <span aria-hidden="true" className="block h-5 w-5 rounded-sm bg-white" />
        </button>
        <span className="mx-1 hidden h-8 w-px bg-white/15 sm:block" aria-hidden="true" />
        <ToolButton icon="undo" label={s.undo} onClick={() => editorApi.current?.undo()} testId="undo" hideLabel />
        <ToolButton icon="redo" label={s.redo} onClick={() => editorApi.current?.redo()} hideLabel />

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveFile}
            title={s.saveHint}
            aria-label={s.save}
            data-testid="save"
            className={`inline-flex h-11 items-center gap-2 rounded-lg bg-[#D58401] px-4 text-sm font-extrabold text-[#010F2A] hover:bg-[#E89512] ${focusRing}`}
          >
            <Icon name="download" className="h-5 w-5" />
            {s.save}
          </button>
          <ToolButton icon="folderOpen" label={s.open} onClick={() => fileInput.current?.click()} testId="open" />
          <ToolButton icon="link" label={s.copyLink} onClick={onCopyLink} testId="copy-link" hideLabel />
          <div className="relative" data-menu>
            <button
              type="button"
              onClick={() => setMenu(menu === "settings" ? null : "settings")}
              aria-expanded={menu === "settings"}
              aria-label={s.settings}
              title={s.settings}
              data-testid="settings"
              className={toolBtn}
            >
              <Icon name="more" className="h-5 w-5" />
            </button>
            {menu === "settings" && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-24px)] space-y-3 rounded-xl border border-white/15 bg-[#0A2648] p-4 text-sm shadow-2xl">
                <label className="block">
                  <span className="mb-1 block font-semibold text-white/80">{s.language}</span>
                  <select value={settings.lang} onChange={(e) => updateSettings({ lang: e.target.value as UiLang })} data-testid="set-lang" className="w-full rounded-md bg-white px-2 py-2 text-[#010F2A]">
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold text-white/80">{s.labels}</span>
                  <select value={settings.mode} onChange={(e) => updateSettings({ mode: e.target.value as LabelMode })} data-testid="set-mode" className="w-full rounded-md bg-white px-2 py-2 text-[#010F2A]">
                    <option value="words">{s.labelsWords}</option>
                    <option value="icons">{s.labelsIcons}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold text-white/80">{s.semester}</span>
                  <select value={settings.semester} onChange={(e) => updateSettings({ semester: Number(e.target.value) })} data-testid="set-semester" className="w-full rounded-md bg-white px-2 py-2 text-[#010F2A]">
                    <option value={0}>{s.semesterAll}</option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {s.semesterUpTo(n)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold text-white/80">{s.projectName}</span>
                  <input
                    value={project?.name ?? ""}
                    onChange={(e) => {
                      if (project) project.name = e.target.value;
                      edited();
                    }}
                    className="w-full rounded-md bg-white px-2 py-2 text-[#010F2A]"
                  />
                </label>
                <button type="button" onClick={onMicSetup} className="w-full rounded-md bg-[#035762] px-3 py-2 font-bold text-white">
                  🎤 {s.micSetup}
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            data-testid="file-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) openFile(f);
            }}
          />
        </div>
      </header>

      {notice && (
        <div role="status" className="flex items-start gap-3 bg-[#D58401] px-4 py-2 text-sm font-semibold text-[#010F2A]">
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label={s.close}>
            <Icon name="x" />
          </button>
        </div>
      )}

      {/* ───────── Workspace ───────── */}
      <main className="flex min-h-0 flex-1 flex-col-reverse md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,min(46%,600px))]">
        {/* Blocks for the selected character: the state is made loud on purpose. */}
        <section className="flex h-[70vh] min-h-[320px] flex-col md:h-auto md:min-h-0" aria-label={s.blocksFor}>
          <div key={selectedId ?? "none"} className="flex items-center gap-3 border-b-4 border-[#D58401] bg-[#0A2648] px-3 py-1.5 [animation:cb-flash_600ms_ease-out]">
            <span className="text-sm font-semibold text-white/80">{s.blocksFor}</span>
            {selected && (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 ring-4 ring-[#D58401]" data-testid="blocks-for">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={costumeUrl(costumeOfActor(selected.characterId))} alt={costumeOfActor(selected.characterId)} className="h-full w-full" />
              </span>
            )}
            <span className="ml-auto rounded-md bg-white/10 px-2 py-1 text-xs font-bold">
              {s.page} {(engine?.page ?? 0) + 1}
            </span>
            <button type="button" onClick={() => editorApi.current?.zoom(-1)} aria-label={s.zoomOut} title={s.zoomOut} className={`h-10 w-10 rounded-lg bg-white/10 text-xl font-bold ${focusRing}`}>
              −
            </button>
            <button type="button" onClick={() => editorApi.current?.zoom(1)} aria-label={s.zoomIn} title={s.zoomIn} className={`h-10 w-10 rounded-lg bg-white/10 text-xl font-bold ${focusRing}`}>
              +
            </button>
          </div>
          <div className="relative min-h-0 flex-1 border-x-4 border-[#D58401]">
            {project && selected ? (
              <BlocksEditor
                lang={settings.lang}
                mode={settings.mode}
                semester={settings.semester}
                pageCount={project.pages.length}
                actorKey={`${engine?.page}:${selected.id}`}
                scripts={selected.scripts}
                clipIds={clipIds}
                onChange={onScripts}
                onRecordBlock={(blockId, clipId) => setRecordFor({ blockId, clipId })}
                apiRef={editorApi}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#F4F7FB] p-6 text-center text-[#586173]">
                <button type="button" onClick={() => setMenu("addCharacter")} className="rounded-xl bg-[#D58401] px-5 py-3 text-base font-extrabold text-[#010F2A]">
                  + {s.addCharacter}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 bg-[#010F2A] px-3 py-1.5 text-[13px] text-white/80">
            <span className={`h-2 w-2 rounded-full ${save.kind === "saved" ? "bg-[#3CC6A8]" : "bg-white/40"}`} aria-hidden="true" />
            <span data-testid="save-status">{saveText}</span>
          </div>
        </section>

        {/* Stage, pages and characters */}
        <section className="flex min-h-0 flex-col gap-2 border-white/10 bg-[#010F2A] p-2 md:border-l">
          {/* Page tabs (for the adult; the stage itself has no way back) */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label={s.page}>
            {project?.pages.map((pg, i) => (
              <div key={pg.id} className="flex items-center">
                <button
                  type="button"
                  role="tab"
                  aria-selected={engine?.page === i}
                  data-testid={`page-tab-${i + 1}`}
                  onClick={() => goToPage(i)}
                  className={`h-10 min-w-10 rounded-lg px-3 text-sm font-extrabold ${engine?.page === i ? "bg-[#D58401] text-[#010F2A]" : "bg-white/10 text-white hover:bg-white/15"} ${focusRing}`}
                  title={i === 0 ? s.pageMap : `${s.page} ${i + 1}`}
                >
                  {i === 0 ? "1 🗺️" : i + 1}
                </button>
                {i > 0 && engine?.page === i && (
                  <button
                    type="button"
                    onClick={() => removePage(i)}
                    aria-label={s.deletePage}
                    title={armed === `page:${i}` ? s.tapAgainToRemove : s.deletePage}
                    className={`ml-0.5 h-10 rounded-lg px-2 text-xs font-bold ${armed === `page:${i}` ? "bg-[#E53935] text-white" : "text-white/60 hover:text-white"}`}
                  >
                    {armed === `page:${i}` ? s.tapAgainToRemove : "✕"}
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addPage} aria-label={s.addPage} title={s.addPage} data-testid="add-page" className={`h-10 w-10 rounded-lg border-2 border-dashed border-white/30 text-lg font-bold text-white/80 ${focusRing}`}>
              +
            </button>
            {page && (
              <select
                value={page.background}
                onChange={(e) => {
                  page.background = e.target.value;
                  edited();
                }}
                aria-label={s.background}
                title={s.background}
                className="ml-auto h-10 rounded-lg bg-white/10 px-2 text-sm text-white"
              >
                {BACKGROUNDS.map((b) => (
                  <option key={b.id} value={b.id} className="text-[#010F2A]">
                    {b.name[settings.lang]}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="relative min-h-[200px] flex-1">
            {page && engine && (
              <Stage
                background={page.background}
                actors={page.actors}
                characters={project?.characters ?? []}
                states={engine.states}
                selectedId={selectedId}
                running={running}
                onTap={onTap}
                onPlace={onPlace}
              />
            )}
          </div>

          {/* Character strip: tap to choose whose blocks you are building. */}
          <div className="flex items-center gap-2 overflow-x-auto rounded-xl bg-white/[0.06] p-2" aria-label={s.characters}>
            {page?.actors.map((a) => {
              const sel = a.id === selectedId;
              const hidden = engine?.states.get(a.id)?.visible === false;
              return (
                <div key={a.id} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => selectActor(a.id)}
                    data-testid={`pick-${a.id}`}
                    aria-pressed={sel}
                    aria-label={costumeOfActor(a.characterId)}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1 transition ${sel ? "scale-110 ring-4 ring-[#D58401]" : "opacity-80 ring-1 ring-white/30"} ${focusRing}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={costumeUrl(costumeOfActor(a.characterId))} alt="" className={`h-full w-full ${hidden ? "opacity-30" : ""}`} />
                  </button>
                  {hidden && <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-[#4E2B6F] px-1 text-[10px] font-bold">{s.hiding}</span>}
                  {sel && (
                    <button
                      type="button"
                      onClick={() => removeActor(a.id)}
                      aria-label={s.removeCharacter}
                      title={armed === `actor:${a.id}` ? s.tapAgainToRemove : s.removeCharacter}
                      className={`absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-bold ${armed === `actor:${a.id}` ? "bg-[#E53935] text-white" : "bg-[#586173] text-white"}`}
                    >
                      {armed === `actor:${a.id}` ? s.tapAgainToRemove : "✕"}
                    </button>
                  )}
                </div>
              );
            })}
            <div className="relative shrink-0" data-menu>
              <button
                type="button"
                onClick={() => setMenu(menu === "addCharacter" ? null : "addCharacter")}
                aria-label={s.addCharacter}
                title={s.addCharacter}
                data-testid="add-character"
                className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-white/40 text-2xl font-bold ${focusRing}`}
              >
                +
              </button>
              {menu === "addCharacter" && (
                <div className="fixed bottom-24 right-3 z-50 max-h-[60vh] w-80 max-w-[calc(100vw-24px)] overflow-auto rounded-xl border border-white/15 bg-[#0A2648] p-3 shadow-2xl">
                  {otherCharacters.length > 0 && (
                    <>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">{s.alsoOnOtherPages}</p>
                      <div className="mb-3 grid grid-cols-4 gap-2">
                        {otherCharacters.map((c) => (
                          <button key={c.id} type="button" onClick={() => addActor(c.id, c.costume)} className="rounded-lg bg-white p-1 ring-2 ring-[#D58401]" aria-label={c.costume}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={costumeUrl(c.costume)} alt="" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">{s.newCharacter}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {COSTUMES.map((c) => (
                      <button key={c.id} type="button" onClick={() => addActor(null, c.id)} data-testid={`costume-${c.id}`} className="rounded-lg bg-white p-1" title={c.name[settings.lang]} aria-label={c.name[settings.lang]}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={costumeUrl(c.id)} alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center border-t border-white/10 px-4 py-1.5 text-xs">
        <span className="font-display font-extrabold tracking-[0.25em] text-[#D58401]">{s.tagline}</span>
      </footer>

      {recordFor && <RecorderPanel s={s} clip={recordingClip} onRecorded={onRecorded} onClose={() => setRecordFor(null)} />}

      {linkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={() => setLinkDialog(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-[#010F2A]" onClick={(e) => e.stopPropagation()}>
            {"url" in linkDialog ? (
              <>
                <h2 className="font-display text-xl font-extrabold">{linkDialog.copied ? s.linkCopied : s.linkCopyFailed}</h2>
                <input readOnly value={linkDialog.url} data-testid="link-url" onFocus={(e) => e.currentTarget.select()} className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs" />
              </>
            ) : (
              <p data-testid="link-error" className="text-base font-semibold">
                {linkDialog.error}
              </p>
            )}
            <div className="mt-5 flex justify-end">
              <button type="button" autoFocus onClick={() => setLinkDialog(null)} className="rounded-lg bg-[#010F2A] px-5 py-2.5 text-sm font-bold text-white">
                {s.done}
              </button>
            </div>
          </div>
        </div>
      )}

      {dragOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[#010F2A]/85">
          <p className="rounded-2xl border-2 border-dashed border-[#D58401] px-8 py-10 font-display text-xl font-extrabold">{s.dropToOpen}</p>
        </div>
      )}
      {toast && <div className="pointer-events-none fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#035762] px-4 py-2 text-sm font-semibold">{toast}</div>}
    </div>
  );
}
