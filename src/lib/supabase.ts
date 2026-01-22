import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Types for our database
export interface User {
  id: string;
  email: string;
  created_at: string;
  tier: 'free' | 'premium';
  prompts_used_this_month: number;
  prompts_reset_at: string;
}

export interface SavedOutput {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  output: string;
  discipline: string;
  mode: 'strategy' | 'execution';
  persona?: string;
  created_at: string;
  folder_id?: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
