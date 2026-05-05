interface Bucket {
    count: number;
    resetAt: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
    allowed: boolean;
    retryAfterSeconds: number;
}

export function checkRateLimit(key: string): RateLimitResult {
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
        buckets.set(key, {count: 1, resetAt: now + WINDOW_MS});
        return {allowed: true, retryAfterSeconds: 0};
    }
    if (existing.count >= MAX_ATTEMPTS) {
        return {allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000)};
    }
    existing.count += 1;
    return {allowed: true, retryAfterSeconds: 0};
}

export function clearRateLimit(key: string): void {
    buckets.delete(key);
}
