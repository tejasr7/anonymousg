"use client";

import { motion, AnimatePresence } from "motion/react";
import { WifiSlash, ArrowsClockwise } from "@phosphor-icons/react";

type ConnectionState = "connected" | "reconnecting" | "offline";

export function ConnectionBanner({ connection }: { connection: ConnectionState }) {
  return (
    <AnimatePresence>
      {connection !== "connected" && (
        <motion.div
          initial={{ y: -40, opacity: 0, height: 0 }}
          animate={{ y: 0, opacity: 1, height: "auto" }}
          exit={{ y: -40, opacity: 0, height: 0 }}
          className="shrink-0 bg-warm text-black border-b-2 border-black px-4 py-2 flex items-center justify-center gap-2 font-mono text-2xs uppercase tracking-wider z-40"
        >
          {connection === "offline" && (
            <>
              <WifiSlash size={14} weight="bold" />
              <span>connection died lol</span>
            </>
          )}
          {connection === "reconnecting" && (
            <>
              <ArrowsClockwise size={14} weight="bold" className="animate-spin" />
              <span>trying to resurrect it...</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
