"use client";

// ponytail: full-screen reveal scene — 2D animated fallback only.
// 3D path removed because R3F v9 + React 19 layout-effect errors escape error boundaries.

import { motion } from "motion/react";
import { AvatarFallback } from "./avatar-fallback";
import type { CharacterSlug } from "@/types";

export function RevealScene({
  slug,
  phase,
}: {
  slug: CharacterSlug;
  phase: "falling" | "landed" | "idle";
}) {
  if (phase === "falling") {
    return (
      <motion.div
        key="fall"
        initial={{ y: "-120%", rotate: -45 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.5, 0, 0.5, 1] }}
        className="absolute inset-0 flex items-end justify-center"
      >
        <AvatarFallback slug={slug} state="idle" size="xl" />
      </motion.div>
    );
  }
  if (phase === "landed") {
    return (
      <motion.div
        key="land"
        initial={{ scale: 1.2 }}
        animate={{ scale: [1.2, 0.9, 1.05, 1] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 flex items-end justify-center"
      >
        <AvatarFallback slug={slug} state="idle" size="xl" />
      </motion.div>
    );
  }
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex items-end justify-center"
    >
      <AvatarFallback slug={slug} state="idle" size="xl" />
    </motion.div>
  );
}
