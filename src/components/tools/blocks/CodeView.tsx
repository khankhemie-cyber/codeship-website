"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Strings } from "./i18n";

/**
 * The "Show JavaScript" switch and the read-only panel it opens, shared by
 * Create and Levels. The switch is remembered in this browser.
 */

const SHOW_CODE_KEY = "codeship-blocks-show-code";

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D58401] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010F2A]";

/** Whether the JavaScript panel is open, and a toggle that remembers the choice. */
export function useShowCode() {
  const [showCode, setShowCode] = useState(false);
  useEffect(() => {
    try {
      setShowCode(localStorage.getItem(SHOW_CODE_KEY) === "1");
    } catch {}
  }, []);
  const toggle = () =>
    setShowCode((on) => {
      try {
        localStorage.setItem(SHOW_CODE_KEY, on ? "0" : "1");
      } catch {}
      return !on;
    });
  return [showCode, toggle] as const;
}

export function ShowCodeSwitch({ s, on, onToggle, className = "" }: { s: Strings; on: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-sm font-semibold text-white hover:bg-white/10 ${focusRing} ${on ? "!border-[#D58401] !bg-[#D58401]/20" : ""} ${className}`}
      title={s.showCodeHint}
      aria-label={s.showCodeHint}
      data-testid="show-code"
    >
      <span aria-hidden="true" className="font-mono text-sm font-bold text-[#F5B544]">
        {"</>"}
      </span>
      <span className="hidden lg:inline">{s.showCode}</span>
      <span aria-hidden="true" className={`relative h-6 w-10 rounded-full transition ${on ? "bg-[#2EB84B]" : "bg-white/25"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function CodePanel({ s, code, className = "" }: { s: Strings; code: string; className?: string }) {
  return (
    <div className={`flex max-h-[40%] min-h-[120px] flex-col bg-[#06142E] ${className}`} data-testid="code-panel">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white/70">
        <span aria-hidden="true" className="font-mono text-[#F5B544]">
          {"</>"}
        </span>
        {s.codeTitle}
      </div>
      <pre className="min-h-0 flex-1 overflow-auto px-3 py-2 font-mono text-sm leading-relaxed text-[#E6ECF4]" lang="en" data-testid="code-text">
        <code>
          <Highlighted code={code} />
        </code>
      </pre>
    </div>
  );
}

/** Light syntax colouring for the generated JavaScript (comments, keywords, strings, numbers, calls). */
const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(for|let)\b|\b(\d+)\b|([A-Za-z_]\w*)(?=\()/gm;
function Highlighted({ code }: { code: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(code.slice(last, i));
    const colour = m[1] ? "#7D8BA3" : m[2] ? "#7EE0A1" : m[3] ? "#C792EA" : m[4] ? "#F5B544" : "#6CC4FF";
    parts.push(
      <span key={i} style={{ color: colour, fontStyle: m[1] ? "italic" : undefined }}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  parts.push(code.slice(last));
  return <>{parts}</>;
}
