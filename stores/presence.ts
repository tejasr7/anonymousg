"use client";

import { create } from "zustand";
import type { CharacterSlug } from "@/types";

export type PresenceEntry = {
  sessionId: string;
  characterSlug: CharacterSlug;
  characterDisplayName: string;
  joinedAt: number;
};

export type TypingEntry = {
  sessionId: string;
  characterSlug: CharacterSlug;
  characterDisplayName: string;
};

type PresenceState = {
  online: PresenceEntry[];
  typingByRoom: Record<string, TypingEntry[]>;
  blockedSessionIds: Set<string>;
  setOnline: (list: PresenceEntry[]) => void;
  setTyping: (roomId: string, list: TypingEntry[]) => void;
  toggleBlock: (sessionId: string) => void;
  hydrateBlocks: (ids: string[]) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  online: [],
  typingByRoom: {},
  blockedSessionIds: new Set(),
  setOnline: (list) => set({ online: list }),
  setTyping: (roomId, list) =>
    set((s) => ({ typingByRoom: { ...s.typingByRoom, [roomId]: list } })),
  toggleBlock: (sessionId) =>
    set((s) => {
      const next = new Set(s.blockedSessionIds);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      // ponytail: persist
      try {
        localStorage.setItem("chaos.blocks", JSON.stringify([...next]));
      } catch {}
      return { blockedSessionIds: next };
    }),
  hydrateBlocks: (ids) => set({ blockedSessionIds: new Set(ids) }),
}));

// ponytail: selector that hides messages/reactions from blocked users.
export function selectVisibleMessages(
  messages: { sessionId: string; id: string }[],
  blocked: Set<string>
) {
  return messages.filter((m) => !blocked.has(m.sessionId));
}
