"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  program: string;
  level: string;
  fileUrl: string;
  fileName: string;
}

/**
 * Password form for one program's workbook. The password is checked on the
 * server (/api/workbooks/login), which sets an HttpOnly cookie; the PDF itself
 * is only decrypted for a browser holding that cookie (/api/workbooks/download).
 */
export default function WorkbookGate({ program, level, fileUrl, fileName }: Props) {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/workbooks/session/?program=${program}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { ok: false }))
      .then((data: { ok?: boolean }) => setStatus(data.ok ? "open" : "locked"))
      .catch(() => setStatus("locked"));
  }, [program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workbooks/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, password }),
      });
      if (res.ok) {
        setStatus("open");
      } else if (res.status === 401) {
        setError("That password is not right. Check the spelling and try again.");
        setPassword("");
        inputRef.current?.focus();
      } else {
        setError("The workbooks are not switched on yet. Please ask your instructor.");
      }
    } catch {
      setError("Could not reach the server. Check your internet connection and try again.");
    }
    setLoading(false);
  };

  if (status === "checking") {
    return <div className="h-64" aria-busy="true" />;
  }

  if (status === "locked") {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 max-w-md">
        <h2 className="font-display text-2xl font-extrabold text-[#001532]">Enter your class password</h2>
        <p className="text-base text-gray-600 mt-2">
          Your instructor gives this password to {level} families. You only need to enter it once on this device.
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="workbook-password" className="block text-sm font-bold text-[#001532] mb-2">
            Password
          </label>
          <input
            id="workbook-password"
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoCapitalize="none"
            className={`w-full px-4 py-3 text-lg border-2 outline-none focus:border-[#138A9A] ${error ? "border-red-500" : "border-gray-300"}`}
          />
          {error && (
            <p role="alert" className="text-sm font-semibold text-red-600 mt-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="mt-5 w-full bg-[#F4D734] text-[#001532] font-bold text-lg py-3.5 hover:bg-[#E6C51E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking…" : "Unlock workbook"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">Unlocked</p>
      <h2 className="font-display text-2xl font-extrabold text-[#001532] mt-2">{level} · Semester 1 workbook</h2>
      <a
        href={fileUrl}
        download={fileName}
        className="mt-6 inline-flex items-center justify-center px-7 py-3.5 text-lg font-bold bg-[#F4D734] text-[#001532] hover:bg-[#E6C51E] shadow-lg"
      >
        Download the workbook (PDF)
      </a>

      <h3 className="font-display text-xl font-extrabold text-[#001532] mt-10">How to fill it in</h3>
      <ol className="list-decimal pl-5 mt-3 space-y-2 text-base text-gray-700">
        <li>
          Download the workbook and <strong>save it on your computer</strong> (for example in Documents) so your work is
          kept between classes.
        </li>
        <li>
          Open the saved file in a PDF app: <strong>Adobe Acrobat Reader</strong> (free, Windows and Mac),{" "}
          <strong>Preview</strong> on a Mac, or <strong>Microsoft Edge</strong> / <strong>Google Chrome</strong>.
        </li>
        <li>Click on any line or box to type in it. Click a checkbox to tick it. Explorers can tap a star box to colour in a star.</li>
        <li>
          Choose <strong>File → Save</strong> (or the save/download button in Edge and Chrome) before you close it. Next week, open the
          same saved file and keep going.
        </li>
      </ol>
      <p className="text-base text-gray-600 mt-5">
        You can also print it and write on it by hand. For drawing pages, use your PDF app&apos;s draw or markup tool, or print that page.
      </p>
    </div>
  );
}
