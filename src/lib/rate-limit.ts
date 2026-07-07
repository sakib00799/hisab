/**
 * Fixed-window in-memory rate limiter.
 *
 * Serverless caveat: each warm lambda instance has its own window, so this is
 * burst protection rather than a hard global cap. For strict global limits,
 * swap the store for Upstash Redis / Vercel KV keeping the same interface.
 */
interface WindowEntry {
  count: number;
  resetAt: number;
}

const windows = new Map<string, WindowEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const entry = windows.get(key);

  if (!entry || now >= entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    retryAfter: 0,
  };
}

/** Reset all windows (test helper). */
export function resetRateLimits() {
  windows.clear();
}
