"use client";

import { create } from "zustand";
import type { CharacterSlug, Message, Room } from "@/types";

type ChatState = {
  currentRoomId: string;
  rooms: Room[];
  messagesByRoom: Record<string, Message[]>;
  replyTo: Message | null;
  lastReadMessageIdByRoom: Record<string, string | null>;
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (id: string) => void;
  setHistory: (roomId: string, messages: Message[]) => void;
  addMessage: (msg: Message) => void;
  removeMessageById: (id: string) => void;
  setReactions: (
    roomId: string,
    messageId: string,
    reactions: Message["reactions"]
  ) => void;
  setReplyTo: (msg: Message | null) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  currentRoomId: "general",
  rooms: [],
  messagesByRoom: {},
  replyTo: null,
  lastReadMessageIdByRoom: {},
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (id) => {
    // ponytail: mark everything in the new room as read on switch.
    const messages = get().messagesByRoom[id] ?? [];
    const lastId = messages.length > 0 ? messages[messages.length - 1].id : null;
    set((s) => ({
      currentRoomId: id,
      replyTo: null,
      lastReadMessageIdByRoom: {
        ...s.lastReadMessageIdByRoom,
        [id]: lastId ?? s.lastReadMessageIdByRoom[id] ?? null,
      },
    }));
  },
  setHistory: (roomId, messages) => {
    set((s) => ({
      messagesByRoom: { ...s.messagesByRoom, [roomId]: messages },
    }));
    // ponytail: if this is the current room, bump lastRead to latest.
    if (get().currentRoomId === roomId && messages.length > 0) {
      set((s) => ({
        lastReadMessageIdByRoom: {
          ...s.lastReadMessageIdByRoom,
          [roomId]: messages[messages.length - 1].id,
        },
      }));
    }
  },
  addMessage: (msg) =>
    set((s) => {
      // ponytail: dedupe by id — server reconnect can re-broadcast.
      const existing = s.messagesByRoom[msg.roomId] ?? [];
      if (existing.some((m) => m.id === msg.id)) return s;
      return {
        messagesByRoom: {
          ...s.messagesByRoom,
          [msg.roomId]: [...existing, msg],
        },
      };
    }),
  removeMessageById: (id) =>
    set((s) => {
      const next: typeof s.messagesByRoom = {};
      for (const [k, v] of Object.entries(s.messagesByRoom)) {
        next[k] = v.filter((m) => m.id !== id);
      }
      return { messagesByRoom: next };
    }),
  setReactions: (roomId, messageId, reactions) =>
    set((s) => ({
      messagesByRoom: {
        ...s.messagesByRoom,
        [roomId]: (s.messagesByRoom[roomId] ?? []).map((m) =>
          m.id === messageId ? { ...m, reactions } : m
        ),
      },
    })),
  setReplyTo: (msg) => set({ replyTo: msg }),
}));

// ponytail: derive unread count from visible messages (filter blocked upstream).
export function unreadCount(
  visibleMessages: { id: string }[],
  lastReadId: string | null
): number {
  if (!lastReadId) return visibleMessages.length;
  let idx = -1;
  for (let i = 0; i < visibleMessages.length; i++) {
    if (visibleMessages[i].id === lastReadId) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return visibleMessages.length;
  return visibleMessages.length - idx - 1;
}
