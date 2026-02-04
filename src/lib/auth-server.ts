import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
}

export async function requireUserId(request: NextRequest): Promise<{ userId: string } | { error: NextResponse }> {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    return {
      error: NextResponse.json({ error: 'Supabase not configured' }, { status: 500 }),
    };
  }

  const token = extractBearerToken(request);
  if (!token) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { userId: data.user.id };
}

export async function getUserIdIfPresent(request: NextRequest): Promise<{ userId: string | null } | { error: NextResponse }> {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    return {
      error: NextResponse.json({ error: 'Supabase not configured' }, { status: 500 }),
    };
  }

  const token = extractBearerToken(request);
  if (!token) {
    return { userId: null };
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { userId: data.user.id };
}
