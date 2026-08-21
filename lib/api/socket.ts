// ponytail: socket event handlers — room-scoped broadcast, persistence,
// presence + typing tracking, message/reaction CRUD.

import type { Server as SocketIOServer, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import type { CharacterSlug } from "../../types";
import { rateLimit } from "./rate-limit";
import {
  addPresence,
  addTyping,
  getPresence,
  getTyping,
  removePresence,
  removeTyping,
} from "./presence";
import { shouldDedupNonce } from "./dedup";

type Session = {
  id: string;
  characterId: string;
  character: { slug: CharacterSlug; displayName: string };
};

function serializeMessage(m: {
  id: string;
  sessionId: string;
  characterId: string;
  roomId: string;
  body: string;
  replyToMessageId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  character: { slug: string; displayName: string };
  reactions: {
    id: string;
    sessionId: string;
    emoji: string;
    character: { slug: string };
  }[];
}) {
  return {
    id: m.id,
    sessionId: m.sessionId,
    characterSlug: m.character.slug,
    characterId: m.characterId,
    roomId: m.roomId,
    body: m.body,
    replyToMessageId: m.replyToMessageId,
    createdAt: m.createdAt.getTime(),
    deletedAt: m.deletedAt?.getTime() ?? null,
    reactions: m.reactions.map((r) => ({
      id: r.id,
      emoji: r.emoji,
      sessionId: r.sessionId,
      characterSlug: r.character.slug,
    })),
  };
}

// ponytail: track which reactions have been broadcast for a given message
// to avoid redundant DB queries + emissions.
const lastReactionBroadcast = new Map<string, string>(); // messageId → JSON

function reactionFingerprint(rs: { id: string; emoji: string; sessionId: string; characterSlug: string }[]): string {
  // ponytail: sort to make order-independent, then hash.
  return rs
    .map((r) => `${r.emoji}:${r.sessionId}`)
    .sort()
    .join("|");
}

export function registerSocketHandlers(
  io: SocketIOServer,
  prisma: PrismaClient
) {
  io.on("connection", (socket: Socket) => {
    const session = socket.data.session as Session;
    const characterSlug = session.character.slug;
    const characterDisplayName = session.character.displayName;
    const sessionId = session.id;

    // ponytail: track presence — emit only if changed.
    const presenceChanged = addPresence({
      sessionId,
      characterSlug,
      characterDisplayName,
      joinedAt: Date.now(),
    });
    if (presenceChanged) io.emit("presence:list", getPresence());

    socket.on("room:join", async (roomId: string) => {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) return;
      socket.join(`room:${roomId}`);
      const messages = await prisma.message.findMany({
        where: { roomId, deletedAt: null },
        include: { reactions: { include: { character: true } }, character: true },
        orderBy: { createdAt: "asc" },
        take: 100,
      });
      socket.emit("room:history", {
        roomId,
        messages: messages.map(serializeMessage),
      });
      // ponytail: typing list for this room so the user sees who's typing.
      const typingList = getTyping(roomId).filter((t) => t.sessionId !== sessionId);
      if (typingList.length > 0) socket.emit("typing:set", { roomId, typing: typingList });
    });

    socket.on("room:leave", (roomId: string) => {
      socket.leave(`room:${roomId}`);
      const { changed, typing } = removeTyping(roomId, sessionId);
      if (changed)
        io.to(`room:${roomId}`).emit("typing:set", { roomId, typing });
    });

    socket.on(
      "message:send",
      async (payload: {
        roomId: string;
        body: string;
        replyToMessageId?: string;
        clientNonce?: string;
      }) => {
        if (!(await rateLimit(`msg:${sessionId}`, 10, 1000)))
          return socket.emit("error", { code: "rate_limited" });
        const body = (payload.body ?? "").trim().slice(0, 1000);
        if (!body) return;
        // ponytail: dedup by clientNonce (idempotency). No nonce = no dedup.
        if (payload.clientNonce && shouldDedupNonce(sessionId, payload.clientNonce)) return;
        const room = await prisma.room.findUnique({ where: { id: payload.roomId } });
        if (!room) return;
        // ponytail: validate reply target exists in same room + not deleted.
        if (payload.replyToMessageId) {
          const target = await prisma.message.findUnique({
            where: { id: payload.replyToMessageId },
          });
          if (!target || target.roomId !== payload.roomId || target.deletedAt)
            return socket.emit("error", { code: "invalid_reply" });
        }
        const msg = await prisma.message.create({
          data: {
            sessionId,
            characterId: session.characterId,
            roomId: payload.roomId,
            body,
            replyToMessageId: payload.replyToMessageId ?? null,
          },
          include: {
            character: true,
            reactions: { include: { character: true } },
          },
        });
        // ponytail: clear typing on send.
        const { changed: tChanged, typing } = removeTyping(payload.roomId, sessionId);
        if (tChanged)
          io.to(`room:${payload.roomId}`).emit("typing:set", {
            roomId: payload.roomId,
            typing,
          });
        io.to(`room:${payload.roomId}`).emit(
          "message:created",
          serializeMessage(msg)
        );
      }
    );

    socket.on(
      "message:delete",
      async (payload: { messageId: string; roomId: string }) => {
        const msg = await prisma.message.findUnique({
          where: { id: payload.messageId },
        });
        if (!msg) return;
        // ponytail: only the author can delete + room must match.
        if (msg.sessionId !== sessionId) return;
        if (msg.roomId !== payload.roomId) return;
        if (msg.deletedAt) return;
        await prisma.message.update({
          where: { id: payload.messageId },
          data: { deletedAt: new Date() },
        });
        io.to(`room:${payload.roomId}`).emit("message:deleted", {
          messageId: payload.messageId,
          roomId: payload.roomId,
        });
      }
    );

    socket.on(
      "reaction:add",
      async (payload: { messageId: string; emoji: string; roomId: string }) => {
        if (!(await rateLimit(`rxn:${sessionId}`, 30, 1000))) return;
        const emoji = payload.emoji.slice(0, 8);
        // ponytail: validate message exists + not deleted + in same room.
        const target = await prisma.message.findUnique({
          where: { id: payload.messageId },
        });
        if (!target || target.deletedAt || target.roomId !== payload.roomId) return;
        const existing = await prisma.reaction.findUnique({
          where: {
            messageId_sessionId_emoji: {
              messageId: payload.messageId,
              sessionId,
              emoji,
            },
          },
        });
        if (existing) return; // ponytail: no-op, client toggles via reaction:remove
        await prisma.reaction.create({
          data: {
            messageId: payload.messageId,
            sessionId,
            characterId: session.characterId,
            emoji,
          },
        });
        await broadcastReactions(io, prisma, payload.messageId, payload.roomId);
      }
    );

    socket.on(
      "reaction:remove",
      async (payload: { messageId: string; emoji: string; roomId: string }) => {
        if (!(await rateLimit(`rxn:${sessionId}`, 30, 1000))) return;
        const emoji = payload.emoji.slice(0, 8);
        await prisma.reaction
          .delete({
            where: {
              messageId_sessionId_emoji: {
                messageId: payload.messageId,
                sessionId,
                emoji,
              },
            },
          })
          .catch(() => undefined);
        await broadcastReactions(io, prisma, payload.messageId, payload.roomId);
      }
    );

    socket.on("typing:start", (roomId: string) => {
      const { changed, typing } = addTyping(roomId, {
        sessionId,
        characterSlug,
        characterDisplayName,
      });
      if (changed)
        io.to(`room:${roomId}`).emit("typing:set", { roomId, typing });
    });

    socket.on("typing:stop", (roomId: string) => {
      const { changed, typing } = removeTyping(roomId, sessionId);
      if (changed)
        io.to(`room:${roomId}`).emit("typing:set", { roomId, typing });
    });

    socket.on("disconnect", () => {
      removePresence(sessionId);
      // ponytail: clear typing from every room this socket was in.
      for (const r of socket.rooms) {
        if (r.startsWith("room:")) {
          const roomId = r.slice(5);
          const { changed, typing } = removeTyping(roomId, sessionId);
          if (changed) io.to(r).emit("typing:set", { roomId, typing });
        }
      }
      io.emit("presence:list", getPresence());
    });
  });
}

// ponytail: helper — fetch reactions, dedupe broadcasts via fingerprint, include roomId.
async function broadcastReactions(
  io: SocketIOServer,
  prisma: PrismaClient,
  messageId: string,
  roomId: string
) {
  const reactions = await prisma.reaction.findMany({
    where: { messageId },
    include: { character: true },
  });
  const serialized = reactions.map((r) => ({
    id: r.id,
    emoji: r.emoji,
    sessionId: r.sessionId,
    characterSlug: r.character.slug,
  }));
  const fp = reactionFingerprint(serialized);
  if (lastReactionBroadcast.get(messageId) === fp) return;
  lastReactionBroadcast.set(messageId, fp);
  io.to(`room:${roomId}`).emit("reaction:update", {
    messageId,
    roomId,
    reactions: serialized,
  });
}
