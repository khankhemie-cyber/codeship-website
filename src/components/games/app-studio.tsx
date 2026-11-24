"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EMOJIS,
  HELPERS,
  MISSIONS,
  OPS,
  PALETTE,
  THEMES,
  applyActions,
  createProject,
  evalCondition,
  exportHtml,
  generateScript,
  initialState,
  interpolate,
  newComp,
  toIdentifier,
  display,
  type Action,
  type AppProject,
  type AppVar,
  type Comp,
  type CompType,
  type Mission,
  type Op,
  type State,
  type VarType,
} from "@/lib/games/studio";
import { addXp, completeLevel, earnBadge, starsFor, useProgress } from "@/lib/games/progress";
import { ArcadeTopBar, Confetti, Modal, Pill, RewardLayer, Stars, celebrate } from "./arcade-kit";
import { highlight } from "./code-editor";
import { LockBadge, UnlockModal, useLevelAccess } from "./level-lock";
import { Art, ArtText } from "./art";

const STORE = "codeship-app-studio-v1";
const HELPER_NAMES = ["clearScreen", "addTitle", "addText", "addPicture", "addButton", "addTextBox", "addList", "addMeter", "addDivider", "randomNumber", "showMessage", "render"];

function loadProjects(): AppProject[] {
  try {
    const raw = window.localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as AppProject[]) : [];
  } catch {
    return [];
  }
}
function saveProjects(p: AppProject[]) {
  try {
    window.localStorage.setItem(STORE, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function missionDone(m: Mission, projects: AppProject[]) {
  return projects.some((p) => p.missionId === m.id && m.goals.every((g) => p.doneGoals.includes(g.id)));
}

/* ------------------------------------------------------------------ */
/* Phone preview                                                        */
/* ------------------------------------------------------------------ */

const SIZE_TITLE = { s: "text-xl", m: "text-2xl", l: "text-[32px]" };
const SIZE_TEXT = { s: "text-sm", m: "text-base", l: "text-xl font-bold" };
const SIZE_EMOJI = { s: "text-4xl", m: "text-6xl", l: "text-[96px]" };

function CompView({
  comp,
  app,
  state,
  playing,
  onTap,
  onType,
}: {
  comp: Comp;
  app: AppProject;
  state: State;
  playing: boolean;
  onTap: (c: Comp) => void;
  onType: (name: string, value: string) => void;
}) {
  const fg = app.dark ? "text-white" : "text-[#1f2336]";
  const align = comp.align === "left" ? "text-left" : "text-center";
  switch (comp.type) {
    case "heading":
      return <h2 className={`font-extrabold leading-tight ${fg} ${align} ${SIZE_TITLE[comp.size ?? "l"]}`}>{interpolate(comp.text ?? "", state) || " "}</h2>;
    case "text":
      return <p className={`leading-relaxed ${app.dark ? "text-white/85" : "text-[#1f2336]/85"} ${align} ${SIZE_TEXT[comp.size ?? "m"]}`}>{interpolate(comp.text ?? "", state) || " "}</p>;
    case "emoji":
      return (
        <motion.div key={comp.text} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className={`text-center leading-none ${SIZE_EMOJI[comp.size ?? "l"]}`} aria-hidden>
          {comp.text}
        </motion.div>
      );
    case "button":
      return (
        <motion.button
          type="button"
          tabIndex={playing ? 0 : -1}
          whileTap={playing ? { scale: 0.94 } : undefined}
          onClick={() => playing && onTap(comp)}
          className="w-full rounded-2xl border-2 px-4 py-3 text-base font-extrabold"
          style={comp.variant === "outline" ? { borderColor: app.theme, color: app.theme } : { borderColor: app.theme, background: app.theme, color: "#fff" }}
        >
          {comp.text || "Button"}
        </motion.button>
      );
    case "input": {
      const value = comp.var ? display(state[comp.var]) : "";
      return (
        <input
          tabIndex={playing ? 0 : -1}
          readOnly={!playing}
          value={value}
          placeholder={comp.text}
          aria-label={comp.text || "Text box"}
          onChange={(e) => comp.var && onType(comp.var, e.target.value)}
          className={`w-full rounded-2xl border-2 px-4 py-3 text-base outline-none ${
            app.dark ? "border-[#3a3d5c] bg-[#1f2238] text-white placeholder:text-white/40" : "border-[#d9dbe7] bg-white text-[#1f2336]"
          }`}
          style={{ caretColor: app.theme }}
        />
      );
    }
    case "list": {
      const items = comp.var && Array.isArray(state[comp.var]) ? (state[comp.var] as string[]) : [];
      return (
        <ul className="flex flex-col gap-2">
          {items.length === 0 ? <li className={`py-2 text-center text-sm ${app.dark ? "text-white/45" : "text-[#1f2336]/45"}`}>{comp.var ? comp.text : "Pick a list variable →"}</li> : null}
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.li
                key={`${i}-${item}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${app.dark ? "bg-[#1f2238] text-white" : "bg-white text-[#1f2336]"}`}
              >
                {item}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      );
    }
    case "progress": {
      const v = comp.var ? Number(state[comp.var]) || 0 : 0;
      const pct = Math.max(0, Math.min(100, (v / (comp.max || 100)) * 100));
      return (
        <div className={`h-[18px] overflow-hidden rounded-full ${app.dark ? "bg-[#2a2d48]" : "bg-[#e6e7f0]"}`} role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={comp.max || 100}>
          <motion.div className="h-full rounded-full" style={{ background: app.theme }} animate={{ width: `${pct}%` }} />
        </div>
      );
    }
    case "divider":
      return <hr className={`border-0 border-t-2 border-dashed ${app.dark ? "border-[#3a3d5c]" : "border-[#d9dbe7]"}`} />;
  }
}

function Phone({
  app,
  state,
  playing,
  selectedId,
  onSelect,
  onTap,
  onType,
  onMove,
  onDuplicate,
  onDelete,
  toasts,
}: {
  app: AppProject;
  state: State;
  playing: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onTap: (c: Comp) => void;
  onType: (name: string, value: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  toasts: { id: number; text: string }[];
}) {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const d = new Date();
    setTime(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`);
  }, []);

  return (
    <div className="keep-dark relative mx-auto w-full max-w-[360px]">
      <div className="rounded-[44px] border-[10px] border-[#0b0c16] bg-[#0b0c16] shadow-[0_40px_100px_-30px_rgba(63,81,181,0.75),0_0_0_2px_rgba(255,255,255,0.08)]">
        <div className={`relative h-[540px] overflow-hidden rounded-[34px] sm:h-[600px] ${app.dark ? "bg-[#14162a]" : "bg-[#f7f7fb]"}`}>
          {/* status bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-2 text-[11px] font-bold text-white">
            <span>{time}</span>
            <span className="absolute left-1/2 top-1.5 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            <span>●●● 🔋</span>
          </div>
          <div className="flex items-center gap-2 px-5 pb-3 pt-9 text-white" style={{ background: app.theme }}>
            <span className="text-xl" aria-hidden>
              {app.icon}
            </span>
            <span className="truncate text-lg font-extrabold">{app.name || "My App"}</span>
          </div>
          <div className="h-[calc(100%-76px)] overflow-y-auto px-4 pb-16 pt-4" onClick={() => !playing && onSelect(null)}>
            {app.comps.length === 0 ? (
              <div className={`mt-20 text-center text-sm ${app.dark ? "text-white/40" : "text-[#1f2336]/40"}`}>
                <Art e="📱" size={56} className="mx-auto" />
                <p className="mt-2">Your app is empty.<br />Add blocks from the left!</p>
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              {app.comps.map((c, i) => {
                const visible = !c.showIf || evalCondition(c.showIf, state);
                if (playing && !visible) return null;
                const selected = !playing && selectedId === c.id;
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    {playing ? (
                      <CompView comp={c} app={app} state={state} playing onTap={onTap} onType={onType} />
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${c.type}${c.text ? `: ${c.text}` : ""}`}
                        aria-pressed={selected}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(c.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(c.id);
                          }
                        }}
                        className={`relative cursor-pointer rounded-xl p-1.5 outline-none transition ${
                          selected ? "ring-2 ring-amber ring-offset-2 ring-offset-transparent" : "hover:ring-2 hover:ring-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400"
                        } ${!visible ? "opacity-40" : ""}`}
                      >
                        <div className="pointer-events-none">
                          <CompView comp={c} app={app} state={state} playing={false} onTap={onTap} onType={onType} />
                        </div>
                        {c.showIf ? (
                          <span className="absolute -top-2 right-1 rounded-full bg-violet-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow">
                            if {c.showIf.var} {c.showIf.op} {c.showIf.value}
                          </span>
                        ) : null}
                        {c.type === "button" && (c.actions?.length ?? 0) > 0 ? (
                          <span className="absolute -top-2 left-1 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">{c.actions?.length} actions</span>
                        ) : null}
                      </div>
                    )}
                    {selected ? (
                      <div className="absolute -right-2 top-1/2 z-10 flex -translate-y-1/2 translate-x-full flex-col gap-1 max-sm:right-1 max-sm:top-1 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:flex-row">
                        {[
                          { label: "Move up", icon: "↑", fn: () => onMove(c.id, -1), disabled: i === 0 },
                          { label: "Move down", icon: "↓", fn: () => onMove(c.id, 1), disabled: i === app.comps.length - 1 },
                          { label: "Duplicate", icon: "⧉", fn: () => onDuplicate(c.id), disabled: false },
                          { label: "Delete", icon: "✕", fn: () => onDelete(c.id), disabled: false },
                        ].map((b) => (
                          <button
                            key={b.label}
                            type="button"
                            aria-label={b.label}
                            title={b.label}
                            disabled={b.disabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              b.fn();
                            }}
                            className="keep-dark focus-ring flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a2d48] text-sm text-white shadow-lg hover:bg-amber hover:text-navy disabled:opacity-30"
                          >
                            {b.icon}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex flex-col items-center gap-2" aria-live="polite">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-[#1f2336] px-4 py-2.5 text-sm font-bold text-white shadow-xl">
                  {t.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="absolute bottom-1.5 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-black/40" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inspector                                                            */
/* ------------------------------------------------------------------ */

const field = "w-full rounded-xl border border-white/10 bg-[#0f1120] px-3 py-2 text-sm text-white outline-none focus:border-amber/60";
const labelCls = "mb-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-white/45";

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-white/10 bg-[#0f1120] p-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`focus-ring flex-1 rounded-lg px-2 py-1.5 text-xs font-bold transition ${value === o.v ? "bg-amber text-navy" : "text-white/60 hover:text-white"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function VarSelect({ app, type, value, onChange, label, goData }: { app: AppProject; type: VarType | "any"; value?: string; onChange: (v: string) => void; label: string; goData: () => void }) {
  const vars = app.vars.filter((v) => type === "any" || v.type === type);
  if (!vars.length)
    return (
      <button type="button" onClick={goData} className="focus-ring w-full rounded-xl border border-dashed border-amber/40 px-3 py-2 text-left text-xs font-semibold text-amber hover:bg-amber/10">
        + Create a {type === "any" ? "" : type} variable first (Data tab)
      </button>
    );
  return (
    <select aria-label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={field}>
      <option value="" disabled>
        Choose…
      </option>
      {vars.map((v) => (
        <option key={v.name} value={v.name}>
          {v.name} ({v.type})
        </option>
      ))}
    </select>
  );
}

const ACTION_KINDS: { kind: Action["kind"]; label: string }[] = [
  { kind: "change", label: "Change a number" },
  { kind: "set", label: "Set a variable" },
  { kind: "random", label: "Random number" },
  { kind: "addToList", label: "Add to a list" },
  { kind: "clearList", label: "Clear a list" },
  { kind: "toast", label: "Show a message" },
];

function defaultAction(kind: Action["kind"], app: AppProject): Action {
  const first = (t: VarType) => app.vars.find((v) => v.type === t)?.name ?? "";
  switch (kind) {
    case "change":
      return { kind, var: first("number"), amount: 1 };
    case "set":
      return { kind, var: app.vars[0]?.name ?? "", value: "0" };
    case "random":
      return { kind, var: first("number"), min: 1, max: 6 };
    case "addToList":
      return { kind, list: first("list"), from: first("text") };
    case "clearList":
      return { kind, list: first("list") };
    case "toast":
      return { kind, text: "Great job! 🎉" };
  }
}

function ActionEditor({ action, app, onChange, onDelete, goData, index }: { action: Action; app: AppProject; onChange: (a: Action) => void; onDelete: () => void; goData: () => void; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f1120]/60 p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/30 text-[11px] font-bold text-sky-200">{index + 1}</span>
        <select aria-label={`Action ${index + 1} type`} value={action.kind} onChange={(e) => onChange(defaultAction(e.target.value as Action["kind"], app))} className={`${field} py-1.5`}>
          {ACTION_KINDS.map((k) => (
            <option key={k.kind} value={k.kind}>
              {k.label}
            </option>
          ))}
        </select>
        <button type="button" aria-label={`Delete action ${index + 1}`} onClick={onDelete} className="focus-ring rounded-lg px-2 py-1 text-white/40 hover:bg-red-400/20 hover:text-red-300">
          ✕
        </button>
      </div>
      <div className="mt-2 space-y-2 pl-8 text-sm">
        {action.kind === "change" ? (
          <>
            <VarSelect app={app} type="number" value={action.var} onChange={(v) => onChange({ ...action, var: v })} label="Number to change" goData={goData} />
            <label className="flex items-center gap-2 text-white/70">
              by
              <input type="number" value={action.amount} onChange={(e) => onChange({ ...action, amount: Number(e.target.value) || 0 })} className={`${field} w-24`} aria-label="Change amount" />
              <span className="text-xs text-white/40">(use − to subtract)</span>
            </label>
          </>
        ) : null}
        {action.kind === "set" ? (
          <>
            <VarSelect app={app} type="any" value={action.var} onChange={(v) => onChange({ ...action, var: v })} label="Variable to set" goData={goData} />
            <label className="flex items-center gap-2 text-white/70">
              to
              <input value={action.value} onChange={(e) => onChange({ ...action, value: e.target.value })} className={field} aria-label="New value" />
            </label>
          </>
        ) : null}
        {action.kind === "random" ? (
          <>
            <VarSelect app={app} type="number" value={action.var} onChange={(v) => onChange({ ...action, var: v })} label="Number to randomize" goData={goData} />
            <div className="flex items-center gap-2 text-white/70">
              from
              <input type="number" value={action.min} onChange={(e) => onChange({ ...action, min: Number(e.target.value) || 0 })} className={`${field} w-20`} aria-label="Lowest" />
              to
              <input type="number" value={action.max} onChange={(e) => onChange({ ...action, max: Number(e.target.value) || 0 })} className={`${field} w-20`} aria-label="Highest" />
            </div>
          </>
        ) : null}
        {action.kind === "addToList" ? (
          <>
            <p className="text-xs text-white/50">Take what was typed in…</p>
            <VarSelect app={app} type="text" value={action.from} onChange={(v) => onChange({ ...action, from: v })} label="Text variable" goData={goData} />
            <p className="text-xs text-white/50">…and add it to the list:</p>
            <VarSelect app={app} type="list" value={action.list} onChange={(v) => onChange({ ...action, list: v })} label="List variable" goData={goData} />
          </>
        ) : null}
        {action.kind === "clearList" ? <VarSelect app={app} type="list" value={action.list} onChange={(v) => onChange({ ...action, list: v })} label="List to clear" goData={goData} /> : null}
        {action.kind === "toast" ? <input value={action.text} onChange={(e) => onChange({ ...action, text: e.target.value })} className={field} aria-label="Message text" placeholder="You can use {variables} here too" /> : null}
      </div>
    </div>
  );
}

function Inspector({ app, comp, update, goData }: { app: AppProject; comp: Comp | null; update: (fn: (a: AppProject) => AppProject) => void; goData: () => void }) {
  const textRef = useRef<HTMLTextAreaElement>(null);

  if (!comp) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm text-white/60">Tap any block on the phone to edit it, or style your whole app here.</p>
        </div>
        <div>
          <label className={labelCls} htmlFor="app-name">App name</label>
          <input id="app-name" value={app.name} maxLength={28} onChange={(e) => update((a) => ({ ...a, name: e.target.value }))} className={field} />
        </div>
        <div>
          <p className={labelCls}>App icon</p>
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.slice(0, 32).map((e) => (
              <button key={e} type="button" aria-label={`Icon ${e}`} aria-pressed={app.icon === e} onClick={() => update((a) => ({ ...a, icon: e }))} className={`focus-ring rounded-lg p-1 text-xl ${app.icon === e ? "bg-amber/30 ring-1 ring-amber" : "hover:bg-white/10"}`}>
                <Art e={e} size={26} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className={labelCls}>Theme colour</p>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t} type="button" aria-label={`Theme ${t}`} aria-pressed={app.theme === t} onClick={() => update((a) => ({ ...a, theme: t }))} className={`focus-ring h-9 w-9 rounded-full border-2 transition ${app.theme === t ? "scale-110 border-white" : "border-transparent"}`} style={{ background: t }} />
            ))}
          </div>
        </div>
        <div>
          <p className={labelCls}>Mode</p>
          <Segmented label="Light or dark" value={app.dark ? "dark" : "light"} options={[{ v: "light", l: "Light" }, { v: "dark", l: "Dark" }]} onChange={(v) => update((a) => ({ ...a, dark: v === "dark" }))} />
        </div>
      </div>
    );
  }

  const set = (patch: Partial<Comp>) => update((a) => ({ ...a, comps: a.comps.map((c) => (c.id === comp.id ? { ...c, ...patch } : c)) }));
  const meta = PALETTE.find((p) => p.type === comp.type)!;
  const insertVar = (name: string) => {
    const el = textRef.current;
    const text = comp.text ?? "";
    const pos = el ? el.selectionStart : text.length;
    set({ text: text.slice(0, pos) + `{${name}}` + text.slice(pos) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Art e={meta.emoji} size={36} />
        <div>
          <p className="font-display text-2xl leading-none text-white">{meta.label}</p>
          <p className="text-xs text-white/50">{meta.tip}</p>
        </div>
      </div>

      {comp.type === "heading" || comp.type === "text" ? (
        <div>
          <label className={labelCls} htmlFor="comp-text">Words</label>
          <textarea id="comp-text" ref={textRef} rows={comp.type === "text" ? 3 : 2} value={comp.text ?? ""} onChange={(e) => set({ text: e.target.value })} className={`${field} resize-none`} />
          {app.vars.length ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-white/45">Insert variable:</span>
              {app.vars.map((v) => (
                <button key={v.name} type="button" onClick={() => insertVar(v.name)} className="focus-ring rounded-md bg-violet-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-violet-200 hover:bg-violet-500/40">
                  {`{${v.name}}`}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-white/45">Tip: create a variable, then type {"{score}"} to show its live value.</p>
          )}
        </div>
      ) : null}

      {comp.type === "heading" || comp.type === "text" || comp.type === "emoji" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={labelCls}>Size</p>
            <Segmented label="Size" value={comp.size ?? "m"} options={[{ v: "s", l: "S" }, { v: "m", l: "M" }, { v: "l", l: "L" }]} onChange={(v) => set({ size: v })} />
          </div>
          {comp.type !== "emoji" ? (
            <div>
              <p className={labelCls}>Align</p>
              <Segmented label="Alignment" value={comp.align ?? "center"} options={[{ v: "left", l: "⇤" }, { v: "center", l: "↔" }]} onChange={(v) => set({ align: v })} />
            </div>
          ) : null}
        </div>
      ) : null}

      {comp.type === "emoji" ? (
        <div>
          <p className={labelCls}>Picture</p>
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button key={e} type="button" aria-label={`Picture ${e}`} aria-pressed={comp.text === e} onClick={() => set({ text: e })} className={`focus-ring rounded-lg p-1 text-xl ${comp.text === e ? "bg-amber/30 ring-1 ring-amber" : "hover:bg-white/10"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {comp.type === "button" ? (
        <>
          <div>
            <label className={labelCls} htmlFor="btn-label">Button label</label>
            <input id="btn-label" value={comp.text ?? ""} maxLength={30} onChange={(e) => set({ text: e.target.value })} className={field} />
          </div>
          <div>
            <p className={labelCls}>Style</p>
            <Segmented label="Button style" value={comp.variant ?? "solid"} options={[{ v: "solid", l: "Solid" }, { v: "outline", l: "Outline" }]} onChange={(v) => set({ variant: v })} />
          </div>
          <div className="rounded-2xl border border-sky-400/30 bg-sky-400/5 p-3">
            <p className="text-sm font-bold text-sky-200">When tapped, do this:</p>
            <p className="mt-0.5 text-[11px] text-white/45">Actions run top to bottom — just like lines of code.</p>
            <div className="mt-3 space-y-2">
              {(comp.actions ?? []).map((a, i) => (
                <ActionEditor
                  key={i}
                  index={i}
                  action={a}
                  app={app}
                  goData={goData}
                  onChange={(next) => set({ actions: (comp.actions ?? []).map((x, n) => (n === i ? next : x)) })}
                  onDelete={() => set({ actions: (comp.actions ?? []).filter((_, n) => n !== i) })}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => set({ actions: [...(comp.actions ?? []), defaultAction(app.vars.some((v) => v.type === "number") ? "change" : "toast", app)] })}
              className="focus-ring mt-3 w-full rounded-xl border border-dashed border-sky-300/40 px-3 py-2 text-sm font-bold text-sky-200 hover:bg-sky-400/10"
            >
              + Add action
            </button>
          </div>
        </>
      ) : null}

      {comp.type === "input" ? (
        <>
          <div>
            <label className={labelCls} htmlFor="input-hint">Hint text</label>
            <input id="input-hint" value={comp.text ?? ""} onChange={(e) => set({ text: e.target.value })} className={field} />
          </div>
          <div>
            <p className={labelCls}>Saves into (text variable)</p>
            <VarSelect app={app} type="text" value={comp.var} onChange={(v) => set({ var: v })} label="Text variable" goData={goData} />
          </div>
        </>
      ) : null}

      {comp.type === "list" ? (
        <>
          <div>
            <p className={labelCls}>Shows list</p>
            <VarSelect app={app} type="list" value={comp.var} onChange={(v) => set({ var: v })} label="List variable" goData={goData} />
          </div>
          <div>
            <label className={labelCls} htmlFor="list-empty">When empty, say</label>
            <input id="list-empty" value={comp.text ?? ""} onChange={(e) => set({ text: e.target.value })} className={field} />
          </div>
        </>
      ) : null}

      {comp.type === "progress" ? (
        <>
          <div>
            <p className={labelCls}>Fills up with</p>
            <VarSelect app={app} type="number" value={comp.var} onChange={(v) => set({ var: v })} label="Number variable" goData={goData} />
          </div>
          <div>
            <label className={labelCls} htmlFor="meter-max">Full at</label>
            <input id="meter-max" type="number" value={comp.max ?? 100} onChange={(e) => set({ max: Math.max(1, Number(e.target.value) || 1) })} className={field} />
          </div>
        </>
      ) : null}

      <div className="rounded-2xl border border-violet-400/30 bg-violet-400/5 p-3">
        <label className="flex cursor-pointer items-center justify-between gap-2 text-sm font-bold text-violet-200">
          <span>Only show when…</span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-violet-400"
            checked={!!comp.showIf}
            onChange={(e) => set({ showIf: e.target.checked ? { var: app.vars.find((v) => v.type === "number")?.name ?? app.vars[0]?.name ?? "", op: ">=", value: "10" } : null })}
          />
        </label>
        {comp.showIf ? (
          <div className="mt-3 grid grid-cols-[1fr_auto_80px] gap-2">
            <VarSelect app={app} type="any" value={comp.showIf.var} onChange={(v) => set({ showIf: { ...comp.showIf!, var: v } })} label="Condition variable" goData={goData} />
            <select aria-label="Comparison" value={comp.showIf.op} onChange={(e) => set({ showIf: { ...comp.showIf!, op: e.target.value as Op } })} className={`${field} font-mono`}>
              {OPS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input aria-label="Compare to" value={comp.showIf.value} onChange={(e) => set({ showIf: { ...comp.showIf!, value: e.target.value } })} className={`${field} font-mono`} />
          </div>
        ) : (
          <p className="mt-1 text-[11px] text-white/45">This is an <code>if</code> statement! Hide or show this block depending on a variable.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data panel                                                           */
/* ------------------------------------------------------------------ */

function DataPanel({ app, state, update }: { app: AppProject; state: State; update: (fn: (a: AppProject) => AppProject) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<VarType>("number");
  const clean = toIdentifier(name);
  const exists = app.vars.some((v) => v.name === clean);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clean || exists) return;
    update((a) => ({ ...a, vars: [...a.vars, { name: clean, type, initial: type === "number" ? "0" : "" }] }));
    setName("");
  };

  const setVar = (n: string, patch: Partial<AppVar>) => update((a) => ({ ...a, vars: a.vars.map((v) => (v.name === n ? { ...v, ...patch } : v)) }));

  return (
    <div className="space-y-5">
      <p className="text-sm text-white/60">
        <strong className="text-white">Variables</strong> are labelled boxes your app uses to remember things — a score, a name, a list of moods.
      </p>
      <form onSubmit={add} className="rounded-2xl border border-white/10 bg-[#0f1120]/60 p-3">
        <label className={labelCls} htmlFor="var-name">New variable</label>
        <input id="var-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. score" className={field} autoComplete="off" />
        <div className="mt-2">
          <Segmented label="Variable type" value={type} options={[{ v: "number", l: "Number" }, { v: "text", l: "Text" }, { v: "list", l: "List" }]} onChange={setType} />
        </div>
        {name && clean !== name ? <p className="mt-2 text-[11px] text-white/50">Code name: <code className="text-violet-200">{clean || "—"}</code> (no spaces or symbols allowed)</p> : null}
        {exists ? <p className="mt-2 text-[11px] text-orange-300">You already have a variable called {clean}.</p> : null}
        <button type="submit" disabled={!clean || exists} className="focus-ring mt-3 w-full rounded-xl bg-amber px-3 py-2 text-sm font-bold text-navy disabled:opacity-40">
          + Add variable
        </button>
      </form>

      {app.vars.length ? (
        <ul className="space-y-2">
          {app.vars.map((v) => (
            <li key={v.name} className="rounded-2xl border border-white/10 bg-[#0f1120]/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <code className="font-bold text-sky-200">{v.name}</code>
                <span className="flex items-center gap-2">
                  <Pill tone={v.type === "number" ? "yellow" : v.type === "text" ? "green" : "pink"}>{v.type}</Pill>
                  <button type="button" aria-label={`Delete ${v.name}`} onClick={() => update((a) => ({ ...a, vars: a.vars.filter((x) => x.name !== v.name) }))} className="focus-ring rounded px-1.5 text-white/30 hover:text-red-300">
                    ✕
                  </button>
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {v.type !== "list" ? (
                  <label className="text-white/50">
                    Starts at
                    <input value={v.initial} onChange={(e) => setVar(v.name, { initial: e.target.value })} type={v.type === "number" ? "number" : "text"} className={`${field} mt-1 py-1.5 font-mono`} />
                  </label>
                ) : (
                  <p className="self-end text-white/50">Starts empty</p>
                )}
                <div className="text-white/50">
                  Right now
                  <motion.p key={display(state[v.name])} initial={{ scale: 1.2, color: "#FFD740" }} animate={{ scale: 1, color: "#ffffff" }} className="mt-1 truncate rounded-xl bg-black/30 px-3 py-1.5 font-mono">
                    {Array.isArray(state[v.name]) ? `[${(state[v.name] as string[]).length} items]` : JSON.stringify(state[v.name] ?? "")}
                  </motion.p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/15 p-4 text-center text-sm text-white/45">No variables yet.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                               */
/* ------------------------------------------------------------------ */

function download(app: AppProject) {
  const blob = new Blob([exportHtml(app)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${toIdentifier(app.name) || "my-app"}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Editor({ project, onSave, onExit, allProjects }: { project: AppProject; onSave: (p: AppProject) => void; onExit: () => void; allProjects: AppProject[] }) {
  const [app, setApp] = useState(project);
  const [history, setHistory] = useState<AppProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [state, setState] = useState<State>(() => initialState(project));
  const [tab, setTab] = useState<"design" | "data" | "code">("design");
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [showHelpers, setShowHelpers] = useState(false);
  const [missionWin, setMissionWin] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const toastId = useRef(0);
  const mission = MISSIONS.find((m) => m.id === app.missionId);

  // Persist (debounced).
  useEffect(() => {
    const t = window.setTimeout(() => onSave(app), 350);
    return () => window.clearTimeout(t);
  }, [app, onSave]);

  // Keep runtime state in sync with variable definitions while editing.
  const varsKey = JSON.stringify(app.vars);
  useEffect(() => {
    setState((s) => {
      const fresh = initialState(app);
      for (const k of Object.keys(fresh)) if (k in s && typeof s[k] === typeof fresh[k] && playing) fresh[k] = s[k];
      return fresh;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varsKey]);

  // Mission goals → XP.
  useEffect(() => {
    if (!mission) return;
    const newly = mission.goals.filter((g) => !app.doneGoals.includes(g.id) && g.check(app));
    if (!newly.length) return;
    const doneGoals = [...app.doneGoals, ...newly.map((g) => g.id)];
    const withGoals = { ...appRef.current, doneGoals };
    appRef.current = withGoals;
    setApp(withGoals);
    newly.forEach((g, i) =>
      window.setTimeout(() => {
        addXp(25);
        celebrate({ xp: 25, message: g.label });
      }, i * 400)
    );
    if (mission.goals.every((g) => doneGoals.includes(g.id))) {
      window.setTimeout(() => {
        completeLevel("studio", mission.id, 3);
        setMissionWin(true);
        setConfetti((c) => c + 1);
        const first = earnBadge("first-app");
        if (first) celebrate({ badge: first });
        const others = allProjects.filter((p) => p.id !== app.id);
        const all = MISSIONS.every((m) => m.id === mission.id || missionDone(m, others));
        if (all) {
          const b = earnBadge("app-architect");
          if (b) window.setTimeout(() => celebrate({ badge: b }), 600);
        }
      }, 700);
    }
  }, [app, mission, allProjects]);

  // Free-build apps earn "App Maker" once they have a working button + variable.
  useEffect(() => {
    if (mission) return;
    if (app.vars.length && app.comps.some((c) => c.type === "button" && (c.actions?.length ?? 0) > 0)) {
      const b = earnBadge("first-app");
      if (b) celebrate({ badge: b });
    }
  }, [app, mission]);

  const appRef = useRef(app);
  appRef.current = app;
  const historyRef = useRef<AppProject[]>([]);

  const update = useCallback((fn: (a: AppProject) => AppProject) => {
    const prev = appRef.current;
    const next = { ...fn(prev), updatedAt: Date.now() };
    historyRef.current = [...historyRef.current.slice(-49), prev];
    setHistory(historyRef.current);
    appRef.current = next;
    setApp(next);
  }, []);

  const undo = () => {
    const h = historyRef.current;
    if (!h.length) return;
    const prev = h[h.length - 1];
    historyRef.current = h.slice(0, -1);
    setHistory(historyRef.current);
    const restored = { ...prev, doneGoals: appRef.current.doneGoals };
    appRef.current = restored;
    setApp(restored);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        const t = e.target as HTMLElement;
        if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const addComp = (type: CompType) => {
    const comp = newComp(type, app);
    update((a) => {
      const idx = selectedId ? a.comps.findIndex((c) => c.id === selectedId) : -1;
      const comps = [...a.comps];
      comps.splice(idx >= 0 ? idx + 1 : comps.length, 0, comp);
      return { ...a, comps };
    });
    setPlaying(false);
    setSelectedId(comp.id);
    setTab("design");
  };

  const moveComp = (id: string, dir: -1 | 1) =>
    update((a) => {
      const i = a.comps.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= a.comps.length) return a;
      const comps = [...a.comps];
      [comps[i], comps[j]] = [comps[j], comps[i]];
      return { ...a, comps };
    });

  const duplicate = (id: string) =>
    update((a) => {
      const i = a.comps.findIndex((c) => c.id === id);
      const copy = { ...JSON.parse(JSON.stringify(a.comps[i])), id: `${id}-${Date.now().toString(36)}` };
      const comps = [...a.comps];
      comps.splice(i + 1, 0, copy);
      return { ...a, comps };
    });

  const remove = (id: string) => {
    update((a) => ({ ...a, comps: a.comps.filter((c) => c.id !== id) }));
    setSelectedId(null);
  };

  const tap = (c: Comp) => {
    const res = applyActions(c.actions ?? [], state);
    setState(res.state);
    res.toasts.forEach((text) => {
      const id = ++toastId.current;
      setToasts((t) => [...t, { id, text }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2000);
    });
  };

  const restart = () => setState(initialState(app));
  const code = useMemo(() => generateScript(app), [app]);
  const selected = app.comps.find((c) => c.id === selectedId) ?? null;
  const nextGoal = mission?.goals.find((g) => !app.doneGoals.includes(g.id));

  const ship = () => {
    download(app);
    const b = earnBadge("shipped-it");
    if (b) celebrate({ badge: b });
    else celebrate({ message: "App downloaded! Open the file in any browser." });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 md:px-5">
      <Confetti fire={confetti} />
      {/* Editor toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onExit} className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10">
          ← My apps
        </button>
        <Art e={app.icon} size={28} />
        <input aria-label="App name" value={app.name} maxLength={28} onChange={(e) => update((a) => ({ ...a, name: e.target.value }))} className="min-w-0 max-w-[220px] flex-1 rounded-lg bg-transparent px-2 py-1 font-display text-2xl text-white outline-none hover:bg-white/5 focus:bg-white/10" />
        <span className="hidden text-xs text-emerald-300/80 sm:inline">Saved on this device</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={undo} disabled={!history.length} className="focus-ring rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white disabled:opacity-30" title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <div role="radiogroup" aria-label="Mode" className="flex rounded-xl border border-white/15 p-1">
            <button type="button" role="radio" aria-checked={!playing} onClick={() => setPlaying(false)} className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-bold ${!playing ? "bg-white/15 text-white" : "text-white/55"}`}>
              Build
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={playing}
              onClick={() => {
                setPlaying(true);
                setSelectedId(null);
                restart();
              }}
              className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-bold ${playing ? "bg-emerald-400 text-navy" : "text-white/55"}`}
            >
              ▶ Try it
            </button>
          </div>
          <button type="button" onClick={ship} className="focus-ring rounded-xl bg-amber px-4 py-2 text-sm font-extrabold text-navy shadow-[0_8px_24px_-8px_rgba(255,215,64,0.8)]">
            Download app
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)_360px]">
        {/* Blocks + mission */}
        <aside className="order-2 space-y-4 lg:order-1" aria-label="Blocks">
          <div className="rounded-3xl border border-white/10 bg-[#1b1e33] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Add blocks</p>
            {(["Show", "Interact", "Data"] as const).map((g) => (
              <div key={g} className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold text-white/35">{g}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PALETTE.filter((p) => p.group === g).map((p) => (
                    <motion.button
                      key={p.type}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addComp(p.type)}
                      title={p.tip}
                      className="focus-ring flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-xs font-bold text-white hover:border-amber/50"
                    >
                      <Art e={p.emoji} size={32} />
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {mission ? (
            <div className="rounded-3xl border border-amber/25 bg-gradient-to-b from-amber/10 to-transparent p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber">
                Mission: {mission.title}
              </p>
              <ol className="mt-3 space-y-2">
                {mission.goals.map((g, i) => {
                  const done = app.doneGoals.includes(g.id);
                  const current = nextGoal?.id === g.id;
                  return (
                    <li key={g.id} className={`rounded-xl p-2 text-sm ${current ? "bg-white/10" : ""}`}>
                      <div className="flex gap-2">
                        <motion.span key={String(done)} initial={{ scale: done ? 0 : 1 }} animate={{ scale: 1 }} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-emerald-400 text-navy" : "border border-white/25 text-white/50"}`}>
                          {done ? "✓" : i + 1}
                        </motion.span>
                        <span className={done ? "text-white/45 line-through" : "font-semibold text-white"}>{g.label}</span>
                      </div>
                      {current ? <p className="ml-7 mt-1 text-xs text-amber/90"><ArtText text={g.tip} /></p> : null}
                    </li>
                  );
                })}
              </ol>
              {!nextGoal ? <p className="mt-3 text-sm font-bold text-emerald-300">Mission complete! Keep remixing and add your own ideas.</p> : null}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#1b1e33] p-4 text-sm text-white/60">
              <p className="font-bold text-white">Free build</p>
              <p className="mt-1">No rules — make anything! Ideas: a quiz, a score keeper for gym class, a chore tracker, a story with choices.</p>
            </div>
          )}
        </aside>

        {/* Phone */}
        <section className="order-1 lg:order-2" aria-label="App preview">
          <div className="mb-3 flex items-center justify-center gap-3 text-xs">
            {playing ? (
              <>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 font-bold text-emerald-300">● Live — your app is running</span>
                <button type="button" onClick={restart} className="focus-ring rounded-full border border-white/15 px-3 py-1 font-semibold text-white/80 hover:bg-white/10">
                  ↺ Restart app
                </button>
              </>
            ) : (
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white/60">Build mode: tap a block to edit it</span>
            )}
          </div>
          <Phone
            app={app}
            state={state}
            playing={playing}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              if (id) setTab("design");
            }}
            onTap={tap}
            onType={(n, v) => setState((s) => ({ ...s, [n]: v }))}
            onMove={moveComp}
            onDuplicate={duplicate}
            onDelete={remove}
            toasts={toasts}
          />
        </section>

        {/* Inspector tabs */}
        <aside className="order-3 rounded-3xl border border-white/10 bg-[#1b1e33]" aria-label="Inspector">
          <div role="tablist" aria-label="Panels" className="flex border-b border-white/10 p-2">
            {([
              ["design", "Design"],
              ["data", "Data"],
              ["code", "</> Code"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`focus-ring flex-1 rounded-xl px-2 py-2 text-sm font-bold transition ${tab === id ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {(
            <div role="tabpanel" className="max-h-none p-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
              {tab === "design" ? <Inspector app={app} comp={selected} update={update} goData={() => setTab("data")} /> : null}
              {tab === "data" ? <DataPanel app={app} state={state} update={update} /> : null}
              {tab === "code" ? (
                <div>
                  <p className="text-sm text-white/60">
                    This is the <strong className="text-white">real JavaScript</strong> behind your app. It updates as you build! Click <em>Download app</em> to get a file you can open in any browser.
                  </p>
                  <pre className="keep-dark mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-[#0f1120] p-4 font-mono text-[12px] leading-5" dangerouslySetInnerHTML={{ __html: highlight(code, HELPER_NAMES) }} />
                  <button type="button" onClick={() => setShowHelpers((v) => !v)} aria-expanded={showHelpers} className="focus-ring mt-3 text-xs font-semibold text-sky-300 hover:underline">
                    {showHelpers ? "Hide" : "Show"} the building-block functions →
                  </button>
                  {showHelpers ? <pre className="keep-dark mt-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#0f1120] p-4 font-mono text-[12px] leading-5" dangerouslySetInnerHTML={{ __html: highlight(HELPERS.trim(), HELPER_NAMES) }} /> : null}
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>

      <Modal open={missionWin} onClose={() => setMissionWin(false)} label="Mission complete">
        {mission ? (
          <div className="text-center">
            <Art e={mission.emoji} size={80} className="mx-auto" />
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Mission complete</p>
            <h3 className="mt-1 font-display text-5xl">You built an app!</h3>
            <Stars count={3} size="text-4xl" animate />
            <p className="mt-3 text-sm text-white/75">Try it out, then download it and show your family. Real developers call that <em>shipping</em>!</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setMissionWin(false);
                  setPlaying(true);
                  restart();
                }}
                className="focus-ring flex-1 rounded-2xl border border-white/15 px-4 py-3 font-semibold hover:bg-white/10"
              >
                ▶ Try my app
              </button>
              <button
                type="button"
                onClick={() => {
                  setMissionWin(false);
                  ship();
                }}
                className="focus-ring flex-1 rounded-2xl bg-amber px-4 py-3 font-bold text-navy"
              >
                Download it
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery                                                              */
/* ------------------------------------------------------------------ */

function Gallery({ projects, open, create, remove }: { projects: AppProject[]; open: (id: string) => void; create: (m?: Mission) => void; remove: (id: string) => void }) {
  const p = useProgress();
  // Missions are levels: the first FREE_LEVELS are free, later ones need the Developers class password.
  const access = useLevelAccess("developers");
  const [asking, setAsking] = useState(false);
  const [confirm, setConfirm] = useState<AppProject | null>(null);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#2b2f63] via-[#252848] to-[#1b1e33] p-6 md:p-10">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-pink-500/20 blur-3xl" aria-hidden />
        <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Pill tone="pink">App design · Grades 4–8</Pill>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] text-white md:text-7xl">
              Build your <span className="text-amber">own app.</span>
            </h2>
            <p className="mt-4 max-w-lg text-white/75">
              Snap together screens, buttons and variables, make them react to taps, then peek at the real JavaScript you just wrote.
              When it’s ready, download your app and share it with anyone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => create()} className="focus-ring rounded-2xl bg-amber px-6 py-3 font-display text-2xl text-navy shadow-[0_10px_30px_-10px_rgba(255,215,64,0.8)]">
                Start a free build
              </button>
              <a href="#missions" className="focus-ring rounded-2xl border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10">
                Take a guided mission ↓
              </a>
            </div>
          </div>
          <div className="hidden justify-center md:flex" aria-hidden>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="keep-dark w-48 rounded-[28px] border-[6px] border-[#0b0c16] bg-[#f7f7fb] shadow-2xl">
              <div className="rounded-t-[22px] bg-[#F59E0B] px-3 pb-2 pt-4 text-sm font-extrabold text-white"><Art e="🍪" size={18} /> Cookie Clicker</div>
              <div className="space-y-2 p-3 text-center text-[#1f2336]">
                <Art e="🍪" size={56} className="mx-auto" />
                <p className="text-sm font-bold">Score: 7</p>
                <div className="rounded-xl bg-[#F59E0B] py-2 text-xs font-extrabold text-white">Tap me!</div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e6e7f0]"><div className="h-full w-[70%] bg-[#F59E0B]" /></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <h3 id="missions" className="mt-12 font-display text-4xl text-white">Guided missions</h3>
      <p className="text-white/60">Each mission teaches a new idea. Complete every goal to earn 3 stars.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MISSIONS.map((m, i) => {
          const existing = projects.find((x) => x.missionId === m.id);
          const done = existing ? existing.doneGoals.length : 0;
          const paid = access.isLocked(i);
          return (
            <motion.button
              key={m.id}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => (paid ? setAsking(true) : existing ? open(existing.id) : create(m))}
              className="focus-ring group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1b1e33] text-left hover:border-white/30"
            >
              <div className="flex h-28 items-center justify-center text-6xl" style={{ background: `linear-gradient(135deg, ${m.theme}, ${m.theme}55)` }} aria-hidden>
                <motion.span whileHover={{ rotate: [0, -10, 10, 0] }}><Art e={m.emoji} size={64} /></motion.span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-2xl text-white">{m.title}</p>
                  {paid ? <LockBadge /> : <Stars count={starsFor(p, "studio", m.id)} size="text-sm" />}
                </div>
                <p className="mt-1 text-sm text-white/65">{m.pitch}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {m.concepts.map((c) => (
                    <Pill key={c}>{c}</Pill>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(done / m.goals.length) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-white/50">{existing ? `${done}/${m.goals.length} goals · Continue →` : "Start mission →"}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <UnlockModal open={asking} onClose={() => setAsking(false)} program="developers" onUnlock={access.markUnlocked} />

      <h3 className="mt-12 font-display text-4xl text-white">My apps</h3>
      {projects.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...projects]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((proj) => (
              <li key={proj.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1b1e33] p-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: proj.theme }} aria-hidden>
                  <Art e={proj.icon} size={30} />
                </span>
                <button type="button" onClick={() => open(proj.id)} className="focus-ring min-w-0 flex-1 rounded-lg text-left">
                  <span className="block truncate font-bold text-white">{proj.name || "Untitled"}</span>
                  <span className="block text-xs text-white/45">
                    {proj.comps.length} blocks · {proj.vars.length} variables
                  </span>
                </button>
                <button type="button" onClick={() => setConfirm(proj)} aria-label={`Delete ${proj.name}`} className="focus-ring rounded-lg px-2 py-1 text-white/30 hover:bg-red-400/15 hover:text-red-300">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
                </button>
              </li>
            ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-6 text-center text-white/50">Your apps will appear here. They’re saved on this device.</p>
      )}

      <Modal open={!!confirm} onClose={() => setConfirm(null)} label="Delete app">
        <p className="font-display text-3xl">Delete “{confirm?.name}”?</p>
        <p className="mt-2 text-sm text-white/65">This can’t be undone. Tip: download it first if you want to keep a copy.</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => setConfirm(null)} className="focus-ring flex-1 rounded-2xl border border-white/15 px-4 py-3 font-semibold">
            Keep it
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm) remove(confirm.id);
              setConfirm(null);
            }}
            className="focus-ring flex-1 rounded-2xl bg-red-500 px-4 py-3 font-bold text-white"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function AppStudio() {
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveProjects(projects);
  }, [projects, loaded]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [openId]);

  const onSave = useCallback((p: AppProject) => setProjects((ps) => ps.map((x) => (x.id === p.id ? p : x))), []);
  const create = (m?: Mission) => {
    const proj = createProject(m);
    setProjects((ps) => [...ps, proj]);
    setOpenId(proj.id);
  };
  const current = projects.find((p) => p.id === openId);

  return (
    <>
      <ArcadeTopBar title="App Studio" emoji="📱" semester="Ship It! Arcade · App design" />
      <RewardLayer />
      {current ? (
        <Editor key={current.id} project={current} onSave={onSave} onExit={() => setOpenId(null)} allProjects={projects} />
      ) : (
        <Gallery projects={projects} open={setOpenId} create={create} remove={(id) => setProjects((ps) => ps.filter((p) => p.id !== id))} />
      )}
    </>
  );
}
