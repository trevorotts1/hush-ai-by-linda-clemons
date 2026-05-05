import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
  return _client;
}

function getAdmin(): SupabaseClient {
  if (_admin) return _admin;
  _admin = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  return _admin;
}

// Lazy accessors
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient() as unknown as Record<PropertyKey, unknown>;
    return client[prop];
  }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const admin = getAdmin() as unknown as Record<PropertyKey, unknown>;
    return admin[prop];
  }
});

export async function createUser(email: string, phone: string, firstName: string) {
  const { data, error } = await getAdmin()
    .from("hush_users")
    .insert({ email, phone, first_name: firstName })
    .select("id, email, first_name")
    .single();
  if (error) throw error;
  return data;
}

export async function getUser(email: string) {
  const { data, error } = await getAdmin()
    .from("hush_users")
    .select("id, email, first_name, phone")
    .eq("email", email)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}
