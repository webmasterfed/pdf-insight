// Fixed-window counter kept in memory. Limitation: every Edge Function instance has its own
// memory, and instances restart, so this slows down abuse but is not a hard global guarantee.

type Window = { count: number; startedAt: number };

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

const MAX_TRACKED_KEYS = 10_000;

export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, Window>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(key: string, now: number = Date.now()): RateLimitResult {
    const current = this.windows.get(key);
    if (!current || now - current.startedAt >= this.windowMs) {
      this.removeExpired(now);
      this.windows.set(key, { count: 1, startedAt: now });
      return { allowed: true };
    }
    if (current.count >= this.limit) {
      const retryAfterMs = current.startedAt + this.windowMs - now;
      return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
    }
    current.count += 1;
    return { allowed: true };
  }

  // Keeps memory bounded when many different IPs call the function.
  private removeExpired(now: number): void {
    if (this.windows.size < MAX_TRACKED_KEYS) {
      return;
    }
    for (const [key, window] of this.windows) {
      if (now - window.startedAt >= this.windowMs) {
        this.windows.delete(key);
      }
    }
  }
}
