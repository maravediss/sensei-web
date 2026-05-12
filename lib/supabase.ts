import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "https://supabase.margitalia.com";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "sensei" },
});

// Plain SQL via PostgREST RPC functions (when schema exposure not available)
export async function sql<T = unknown>(query: string): Promise<T[]> {
  const resp = await fetch(`${url}/rest/v1/rpc/sensei_query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ q: query }),
    cache: "no-store",
  });
  if (!resp.ok) throw new Error(`SQL ${resp.status}: ${await resp.text()}`);
  return resp.json();
}
