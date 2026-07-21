"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CURRICULUM_LEVELS, type LevelSlug } from "@/data/academy/curriculum";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAcademySession, type AcademySession } from "@/lib/academy/session";

interface ClassRow {
  id: string;
  name: string;
  level: LevelSlug;
  semester: string;
  class_code: string;
}

export default function TeacherDashboardPage() {
  const [session, setSession] = useState<AcademySession | null | undefined>(undefined);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LevelSlug>("explorers");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const supabase = getSupabaseBrowserClient();
    const { data } = (await supabase?.from("classes").select("id, name, level, semester, class_code")) ?? { data: [] };
    setClasses((data as ClassRow[] | null) ?? []);
  }

  useEffect(() => {
    (async () => {
      setSession(await getAcademySession());
      await refresh();
    })();
  }, []);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session: authSession },
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    if (!authSession) return;
    setCreating(true);
    const response = await fetch("/api/academy/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authSession.access_token}` },
      body: JSON.stringify({ name, level }),
    });
    setCreating(false);
    if (response.ok) {
      setName("");
      await refresh();
    }
  }

  if (session === undefined) return <div className="mx-auto max-w-5xl px-4 py-10 text-[#2E3440]">Loading…</div>;
  if (!session || session.role !== "teacher") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-[#2E3440]">
        You need a teacher account. <Link href="/academy/login" className="underline">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#001532]">Welcome, {session.displayName}</h1>

      <h2 className="mt-8 text-lg font-semibold text-[#001532]">My classes</h2>
      <ul className="mt-3 space-y-2">
        {classes.map((c) => (
          <li key={c.id}>
            <Link
              href={`/academy/teacher/classes/${c.id}`}
              className="flex items-center justify-between rounded-lg border border-[#138A9A] bg-white p-4 shadow-sm hover:shadow-md"
            >
              <span>
                <span className="block font-medium text-[#001532]">{c.name}</span>
                <span className="block text-sm text-[#2E3440]">
                  {c.level} · Semester {c.semester} · Code: <strong>{c.class_code}</strong>
                </span>
              </span>
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
        {classes.length === 0 && <li className="text-sm text-[#2E3440]">No classes yet — create one below.</li>}
      </ul>

      <h2 className="mt-8 text-lg font-semibold text-[#001532]">Create a class</h2>
      <form onSubmit={createClass} className="mt-3 max-w-sm space-y-3">
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-[#001532]">
            Class name
          </label>
          <input
            id="className"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-[#138A9A] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#138A9A]"
          />
        </div>
        <div>
          <label htmlFor="classLevel" className="block text-sm font-medium text-[#001532]">
            Level
          </label>
          <select
            id="classLevel"
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelSlug)}
            className="mt-1 w-full rounded-md border border-[#138A9A] px-3 py-2"
          >
            {CURRICULUM_LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-md bg-[#001532] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create class"}
        </button>
      </form>
    </div>
  );
}
