"use client";

// ponytail: animated 2D fallback when WebGL isn't available.
// Adds a character-specific radial gradient + better visual hierarchy
// so portraits don't look like blobs at large sizes.

import { PortraitSvg } from "./avatar-portrait";
import { getCharacter } from "@/lib/characters";
import type { AvatarState, CharacterSlug } from "@/types";

const STATE_CLASS: Record<AvatarState, string> = {
  idle: "animate-anim-idle",
  typing: "animate-anim-typing",
  laughing: "animate-anim-laugh",
  shocked: "animate-anim-shocked",
  sleeping: "animate-anim-sleeping",
  celebrate: "animate-anim-celebrate",
  angry: "animate-anim-angry",
  dead: "",
};

export function AvatarFallback({
  slug,
  state = "idle",
  size = "md",
  className,
}: {
  slug: CharacterSlug;
  state?: AvatarState;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const char = getCharacter(slug);
  const dim =
    size === "sm" ? 80 : size === "md" ? 160 : size === "lg" ? 240 : 320;

  const isDead = state === "dead";
  const isSleeping = state === "sleeping";
  const id = `bg-${slug}-${dim}`;

  return (
    <div
      className={"relative flex items-center justify-center " + (className ?? "")}
      style={{ width: dim, height: dim }}
    >
      {/* ponytail: per-character gradient — gives depth at large sizes. */}
      <svg
        width={dim}
        height={dim}
        className="absolute inset-0"
        aria-hidden
      >
        <defs>
          <radialGradient id={id} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor={char.primary} stopOpacity="0.5" />
            <stop offset="55%" stopColor={char.primary} stopOpacity="0.2" />
            <stop offset="100%" stopColor={char.secondary} stopOpacity="0.05" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>

      {/* ponytail: subtle inner glow ring for character depth */}
      <div
        className="absolute inset-3 rounded-full opacity-40 blur-md"
        style={{ background: char.primary }}
      />

      <div
        className={
          "relative " +
          STATE_CLASS[state] +
          (isDead ? " opacity-70" : "")
        }
        style={{
          width: dim,
          height: dim,
          transform: isDead ? "rotate(90deg) translateY(20%)" : undefined,
          transformOrigin: "center",
        }}
      >
        <PortraitSvg
          character={char}
          className={
            "w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] " +
            (isSleeping ? "brightness-75 saturate-50" : "")
          }
        />
      </div>
    </div>
  );
}
