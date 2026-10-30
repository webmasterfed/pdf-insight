import { z } from 'zod';
import type { FixedWindowRateLimiter, RateLimitResult } from './rateLimit.ts';

const STORE_TIMEOUT_MS = 2_000;

// Counts one request for "key" and returns the seconds to wait (0 = allowed).
export type RateLimitStore = (key: string, limit: number, windowSeconds: number) => Promise<number>;

// Calls the check_rate_limit() Postgres function (see supabase/migrations) through the
// Supabase REST API. The service-role key comes from the function's injected environment and
// is only ever sent to our own Supabase project.
export function createPostgresStore(supabaseUrl: string, serviceRoleKey: string): RateLimitStore {
  return async (key, limit, windowSeconds) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_rate_limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ p_key: key, p_limit: limit, p_window_seconds: windowSeconds }),
      signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Rate limit store HTTP ${String(response.status)}`);
    }
    return z
      .number()
      .int()
      .min(0)
      .parse(await response.json());
  };
}

type LimitRule = {
  key: string;
  limit: number;
  windowSeconds: number;
  // Used when the shared store is not configured or cannot be reached.
  fallback: FixedWindowRateLimiter;
};

export async function checkRateLimit(
  store: RateLimitStore | null,
  rule: LimitRule,
): Promise<RateLimitResult> {
  if (store) {
    try {
      const retryAfterSeconds = await store(rule.key, rule.limit, rule.windowSeconds);
      return retryAfterSeconds > 0 ? { allowed: false, retryAfterSeconds } : { allowed: true };
    } catch (error) {
      // Never block the demo because the database is down; fall back to the per-instance limit.
      console.error(
        `rate limit store unavailable, using in-memory fallback (${error instanceof Error ? error.message : 'unknown'})`,
      );
    }
  }
  return rule.fallback.check(rule.key);
}

// The IP is stored only as a SHA-256 hash (pseudonymised), never in plain text.
export async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
