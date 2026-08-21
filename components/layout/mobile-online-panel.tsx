"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui";
import { OnlinePanel } from "./online-panel";

export function MobileOnlinePanel() {
  const open = useUIStore((s) => s.onlinePanelOpen);
  const setOnlinePanel = useUIStore((s) => s.setOnlinePanel);
  return (
    <Sheet open={open} onOpenChange={setOnlinePanel}>
      <SheetContent side="right" className="p-0">
        <OnlinePanel />
      </SheetContent>
    </Sheet>
  );
}
