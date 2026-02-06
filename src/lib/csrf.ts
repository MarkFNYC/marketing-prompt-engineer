import { NextRequest, NextResponse } from 'next/server';
import { isAllowedOrigin } from '@/lib/allowed-origins';

/**
 * CSRF / Origin validation helper.
 *
 * The Amplify app uses Bearer tokens (Authorization header) for authenticated
 * endpoints, which are inherently immune to CSRF because browsers never
 * auto-send custom headers on cross-origin requests. This module provides
 * additional defence-in-depth by validating the Origin / Referer header on
 * every state-changing request (POST / PUT / DELETE).
 *
 * For unauthenticated endpoints (login, signup, reset-password) this is the
 * primary CSRF defence.
 *
 * The canonical list of allowed origins lives in `@/lib/allowed-origins`.
 */

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the request originates from a trusted origin.
 *
 * Delegates to `isAllowedOrigin` from `@/lib/allowed-origins`, which
 * handles Vercel preview deployments, the configured NEXT_PUBLIC_SITE_URL,
 * and the hard-coded known domains.
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // At least one header must be present.
  if (!origin && !referer) {
    return false;
  }

  return isAllowedOrigin(origin) || isAllowedOrigin(referer);
}

/**
 * Convenience wrapper that returns a 403 response when the origin is not
 * allowed. Call at the top of any POST / PUT / DELETE handler:
 *
 * ```ts
 * const originError = requireOrigin(request);
 * if (originError) return originError;
 * ```
 */
export function requireOrigin(request: NextRequest): NextResponse | null {
  if (validateOrigin(request)) {
    return null; // Origin is fine -- continue.
  }

  return NextResponse.json(
    { error: 'Forbidden - origin not allowed' },
    { status: 403 },
  );
}
