"use client";

import { useState } from "react";
import type { Project, Locale } from "@/data/academy/curriculum";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProjectSubmission({ project, locale = "en" }: { project: Project; locale?: Locale }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    if (!session) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    const response = await fetch("/api/academy/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ type: "project_submission", projectId: project.id, selfCheck: checked }),
    });
    setStatus(response.ok ? "saved" : "error");
  }

  const allChecked = project.rubric.every((r) => checked[r.criterion]);

  return (
    <div className="mt-6 rounded-lg border border-[#138A9A]/30 bg-white p-4">
      <h2 className="font-semibold text-[#001532]">{locale === "fr" ? "Grille" : "Rubric self-check"}</h2>
      <ul className="mt-2 space-y-2">
        {project.rubric.map((r) => (
          <li key={r.criterion}>
            <label className="flex items-start gap-2 text-sm text-[#2E3440]">
              <input
                type="checkbox"
                checked={checked[r.criterion] ?? false}
                onChange={(e) => setChecked((prev) => ({ ...prev, [r.criterion]: e.target.checked }))}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-[#001532]">{r.criterion}.</span> {r.description}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={submit}
        disabled={!allChecked || status === "saving"}
        className="mt-4 rounded-md bg-[#001532] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
      >
        {locale === "fr" ? "Soumettre à mon enseignant·e" : "Submit to my teacher"}
      </button>
      {status === "saved" && (
        <p role="status" className="mt-2 text-sm text-green-700">
          {locale === "fr" ? "Envoyé! Ton enseignant·e va vérifier ton travail." : "Submitted! Your teacher will review it."}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {locale === "fr" ? "Connecte-toi d'abord pour soumettre." : "Sign in first to submit."}
        </p>
      )}
    </div>
  );
}
