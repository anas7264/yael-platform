/**
 * In-memory token bucket rate limiter.
 * Map-based — works in serverless with per-instance isolation.
 *
 * Route type limits (requests per minute):
 *   ai       → 10 req/min
 *   practice → 30 req/min
 *   general  → 60 req/min
 */

export type RouteType = 'ai' | 'practice' | 'general';

interface BucketEntry {
  tokens: number;
  lastRefill: number; // epoch ms
}

const LIMITS: Record<RouteType, { maxTokens: number; refillMs: number }> = {
  ai:       { maxTokens: 10, refillMs: 60_000 },
  practice: { maxTokens: 30, refillMs: 60_000 },
  general:  { maxTokens: 60, refillMs: 60_000 },
};

// Keyed by `${userId}:${routeType}`
const buckets = new Map<string, BucketEntry>();

function refillBucket(entry: BucketEntry, max: number, refillMs: number): BucketEntry {
  const now = Date.now();
  const elapsed = now - entry.lastRefill;
  const tokensToAdd = Math.floor((elapsed / refillMs) * max);
  if (tokensToAdd > 0) {
    return {
      tokens: Math.min(max, entry.tokens + tokensToAdd),
      lastRefill: now,
    };
  }
  return entry;
}

interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the bucket refills at least one token */
  retryAfterSeconds: number;
}

export function checkRateLimit(userId: string, routeType: RouteType): RateLimitResult {
  const { maxTokens, refillMs } = LIMITS[routeType];
  const key = `${userId}:${routeType}`;

  let entry = buckets.get(key) ?? { tokens: maxTokens, lastRefill: Date.now() };

  // Refill based on elapsed time
  entry = refillBucket(entry, maxTokens, refillMs);

  if (entry.tokens <= 0) {
    buckets.set(key, entry);
    const retryAfterSeconds = Math.ceil(refillMs / maxTokens / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.tokens -= 1;
  buckets.set(key, entry);
  return { allowed: true, retryAfterSeconds: 0 };
}
