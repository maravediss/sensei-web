import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL || "http://supabase-kong:8000";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    // dummy client during build (won't run queries)
    _client = createClient(url, "build-placeholder", {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: "sensei" },
    });
    return _client;
  }
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "sensei" },
  });
  return _client;
}

// Backwards-compat: lazy proxy
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, p) {
    const c = getSupabase();
    // @ts-expect-error proxy access
    return c[p];
  },
});
