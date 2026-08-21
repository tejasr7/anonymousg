// ponytail: in-memory presence + typing state.
// Both are single-instance maps; swap for Redis pub/sub when scaling.

import type { CharacterSlug } from "../../types";

export type PresenceEntry = {
  sessionId: string;
  characterSlug: CharacterSlug;
  characterDisplayName: string;
  joinedAt: number;
};

const presence = new Map<string, PresenceEntry>();

export function addPresence(entry: PresenceEntry): boolean {
  const prev = presence.get(entry.sessionId);
  presence.set(entry.sessionId, entry);
  // ponytail: only "changed" if entry is new or different fields.
  if (!prev) return true;
  return (
    prev.characterSlug !== entry.characterSlug ||
    prev.characterDisplayName !== entry.characterDisplayName
  );
}

export function removePresence(sessionId: string): boolean {
  return presence.delete(sessionId);
}

export function getPresence(): PresenceEntry[] {
  return Array.from(presence.values()).sort((a, b) => a.joinedAt - b.joinedAt);
}

export function getPresenceSet(): Set<string> {
  return new Set(presence.keys());
}

// ----- typing state -----
type TypingWithTimeout = {
  sessionId: string;
  characterSlug: CharacterSlug;
  characterDisplayName: string;
  timeoutId: NodeJS.Timeout | null;
};

const typing = new Map<string, Map<string, TypingWithTimeout>>();

function getRoomTyping(roomId: string): Map<string, TypingWithTimeout> {
  let m = typing.get(roomId);
  if (!m) {
    m = new Map();
    typing.set(roomId, m);
  }
  return m;
}

export function addTyping(
  roomId: string,
  entry: { sessionId: string; characterSlug: CharacterSlug; characterDisplayName: string }
): { changed: boolean; typing: ReturnType<typeof getTyping> } {
  const m = getRoomTyping(roomId);
  const prev = m.get(entry.sessionId);
  const changed = !prev || prev.characterSlug !== entry.characterSlug;
  if (prev?.timeoutId) clearTimeout(prev.timeoutId);
  const entryWithTimeout: TypingWithTimeout = { ...entry, timeoutId: null };
  const id = setTimeout(() => removeTyping(roomId, entry.sessionId), 8_000);
  entryWithTimeout.timeoutId = id;
  m.set(entry.sessionId, entryWithTimeout);
  return { changed, typing: getTyping(roomId) };
}

export function removeTyping(roomId: string, sessionId: string): { changed: boolean; typing: ReturnType<typeof getTyping> } {
  const m = typing.get(roomId);
  if (!m) return { changed: false, typing: [] };
  const had = m.delete(sessionId);
  if (had) {
    const e = m.get(sessionId);
    if (e?.timeoutId) clearTimeout(e.timeoutId);
    if (m.size === 0) typing.delete(roomId);
  }
  return { changed: had, typing: getTyping(roomId) };
}

export function getTyping(roomId: string): {
  sessionId: string;
  characterSlug: CharacterSlug;
  characterDisplayName: string;
}[] {
  return Array.from(getRoomTyping(roomId).values()).map((e) => ({
    sessionId: e.sessionId,
    characterSlug: e.characterSlug,
    characterDisplayName: e.characterDisplayName,
  }));
}
