import { NextResponse } from 'next/server';

/**
 * Create a sanitized API error response.
 *
 * For 5xx errors the caller-supplied message is replaced with a generic
 * "Internal server error" so that implementation details (Supabase, Stripe,
 * Gemini, etc.) are never leaked to the client.  4xx messages are passed
 * through as-is because they are expected to be user-friendly.
 *
 * @param message  - Human-readable error description (only sent for 4xx).
 * @param status   - HTTP status code.
 * @param logContext - Optional prefix for the console.error log line.
 * @param logError  - Optional underlying error object to log server-side.
 */
export function apiError(
  message: string,
  status: number,
  logContext?: string,
  logError?: unknown,
): NextResponse {
  if (logError) {
    console.error(logContext || 'API Error:', logError);
  }

  // In production, don't expose internal error details
  const safeMessage = status >= 500
    ? 'Internal server error'
    : message;

  return NextResponse.json({ error: safeMessage }, { status });
}
