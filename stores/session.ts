"use client";

import { create } from "zustand";
import type { CharacterSlug } from "@/types";
import { csrfPost, clearCsrfCache } from "@/lib/api/csrf-client";

type SessionState = {
  sessionId: string | null;
  characterSlug: CharacterSlug | null;
  characterId: string | null;
  characterDisplayName: string | null;
  createdAt: number | null;
  officeCode: string | null;
  loading: boolean;
  error: string | null;
  fetchMe: () => Promise<void>;
  createSession: (code: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  characterSlug: null,
  characterId: null,
  characterDisplayName: null,
  createdAt: null,
  officeCode: null,
  loading: false,
  error: null,
  async fetchMe() {
    set({ loading: true, error: null });
    try {
      const r = await fetch("/api/me", { credentials: "include" });
      if (r.status === 401) {
        set({
          sessionId: null,
          characterSlug: null,
          characterId: null,
          characterDisplayName: null,
          createdAt: null,
          officeCode: null,
          loading: false,
        });
        return;
      }
      const data = await r.json();
      set({
        sessionId: data.sessionId,
        characterSlug: data.characterSlug,
        characterId: data.characterId,
        characterDisplayName: data.characterDisplayName,
        createdAt: data.createdAt,
        officeCode: null,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },
  async createSession(code: string) {
    set({ loading: true, error: null });
    try {
      const data = await csrfPost<{
        sessionId: string;
        characterSlug: CharacterSlug;
        characterId: string;
        characterDisplayName: string;
        createdAt: number;
      }>("/api/session", { code });
      set({
        sessionId: data.sessionId,
        characterSlug: data.characterSlug,
        characterId: data.characterId,
        characterDisplayName: data.characterDisplayName,
        createdAt: data.createdAt,
        officeCode: code,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: String(e) });
      throw e;
    }
  },
  async logout() {
    try {
      await csrfPost("/api/logout", {});
    } catch {
      // ponytail: best-effort, still clear local.
    }
    // ponytail: drop cached CSRF token so next login fetches fresh.
    clearCsrfCache();
    set({
      sessionId: null,
      characterSlug: null,
      characterId: null,
      characterDisplayName: null,
      officeCode: null,
    });
  },
}));
