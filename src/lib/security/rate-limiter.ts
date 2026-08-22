interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  sos: { maxRequests: 10, windowMs: 60 * 1000 },          // 10 req / min
  alerts: { maxRequests: 5, windowMs: 60 * 1000 },         // 5 req / min
  incidents: { maxRequests: 30, windowMs: 60 * 1000 },     // 30 req / min
  copilot: { maxRequests: 25, windowMs: 60 * 1000 },       // 25 req / min
  ai_triage: { maxRequests: 35, windowMs: 60 * 1000 },     // 35 req / min
  auth: { maxRequests: 20, windowMs: 60 * 1000 },          // 20 req / min
  default: { maxRequests: 60, windowMs: 60 * 1000 },       // 60 req / min
};

const store = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically to avoid memory growth
const CLEANUP_INTERVAL_MS = 2 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleRecords(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    // Retain only records active within the last 5 minutes
    const validTimestamps = record.timestamps.filter((ts) => now - ts < 5 * 60 * 1000);
    if (validTimestamps.length === 0) {
      store.delete(key);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}

/**
 * Extracts a representative client identifier (IP address or fallback).
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * In-memory sliding-window rate limiter.
 */
export function checkRateLimit(
  key: string,
  category: keyof typeof DEFAULT_CONFIGS = 'default',
  customConfig?: Partial<RateLimitConfig>
): RateLimitResult {
  const now = Date.now();
  cleanupStaleRecords(now);

  const config: RateLimitConfig = {
    ...(DEFAULT_CONFIGS[category] || DEFAULT_CONFIGS.default),
    ...customConfig,
  };

  const storeKey = `${category}:${key}`;
  let record = store.get(storeKey);

  if (!record) {
    record = { timestamps: [] };
    store.set(storeKey, record);
  }

  // Filter timestamps within the current sliding window
  const windowStart = now - config.windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = Math.max(0, oldestTimestamp + config.windowMs - now);

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.timestamps.length,
    resetMs: config.windowMs,
  };
}

/**
 * Reset rate limit for a key (useful for automated testing teardown).
 */
export function resetRateLimit(key?: string): void {
  if (key) {
    for (const storeKey of store.keys()) {
      if (storeKey.includes(key)) {
        store.delete(storeKey);
      }
    }
  } else {
    store.clear();
  }
}
