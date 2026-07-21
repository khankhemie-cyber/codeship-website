import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AcademyRole = "student" | "teacher" | "parent" | "school_admin";

export interface AcademySession {
  role: AcademyRole;
  id: string; // row id in the role's own table (students.id, teachers.id, ...)
  displayName: string;
}

/**
 * Determines which of the 4 role tables the current auth user has a row in.
 * A signed-in user has exactly one role row (a person only ever has one
 * academy identity), so the first match wins.
 */
export async function getAcademySession(): Promise<AcademySession | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (student) return { role: "student", id: student.id, displayName: student.display_name };

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, display_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (teacher) return { role: "teacher", id: teacher.id, displayName: teacher.display_name };

  const { data: parent } = await supabase
    .from("parents")
    .select("id, display_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (parent) return { role: "parent", id: parent.id, displayName: parent.display_name };

  const { data: admin } = await supabase
    .from("school_admins")
    .select("id, display_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (admin) return { role: "school_admin", id: admin.id, displayName: admin.display_name };

  return null;
}

export async function signOutOfAcademy(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase?.auth.signOut();
}
