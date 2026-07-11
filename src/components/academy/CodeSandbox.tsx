"use client";

import { useRef, useState } from "react";

export type SandboxLanguage = "html" | "javascript" | "python";

const PLACEHOLDER: Record<SandboxLanguage, string> = {
  html: "<h1>Hello!</h1>\n<p>Edit this and click Run.</p>",
  javascript: "console.log('Hello!');",
  python: "print('Hello!')",
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<{
      runPython: (code: string) => unknown;
      setStdout: (opts: { batched: (s: string) => void }) => void;
    }>;
  }
}

const PYODIDE_VERSION = "0.26.2";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/**
 * A real (not simulated) code sandbox per level's tooling: HTML/CSS renders in a
 * script-less sandboxed iframe (Builders); JavaScript runs in a sandboxed iframe
 * with no same-origin access, console output relayed via postMessage
 * (Developers); Python runs client-side via Pyodide, loaded on demand from its
 * official CDN (Engineers) — no student code ever reaches a server.
 */
export default function CodeSandbox({ language, starterCode }: { language: SandboxLanguage; starterCode?: string }) {
  const [code, setCode] = useState(starterCode ?? PLACEHOLDER[language]);
  const [output, setOutput] = useState<string>("");
  const [htmlPreviewSrc, setHtmlPreviewSrc] = useState<string | null>(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const pyodideRef = useRef<Awaited<ReturnType<NonNullable<typeof window.loadPyodide>>> | null>(null);

  async function run() {
    if (language === "html") {
      setHtmlPreviewSrc(code);
      return;
    }

    if (language === "javascript") {
      setOutput("");
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.source !== "codeship-academy-sandbox") return;
        setOutput((prev) => prev + event.data.line + "\n");
      };
      window.addEventListener("message", handleMessage);
      const iframe = document.createElement("iframe");
      iframe.sandbox.add("allow-scripts");
      iframe.style.display = "none";
      iframe.srcdoc = `<script>
        const send = (line) => parent.postMessage({ source: "codeship-academy-sandbox", line }, "*");
        console.log = (...args) => send(args.map(String).join(" "));
        try { ${code} } catch (e) { send("Error: " + e.message); }
      </script>`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.removeEventListener("message", handleMessage);
      }, 1000);
      return;
    }

    if (language === "python") {
      setOutput("");
      if (!pyodideRef.current) {
        setPyodideLoading(true);
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${PYODIDE_INDEX_URL}pyodide.js`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Couldn't load Python."));
            document.body.appendChild(script);
          }).catch((e: Error) => setOutput(e.message));
        }
        if (window.loadPyodide) {
          const pyodide = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
          pyodide.setStdout({ batched: (s: string) => setOutput((prev) => prev + s + "\n") });
          pyodideRef.current = pyodide;
        }
        setPyodideLoading(false);
      }
      try {
        pyodideRef.current?.runPython(code);
      } catch (e) {
        setOutput((prev) => prev + String(e) + "\n");
      }
    }
  }

  return (
    <div className="rounded-lg border border-[#138A9A]/30 bg-white p-4">
      <label htmlFor="sandbox-code" className="text-sm font-semibold text-[#001532]">
        Code
      </label>
      <textarea
        id="sandbox-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        spellCheck={false}
        className="mt-1 w-full rounded-md border border-[#138A9A] bg-[#0D1B2A] p-3 font-mono text-sm text-[#F1EEE7] focus:outline-none focus:ring-2 focus:ring-[#138A9A]"
      />
      <button
        type="button"
        onClick={run}
        disabled={pyodideLoading}
        className="mt-3 rounded-md bg-[#001532] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
      >
        {pyodideLoading ? "Loading Python…" : "Run"}
      </button>

      {language === "html" && htmlPreviewSrc !== null && (
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-[#001532]">Preview</h3>
          <iframe
            title="Preview"
            sandbox=""
            srcDoc={htmlPreviewSrc}
            className="mt-1 h-56 w-full rounded-md border border-[#138A9A]/30 bg-white"
          />
        </div>
      )}

      {(language === "javascript" || language === "python") && (
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-[#001532]">Output</h3>
          <pre className="mt-1 min-h-[3rem] whitespace-pre-wrap rounded-md bg-[#F1EEE7] p-3 text-sm text-[#001532]">
            {output || "Nothing printed yet."}
          </pre>
        </div>
      )}
    </div>
  );
}
