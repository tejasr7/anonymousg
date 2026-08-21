// ponytail: idempotency-key dedup. Reject a *retry* of the same send (same nonce),
// not any send within a window. Use case: socket reconnect retries the same send.

const sentNonces = new Map<string, number>(); // nonce → timestamp
const TTL = 60_000;
const MAX = 5_000;

export function shouldDedupNonce(sessionId: string, nonce: string | undefined): boolean {
  if (!nonce) return false;
  const key = `${sessionId}:${nonce}`;
  const last = sentNonces.get(key);
  const now = Date.now();
  if (last && now - last < TTL) return true;
  sentNonces.set(key, now);
  if (sentNonces.size > MAX) {
    for (const [k, t] of sentNonces) {
      if (now - t > TTL) sentNonces.delete(k);
    }
  }
  return false;
}
