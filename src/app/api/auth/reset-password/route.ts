import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { requireOrigin } from '@/lib/csrf';
import { apiError } from '@/lib/api-error';
import { resetPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // CSRF protection: validate request origin
    const originError = requireOrigin(request);
    if (originError) return originError;

    // Rate limiting (IP-based, 3 requests per minute)
    const identifier = getClientIdentifier(request);
    const rateCheck = rateLimiter.check(identifier, 3, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    const { email } = parsed.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://amplify.fabricacollective.com'}/auth/callback?type=recovery`,
    });

    if (error) {
      console.error('Reset password Supabase error:', error);
      return NextResponse.json({ error: 'Password reset failed. Please try again.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error: any) {
    return apiError('Password reset failed', 500, 'Reset password error:', error);
  }
}
