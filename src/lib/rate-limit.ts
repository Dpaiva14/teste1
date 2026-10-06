import { tooManyRequests } from "./errors";

/**
 * Fixed-window-with-sliding-log rate limiter, in memory.
 *
 * Limitation (documented in README): state is per Node process. For multi-instance deployments swap
 * `MemoryRateLimitStore` for a shared store (Redis/Upstash) behind the same `RateLimitStore` interface.
 */
export interface RateLimitStore {
  /** Record a hit for `key` and return how many hits fall inside the window (including this one) plus ms until the oldest expires. */
  hit(key: string, windowMs: number, now: number): { count: number; resetMs: number };
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly hits = new Map<string, number[]>();
  private lastSweep = 0;

  hit(key: string, windowMs: number, now: number) {
    const cutoff = now - windowMs;
    const list = (this.hits.get(key) ?? []).filter((t) => t > cutoff);
    list.push(now);
    this.hits.set(key, list);
    this.sweep(now, windowMs);
    const oldest = list[0] ?? now;
    return { count: list.length, resetMs: Math.max(0, oldest + windowMs - now) };
  }

  private sweep(now: number, windowMs: number) {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, list] of this.hits) {
      const last = list[list.length - 1] ?? 0;
      if (now - last > windowMs) this.hits.delete(key);
    }
  }
}

const globalForLimiter = globalThis as unknown as { __rateLimitStore?: RateLimitStore };
const store: RateLimitStore = (globalForLimiter.__rateLimitStore ??= new MemoryRateLimitStore());

export interface RateLimitRule {
  /** Logical bucket name, e.g. "auth:login". */
  name: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function checkRateLimit(rule: RateLimitRule, identity: string, now = Date.now(), s: RateLimitStore = store): RateLimitResult {
  const { count, resetMs } = s.hit(`${rule.name}:${identity}`, rule.windowMs, now);
  return {
    allowed: count <= rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfterSec: Math.ceil(resetMs / 1000),
  };
}

/** Throws a 429 HttpError when the rule is exceeded. */
export function enforceRateLimit(rule: RateLimitRule, identity: string): void {
  const r = checkRateLimit(rule, identity);
  if (!r.allowed) throw tooManyRequests(r.retryAfterSec);
}

export const RATE_LIMITS = {
  login: { name: "auth:login", limit: 10, windowMs: 15 * 60_000 },
  loginPerEmail: { name: "auth:login-email", limit: 8, windowMs: 15 * 60_000 },
  register: { name: "auth:register", limit: 5, windowMs: 60 * 60_000 },
  forgot: { name: "auth:forgot", limit: 5, windowMs: 60 * 60_000 },
  forgotPerEmail: { name: "auth:forgot-email", limit: 3, windowMs: 60 * 60_000 },
  reset: { name: "auth:reset", limit: 10, windowMs: 60 * 60_000 },
  api: { name: "api", limit: 240, windowMs: 60_000 },
  upload: { name: "upload", limit: 20, windowMs: 10 * 60_000 },
  ai: { name: "ai", limit: 20, windowMs: 10 * 60_000 },
} as const satisfies Record<string, RateLimitRule>;
