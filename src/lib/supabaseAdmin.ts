import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { getEnv } from "./env";

/**
 * Service-role Supabase client — server-only (edge routes under
 * src/app/api/*\/route.ts), never imported from client components; bypasses
 * RLS entirely. Matches PR #14's `getSupabaseAdmin()` (src/lib/supabaseAdmin.ts)
 * exactly so the two features share one client helper once both land.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  const env = getEnv();
  const url = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
