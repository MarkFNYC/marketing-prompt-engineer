import { NextRequest, NextResponse } from 'next/server';
import { requireOrigin } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  // CSRF protection: validate request origin
  const originError = requireOrigin(request);
  if (originError) return originError;

  // Client-side will handle the actual sign out via supabase.auth.signOut()
  // This endpoint just confirms the logout request
  return NextResponse.json({ message: 'Logged out successfully' });
}
