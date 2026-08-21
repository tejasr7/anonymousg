"use client";

import { useChatStore } from "@/stores/chat";
import { TypingDots } from "@/components/ui/primitives";

export function TypingIndicator({
  typing,
}: {
  typing: { characterDisplayName: string }[];
}) {
  if (typing.length === 0) return null;
  const text =
    typing.length === 1
      ? `${typing[0].characterDisplayName} is typing`
      : typing.length === 2
      ? `${typing[0].characterDisplayName} and ${typing[1].characterDisplayName} are typing`
      : `${typing.length} creatures are typing`;
  return (
    <div className="flex items-center gap-2 px-1 py-2 font-mono text-2xs uppercase tracking-widest text-ink-dim">
      <TypingDots />
      <span>{text}...</span>
    </div>
  );
}
