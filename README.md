# Chaos Chat — anonymous office hell

> You get what you get.

Anonymous real-time chat for an office. Type an office code, get assigned a cursed animal identity, talk to your coworkers without anyone knowing it's you.

No accounts. No names. No emails. Just vibes.

---

## Try it

1. Visit the URL (or scan the QR code)
2. Type any office code — even gibberish works in MVP
3. You get assigned a random cursed character (Fat Pig, Dirty Donkey, Kechua, Sewer Pigeon, …)
4. Drop into `#42069` and start talking

You don't get to pick. You don't get to reroll. There is no escape.

---

## Stack

| Layer       | Tech                                                              |
| ----------- | ----------------------------------------------------------------- |
| Frontend    | Next.js 15 · React 19 · TypeScript · Tailwind                    |
| Animation   | Motion (React) · Anime.js · CSS keyframes                        |
| 3D          | ~~R3F + drei + three.js~~ → dropped (R3F/React 19 layout-effect bug) |
| UI kit      | Radix primitives · Phosphor icons · hand-rolled brutalist atoms  |
| State       | Zustand (chat, presence, session, ui)                            |
| Realtime    | Socket.IO                                                        |
| Server      | Custom Next.js server (`server.ts`) · plain Node http            |
| DB          | Postgres 17 · Prisma 6                                           |
| Cache       | Redis 7 (ready, not yet wired)                                   |
| Auth        | Anonymous HTTP-only cookie, HMAC-hashed server-side             |
| Deploy      | Docker · Dokploy · Traefik                                      |

## Features

- **Forced anonymous identity** — server hashes your session token, mods by character count
- **18-character roster** — Fat Pig, Dirty Donkey, Cockroach, Kechua, Office Rat, …
- **Identity-reveal sequence** — black → connecting → verifying → assigning → drop → "there is no escape."
- **4 rooms** — `#42069` (main) · `#random` · `#memes` · `#lunch`
- **Realtime messaging** via Socket.IO with room-scoped broadcast
- **Reactions** (💀 😂 😭 🫡 🤡 👀 🔥 ❤️) with toggle
- **Reply threading** (in-room only, validated server-side)
- **Typing indicator** with real names ("Cockroach is typing", "3 creatures are typing")
- **Presence** with per-room join/leave broadcast
- **Block locally** — persisted in localStorage, filters messages + online list
- **Unread badges** — per-room, lastRead tracked per session
- **Scroll-to-bottom** button with "N new messages" when above bottom
- **CSRF** — double-submit cookie, auto-retry once on 403
- **Rate limits** — 10 msg/sec, 30 reactions/sec, 10 reports/min
- **Message dedup** — by clientNonce (idempotency key) so socket reconnects don't double-send
- **Connection banner** — "connection died lol" / "trying to resurrect it..."
- **Mobile** — drawer sidebar, sheet online panel, safe-area composer
- **Touch support** — message actions visible on tap (not hover-only)
- **Keyboard** — Enter to send, Shift+Enter newline, Cmd/Ctrl+Enter send, Esc cancel reply
- **Reduced motion** — reveal skips animations
- **Healthcheck** — `/api/health`
- **Cursed copy** throughout — "nobody knows who anyone is", "connection died lol"

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                      │
│  Next.js 15 (static + client components)                    │
│  Zustand stores (session, chat, presence, ui)               │
│  Socket.IO client → /socket.io                              │
└──────────────┬───────────────────────┬─────────────────────�
               │ HTTP                 │ WebSocket
