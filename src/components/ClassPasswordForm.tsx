"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Asks whether this browser already holds the program's class-password cookie
 * (/api/workbooks/session). One password unlocks both the workbook and the
 * quizzes for that program.
 */
export function useClassAccess(program: string) {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking");
  useEffect(() => {
    fetch(`/api/workbooks/session/?program=${program}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { ok: false }))
      .then((data: { ok?: boolean }) => setStatus(data.ok ? "open" : "locked"))
      .catch(() => setStatus("locked"));
  }, [program]);
  return [status, setStatus] as const;
}

interface Props {
  program: string;
  level: string;
  /** Button label, e.g. "Unlock workbook". */
  action: string;
  onUnlock: () => void;
}

/** Class password form; the server sets an HttpOnly cookie when it is right. */
export default function ClassPasswordForm({ program, level, action, onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        onUnlock();
      } else if (res.status === 401) {
        setError("That password is not right. Check the spelling and try again.");
        setPassword("");
        inputRef.current?.focus();
      } else {
        setError("This is not switched on yet. Please ask your instructor.");
      }
    } catch {
      setError("Could not reach the server. Check your internet connection and try again.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 max-w-md">
      <h2 className="font-display text-2xl font-extrabold text-[#001532]">Enter your class password</h2>
      <p className="text-base text-gray-600 mt-2">
        Your instructor gives this password to {level} families. You only need to enter it once on this device.
      </p>
      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="class-password" className="block text-sm font-bold text-[#001532] mb-2">
          Password
        </label>
        <input
          id="class-password"
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
          {loading ? "Checking…" : action}
        </button>
      </form>
    </div>
  );
}
