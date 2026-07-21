"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAcademySession, type AcademySession } from "@/lib/academy/session";

interface TeacherRow {
  id: string;
  display_name: string;
}
interface ClassRow {
  id: string;
  name: string;
  level: string;
  semester: string;
}

export default function SchoolAdminDashboardPage() {
  const [session, setSession] = useState<AcademySession | null | undefined>(undefined);
  const [schoolName, setSchoolName] = useState("");
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);

  useEffect(() => {
    (async () => {
      const s = await getAcademySession();
      setSession(s);
      if (s?.role !== "school_admin") return;

      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: admin } = await supabase.from("school_admins").select("school_id").eq("id", s.id).maybeSingle();
      if (!admin) return;

      const { data: school } = await supabase.from("schools").select("name").eq("id", admin.school_id).maybeSingle();
      if (school) setSchoolName(school.name);

      const { data: teacherRows } = await supabase.from("teachers").select("id, display_name").eq("school_id", admin.school_id);
      setTeachers((teacherRows as TeacherRow[] | null) ?? []);

      const { data: classRows } = await supabase.from("classes").select("id, name, level, semester").eq("school_id", admin.school_id);
      setClasses((classRows as ClassRow[] | null) ?? []);
    })();
  }, []);

  if (session === undefined) return <div className="mx-auto max-w-5xl px-4 py-10 text-[#2E3440]">Loading…</div>;
  if (!session || session.role !== "school_admin") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-[#2E3440]">
        You need a school admin account. <Link href="/academy/login" className="underline">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#001532]">{schoolName || "Your school"}</h1>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-[#001532]">Teachers ({teachers.length})</h2>
          <ul className="mt-2 space-y-1 text-sm text-[#2E3440]">
            {teachers.map((t) => (
              <li key={t.id} className="rounded-md bg-white px-3 py-2 shadow-sm">
                {t.display_name}
              </li>
            ))}
            {teachers.length === 0 && <li>No teachers yet.</li>}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#001532]">Classes ({classes.length})</h2>
          <ul className="mt-2 space-y-1 text-sm text-[#2E3440]">
            {classes.map((c) => (
              <li key={c.id} className="rounded-md bg-white px-3 py-2 shadow-sm">
                {c.name} — {c.level}, Semester {c.semester}
              </li>
            ))}
            {classes.length === 0 && <li>No classes yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
