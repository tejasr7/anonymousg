"use client";

import { useMemo } from "react";
import { useChatStore } from "@/stores/chat";
import { usePresenceStore } from "@/stores/presence";
import { useSessionStore } from "@/stores/session";
import { useUIStore } from "@/stores/ui";
import { List, Users } from "@phosphor-icons/react";
import { MonoText } from "@/components/ui/primitives";

export function ChatHeader() {
  const room = useChatStore((s) =>
    s.rooms.find((r) => r.id === s.currentRoomId)
  );
  const online = usePresenceStore((s) => s.online);
  const blocked = usePresenceStore((s) => s.blockedSessionIds);
  const characterSlug = useSessionStore((s) => s.characterSlug);
  const setSidebar = useUIStore((s) => s.setSidebar);
  const setOnlinePanel = useUIStore((s) => s.setOnlinePanel);

  // ponytail: count excludes blocked (consistency with online-panel).
  const visibleOnlineCount = useMemo(
    () =>
      online.filter(
        (p) => !blocked.has(p.sessionId) || p.characterSlug === characterSlug
      ).length,
    [online, blocked, characterSlug]
  );

  if (!room) return null;

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b-2 border-black bg-bg-elevated">
      <button
        className="md:hidden p-1 text-ink-muted hover:text-ink"
        onClick={() => setSidebar(true)}
        aria-label="open menu"
      >
        <List size={22} weight="bold" />
      </button>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl">{room.emoji}</span>
        <div className="min-w-0">
          <div className="font-bold uppercase tracking-tight truncate">
            # {room.name}
          </div>
          <MonoText className="text-2xs truncate">{room.description}</MonoText>
        </div>
      </div>
      <button
        className="hidden sm:flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-ink-muted hover:text-ink"
        onClick={() => setOnlinePanel(true)}
      >
        <Users size={14} weight="bold" />
        <span>{visibleOnlineCount} creatures</span>
      </button>
      <button
        className="sm:hidden p-1 text-ink-muted hover:text-ink"
        onClick={() => setOnlinePanel(true)}
        aria-label="online list"
      >
        <Users size={20} weight="bold" />
      </button>
    </header>
  );
}
