// ponytail: double-submit cookie CSRF. GET /api/csrf sets chaos_csrf cookie
// + returns the value; client echoes it in x-csrf-token header on POSTs.

import { randomBytes } from "node:crypto";

export function makeCsrfToken(): string {
  return randomBytes(24).toString("hex");
}

export const CSRF_COOKIE = "chaos_csrf";
export const CSRF_HEADER = "x-csrf-token";
