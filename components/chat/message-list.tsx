"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useChatStore, unreadCount } from "@/stores/chat";
import { usePresenceStore } from "@/stores/presence";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import { ArrowDown } from "@phosphor-icons/react";
import type { CharacterSlug } from "@/types";

const EMPTY_COPY: Record<string, { title: string; sub: string }> = {
  general: {
    title: "nobody has said anything stupid yet.",
    sub: "be the hero we don't deserve.",
  },
  random: {
    title: "this room is aggressively empty.",
    sub: "say something terrible.",
  },
  memes: {
    title: "zero memes. disgusting.",
    sub: "send the cursed ones.",
  },
  lunch: {
    title: "apparently nobody eats.",
    sub: "who's going down?",
  },
};

export function MessageList({
  currentSessionId,
  myCharacterSlug,
}: {
  currentSessionId: string;
  myCharacterSlug: CharacterSlug;
}) {
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const messagesByRoom = useChatStore((s) => s.messagesByRoom);
  const lastRead = useChatStore((s) => s.lastReadMessageIdByRoom);
  const typingByRoom = usePresenceStore((s) => s.typingByRoom);
  const blocked = usePresenceStore((s) => s.blockedSessionIds);
  const replyTo = useChatStore((s) => s.replyTo);
  const setReplyTo = useChatStore((s) => s.setReplyTo);

  // ponytail: memoize filtered messages + typing list per room.
  const messages = useMemo(
    () => (messagesByRoom[currentRoomId] ?? []).filter((m) => !blocked.has(m.sessionId)),
    [messagesByRoom, currentRoomId, blocked]
  );
  const typing = useMemo(
    () => (typingByRoom[currentRoomId] ?? []).filter((t) => t.sessionId !== currentSessionId),
    [typingByRoom, currentRoomId, currentSessionId]
  );

  // ponytail: reactive unread — subscribe to lastRead directly.
  const unread = useMemo(
    () => unreadCount(messages, lastRead[currentRoomId] ?? null),
    [messages, lastRead, currentRoomId]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);

  // ponytail: instant scroll when user sent the message, smooth otherwise.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;
    if (!stickToBottom && grew) {
      setShowJumpButton(true);
      return;
    }
    el.scrollTo({
      top: el.scrollHeight,
      behavior: grew ? "auto" : "smooth",
    });
  }, [messages.length, typing.length, currentRoomId, stickToBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const stuck = distance < 80;
      setStickToBottom(stuck);
      if (stuck) setShowJumpButton(false);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function jumpToBottom() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setShowJumpButton(false);
  }

  const empty = EMPTY_COPY[currentRoomId] ?? EMPTY_COPY.general;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg relative">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center px-6">
            <div>
              <div className="font-bold uppercase text-2xl mb-2 tracking-tight">
                {empty.title}
              </div>
              <div className="text-ink-muted text-sm font-mono uppercase tracking-wider">
                {empty.sub}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m, idx) => {
              const prev = messages[idx - 1];
              const sameAuthor =
                prev &&
                prev.sessionId === m.sessionId &&
                m.createdAt - prev.createdAt < 1000 * 60 * 5;
              return (
                <MessageItem
                  key={m.id}
                  message={m}
                  isSelf={m.sessionId === currentSessionId}
                  isMineName={m.characterSlug === myCharacterSlug}
                  isConsecutive={sameAuthor}
                  currentSessionId={currentSessionId}
                  replyTarget={
                    replyTo && m.id === replyTo.id ? replyTo : undefined
                  }
                  onClearReply={() => setReplyTo(null)}
                  onDelete={() => {}}
                />
              );
            })}
          </AnimatePresence>
        )}
        {typing.length > 0 && <TypingIndicator typing={typing} />}
      </div>
      {showJumpButton && unread > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          onClick={jumpToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-accent text-black border-2 border-black shadow-chunky-sm px-3 py-1.5 font-mono text-2xs uppercase tracking-wider flex items-center gap-1.5"
        >
          <ArrowDown size={12} weight="bold" />
          {unread} new {unread === 1 ? "message" : "messages"}
        </motion.button>
      )}
    </div>
  );
}
