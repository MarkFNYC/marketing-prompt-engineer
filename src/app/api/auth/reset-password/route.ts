import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limiter';
import { requireOrigin } from '@/lib/csrf';
import { apiError } from '@/lib/api-error';
import { resetPasswordSchema } from '@/lib/validations';

// Verify Turnstile token with Cloudflare
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY not configured — blocking request');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Constant success message to prevent account enumeration
const SUCCESS_RESPONSE = {
  message: 'If an account with that email exists, a password reset link has been sent.',
};

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
    const { email, turnstileToken } = parsed.data;

    // Verify Turnstile token
    if (turnstileToken) {
      const isValid = await verifyTurnstile(turnstileToken);
      if (!isValid) {
        return NextResponse.json({ error: 'Security verification failed. Please try again.' }, { status: 400 });
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      // If Turnstile is configured but no token provided, reject
      return NextResponse.json({ error: 'Security verification required.' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://amplify.fabricacollective.com'}/auth/callback?type=recovery`,
    });

    // Always return the same success response regardless of whether the email exists.
    // This prevents account enumeration attacks. Log errors for debugging only.
    if (error) {
      console.error('Reset password Supabase error:', error);
    }

    return NextResponse.json(SUCCESS_RESPONSE);
  } catch (error: any) {
    return apiError('Password reset failed', 500, 'Reset password error:', error);
  }
}
