"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui";
import { Sidebar } from "./sidebar";

export function MobileSidebar() {
  const open = useUIStore((s) => s.sidebarOpen);
  const setSidebar = useUIStore((s) => s.setSidebar);
  return (
    <Sheet open={open} onOpenChange={setSidebar}>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
