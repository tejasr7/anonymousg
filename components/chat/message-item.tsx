"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowBendUpLeft,
  DotsThree,
  Shield,
  Trash,
} from "@phosphor-icons/react";
import { AvatarPortrait } from "@/components/avatar/avatar-portrait";
import { AvatarCard } from "@/components/avatar/avatar-card";
import { ReactionPicker } from "./reaction-picker";
import { MonoText } from "@/components/ui/primitives";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "./report-dialog";
import { useChatStore } from "@/stores/chat";
import { getCharacter } from "@/lib/characters";
import { cn, formatTimestamp } from "@/lib/utils";
import { play } from "@/lib/sounds";
import { acquireSocket } from "@/hooks/use-socket";
import type { Message } from "@/types";

export function MessageItem({
  message,
  isSelf,
  isMineName,
  isConsecutive,
  currentSessionId,
  replyTarget,
  onClearReply,
  onDelete,
}: {
  message: Message;
  isSelf: boolean;
  isMineName: boolean;
  isConsecutive?: boolean;
  currentSessionId?: string;
  replyTarget?: Message;
  onClearReply: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const setReplyTo = useChatStore((s) => s.setReplyTo);
  const messages = useChatStore((s) => s.messagesByRoom[s.currentRoomId] ?? []);
  const char = getCharacter(message.characterSlug);
  const replySource = message.replyToMessageId
    ? messages.find((m) => m.id === message.replyToMessageId)
    : undefined;
  const replyChar = replySource ? getCharacter(replySource.characterSlug) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "group flex gap-3",
        isConsecutive && "mt-0.5",
        isSelf && "flex-row-reverse"
      )}
      // ponytail: hover (mouse) + focus-within (keyboard) + always-on-touch (no hover devices).
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onFocus={() => setShowActions(true)}
      onBlur={(e) => {
        // ponytail: only hide if focus leaves the whole message group.
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setShowActions(false);
      }}
    >
      <div className="w-10 shrink-0">
        {!isConsecutive && (
          <AvatarCard
            slug={message.characterSlug}
            isSelf={isMineName}
            sessionId={message.sessionId}
            trigger={
              <button className="block hover:scale-105 transition-transform">
                <AvatarPortrait slug={message.characterSlug} size={40} ring />
              </button>
            }
          />
        )}
      </div>
      <div className={cn("flex-1 min-w-0 max-w-2xl", isSelf && "flex flex-col items-end")}>
        {!isConsecutive && (
          <div className={cn("flex items-baseline gap-2 mb-1", isSelf && "flex-row-reverse")}>
            <span className={cn("font-bold uppercase tracking-wide text-sm", isSelf ? "text-accent" : "text-ink")}>
              {char.displayName}
            </span>
            <MonoText className="text-2xs">
              {formatTimestamp(message.createdAt)}
            </MonoText>
            {message.status === "sending" && (
              <MonoText className="text-2xs">sending...</MonoText>
            )}
            {message.status === "failed" && (
              <span className="text-2xs uppercase text-danger font-mono">failed</span>
            )}
          </div>
        )}
        {replySource && replyChar && (
          <div className="mb-1 border-l-2 border-accent pl-2 text-xs flex gap-1.5">
            <ArrowBendUpLeft
              size={12}
              weight="bold"
              className="text-accent mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-accent font-bold uppercase tracking-wide">
                {replyChar.displayName}
              </div>
              <div className="text-ink-muted truncate max-w-md">
                {replySource.body}
              </div>
            </div>
          </div>
        )}
        <div
          className={cn(
            "relative inline-block px-3 py-2 border-2 border-black max-w-full break-words",
            isSelf ? "bg-accent text-black" : "bg-bg-panel text-ink"
          )}
        >
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.body}
          </div>
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1.5", isSelf && "justify-end")}>
            {Object.entries(
              message.reactions.reduce<Record<string, number>>((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => {
                  play("pop");
                  const iReacted = message.reactions?.some(
                    (r) => r.sessionId === currentSessionId && r.emoji === emoji
                  );
                  acquireSocket().emit(
                    iReacted ? "reaction:remove" : "reaction:add",
                    {
                      messageId: message.id,
                      emoji,
                      roomId: message.roomId,
                    }
                  );
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 border-2 border-black bg-bg-elevated text-xs hover:bg-bg-panel animate-pop"
              >
                <span>{emoji}</span>
                <MonoText className="text-2xs">{count}</MonoText>
              </button>
            ))}
          </div>
        )}
        <div
          className={cn(
            // ponytail: opacity by hover/focus, but always show on touch devices.
            "h-6 mt-1 flex items-center gap-1 transition-opacity",
            showActions
              ? "opacity-100"
              : "opacity-0 [@media(hover:none)]:opacity-100",
            isSelf && "justify-end"
          )}
        >
          <ReactionPicker
            onPick={(emoji) => {
              play("pop");
              acquireSocket().emit("reaction:add", {
                messageId: message.id,
                emoji,
                roomId: message.roomId,
              });
            }}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setReplyTo(message)}
            aria-label="reply"
          >
            <ArrowBendUpLeft size={14} weight="bold" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="more">
                <DotsThree size={16} weight="bold" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align={isSelf ? "end" : "start"} className="w-44 p-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-elevated text-left"
                onClick={() => setReplyTo(message)}
              >
                <ArrowBendUpLeft size={14} weight="bold" />
                reply
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-elevated text-left"
                onClick={() => setReportOpen(true)}
              >
                <Shield size={14} weight="bold" />
                report
              </button>
              {isMineName && (
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-elevated text-danger text-left"
                  onClick={() => {
                    play("click");
                    acquireSocket().emit("message:delete", {
                      messageId: message.id,
                      roomId: message.roomId,
                    });
                    onDelete();
                  }}
                >
                  <Trash size={14} weight="bold" />
                  delete
                </button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        message={message}
      />
    </motion.div>
  );
}
