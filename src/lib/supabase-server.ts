import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-loaded admin client with service role key (bypasses RLS)
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    _supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

// For backwards compatibility (but will be evaluated lazily)
export const supabaseAdmin = {
  from: (table: string) => getSupabaseAdmin().from(table),
};
