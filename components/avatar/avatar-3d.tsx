"use client";

// ponytail: 3D Canvas dropped — R3F v9 + React 19 layout-effect bugs escape
// error boundaries. Animated 2D fallback only; re-add 3D once R3F ships the fix.

import { AvatarFallback } from "./avatar-fallback";
import type { AvatarState, CharacterSlug } from "@/types";

export function Avatar3D({
  slug,
  state = "idle",
  className,
}: {
  slug: CharacterSlug;
  state?: AvatarState;
  camera?: [number, number, number];
  enableControls?: boolean;
  environment?: boolean;
  shadows?: boolean;
  className?: string;
}) {
  return (
    <AvatarFallback slug={slug} state={state} size="lg" className={className} />
  );
}
