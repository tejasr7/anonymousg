"use client";

// ponytail: CSRF helper — fetch token once, echo on POSTs.
// Auto-retry once on 403 (token may have rotated server-side).

let cached: { token: string; fetchedAt: number } | null = null;
const TTL = 5 * 60_000; // 5 min

function clearCache() {
  cached = null;
}

export { clearCache as clearCsrfCache };

export async function getCsrfToken(): Promise<string> {
  if (cached && Date.now() - cached.fetchedAt < TTL) return cached.token;
  const r = await fetch("/api/csrf", { credentials: "include" });
  const data = await r.json();
  cached = { token: data.token, fetchedAt: Date.now() };
  return data.token;
}

export async function csrfPost<T>(url: string, body: unknown): Promise<T> {
  const tryOnce = async () => {
    const token = await getCsrfToken();
    const r = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      body: JSON.stringify(body),
    });
    return r;
  };
  let r = await tryOnce();
  if (r.status === 403) {
    // ponytail: token stale (multi-tab, server rotation). Refetch + retry once.
    clearCache();
    r = await tryOnce();
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
}
