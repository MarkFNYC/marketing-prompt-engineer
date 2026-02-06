/**
 * Centralized origin allowlist for API route protection.
 *
 * All API routes that perform origin/referer checks should import
 * `isAllowedOrigin` from this module instead of maintaining their
 * own hardcoded lists.
 */

const KNOWN_ORIGINS = [
  'https://amplify.fabricacollective.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

/**
 * The full list of allowed origins, built from known domains plus
 * the NEXT_PUBLIC_SITE_URL environment variable (when set).
 */
export const ALLOWED_ORIGINS: string[] = [
  ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
  ...KNOWN_ORIGINS,
];

/**
 * Returns true when the given origin (or referer) is permitted.
 *
 * Checks performed (in order):
 * 1. If `origin` is null/undefined/empty, returns false.
 * 2. If `origin` matches (startsWith) any entry in ALLOWED_ORIGINS, returns true.
 * 3. If `origin` ends with `.vercel.app`, returns true (preview deployments).
 * 4. Otherwise returns false.
 */
export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;

  // Allow any Vercel preview deployment
  if (origin.endsWith('.vercel.app')) return true;

  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}
