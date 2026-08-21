// ponytail: token hashing + identity assignment.

import { createHash, createHmac, randomBytes } from "node:crypto";
import { CHARACTERS } from "../characters";
import type { CharacterSlug } from "../../types";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

// ponytail: hash with secret so a DB leak doesn't let an attacker forge sessions.
export function hashToken(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function assignIdentity(token: string): CharacterSlug {
  const h = createHash("sha256").update(token).digest();
  const n = h.readUInt32BE(0);
  return CHARACTERS[n % CHARACTERS.length].slug;
}
