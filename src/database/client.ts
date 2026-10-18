import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

/**
 * Prisma 7 uses driver adapters: the connection is owned by `pg` and the query compiler runs in-process
 * (no Rust engine binary). A single client is cached on globalThis so Next.js dev hot-reloads do not
 * open a new connection pool on every edit.
 */
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function getClient(): PrismaClient {
  const existing = globalForPrisma.__prisma;
  if (existing) return existing;
  const created = createClient();
  // Cached on globalThis in every environment: the client is created lazily on first use (see below), so one instance per process.
  globalForPrisma.__prisma = created;
  return created;
}

/**
 * Lazy: the client is only created when something actually queries the database. Importing this module (as `next build`
 * does while collecting route data) therefore never needs DATABASE_URL — the build works without any secrets or database.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export * from "./generated/client";
