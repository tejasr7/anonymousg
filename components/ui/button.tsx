"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 ring-accent focus-visible:outline-none active:translate-y-[2px] active:shadow-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-black border-2 border-black shadow-chunky-sm hover:bg-accent-dim",
        secondary:
          "bg-bg-panel text-ink border-2 border-black shadow-chunky-sm hover:bg-bg-elevated",
        ghost:
          "bg-transparent text-ink hover:bg-bg-panel border-2 border-transparent",
        outline:
          "bg-transparent text-ink border-2 border-line-strong hover:border-accent hover:text-accent",
        danger:
          "bg-danger text-white border-2 border-black shadow-chunky-sm hover:bg-danger/90",
        purple:
          "bg-purple text-black border-2 border-black shadow-chunky-sm hover:bg-purple-dim",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
