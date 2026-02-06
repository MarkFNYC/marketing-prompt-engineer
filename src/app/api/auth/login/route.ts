import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { requireOrigin } from '@/lib/csrf';
import { apiError } from '@/lib/api-error';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    // Rate limiting (IP-based, 5 requests per minute)
    const identifier = getClientIdentifier(request);
    const rateCheck = rateLimiter.check(identifier, 5, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    const { email } = parsed.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use magic link (passwordless) authentication
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('Login Supabase error:', error);
      return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Magic link sent! Check your email.',
      success: true,
    });
  } catch (error: any) {
    return apiError('Login failed', 500, 'Login error:', error);
  }
}
