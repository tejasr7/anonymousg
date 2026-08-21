"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import * as React from "react";

export function Stamp({
  children,
  className,
  rotate = -3,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={cn(
        "inline-block bg-accent text-black px-3 py-1 font-bold uppercase tracking-wider border-2 border-black text-shadow-brutal clip-stamp",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-bg-panel border-2 border-black shadow-chunky-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "accent" | "purple" | "danger" | "warm";
}) {
  const tones = {
    default: "bg-bg-elevated text-ink-muted border-line-strong",
    accent: "bg-accent text-black border-black",
    purple: "bg-purple text-black border-black",
    danger: "bg-danger/20 text-danger border-danger",
    warm: "bg-warm/20 text-warm border-warm",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-2xs uppercase tracking-wider font-mono border-2",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function MonoText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-ink-muted", className)}>
      {children}
    </span>
  );
}

export function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 bg-ink-muted rounded-full"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px bg-line w-full my-3", className)}
      aria-hidden
    />
  );
}
