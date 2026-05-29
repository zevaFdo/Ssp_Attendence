import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client. NEVER import this in client components.
 * Use sparingly: profile inserts, storage uploads triggered by server actions, etc.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fail loudly in deployed environments if the secret is missing — otherwise
  // the JS client silently falls back to anon-role requests and you get
  // confusing downstream errors like PGRST116 (0 rows) because RLS filters
  // everything out instead of an explicit auth failure.
  if (!url) {
    throw new Error(
      "createAdminClient: NEXT_PUBLIC_SUPABASE_URL is not set in this environment.",
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "createAdminClient: SUPABASE_SERVICE_ROLE_KEY is not set in this environment. " +
        "Add it to your hosting provider's environment variables (it is the " +
        "`service_role` secret from Supabase Dashboard → Project Settings → API) " +
        "and redeploy.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
