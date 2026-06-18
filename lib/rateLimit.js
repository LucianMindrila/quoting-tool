// In-memory rate limiter — 5 requests per IP per hour
// Sufficient for a low-traffic public form; no external service needed.

const store = new Map();

const MAX_REQUESTS = 5;
const WINDOW_MS    = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(ip) {
  const now  = Date.now();
  const hits  = (store.get(ip) || []).filter(t => now - t < WINDOW_MS);

  if (hits.length >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  hits.push(now);
  store.set(ip, hits);

  // Periodically clear stale entries to prevent memory growth
  if (store.size > 2000) {
    for (const [key, times] of store) {
      if (times.every(t => now - t >= WINDOW_MS)) store.delete(key);
    }
  }

  return { allowed: true, remaining: MAX_REQUESTS - hits.length };
}
