"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AvatarPortrait } from "./avatar-portrait";
import { Avatar3D } from "./avatar-3d";
import { Stamp, Chip, MonoText } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Eye } from "@phosphor-icons/react";
import { getCharacter } from "@/lib/characters";
import type { CharacterSlug } from "@/types";
import { relativeTime } from "@/lib/utils";
import { usePresenceStore } from "@/stores/presence";

export function AvatarCard({
  slug,
  trigger,
  isSelf,
  sessionId,
  messageCount = 0,
  reactionCount = 0,
  joinedAt,
}: {
  slug: CharacterSlug;
  trigger: React.ReactNode;
  isSelf?: boolean;
  sessionId?: string;
  messageCount?: number;
  reactionCount?: number;
  joinedAt?: number;
}) {
  const char = getCharacter(slug);
  const [open, setOpen] = useState(false);
  const blocked = usePresenceStore((s) => s.blockedSessionIds);
  const toggleBlock = usePresenceStore((s) => s.toggleBlock);
  const isBlocked = !!sessionId && blocked.has(sessionId);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={12}
        collisionPadding={12}
        className="w-72 p-0 overflow-hidden"
      >
        <div className="relative h-44 bg-gradient-to-b from-bg-elevated to-bg-panel">
          <Avatar3D
            slug={slug}
            state="idle"
            camera={[0, 0.3, 2.4]}
            shadows
            className="absolute inset-0"
          />
          <div className="absolute top-2 left-2">
            <Chip tone="accent">{char.id}</Chip>
          </div>
          <div className="absolute top-2 right-2">
            <Chip tone="purple">live</Chip>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="text-2xl font-bold uppercase tracking-tight">
              {char.displayName}
            </div>
            <div className="flex items-center gap-2 text-ink-muted text-xs">
              <Eye size={12} weight="bold" />
              <span>unknown creature</span>
            </div>
          </div>
          <p className="text-sm text-ink-muted leading-snug">{char.vibe}</p>
          <div className="grid grid-cols-2 gap-2 font-mono text-2xs uppercase tracking-wider">
            <div className="bg-bg-elevated border-2 border-line p-2">
              <div className="text-ink-dim">messages</div>
              <div className="text-ink text-base">{messageCount}</div>
            </div>
            <div className="bg-bg-elevated border-2 border-line p-2">
              <div className="text-ink-dim">reactions</div>
              <div className="text-ink text-base">{reactionCount}</div>
            </div>
          </div>
          {joinedAt && (
            <div className="text-2xs uppercase tracking-wider text-ink-dim font-mono">
              joined {relativeTime(joinedAt)}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {!isSelf && sessionId && (
              <Button
                variant={isBlocked ? "danger" : "secondary"}
                size="sm"
                className="flex-1"
                onClick={() => toggleBlock(sessionId)}
              >
                {isBlocked ? "unblock" : "block locally"}
              </Button>
            )}
            {!isSelf && !sessionId && (
              <div className="flex-1 text-center text-ink-dim font-mono text-2xs uppercase tracking-wider py-1">
                anonymous
              </div>
            )}
            {isSelf && <Stamp rotate={-3}>you</Stamp>}
          </div>
        </div>
        <MonoText className="block text-center pb-2 text-2xs">
          id://{char.id}-{slug}
        </MonoText>
      </PopoverContent>
    </Popover>
  );
}
