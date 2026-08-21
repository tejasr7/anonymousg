"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react";
import { MonoText } from "@/components/ui/primitives";
import type { Message } from "@/types";
import { play } from "@/lib/sounds";
import { csrfPost } from "@/lib/api/csrf-client";

const REASONS = [
  "harassment",
  "spam",
  "hateful content",
  "doxxing attempt",
  "other nonsense",
];

export function ReportDialog({
  open,
  onOpenChange,
  message,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  message: Message;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit() {
    play("click");
    setDone(true);
    setFailed(false);
    try {
      await csrfPost("/api/report", { messageId: message.id, reason });
    } catch {
      setFailed(true);
      setDone(false);
      return;
    }
    setTimeout(() => {
      setDone(false);
      setReason(null);
      onOpenChange(false);
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md p-6">
        <DialogTitle>report this nonsense</DialogTitle>
        <DialogDescription>
          your report is anonymous. even we don't know it's you.
        </DialogDescription>
        <div className="mt-4 space-y-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={
                "w-full text-left px-3 py-2 border-2 transition-colors " +
                (reason === r
                  ? "bg-accent text-black border-black"
                  : "bg-bg-elevated border-line hover:border-ink-muted")
              }
            >
              <span className="capitalize">{r}</span>
            </button>
          ))}
        </div>
        <MonoText className="block mt-3 text-2xs">
          msg://{message.id.slice(0, 8)}
        </MonoText>
        {failed && (
          <div className="mt-3 font-mono text-2xs uppercase text-danger tracking-wider">
            ! server didn't buy it. try again.
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            cancel
          </Button>
          <Button
            variant="danger"
            disabled={!reason || done}
            onClick={submit}
          >
            {done ? (
              <>
                <ShieldCheck size={14} weight="bold" /> reported
              </>
            ) : (
              "report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
