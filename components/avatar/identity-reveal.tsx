"use client";

// ponytail: animejs v3 is callable directly — anime({ targets, ...params }).

import anime from "animejs";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { RevealScene } from "./reveal-scene";
import { getCharacter } from "@/lib/characters";
import type { CharacterSlug } from "@/types";
import { play } from "@/lib/sounds";

type Phase = "black" | "connecting" | "verifying" | "assigning" | "falling" | "landed" | "idle" | "done";

export function IdentityReveal({
  slug,
  onComplete,
}: {
  slug: CharacterSlug;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("black");
  const [shake, setShake] = useState(false);
  const charName = getCharacter(slug).displayName;
  const lineRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ponytail: memoize reducedMotion once on mount.
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  useEffect(() => {
    if (reducedMotion) {
      setPhase("done");
      play("connect");
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("connecting"), 300));
    timers.push(setTimeout(() => setPhase("verifying"), 800));
    timers.push(setTimeout(() => setPhase("assigning"), 1400));
    timers.push(
      setTimeout(() => {
        if (nameRef.current) {
          const spans = nameRef.current.querySelectorAll("span");
          (anime as unknown as (p: object) => unknown)({
            targets: spans,
            translateY: [
              { value: -20, duration: 80 },
              { value: 0, duration: 100 },
            ],
            delay: anime.stagger?.(60),
          });
        }
        setShake(true);
        play("thump");
        setPhase("falling");
      }, 100)
    );
    timers.push(setTimeout(() => setPhase("landed"), 2300));
    timers.push(setTimeout(() => setPhase("idle"), 2700));
    timers.push(setTimeout(() => setPhase("done"), 3400));

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  // ponytail: trigger entrance animations when phase hits "done" so refs exist.
  useEffect(() => {
    if (phase !== "done") return;
    play("connect");
    if (buttonRef.current) {
      if (reducedMotion) {
        buttonRef.current.style.opacity = "1";
      } else {
        (anime as unknown as (p: object) => unknown)({
          targets: buttonRef.current,
          scale: [0.9, 1.05, 1],
          opacity: [0, 1],
          duration: 600,
          easing: "easeOutQuad",
        });
      }
    }
    if (subtitleRef.current) {
      if (reducedMotion) {
        subtitleRef.current.style.opacity = "1";
        subtitleRef.current.style.transform = "none";
      } else {
        (anime as unknown as (p: object) => unknown)({
          targets: subtitleRef.current,
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 400,
          delay: 200,
          easing: "easeOutQuad",
        });
      }
    }
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase === "verifying" || phase === "assigning") {
      if (reducedMotion) return;
      // ponytail: target the inner span (with the text), not the parent div.
      const target = lineRef.current?.querySelector("span");
      if (!target) return;
      anime({
        targets: target,
        translateX: [
          { value: -2, duration: 60 },
          { value: 2, duration: 60 },
          { value: 0, duration: 60 },
        ],
        easing: "steps(3)",
      });
    }
  }, [phase, reducedMotion]);

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-hidden flex items-center justify-center">
      <motion.div
        animate={
          shake
            ? { x: [0, -6, 6, -4, 4, 0], y: [0, 4, -4, 2, -2, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.4 }}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
        <div ref={lineRef} className="font-mono text-2xs uppercase tracking-[0.4em] text-ink-dim mb-8">
          {phase === "black" && "\u00A0"}
          {phase === "connecting" && (
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent animate-pulse" /> connecting
            </span>
          )}
          {phase === "verifying" && (
            <span className="inline-flex items-center gap-2">
              verifying absolutely nothing
              <span className="inline-flex gap-0.5">
                <span className="w-1 h-1 bg-ink-dim animate-pulse" />
                <span className="w-1 h-1 bg-ink-dim animate-pulse [animation-delay:120ms]" />
                <span className="w-1 h-1 bg-ink-dim animate-pulse [animation-delay:240ms]" />
              </span>
            </span>
          )}
          {(phase === "assigning" ||
            phase === "falling" ||
            phase === "landed" ||
            phase === "idle" ||
            phase === "done") && (
            <span className="inline-flex items-center gap-2">
              assigning your identity
              <span className="text-accent">_</span>
            </span>
          )}
        </div>

        {(phase === "assigning" ||
          phase === "falling" ||
          phase === "landed" ||
          phase === "idle" ||
          phase === "done") && (
          <div className="mb-6">
            <div className="text-2xs uppercase tracking-[0.3em] text-ink-muted font-mono mb-3">
              you have been assigned
            </div>
            <div
              ref={nameRef}
              className="text-5xl sm:text-7xl font-bold uppercase tracking-tight text-shadow-brutal"
              aria-label={charName}
            >
              {charName.split("").map((ch, i) => (
                <span key={i} className="inline-block" aria-hidden>
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="relative h-[300px] sm:h-[400px] w-full mb-8">
          {(phase === "falling" ||
            phase === "landed" ||
            phase === "idle" ||
            phase === "done") && (
            <RevealScene
              slug={slug}
              phase={
                phase === "falling"
                  ? "falling"
                  : phase === "landed"
                  ? "landed"
                  : "idle"
              }
            />
          )}
          {phase === "assigning" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="font-mono text-2xs text-ink-dim uppercase tracking-widest">
                [ preparing vessel ]
              </div>
            </div>
          )}
        </div>

        <div
          ref={subtitleRef}
          className="opacity-0 text-ink-muted text-sm font-mono mb-8"
        >
          there is no escape.
        </div>

        {phase === "done" && (
          <Button
            ref={buttonRef}
            onClick={() => {
              play("click");
              onComplete();
            }}
            size="xl"
            variant="primary"
            className="opacity-0"
          >
            enter chat
          </Button>
        )}
      </div>

      <div className="absolute inset-0 scanlines pointer-events-none" />
      <div className="absolute inset-0 grain pointer-events-none" />
    </div>
  );
}
