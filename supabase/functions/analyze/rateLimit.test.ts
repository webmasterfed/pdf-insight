import { describe, expect, it } from 'vitest';
import { FixedWindowRateLimiter } from './rateLimit.ts';

describe('FixedWindowRateLimiter', () => {
  it('allows requests up to the limit, then blocks with a retry time', () => {
    const limiter = new FixedWindowRateLimiter(2, 60_000);
    expect(limiter.check('1.2.3.4', 0).allowed).toBe(true);
    expect(limiter.check('1.2.3.4', 1_000).allowed).toBe(true);
    expect(limiter.check('1.2.3.4', 30_000)).toEqual({ allowed: false, retryAfterSeconds: 30 });
  });

  it('counts each key separately', () => {
    const limiter = new FixedWindowRateLimiter(1, 60_000);
    expect(limiter.check('a', 0).allowed).toBe(true);
    expect(limiter.check('b', 0).allowed).toBe(true);
    expect(limiter.check('a', 0).allowed).toBe(false);
  });

  it('starts a new window after the window time has passed', () => {
    const limiter = new FixedWindowRateLimiter(1, 60_000);
    expect(limiter.check('a', 0).allowed).toBe(true);
    expect(limiter.check('a', 60_000).allowed).toBe(true);
  });
});
