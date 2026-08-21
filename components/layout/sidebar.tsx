"use client";

import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/stores/session";
import { useChatStore, unreadCount } from "@/stores/chat";
import { usePresenceStore, selectVisibleMessages } from "@/stores/presence";
import { useUIStore } from "@/stores/ui";
import { AvatarPortrait } from "@/components/avatar/avatar-portrait";
import { AvatarCard } from "@/components/avatar/avatar-card";
import { Chip, MonoText } from "@/components/ui/primitives";
import {
  Skull,
  House,
  DiceFive,
  Smiley,
  Hamburger,
  SignOut,
  Ghost,
  type Icon,
} from "@phosphor-icons/react";
import { getCharacter } from "@/lib/characters";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { csrfPost } from "@/lib/api/csrf-client";

const ROOM_ICONS: Record<string, Icon> = {
  general: House,
  random: DiceFive,
  memes: Ghost,
  lunch: Hamburger,
};

export function Sidebar() {
  const rooms = useChatStore((s) => s.rooms);
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const messagesByRoom = useChatStore((s) => s.messagesByRoom);
  const lastRead = useChatStore((s) => s.lastReadMessageIdByRoom);
  const characterSlug = useSessionStore((s) => s.characterSlug);
  const sessionCreatedAt = useSessionStore((s) => s.createdAt);
  const online = usePresenceStore((s) => s.online);
  const soundOn = useUIStore((s) => s.soundOn);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const hydrateBlocks = usePresenceStore((s) => s.hydrateBlocks);
  const blocked = usePresenceStore((s) => s.blockedSessionIds);
  const logout = useSessionStore((s) => s.logout);

  // ponytail: hydrate blocked IDs from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("chaos.blocks");
      if (raw) hydrateBlocks(JSON.parse(raw));
      const soundRaw = localStorage.getItem("chaos.sound");
      if (soundRaw === "1") useUIStore.getState().setSound(true);
    } catch {}
  }, [hydrateBlocks]);

  // ponytail: memoize per-room visible message arrays + filtered online count.
  const visibleByRoom = useMemo(() => {
    const out: Record<string, ReturnType<typeof selectVisibleMessages>> = {};
    for (const r of rooms) {
      out[r.id] = selectVisibleMessages(messagesByRoom[r.id] ?? [], blocked);
    }
    return out;
  }, [rooms, messagesByRoom, blocked]);

  const visibleOnlineCount = useMemo(
    () =>
      characterSlug
        ? online.filter(
            (p) => !blocked.has(p.sessionId) || p.characterSlug === characterSlug
          ).length
        : online.length,
    [online, blocked, characterSlug]
  );

  if (!characterSlug) return null;
  const char = getCharacter(characterSlug);

  async function handleLogout() {
    try {
      await csrfPost("/api/logout", {});
    } catch {
      // ponytail: still clear local even if server fails
    }
    logout();
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 bg-bg-elevated border-r-2 border-black flex-col">
      <div className="px-4 py-5 border-b-2 border-black">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-accent border-2 border-black shadow-chunky-sm flex items-center justify-center">
            <Skull size={18} weight="fill" className="text-black" />
          </div>
          <div>
            <div className="font-bold uppercase tracking-tight leading-none">
              chaos
            </div>
            <MonoText className="text-2xs leading-none">chat.exe</MonoText>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b-2 border-line flex items-center justify-between">
        <MonoText className="text-2xs uppercase tracking-widest">rooms</MonoText>
      </div>

      <nav className="px-2 py-2 flex-1 overflow-y-auto">
        {rooms.map((room) => {
          const Icon = ROOM_ICONS[room.slug] ?? House;
          const active = room.id === currentRoomId;
          const msgs = visibleByRoom[room.id] ?? [];
          const count = unreadCount(msgs, lastRead[room.id] ?? null);
          return (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 mb-1 border-2 text-left transition-colors",
                active
                  ? "bg-accent text-black border-black"
                  : "border-transparent hover:bg-bg-panel text-ink"
              )}
            >
              <Icon size={16} weight={active ? "fill" : "bold"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wide text-sm leading-none truncate">
                    {room.name}
                  </span>
                  {!active && count > 0 && (
                    <Chip tone="accent">{count}</Chip>
                  )}
                </div>
                <div
                  className={cn(
                    "text-2xs uppercase tracking-wider truncate mt-0.5 font-mono",
                    active ? "text-black/70" : "text-ink-dim"
                  )}
                >
                  {room.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t-2 border-black">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 bg-accent animate-pulse" />
          <MonoText className="text-2xs uppercase tracking-widest">
            {visibleOnlineCount} idiots online
          </MonoText>
        </div>
      </div>

      <div className="p-3 border-t-2 border-line">
        <AvatarCard
          slug={characterSlug}
          isSelf
          joinedAt={sessionCreatedAt ?? undefined}
          messageCount={0}
          reactionCount={0}
          trigger={
            <button className="w-full flex items-center gap-3 p-2 border-2 border-transparent hover:border-line hover:bg-bg-panel transition-colors text-left">
              <AvatarPortrait slug={characterSlug} size={40} ring />
              <div className="flex-1 min-w-0">
                <div className="font-bold uppercase tracking-wide text-sm truncate">
                  {char.displayName}
                </div>
                <MonoText className="text-2xs truncate">you</MonoText>
              </div>
              <Chip tone="accent">live</Chip>
            </button>
          }
        />
        <div className="mt-3 flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSound}
                className="font-mono text-2xs uppercase tracking-wider text-ink-muted hover:text-ink flex items-center gap-1.5"
              >
                <span className={cn("w-2 h-2", soundOn ? "bg-accent" : "bg-ink-dim")} />
                sound {soundOn ? "on" : "off"}
              </button>
            </TooltipTrigger>
            <TooltipContent>tiny ui sounds</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="text-ink-muted hover:text-ink flex items-center gap-1.5"
                aria-label="logout"
              >
                <SignOut size={14} weight="bold" />
                <MonoText className="text-2xs uppercase tracking-wider">leave</MonoText>
              </button>
            </TooltipTrigger>
            <TooltipContent>forget this identity</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
