"use client";

// ponytail: animejs v3 is callable directly — anime({ targets, ...params }).

import anime from "animejs";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { RevealScene } from "./reveal-scene";
import { getCharacter, CHARACTERS } from "@/lib/characters";
import type { CharacterSlug } from "@/types";
import { play } from "@/lib/sounds";

type Phase = "black" | "connecting" | "verifying" | "assigning" | "falling" | "landed" | "idle" | "done";

// ponytail: random character glyphs for the scramble effect.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?@#$%&*<>/\\|~".split("");

function pickRandomChar() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function DustParticles({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<number[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 14 }, (_, i) => i));
    const t = setTimeout(() => setParticles([]), 1200);
    return () => clearTimeout(t);
  }, [trigger]);
  if (particles.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-1/3 h-32">
      {particles.map((i) => {
        const angle = (i / 14) * Math.PI;
        const dx = Math.cos(angle) * (40 + Math.random() * 60);
        const dy = -20 - Math.random() * 80;
        return (
          <motion.span
            key={`${trigger}-${i}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.3 }}
            transition={{
              duration: 0.9 + Math.random() * 0.4,
              ease: [0.2, 0.7, 0.4, 1],
            }}
            className="absolute left-1/2 top-1/2 w-2 h-2 bg-accent border border-black"
          />
        );
      })}
    </div>
  );
}

export function IdentityReveal({
  slug,
  onComplete,
}: {
  slug: CharacterSlug;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("black");
  const [shake, setShake] = useState(false);
  const [scramble, setScramble] = useState<string[]>([]);
  const [dustTrigger, setDustTrigger] = useState(0);
  const charName = getCharacter(slug).displayName;
  const charVibe = getCharacter(slug).vibe;
  const lineRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  // ponytail: scramble effect — cycle random glyphs during "assigning" phase.
  useEffect(() => {
    if (reducedMotion || phase !== "assigning") return;
    const interval = setInterval(() => {
      setScramble(charName.split("").map((ch) => (ch === " " ? "\u00A0" : pickRandomChar())));
    }, 60);
    return () => clearInterval(interval);
  }, [phase, reducedMotion, charName]);

  useEffect(() => {
    if (reducedMotion) {
      setPhase("done");
      play("connect");
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("connecting"), 250));
    timers.push(setTimeout(() => setPhase("verifying"), 750));
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
        setDustTrigger((d) => d + 1);
        play("thump");
        setPhase("falling");
      }, 100)
    );
    timers.push(setTimeout(() => setPhase("landed"), 2200));
    timers.push(setTimeout(() => setPhase("idle"), 2600));
    timers.push(setTimeout(() => setPhase("done"), 3200));

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

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

  // ponytail: scramble only during "assigning"; real name otherwise.
  // Otherwise the last random glyphs would stick on the screen after settling.
  const displayName =
    phase === "assigning" && scramble.length > 0
      ? scramble
      : charName.split("");

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-hidden flex items-center justify-center">
      <motion.div
        animate={
          shake
            ? {
                x: [0, -10, 10, -7, 7, -4, 4, 0],
                y: [0, 5, -5, 3, -3, 2, -2, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.45 }}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
        <div
          ref={lineRef}
          className="font-mono text-2xs uppercase tracking-[0.4em] text-ink-dim mb-8 min-h-[1.5em]"
        >
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
              className="text-5xl sm:text-7xl font-bold uppercase tracking-tight text-shadow-brutal min-h-[1.2em]"
              aria-label={charName}
            >
              {displayName.map((ch, i) => (
                <span
                  key={i}
                  className="inline-block"
                  aria-hidden
                  style={{
                    color:
                      phase === "assigning" ? "var(--accent)" : undefined,
                    textShadow:
                      phase === "assigning"
                        ? "0 0 12px rgba(200,255,61,0.5)"
                        : undefined,
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
            {phase === "done" && charVibe && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-3 font-mono text-2xs uppercase tracking-widest text-ink-dim"
              >
                {charVibe}
              </motion.div>
            )}
          </div>
        )}

        <div className="relative h-[360px] sm:h-[440px] w-full mb-8">
          {(phase === "falling" ||
            phase === "landed" ||
            phase === "idle" ||
            phase === "done") && (
            <>
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
              <DustParticles trigger={dustTrigger} />
            </>
          )}
          {phase === "assigning" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-12 h-12 rounded-full blur-xl bg-accent opacity-50"
                />
                <div className="font-mono text-2xs text-ink-dim uppercase tracking-widest">
                  [ preparing vessel ]
                </div>
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

// ponytail: export a few character picks so other UIs (tooltips, etc.) can grab
// random names for the scramble effect without importing the whole roster.
export function randomCharacterSlug(): CharacterSlug {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].slug;
}
