// ponytail: single Next.js + Socket.IO server. Plain Node http, no Fastify.
// Fastify v5 + Next.js custom-server integration is fragile; for an MVP
// with ~5 routes, hand-rolled routing is simpler.

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { hashToken, generateSessionToken, assignIdentity } from "./lib/api/auth";
import { registerSocketHandlers } from "./lib/api/socket";
import { rateLimit } from "./lib/api/rate-limit";
import { getPresence } from "./lib/api/presence";
import { CSRF_COOKIE, CSRF_HEADER, makeCsrfToken } from "./lib/api/csrf";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";

const prisma = new PrismaClient();

// ponytail: minimal cookie reader (only need our two cookies).
function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T);
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function buildCookie(name: string, value: string, maxAgeSec: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (!dev) parts.push("Secure");
  return parts.join("; ");
}

function csrfOk(req: IncomingMessage): boolean {
  const cookie = readCookie(req.headers.cookie, CSRF_COOKIE);
  const header = req.headers[CSRF_HEADER];
  if (!cookie || !header) return false;
  // ponytail: constant-time compare would be nicer; for an MVP, plain === is fine.
  return cookie === header;
}

// ponytail: lastSeenAt updates throttled per session.
const lastSeenUpdates = new Map<string, number>();
const LAST_SEEN_MIN_INTERVAL = 30_000;
async function touchLastSeen(sessionId: string) {
  const now = Date.now();
  const last = lastSeenUpdates.get(sessionId) ?? 0;
  if (now - last < LAST_SEEN_MIN_INTERVAL) return;
  lastSeenUpdates.set(sessionId, now);
  try {
    await prisma.anonymousSession.update({
      where: { id: sessionId },
      data: { lastSeenAt: new Date() },
    });
  } catch {
    // ponytail: session may be gone; ignore.
  }
}

async function main() {
  const nextApp = next({ dev, hostname, port });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  const httpServer = createServer(async (req, res) => {
    const url = parse(req.url ?? "/", true);
    const path = url.pathname ?? "/";
    const method = req.method ?? "GET";

    try {
      // -------- API routes --------
      if (path === "/api/health" && method === "GET") {
        return json(res, 200, {
          status: "ok",
          name: "chaos-chat",
          time: new Date().toISOString(),
        });
      }

      if (path === "/api/csrf" && (method === "GET" || method === "POST")) {
        const token = makeCsrfToken();
        res.setHeader(
          "Set-Cookie",
          buildCookie(CSRF_COOKIE, token, 60 * 60 * 24 * 7)
        );
        return json(res, 200, { token });
      }

      if (path === "/api/rooms" && method === "GET") {
        const rooms = await prisma.room.findMany({
          where: { archivedAt: null },
          orderBy: { createdAt: "asc" },
        });
        return json(
          res,
          200,
          rooms.map((r) => ({
            id: r.id,
            slug: r.slug,
            name: r.name,
            description: r.description,
            emoji: r.emoji,
            createdAt: r.createdAt.getTime(),
          }))
        );
      }

      if (path === "/api/presence" && method === "GET") {
        return json(res, 200, getPresence());
      }

      // -------- POST endpoints require CSRF (except csrf endpoint itself) --------
      if (method === "POST" && path !== "/api/csrf" && !csrfOk(req)) {
        return json(res, 403, { error: "csrf" });
      }

      if (path === "/api/session" && method === "POST") {
        const body = await readJson<{ code?: string }>(req);
        const code = body.code?.trim().toLowerCase();
        if (!code) return json(res, 400, { error: "code required" });
        const token = generateSessionToken();
        const tokenHash = hashToken(token, SESSION_SECRET);
        const slug = assignIdentity(token);
        const character = await prisma.character.findUnique({ where: { slug } });
        if (!character) return json(res, 500, { error: "no character" });
        const session = await prisma.anonymousSession.create({
          data: { tokenHash, characterId: character.id, officeCode: code },
        });
        const csrf = readCookie(req.headers.cookie, CSRF_COOKIE) ?? makeCsrfToken();
        res.setHeader("Set-Cookie", buildCookie("chaos_session", token, 60 * 60 * 24 * 365));
        if (!readCookie(req.headers.cookie, CSRF_COOKIE)) {
          res.appendHeader("Set-Cookie", buildCookie(CSRF_COOKIE, csrf, 60 * 60 * 24 * 7));
        }
        return json(res, 200, {
          sessionId: session.id,
          characterSlug: slug,
          characterId: character.id,
          characterDisplayName: character.displayName,
          createdAt: session.createdAt.getTime(),
        });
      }

      if (path === "/api/logout" && method === "POST") {
        res.setHeader(
          "Set-Cookie",
          "chaos_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
        );
        return json(res, 200, { ok: true });
      }

      if (path === "/api/me" && method === "GET") {
        const token = readCookie(req.headers.cookie, "chaos_session");
        if (!token) return json(res, 401, { error: "no session" });
        const session = await prisma.anonymousSession.findUnique({
          where: { tokenHash: hashToken(token, SESSION_SECRET) },
          include: { character: true },
        });
        if (!session || session.bannedAt)
          return json(res, 401, { error: "invalid" });
        void touchLastSeen(session.id);
        return json(res, 200, {
          sessionId: session.id,
          characterSlug: session.character.slug,
          characterId: session.characterId,
          characterDisplayName: session.character.displayName,
          createdAt: session.createdAt.getTime(),
        });
      }

      if (path === "/api/report" && method === "POST") {
        const token = readCookie(req.headers.cookie, "chaos_session");
        if (!token) return json(res, 401, { error: "no session" });
        const session = await prisma.anonymousSession.findUnique({
          where: { tokenHash: hashToken(token, SESSION_SECRET) },
        });
        if (!session) return json(res, 401, { error: "invalid" });
        const body = await readJson<{ messageId?: string; reason?: string }>(req);
        if (!body.messageId || !body.reason)
          return json(res, 400, { error: "missing fields" });
        if (!(await rateLimit(`report:${session.id}`, 10, 60_000)))
          return json(res, 429, { error: "slow down" });
        await prisma.report.create({
          data: {
            messageId: body.messageId,
            reporterSessionId: session.id,
            reason: body.reason.slice(0, 200),
          },
        });
        return json(res, 200, { ok: true });
      }

      // -------- fall through to Next.js --------
      return handle(req, res);
    } catch (err) {
      console.error("[api error]", err);
      if (!res.headersSent) json(res, 500, { error: "internal" });
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: true, credentials: true },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    const cookies = socket.handshake.headers.cookie ?? "";
    const token = readCookie(cookies, "chaos_session");
    if (!token) return next(new Error("no session"));
    const session = await prisma.anonymousSession.findUnique({
      where: { tokenHash: hashToken(token, SESSION_SECRET) },
      include: { character: true },
    });
    if (!session || session.bannedAt) return next(new Error("invalid"));
    socket.data.session = session;
    void touchLastSeen(session.id);
    next();
  });

  registerSocketHandlers(io, prisma);

  httpServer.listen(port, hostname, () => {
    console.log(`chaos-chat listening on http://${hostname}:${port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
