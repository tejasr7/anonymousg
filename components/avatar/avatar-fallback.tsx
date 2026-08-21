"use client";

// ponytail: animated 2D fallback when WebGL isn't available.
// Uses CSS keyframes (in tailwind) for loops — no motion lib for avatar state.

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

  return (
    <div
      className={"relative flex items-center justify-center " + (className ?? "")}
      style={{ width: dim, height: dim }}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-30"
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
            "w-full h-full " +
            (isSleeping ? "brightness-75 saturate-50" : "")
          }
        />
      </div>
    </div>
  );
}
