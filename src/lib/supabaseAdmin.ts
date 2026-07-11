import { createClient } from "@supabase/supabase-js";
import { getEnv } from "./env";

/**
 * Service-role Supabase client — server-only (webhook + checkout-session
 * routes), never imported from client components. Used to persist orders
 * and refund-policy acceptance; see supabase/schema.sql for the table.
 */
export function getSupabaseAdmin() {
  const env = getEnv();
  const url = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
