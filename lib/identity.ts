import type { CharacterSlug } from "@/types";
import { CHARACTERS } from "@/lib/characters";

// ponytail: stable per session token, not random per call.
export function assignIdentity(token: string): CharacterSlug {
  const hash = simpleHash(token);
  return CHARACTERS[hash % CHARACTERS.length].slug;
}

export function simpleHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

// ponytail: cryptographically strong token, used as cookie
export function generateSessionToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
