# Deploying to Dokploy

Dokploy runs each service from a Dockerfile. You need:

1. **App service** — built from this repo's `Dockerfile`
2. **Postgres service** — official `postgres:17-alpine` image
3. **(Optional) Redis** — official `redis:7-alpine` (currently unused, ready for multi-instance scaling)

## App service

- **Source**: this Git repo
- **Build method**: `Dockerfile`
- **Port**: `3000`
- **Healthcheck path**: `/api/health`

### Required env vars

```
DATABASE_URL=postgresql://chaos:<PASSWORD>@<POSTGRES_HOST>:5432/chaos_chat?schema=public
SESSION_SECRET=<random 32+ char string — generate with `openssl rand -hex 32`>
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
```

Replace `<POSTGRES_HOST>` with the Dokploy-internal service name (usually the Postgres service name).

### How it works

- The container's `entrypoint.sh` waits for DB → runs `prisma db push` → seeds characters + rooms → starts `node dist/server.js`.
- Migrations + seed are idempotent (safe on every restart).
- Non-root user (`nextjs`) runs the app.

### First deploy

- Build takes ~3–5 min the first time (pnpm fetches everything).
- Once DB is reachable, the app is ready in ~10s after that.
- `GET /api/health` returns `{ "status": "ok" }` when ready.

## Postgres service

- **Image**: `postgres:17-alpine`
- **DB name**: `chaos_chat`
- **User**: `chaos`
- **Password**: pick one, store in Dokploy secrets
- **Volume**: mount a persistent volume at `/var/lib/postgresql/data`
- **Port**: `5432` (internal only — Dokploy's network)
- The `DATABASE_URL` in the app env points here.

## Health checks

- App: `wget http://127.0.0.1:3000/api/health` every 30s, 5s timeout, 3 retries, 15s start period
- Postgres: `pg_isready -U chaos`

## Reverse proxy / TLS

Dokploy sets up Traefik automatically. Just point a domain at the app service on port 3000. The session cookie needs `Secure` flag in production — the server sets it when `NODE_ENV=production` (which Dokploy sets).

## Backups

- Postgres volume should be backed up via Dokploy's backup schedule
- No local file state — everything is in DB

## Scaling

Single instance for MVP (~20–100 users). To go multi-instance:
- Add Redis (Docker Compose service ready)
- Switch in-memory presence/typing/rate-limit to Redis
- Socket.IO Redis adapter for cross-instance pub/sub

## Local smoke

```bash
docker compose up --build
curl http://localhost:3000/api/health
# {"status":"ok","name":"chaos-chat","time":"..."}
```
