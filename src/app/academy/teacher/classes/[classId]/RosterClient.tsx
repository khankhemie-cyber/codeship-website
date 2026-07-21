"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getLocalizedLevel, type LevelSlug, type Semester } from "@/data/academy/curriculum";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ClassInfo {
  id: string;
  name: string;
  level: LevelSlug;
  semester: Semester;
  class_code: string;
}
interface StudentRow {
  id: string;
  display_name: string;
}

export default function RosterClient({ classId }: { classId: string }) {
  const [klass, setKlass] = useState<ClassInfo | null>(null);
  const [roster, setRoster] = useState<StudentRow[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [lastPin, setLastPin] = useState<{ name: string; pin: string } | null>(null);
  const [projectStatus, setProjectStatus] = useState<Record<string, Record<string, string>>>({});
  const [quizPassed, setQuizPassed] = useState<Record<string, Record<string, boolean>>>({});
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data: classData } = await supabase
      .from("classes")
      .select("id, name, level, semester, class_code")
      .eq("id", classId)
      .maybeSingle();
    if (classData) setKlass(classData as ClassInfo);

    const { data: enrollments } = await supabase.from("enrollments").select("student_id").eq("class_id", classId);
    const studentIds = (enrollments ?? []).map((e) => e.student_id);
    if (studentIds.length === 0) {
      setRoster([]);
      return;
    }
    const { data: students } = await supabase.from("students").select("id, display_name").in("id", studentIds);
    setRoster((students as StudentRow[] | null) ?? []);

    const { data: projects } = await supabase
      .from("project_submissions")
      .select("student_id, project_id, status")
      .in("student_id", studentIds);
    const projectMap: Record<string, Record<string, string>> = {};
    for (const row of projects ?? []) {
      projectMap[row.student_id] ??= {};
      projectMap[row.student_id][row.project_id] = row.status;
    }
    setProjectStatus(projectMap);

    const { data: quizzes } = await supabase
      .from("quiz_results")
      .select("student_id, quiz_id, passed")
      .in("student_id", studentIds);
    const quizMap: Record<string, Record<string, boolean>> = {};
    for (const row of quizzes ?? []) {
      quizMap[row.student_id] ??= {};
      quizMap[row.student_id][row.quiz_id] = row.passed;
    }
    setQuizPassed(quizMap);
  }, [classId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    if (!session) return;
    setBusy(true);
    const response = await fetch("/api/academy/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ classId, displayName: newStudentName }),
    });
    setBusy(false);
    if (response.ok) {
      const data = await response.json();
      setLastPin({ name: newStudentName, pin: data.pin });
      setNewStudentName("");
      await refresh();
    }
  }

  async function markProjectPassed(studentId: string, projectId: string) {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    if (!session) return;
    await fetch("/api/academy/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ type: "project_pass", studentId, projectId }),
    });
    await refresh();
  }

  async function advanceSemester() {
    if (!klass) return;
    const order: Semester[] = ["1", "2", "3", "4", "capstone"];
    const next = order[order.indexOf(klass.semester) + 1];
    if (!next) return;
    const supabase = getSupabaseBrowserClient();
    await supabase?.from("classes").update({ semester: next }).eq("id", klass.id);
    await refresh();
  }

  if (!klass) return <p className="text-[#2E3440]">Loading…</p>;

  const curriculum = getLocalizedLevel(klass.level, "en");
  const currentProject = curriculum.projects.find((p) => p.semester === klass.semester);
  const currentQuizzes = curriculum.quizzes.filter((q) => q.semester === klass.semester);
  const currentLessons = curriculum.lessons
    .filter((l) => l.semester === klass.semester)
    .sort((a, b) => a.classNumber - b.classNumber);

  return (
    <div>
      <p className="text-sm">
        <Link href="/academy/teacher" className="text-[#138A9A] hover:underline">
          ← My classes
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-bold text-[#001532]">{klass.name}</h1>
      <p className="text-sm text-[#2E3440]">
        {curriculum.name} · Class code: <strong>{klass.class_code}</strong>
      </p>

      <section className="mt-6 rounded-lg border border-[#138A9A]/30 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#001532]">
            This week&apos;s kit: Semester {klass.semester}
            {currentProject ? ` — ${currentProject.title}` : ""}
          </h2>
          {klass.semester !== "capstone" && (
            <button
              type="button"
              onClick={advanceSemester}
              className="rounded-md border border-[#001532] px-3 py-1 text-xs font-medium text-[#001532] hover:bg-[#001532] hover:text-white"
            >
              Move class to next semester
            </button>
          )}
        </div>
        <ul className="mt-2 flex flex-wrap gap-2 text-sm text-[#2E3440]">
          {currentLessons.map((l) => (
            <li key={l.id} className="rounded-full bg-[#F1EEE7] px-3 py-1">
              Class {l.classNumber}: {l.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[#001532]">Roster & mastery</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#138A9A]/30 text-left">
                <th className="py-2 pr-4 font-semibold text-[#001532]">Student</th>
                <th className="py-2 pr-4 font-semibold text-[#001532]">This semester&apos;s quizzes</th>
                <th className="py-2 pr-4 font-semibold text-[#001532]">This semester&apos;s project</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((student) => (
                <tr key={student.id} className="border-b border-[#138A9A]/10">
                  <td className="py-2 pr-4 text-[#001532]">{student.display_name}</td>
                  <td className="py-2 pr-4">
                    {currentQuizzes.map((q) => (
                      <span
                        key={q.id}
                        className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                          quizPassed[student.id]?.[q.id] ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        Q{q.quizNumber} {quizPassed[student.id]?.[q.id] ? "✓" : "—"}
                      </span>
                    ))}
                  </td>
                  <td className="py-2 pr-4">
                    {currentProject && (
                      <>
                        <span className="mr-2 text-xs text-[#2E3440]">
                          {projectStatus[student.id]?.[currentProject.id] ?? "not started"}
                        </span>
                        {projectStatus[student.id]?.[currentProject.id] === "submitted" && (
                          <button
                            type="button"
                            onClick={() => markProjectPassed(student.id, currentProject.id)}
                            className="rounded-md bg-[#001532] px-2 py-1 text-xs font-medium text-white hover:bg-[#0D1B2A]"
                          >
                            Mark passed
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {roster.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-[#2E3440]">
                    No students yet — add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[#001532]">Add a student</h2>
        <form onSubmit={addStudent} className="mt-3 flex max-w-sm items-end gap-2">
          <div className="flex-1">
            <label htmlFor="studentName" className="block text-sm font-medium text-[#001532]">
              Student&apos;s first name
            </label>
            <input
              id="studentName"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-[#138A9A] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#138A9A]"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[#001532] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
          >
            Add
          </button>
        </form>
        {lastPin && (
          <p className="mt-3 rounded-md bg-[#FFF8E7] p-3 text-sm text-[#001532]">
            {lastPin.name}&apos;s PIN is <strong>{lastPin.pin}</strong> — write it down now, it won&apos;t be shown again.
            Give it to them with the class code <strong>{klass.class_code}</strong> to join at{" "}
            <Link href="/academy/join" className="underline">
              /academy/join
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
