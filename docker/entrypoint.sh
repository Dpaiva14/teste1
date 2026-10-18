#!/bin/sh
# Container entrypoint: validates the essentials, applies migrations, seeds the curriculum, then starts the server.
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] DATABASE_URL is not set." >&2
  exit 1
fi
if [ "${#AUTH_SECRET}" -lt 32 ] 2>/dev/null; then
  echo "[entrypoint] AUTH_SECRET must have at least 32 characters (openssl rand -base64 48)." >&2
  exit 1
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] applying database migrations…"
  node_modules/.bin/prisma migrate deploy
fi

# Idempotent: re-syncs curriculum, glossary and achievements from code. Lessons edited in the admin area are left alone
# (set SEED_FORCE=1 to overwrite them). SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD create the first admin if they are set.
if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "[entrypoint] seeding curriculum…"
  node_modules/.bin/tsx prisma/seed.ts
fi

echo "[entrypoint] starting: $*"
exec "$@"
