"use client";

import { useSessionStore } from "@/stores/session";
import { useChatStore } from "@/stores/chat";
import { useUIStore } from "@/stores/ui";
import { OfficeCodeScreen } from "@/components/identity/office-code-screen";
import { IdentityReveal } from "@/components/avatar/identity-reveal";
import { ChatShell } from "@/components/chat/chat-shell";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { CharacterSlug } from "@/types";

export default function Home() {
  const sessionId = useSessionStore((s) => s.sessionId);
  const characterSlug = useSessionStore((s) => s.characterSlug);
  const fetchMe = useSessionStore((s) => s.fetchMe);
  const setRooms = useChatStore((s) => s.setRooms);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  useEffect(() => {
    fetchMe();
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(rm.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    rm.addEventListener("change", onChange);
    return () => rm.removeEventListener("change", onChange);
  }, [fetchMe, setReducedMotion]);

  useEffect(() => {
    fetch("/api/rooms", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rooms) => setRooms(rooms))
      .catch(() => setRooms([]));
  }, [setRooms]);

  const showJoin = !sessionId;
  const showChat = !!sessionId && !!characterSlug;

  return (
    <main className="min-h-dvh">
      <AnimatePresence mode="wait">
        {showJoin && (
          <motion.div
            key="join"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <OfficeCodeScreen />
          </motion.div>
        )}
        {showChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RevealGate slug={characterSlug as CharacterSlug}>
              <ChatShell />
            </RevealGate>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

import { useState } from "react";

function RevealGate({
  slug,
  children,
}: {
  slug: CharacterSlug;
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(false);
  if (done) return <>{children}</>;
  return (
    <IdentityReveal
      slug={slug}
      onComplete={() => {
        try {
          sessionStorage.setItem("chaos.revealDone", "1");
        } catch {}
        setDone(true);
      }}
    />
  );
}
