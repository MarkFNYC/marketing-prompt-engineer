import { NextRequest } from 'next/server';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Automatic cleanup of expired entries every 60 seconds to prevent memory leaks.
    // Only start in non-edge environments where setInterval is reliably available.
    if (typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
      // Allow the Node.js process to exit even if the timer is still active.
      if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
        (this.cleanupTimer as NodeJS.Timeout).unref();
      }
    }
  }

  /**
   * Check whether a request from `identifier` is allowed.
   *
   * @param identifier  Unique key for the requester (e.g. "user:<id>" or "ip:<addr>")
   * @param limit       Maximum number of requests allowed within the window
   * @param windowMs    Sliding window size in milliseconds
   * @returns           { allowed, remaining, resetMs }
   */
  check(identifier: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing timestamps or initialise an empty array.
    let timestamps = this.requests.get(identifier) ?? [];

    // Remove timestamps that fall outside the current window.
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      // Rate-limited – calculate when the earliest request in the window expires.
      const oldestInWindow = timestamps[0];
      const resetMs = oldestInWindow + windowMs - now;

      // Persist the pruned array back.
      this.requests.set(identifier, timestamps);

      return {
        allowed: false,
        remaining: 0,
        resetMs: Math.max(resetMs, 0),
      };
    }

    // Allowed – record the current request.
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return {
      allowed: true,
      remaining: limit - timestamps.length,
      resetMs: 0,
    };
  }

  /**
   * Remove entries whose timestamps have all expired (older than 5 minutes).
   */
  private cleanup(): void {
    const cutoff = Date.now() - 5 * 60_000;
    for (const [key, timestamps] of this.requests.entries()) {
      // If the newest timestamp for this key is older than the cutoff, drop it.
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < cutoff) {
        this.requests.delete(key);
      }
    }
  }
}

/** Singleton rate limiter instance shared across all API routes. */
export const rateLimiter = new RateLimiter();

/**
 * Derive a stable client identifier from the request.
 *
 * If a `userId` is provided it takes precedence (authenticated path).
 * Otherwise fall back to the IP address from the x-forwarded-for header.
 */
export function getClientIdentifier(request: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}
