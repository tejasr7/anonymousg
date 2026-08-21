"use client";

import { useEffect } from "react";
import { acquireSocket, releaseSocket } from "./use-socket";
import { useSessionStore } from "@/stores/session";
import { useChatStore } from "@/stores/chat";
import { useUIStore } from "@/stores/ui";
import { usePresenceStore, type PresenceEntry, type TypingEntry } from "@/stores/presence";
import { setMuted } from "@/lib/sounds";
import type { Message } from "@/types";

// ponytail: attach to socket, sync stores, return cleanup.
export function useSocketSync() {
  const sessionId = useSessionStore((s) => s.sessionId);
  const setHistory = useChatStore((s) => s.setHistory);
  const addMessage = useChatStore((s) => s.addMessage);
  const removeMessageById = useChatStore((s) => s.removeMessageById);
  const setReactions = useChatStore((s) => s.setReactions);
  const setOnline = usePresenceStore((s) => s.setOnline);
  const setTyping = usePresenceStore((s) => s.setTyping);
  const setConnection = useUIStore((s) => s.setConnection);
  const soundOn = useUIStore((s) => s.soundOn);

  useEffect(() => {
    setMuted(!soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (!sessionId) return;
    const s = acquireSocket();

    const onConnect = () => {
      setConnection("connected");
      // ponytail: re-join current room from latest store (handles reconnect + room-switch-during-disconnect).
      const roomId = useChatStore.getState().currentRoomId;
      if (roomId) s.emit("room:join", roomId);
    };
    const onDisconnect = () => setConnection("offline");
    const onHistory = ({
      roomId,
      messages,
    }: {
      roomId: string;
      messages: Message[];
    }) => setHistory(roomId, messages);
    const onCreated = (m: Message) => addMessage(m);
    const onDeleted = ({
      messageId,
    }: {
      messageId: string;
      roomId: string;
    }) => removeMessageById(messageId);
    const onReactions = ({
      messageId,
      roomId,
      reactions,
    }: {
      messageId: string;
      roomId?: string;
      reactions: Message["reactions"];
    }) => {
      // ponytail: server includes roomId — use directly, no more O(n) scan.
      if (roomId) {
        setReactions(roomId, messageId, reactions);
        return;
      }
      // ponytail: fallback — scan for the message (legacy payload).
      const messagesByRoom = useChatStore.getState().messagesByRoom;
      for (const [rid, msgs] of Object.entries(messagesByRoom)) {
        if (msgs.some((m) => m.id === messageId)) {
          setReactions(rid, messageId, reactions);
          return;
        }
      }
    };
    const onTypingSet = ({
      roomId,
      typing,
    }: {
      roomId: string;
      typing: TypingEntry[];
    }) => setTyping(roomId, typing);
    const onPresenceList = (list: PresenceEntry[]) => setOnline(list);

    if (s.connected) onConnect();
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("room:history", onHistory);
    s.on("message:created", onCreated);
    s.on("message:deleted", onDeleted);
    s.on("reaction:update", onReactions);
    s.on("typing:set", onTypingSet);
    s.on("presence:list", onPresenceList);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("room:history", onHistory);
      s.off("message:created", onCreated);
      s.off("message:deleted", onDeleted);
      s.off("reaction:update", onReactions);
      s.off("typing:set", onTypingSet);
      s.off("presence:list", onPresenceList);
      releaseSocket();
    };
  }, [
    sessionId,
    setHistory,
    addMessage,
    removeMessageById,
    setReactions,
    setTyping,
    setOnline,
    setConnection,
  ]);
}
