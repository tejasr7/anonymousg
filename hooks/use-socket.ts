"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type SocketState = "connecting" | "connected" | "reconnecting" | "offline";

let socket: Socket | null = null;
let refCount = 0;
const listeners = new Set<(s: SocketState) => void>();

function getSocket(): Socket {
  if (socket) return socket;
  socket = io({
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket", "polling"],
  });
  socket.on("connect", () => notify("connected"));
  socket.on("disconnect", () => notify("offline"));
  socket.on("reconnect_attempt", () => notify("reconnecting"));
  return socket;
}

function notify(state: SocketState) {
  for (const fn of listeners) fn(state);
}

export function acquireSocket(): Socket {
  refCount += 1;
  return getSocket();
}

export function releaseSocket() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket) {
    socket.disconnect();
    socket = null;
  }
}

export function useSocketState(): SocketState {
  const [state, setState] = useState<SocketState>("connecting");
  useEffect(() => {
    const fn = (s: SocketState) => setState(s);
    listeners.add(fn);
    const s = getSocket();
    if (s.connected) setState("connected");
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return state;
}
