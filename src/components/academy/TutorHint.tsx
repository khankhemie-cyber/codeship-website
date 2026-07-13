"use client";

import { useState } from "react";
import type { Locale } from "@/data/academy/curriculum";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function TutorHint({
  lessonId,
  locale,
  currentCode,
  attemptHistory,
}: {
  lessonId: string;
  locale: Locale;
  currentCode: string;
  attemptHistory: string[];
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [hint, setHint] = useState<string | null>(null);

  async function getHint() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    if (!session) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ lessonId, locale, currentCode, attemptHistory }),
    });
    if (!response.ok) {
      setStatus("error");
      return;
    }
    const data = await response.json();
    setHint(data.hintText);
    setStatus("idle");
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={getHint}
        disabled={status === "loading"}
        className="rounded-md border border-[#E5A823] bg-[#FFF8E7] px-4 py-2 text-sm font-medium text-[#001532] hover:bg-[#E5A823]/30 disabled:opacity-60"
      >
        {status === "loading"
          ? locale === "fr"
            ? "Un instant…"
            : "One moment…"
          : locale === "fr"
            ? "Coincé·e? Obtiens un indice"
            : "Stuck? Get a hint"}
      </button>
      {hint && (
        <p role="status" className="mt-2 max-w-md rounded-md bg-[#FFF8E7] p-3 text-sm text-[#001532]">
          💡 {hint}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {locale === "fr" ? "Connecte-toi d'abord pour obtenir un indice." : "Sign in first to get a hint."}
        </p>
      )}
    </div>
  );
}
