"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLevelCurriculum, type LevelSlug } from "@/data/academy/curriculum";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAcademySession, type AcademySession } from "@/lib/academy/session";

interface Child {
  id: string;
  display_name: string;
  level: LevelSlug;
  lessonsMastered: number;
  hasCertificate: boolean;
}

export default function ParentDashboardPage() {
  const [session, setSession] = useState<AcademySession | null | undefined>(undefined);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    (async () => {
      const s = await getAcademySession();
      setSession(s);
      if (s?.role !== "parent") return;

      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", s.id);
      const studentIds = (links ?? []).map((l) => l.student_id);
      if (studentIds.length === 0) return;

      const { data: students } = await supabase.from("students").select("id, display_name, level").in("id", studentIds);
      const { data: mastery } = await supabase
        .from("mastery_state")
        .select("student_id, status")
        .in("student_id", studentIds)
        .eq("status", "mastered");
      const { data: certificates } = await supabase.from("certificates").select("student_id").in("student_id", studentIds);

      const masteredCount = new Map<string, number>();
      for (const row of mastery ?? []) masteredCount.set(row.student_id, (masteredCount.get(row.student_id) ?? 0) + 1);
      const certifiedIds = new Set((certificates ?? []).map((c) => c.student_id));

      setChildren(
        (students ?? []).map((student) => ({
          id: student.id,
          display_name: student.display_name,
          level: student.level as LevelSlug,
          lessonsMastered: masteredCount.get(student.id) ?? 0,
          hasCertificate: certifiedIds.has(student.id),
        }))
      );
    })();
  }, []);

  if (session === undefined) return <div className="mx-auto max-w-5xl px-4 py-10 text-[#2E3440]">Loading…</div>;
  if (!session || session.role !== "parent") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-[#2E3440]">
        You need a parent account. <Link href="/academy/login" className="underline">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#001532]">Welcome, {session.displayName}</h1>
      <p className="mt-1 text-sm text-[#2E3440]">
        Linking a child to your account is done by their teacher or a CODEship program coordinator.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {children.map((child) => {
          const level = getLevelCurriculum(child.level);
          return (
            <div key={child.id} className="rounded-lg border bg-white p-4 shadow-sm" style={{ borderColor: level.accentColour }}>
              <h2 className="font-semibold text-[#001532]">{child.display_name}</h2>
              <p className="text-sm text-[#2E3440]">
                {level.name} ({level.gradeBand})
              </p>
              <p className="mt-2 text-sm text-[#2E3440]">
                {child.lessonsMastered} / {level.lessons.length} lessons completed
              </p>
              {child.hasCertificate && <p className="mt-1 text-sm font-medium text-green-700">🎓 Capstone certificate earned</p>}
              <Link href={`/academy/levels/${child.level}`} className="mt-2 inline-block text-sm text-[#138A9A] underline">
                View the curriculum
              </Link>
            </div>
          );
        })}
        {children.length === 0 && <p className="text-sm text-[#2E3440]">No children linked to your account yet.</p>}
      </div>
    </div>
  );
}
