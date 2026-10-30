import { describe, expect, it, vi } from 'vitest';
import { FixedWindowRateLimiter } from './rateLimit.ts';
import { checkRateLimit, hashIp, type RateLimitStore } from './sharedRateLimit.ts';

function rule(fallback = new FixedWindowRateLimiter(1, 60_000)) {
  return { key: 'ip:abc', limit: 10, windowSeconds: 600, fallback };
}

describe('checkRateLimit', () => {
  it('allows the request when the shared store returns 0', async () => {
    const store: RateLimitStore = vi.fn().mockResolvedValue(0);
    expect(await checkRateLimit(store, rule())).toEqual({ allowed: true });
    expect(store).toHaveBeenCalledWith('ip:abc', 10, 600);
  });

  it('blocks with Retry-After seconds when the shared store says so', async () => {
    const store: RateLimitStore = vi.fn().mockResolvedValue(42);
    expect(await checkRateLimit(store, rule())).toEqual({ allowed: false, retryAfterSeconds: 42 });
  });

  it('falls back to the in-memory limiter when the store fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const store: RateLimitStore = vi.fn().mockRejectedValue(new Error('HTTP 500'));
    const fallback = new FixedWindowRateLimiter(1, 60_000);
    expect((await checkRateLimit(store, rule(fallback))).allowed).toBe(true);
    expect((await checkRateLimit(store, rule(fallback))).allowed).toBe(false);
  });

  it('uses the in-memory limiter when no store is configured', async () => {
    const fallback = new FixedWindowRateLimiter(1, 60_000);
    expect((await checkRateLimit(null, rule(fallback))).allowed).toBe(true);
    expect((await checkRateLimit(null, rule(fallback))).allowed).toBe(false);
  });
});

describe('hashIp', () => {
  it('returns a 64-character hex SHA-256 hash, not the IP itself', async () => {
    const hash = await hashIp('203.0.113.7');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain('203.0.113.7');
    expect(await hashIp('203.0.113.7')).toBe(hash);
  });
});
