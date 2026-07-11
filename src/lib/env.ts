import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Cloudflare Pages injects secrets (Stripe keys, Supabase keys, etc.) as
 * bindings on `getRequestContext().env` — `next dev` has no Cloudflare
 * context, so fall back to `process.env` there (populate via `.env.local`)
 * to keep local development working without a `wrangler pages dev` setup.
 */
export function getEnv(): Record<string, string | undefined> {
  try {
    return getRequestContext().env as Record<string, string | undefined>;
  } catch {
    return process.env as Record<string, string | undefined>;
  }
}
