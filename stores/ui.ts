"use client";

import { create } from "zustand";
import type { CharacterSlug } from "@/types";

type ConnectionState = "connected" | "reconnecting" | "offline";
type UIState = {
  soundOn: boolean;
  reducedMotion: boolean;
  sidebarOpen: boolean;
  onlinePanelOpen: boolean;
  connection: ConnectionState;
  toggleSound: () => void;
  setSound: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  setSidebar: (open: boolean) => void;
  setOnlinePanel: (open: boolean) => void;
  setConnection: (state: ConnectionState) => void;
};

export const useUIStore = create<UIState>((set) => ({
  soundOn: false,
  reducedMotion: false,
  sidebarOpen: false,
  onlinePanelOpen: false,
  connection: "connected",
  toggleSound: () =>
    set((s) => {
      const next = !s.soundOn;
      try {
        localStorage.setItem("chaos.sound", next ? "1" : "0");
      } catch {}
      return { soundOn: next };
    }),
  setSound: (on) => set({ soundOn: on }),
  setReducedMotion: (on) => set({ reducedMotion: on }),
  setSidebar: (open) => set({ sidebarOpen: open }),
  setOnlinePanel: (open) => set({ onlinePanelOpen: open }),
  setConnection: (state) => set({ connection: state }),
}));
