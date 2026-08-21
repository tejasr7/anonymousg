"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUp, X, Smiley } from "@phosphor-icons/react";
import { useChatStore } from "@/stores/chat";
import { Button } from "@/components/ui/button";
import { MonoText } from "@/components/ui/primitives";
import { ReactionPicker } from "./reaction-picker";
import { MAX_MESSAGE_LENGTH } from "@/types";
import { acquireSocket } from "@/hooks/use-socket";

export function MessageComposer() {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const replyTo = useChatStore((s) => s.replyTo);
  const setReplyTo = useChatStore((s) => s.setReplyTo);
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<number | null>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, [currentRoomId]);

  // ponytail: auto-resize textarea to content.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [text]);

  function cancelReply() {
    setReplyTo(null);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function send() {
    const body = text.trim();
    if (!body) return;
    const s = acquireSocket();
    s.emit("message:send", {
      roomId: currentRoomId,
      body,
      replyToMessageId: replyTo?.id,
    });
    setText("");
    setReplyTo(null);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      send();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
      return;
    }
    if (e.key === "Escape" && replyTo) {
      e.preventDefault();
      cancelReply();
    }
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value.slice(0, MAX_MESSAGE_LENGTH);
    setText(v);
    const s = acquireSocket();
    s.emit("typing:start", currentRoomId);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      s.emit("typing:stop", currentRoomId);
    }, 1200);
  }

  function appendEmoji(emoji: string) {
    setText((t) => (t + emoji).slice(0, MAX_MESSAGE_LENGTH));
    setEmojiOpen(false);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  return (
    <div className="border-t-2 border-black bg-bg-elevated p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {replyTo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2 px-3 py-2 border-l-2 border-accent bg-bg-panel"
        >
          <div className="min-w-0">
            <MonoText className="text-2xs uppercase tracking-wider">
              replying to
            </MonoText>
            <div className="text-sm text-ink truncate">{replyTo.body}</div>
          </div>
          <button
            onClick={cancelReply}
            className="p-1 text-ink-muted hover:text-ink"
            aria-label="cancel reply"
          >
            <X size={14} weight="bold" />
          </button>
        </motion.div>
      )}
      <div className="flex items-end gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="emoji"
            onClick={() => setEmojiOpen((v) => !v)}
            aria-expanded={emojiOpen}
          >
            <Smiley size={20} weight="bold" />
          </Button>
          {emojiOpen && (
            <div className="absolute bottom-full mb-2 left-0 z-50 bg-bg-panel border-2 border-black shadow-chunky p-2 w-64">
              <div className="grid grid-cols-8 gap-1">
                {(
                  [
                    "😂",
                    "💀",
                    "😭",
                    "🫡",
                    "🤡",
                    "👀",
                    "🔥",
                    "❤️",
                    "😎",
                    "🤮",
                    "🥲",
                    "🤬",
                    "😈",
                    "🥴",
                    "🦄",
                    "🐀",
                  ] as string[]
                ).map((e) => (
                  <button
                    key={e}
                    onClick={() => appendEmoji(e)}
                    className="w-7 h-7 flex items-center justify-center text-base hover:bg-bg-elevated border-2 border-transparent hover:border-line"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 relative">
          <textarea
            ref={taRef}
            value={text}
            onChange={onChange}
            onKeyDown={onKey}
            placeholder="say something terrible..."
            rows={1}
            className="w-full resize-none bg-bg-panel border-2 border-line-strong focus:border-accent focus:outline-none px-3 py-2.5 text-sm max-h-32 min-h-[44px] leading-relaxed"
          />
          <MonoText className="absolute right-2 bottom-1 text-2xs">
            {text.length}/{MAX_MESSAGE_LENGTH}
          </MonoText>
        </div>
        <Button
          variant="primary"
          size="icon"
          disabled={!text.trim()}
          onClick={send}
          aria-label="send"
        >
          <ArrowUp size={20} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
