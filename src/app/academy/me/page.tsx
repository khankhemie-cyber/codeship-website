"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAcademySession, type AcademySession } from "@/lib/academy/session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import LevelSemesterMap from "@/components/academy/LevelSemesterMap";
import type { LevelSlug } from "@/data/academy/curriculum";

export default function MyAcademyPage() {
  const [session, setSession] = useState<AcademySession | null | undefined>(undefined);
  const [level, setLevel] = useState<LevelSlug | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getAcademySession();
      setSession(s);
      if (s?.role === "student") {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase?.from("students").select("level").eq("id", s.id).maybeSingle() ?? { data: null };
        if (data) setLevel(data.level as LevelSlug);
      }
    })();
  }, []);

  if (session === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-[#2E3440]">Loading…</div>
    );
  }

  if (!session || session.role !== "student") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-[#2E3440]">
          You need to join with your class code and PIN first.{" "}
          <Link href="/academy/join" className="underline">
            Join a class
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-[#2E3440]">Welcome back, {session.displayName}!</p>
      {level && <LevelSemesterMap level={level} />}
    </div>
  );
}
