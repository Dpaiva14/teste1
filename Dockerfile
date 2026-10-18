# syntax=docker/dockerfile:1

# US30 Trading Academy — production image (Next.js 16 + Prisma 7).
#
#   docker compose --env-file .env.docker up -d --build     # recommended: app + PostgreSQL
#
# The image keeps the dev dependencies on purpose: the entrypoint needs the Prisma CLI (migrations) and tsx (seed).
# It runs as the unprivileged `node` user; uploaded files live in /app/storage (mount a volume there).

ARG NODE_VERSION=22

# ── build ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 CI=true
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Dependencies first, so this layer is cached until package files or the Prisma schema change.
# `npm ci` runs the `postinstall` script (`prisma generate`), which is why prisma/ must already be here.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .
# No secrets are needed to build: the environment is validated lazily at request time.
RUN npm run build && rm -rf .next/cache

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    STORAGE_DIR=/app/storage
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/storage && chown node:node /app/storage && chmod +x /app/docker/entrypoint.sh

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["node_modules/.bin/next", "start", "--hostname", "0.0.0.0"]
