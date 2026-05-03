import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Auth helpers
export async function createUser(email: string, phone: string, firstName: string) {
  const { data, error } = await supabaseAdmin
    .from("hush_users")
    .insert({ email, phone, first_name: firstName })
    .select("id, email, first_name")
    .single();

  if (error) throw error;
  return data;
}

export async function getUser(email: string) {
  const { data, error } = await supabaseAdmin
    .from("hush_users")
    .select("id, email, first_name, phone")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}
