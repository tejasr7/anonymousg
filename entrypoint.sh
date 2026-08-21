#!/bin/sh
# ponytail: run migrations + seed + start server.
# Idempotent — safe to run on every container start.

set -e

echo "[entrypoint] waiting for db..."
node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (let i = 0; i < 30; i++) {
    try { await p.$queryRaw`SELECT 1`; console.log("[entrypoint] db ready"); return; }
    catch (e) { console.log("[entrypoint] waiting...", i); await new Promise(r => setTimeout(r, 1000)); }
  }
  throw new Error("db not ready after 30s");
})().finally(() => p.$disconnect());
'

echo "[entrypoint] pushing schema..."
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss

echo "[entrypoint] seeding characters + rooms..."
./node_modules/.bin/tsx prisma/seed.ts

echo "[entrypoint] ensuring office code '42069' exists..."
# ponytail: direct upsert via plain node — no tsx dependency.
# Belt-and-suspenders: seed.ts should have done this but we don't trust tsx in prod.
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.officeCode.upsert({
  where: { code: '42069' },
  create: { code: '42069' },
  update: {},
}).then(() => p.\$disconnect());
"

echo "[entrypoint] starting server..."
exec node dist/server.js
