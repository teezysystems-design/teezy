import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

// In-memory store for edge — resets per cold start.
// For production, replace with Vercel KV or Upstash Redis.
const store = new Map<string, { count: number; reset: number }>();

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export function rateLimit({ limit = 60, windowMs = 60_000 }: RateLimitOptions = {}) {
  return createMiddleware(async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      c.req.header('x-real-ip') ??
      'unknown';

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.reset) {
      store.set(ip, { count: 1, reset: now + windowMs });
    } else {
      entry.count++;
      if (entry.count > limit) {
        throw new HTTPException(429, { message: 'Too many requests' });
      }
    }

    await next();
  });
}

/** Strict rate limit for sensitive endpoints (auth, booking creation) */
export const strictRateLimit = rateLimit({ limit: 10, windowMs: 60_000 });

/** Standard rate limit for general API */
export const standardRateLimit = rateLimit({ limit: 60, windowMs: 60_000 });