┌──────────────▼───────────────────────▼─────────────────────┐
│ server.ts (custom Next.js server)                           │
│  ┌─────────────────┐  ┌──────────────────────────────────┐ │
│  │ /api/* routes    │  │ Socket.IO                       │ │
│  │  /health         │  │  presence:list                  │ │
│  │  /csrf           │  │  room:history                   │ │
│  │  /session        │  │  message:created/deleted        │ │
│  │  /me             │  │  reaction:add/remove/update      │ │
│  │  /rooms          │  │  typing:start/stop/set          │ │
│  │  /presence       │  │                                  │ │
│  │  /report         │  │  in-memory: presence, typing,    │ │
│  │  /logout         │  │  rate-limit, dedup, fingerprints │ │
│  └────────┬────────┘  └──────────────┬───────────────────┘ │
│           │                          │                       │
│           ▼                          ▼                       │
│      Prisma 6 ─────────────────► Postgres 17                │
│                                                              │
│   AnonymousSession ────► Character                          │
│   Room              ────► Message ────► Reaction             │
│                           Message ────► Report               │
└──────────────────────────────────────────────────────────────┘
```

### Socket event contract

**Client → server:**

| Event              | Payload                                   |
| ------------------ | ----------------------------------------- |
| `room:join`        | `{ roomId }`                              |
| `room:leave`       | `{ roomId }`                              |
| `message:send`     | `{ roomId, body, replyToMessageId?, clientNonce? }` |
| `message:delete`   | `{ messageId, roomId }` (author only)     |
| `reaction:add`     | `{ messageId, emoji, roomId }`            |
| `reaction:remove`  | `{ messageId, emoji, roomId }`            |
| `typing:start`     | `{ roomId }`                              |
| `typing:stop`      | `{ roomId }`                              |

**Server → client:**

| Event              | Payload                                                |
| ------------------ | ------------------------------------------------------ |
| `presence:list`    | `PresenceEntry[]`                                     |
| `room:history`     | `{ roomId, messages[] }`                              |
| `message:created`  | `Message`                                              |
| `message:deleted`  | `{ messageId, roomId }`                                |
| `reaction:update`  | `{ messageId, roomId, reactions[] }`                  |
| `typing:set`       | `{ roomId, typing[] }`                                |

### Identity assignment

```
session token (32 random bytes hex)
  ↓ SHA-256 hash
  ↓ readUInt32BE(0) → integer
  ↓ modulo CHARACTERS.length → index
  ↓ CHARACTERS[index].slug
```

Same token → same character, always. Refresh, reconnect, new tab — you keep your identity until you log out.

### Auth model

- **No login.** User opens the URL, server issues an anonymous session cookie (`chaos_session`).
- Cookie is HTTP-only, SameSite=Lax, Secure in prod, 1-year expiry.
- Session token is stored as **HMAC-SHA256** hash in Postgres — a DB leak doesn't let an attacker forge sessions (they'd need `SESSION_SECRET`).
- **CSRF**: double-submit cookie pattern. Server sets `chaos_csrf` HTTP-only cookie, returns same value in JSON body. Client echoes it in `X-CSRF-Token` header on POSTs. Server compares.
- Office code: any non-empty string accepted in MVP. Real allowlist can be added server-side without UI changes.

---

## Project layout

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx          # root: TooltipProvider + fonts + globals
│   ├── page.tsx            # root router (join → reveal → chat)
│   └── globals.css         # Tailwind + tokens + grain/scanlines utilities
│
├── components/
│   ├── avatar/             # Identity reveal + 2D character portraits
│   │   ├── avatar-fallback.tsx
│   │   ├── avatar-portrait.tsx
│   │   ├── avatar-card.tsx
│   │   ├── avatar-3d.tsx   # stub — always uses fallback
│   │   ├── reveal-scene.tsx
│   │   └── identity-reveal.tsx
│   ├── chat/               # Message list, item, composer, reactions, report
│   ├── identity/           # Office code entry
│   ├── layout/             # Sidebar, header, online panel, connection banner
│   └── ui/                 # Hand-rolled atoms (Button, Input, Dialog, Popover, etc.)
│
├── hooks/                  # use-socket, use-socket-sync
├── stores/                 # zustand: session, chat, ui, presence
├── lib/
│   ├── api/                # Server-only: auth, socket handlers, CSRF, dedup, rate-limit
│   ├── characters.ts       # Character roster (18 entries)
│   ├── sounds.ts           # Howler + WebAudio synth
│   └── utils.ts            # cn, formatTime, formatTimestamp, relativeTime
│
├── prisma/
│   ├── schema.prisma       # Models: Character, AnonymousSession, Room, Message, Reaction, Report
│   └── seed.ts             # Idempotent character + room seeding
│
├── server.ts               # Custom Next.js server (HTTP routes + Socket.IO)
├── entrypoint.sh           # Container startup: wait for DB → push schema → seed → start
├── Dockerfile              # Multi-stage, non-root, healthcheck
├── docker-compose.yml      # Local dev (app + Postgres)
├── DOKPLOY.md               # Production deploy guide
└── README.md                # This file
```

---

## Run locally

```bash
# 1. Postgres (already running locally) + create db
createdb chaos_chat

# 2. Install + generate Prisma client + push schema + seed
pnpm install --ignore-workspace
pnpm exec prisma generate
pnpm exec prisma db push
./node_modules/.bin/tsx prisma/seed.ts

# 3. Build
./node_modules/.bin/next build
./node_modules/.bin/tsc --project tsconfig.server.json

# 4. Run
pnpm start   # node dist/server.js — uses .next + dist + prisma
# or
pnpm dev     # tsx server.ts — hot-reload
```

Visit `http://localhost:3000`. Type any office code → reveal → `#42069`.

---

## Run via Docker (local stack)

```bash
docker compose up --build
```

Brings up app + Postgres together. Visit `http://localhost:3000`.

---

## Deploy to Dokploy (production)

See **[DOKPLOY.md](./DOKPLOY.md)** for full instructions.

TL;DR:
1. **App service** — built from `Dockerfile`. Port `3000`. Healthcheck `/api/health`.
2. **Postgres service** — `postgres:17-alpine`. DB `chaos_chat`. User `chaos`. Persistent volume.
3. **Env vars**:
   ```
   DATABASE_URL=postgresql://chaos:<pwd>@<postgres-host>:5432/chaos_chat?schema=public
   SESSION_SECRET=<openssl rand -hex 32>
   PORT=3000
   HOSTNAME=0.0.0.0
   NODE_ENV=production
   ```
4. First deploy: build 3–5 min, app ready ~10s after DB is reachable.

The container's `entrypoint.sh` runs `prisma db push` + seed on every start (idempotent).

---

## HTTP API

| Method | Path           | Description                                       |
| ------ | -------------- | ------------------------------------------------- |
| GET    | `/api/health`  | Healthcheck                                       |
| GET    | `/api/csrf`    | Issue CSRF token (cookie + body)                  |
| POST   | `/api/session` | Create anonymous session, set `chaos_session` cookie |
| GET    | `/api/me`      | Current session info (401 if no cookie)           |
| POST   | `/api/logout`  | Clear session cookie                              |
| GET    | `/api/rooms`   | List rooms                                        |
| GET    | `/api/presence` | Currently online list                            |
| POST   | `/api/report`  | Report a message (rate-limited 10/min)            |

All POST endpoints require `X-CSRF-Token` header matching `chaos_csrf` cookie.

---

## Phase status

- [x] Design system, character engine, animated 2D avatars
- [x] Office code, identity reveal, main chat, profile popover, mobile
- [x] Production build + Docker + Dokploy
- [x] **Backend**: Postgres + Prisma + Socket.IO + cookie sessions
- [x] **Frontend wired to real API + socket**
- [x] CSRF, rate limits, message dedup, presence/typing tracking
- [x] Reply threading, reaction toggle, message delete, block-locally
- [ ] Real `.glb` characters (drop-in to `lib/avatar/3d/`) — waiting on R3F/React 19 fix
- [ ] Redis pub/sub for multi-instance deploys
- [ ] Admin tools (delete any, ban session) — server methods ready, no UI

---

## License

For your office, not the world.
