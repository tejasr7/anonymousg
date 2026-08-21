"use client";

import { useMemo } from "react";
import { useChatStore } from "@/stores/chat";
import { usePresenceStore, selectVisibleMessages } from "@/stores/presence";
import { useSessionStore } from "@/stores/session";
import { AvatarPortrait } from "@/components/avatar/avatar-portrait";
import { AvatarCard } from "@/components/avatar/avatar-card";
import { Chip, MonoText, Stamp } from "@/components/ui/primitives";
import { getCharacter } from "@/lib/characters";
import { motion } from "motion/react";

export function OnlinePanel() {
  const online = usePresenceStore((s) => s.online);
  const blocked = usePresenceStore((s) => s.blockedSessionIds);
  const characterSlug = useSessionStore((s) => s.characterSlug);
  const messagesByRoom = useChatStore((s) => s.messagesByRoom);

  // ponytail: derive stable filtered lists with shallow comparison-friendly refs.
  const visible = useMemo(
    () =>
      online.filter(
        (p) => !blocked.has(p.sessionId) || p.characterSlug === characterSlug
      ),
    [online, blocked, characterSlug]
  );
  const visibleFiltered = useMemo(
    () => visible.filter((p) => p.characterSlug !== characterSlug),
    [visible, characterSlug]
  );

  // ponytail: count messages for SELF only (best-effort).
  const myMessages = useMemo(() => {
    if (!characterSlug) return [];
    const flat = Object.values(messagesByRoom).flat();
    return flat.filter(
      (m) => !blocked.has(m.sessionId) && m.characterSlug === characterSlug
    );
  }, [messagesByRoom, blocked, characterSlug]);
  const myCount = myMessages.length;

  return (
    <aside className="hidden lg:flex w-72 shrink-0 bg-bg-elevated border-l-2 border-black flex-col">
      <div className="px-4 py-3 border-b-2 border-line flex items-center justify-between">
        <MonoText className="text-2xs uppercase tracking-widest">now online</MonoText>
        <Chip tone="accent">{visible.length}</Chip>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {visible.map((p, i) => {
            const char = getCharacter(p.characterSlug);
            const isSelf = p.characterSlug === characterSlug;
            return (
              <motion.div
                key={p.sessionId}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.015 }}
              >
                <AvatarCard
                  slug={p.characterSlug}
                  isSelf={isSelf}
                  sessionId={p.sessionId}
                  messageCount={isSelf ? myCount : 0}
                  trigger={
                    <button className="w-full flex items-center gap-3 p-2 hover:bg-bg-panel border-2 border-transparent hover:border-line transition-colors text-left">
                      <div className="relative">
                        <AvatarPortrait slug={p.characterSlug} size={32} />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent border-2 border-bg-elevated rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold uppercase tracking-wide text-sm truncate">
                          {char.displayName}
                        </div>
                        <MonoText className="text-2xs truncate">
                          {p.characterDisplayName}
                        </MonoText>
                      </div>
                      {isSelf && <Stamp rotate={-4}>you</Stamp>}
                    </button>
                  }
                />
              </motion.div>
            );
          })}
          {visibleFiltered.length === 0 && (
            <div className="text-center py-6 text-ink-dim font-mono text-2xs uppercase tracking-wider">
              just you, alone, in the void
            </div>
          )}
        </div>
      </div>
      <div className="p-3 border-t-2 border-line">
        <MonoText className="text-2xs uppercase tracking-widest text-ink-dim">
          nobody knows who anyone is
        </MonoText>
      </div>
    </aside>
  );
}
