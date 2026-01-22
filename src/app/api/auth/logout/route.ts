import { NextResponse } from 'next/server';

export async function POST() {
  // Client-side will handle the actual sign out via supabase.auth.signOut()
  // This endpoint just confirms the logout request
  return NextResponse.json({ message: 'Logged out successfully' });
}
