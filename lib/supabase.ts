import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * It uses the SERVICE ROLE key, which bypasses Row Level Security. That is
 * deliberate: all three tables have RLS enabled with no policies, so the
 * browser-side key can read nothing at all. Every single read and write in
 * this app goes through server code in lib/data.ts, which applies the
 * role rules itself. The browser never touches the database.
 */
export const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
