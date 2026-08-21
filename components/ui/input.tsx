"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-12 w-full bg-bg-elevated border-2 border-line-strong px-4 text-base text-ink placeholder:text-ink-dim focus:border-accent focus:outline-none transition-colors disabled:opacity-50 font-mono tracking-wider",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
