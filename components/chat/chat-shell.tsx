"use client";

import { useSessionStore } from "@/stores/session";
import { useChatStore } from "@/stores/chat";
import { useUIStore } from "@/stores/ui";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatHeader } from "@/components/layout/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageComposer } from "@/components/chat/message-composer";
import { OnlinePanel } from "@/components/layout/online-panel";
import { ConnectionBanner } from "@/components/layout/connection-banner";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { MobileOnlinePanel } from "@/components/layout/mobile-online-panel";
import { useSocketSync } from "@/hooks/use-socket-sync";

export function ChatShell() {
  const characterSlug = useSessionStore((s) => s.characterSlug);
  const sessionId = useSessionStore((s) => s.sessionId)!;
  const connection = useUIStore((s) => s.connection);

  useSocketSync();

  return (
    <div className="h-dvh w-full flex flex-col bg-bg text-ink overflow-hidden">
      <ConnectionBanner connection={connection} />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <MobileSidebar />
        <main className="flex-1 flex flex-col min-w-0 relative">
          <ChatHeader />
          <MessageList
            currentSessionId={sessionId}
            myCharacterSlug={characterSlug!}
          />
          <MessageComposer />
        </main>
        <OnlinePanel />
        <MobileOnlinePanel />
      </div>
    </div>
  );
}
