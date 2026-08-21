"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right" | "top" | "bottom";
  }
>(({ className, children, side = "left", ...props }, ref) => {
  const sideClasses = {
    left: "inset-y-0 left-0 h-full w-3/4 max-w-xs border-r-2 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
    right:
      "inset-y-0 right-0 h-full w-3/4 max-w-xs border-l-2 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
    top: "inset-x-0 top-0 w-full border-b-2 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
    bottom:
      "inset-x-0 bottom-0 w-full border-t-2 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
  }[side];

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-bg-elevated border-black shadow-chunky transition-transform duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
          sideClasses,
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = "SheetContent";

export { SheetContent };
