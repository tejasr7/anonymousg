// ponytail: in-memory rate limit (single instance). Periodic cleanup prevents Map growth.

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

// ponytail: run cleanup every 60s — removes expired buckets.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}, 60_000);
// ponytail: don't keep Node alive just for cleanup.
if (typeof cleanup.unref === "function") cleanup.unref();
