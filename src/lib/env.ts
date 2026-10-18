import "server-only";
import { z } from "@/lib/zod";

/**
 * Server-side environment, validated lazily on first use so `next build` works without secrets.
 * Nothing in here may ever be imported from a Client Component ("server-only" guard below).
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  APP_URL: z.url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters (openssl rand -base64 48)"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_FROM: z.string().default("US30 Trading Academy <no-reply@example.com>"),
  SMTP_URL: z.string().optional(),
  MARKET_DATA_PROVIDER: z.string().default("demo"),
  MARKET_DATA_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  STORAGE_DIR: z.string().default("./storage"),
  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
  /** Overrides the `Secure` flag of the session cookies (default: on in production). Only turn it off to serve over plain http. */
  COOKIE_SECURE: z.enum(["true", "false"]).optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const raw = Object.fromEntries(
    Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = () => process.env.NODE_ENV === "production";

/**
 * `Secure` flag for cookies. Secure by default in production; `COOKIE_SECURE=false` exists for running the production
 * build over plain http (e.g. a local Docker stack reached through a LAN address — browsers drop Secure cookies on http,
 * except on localhost). Behind HTTPS always leave it on.
 */
export const cookieSecure = (): boolean => {
  const override = getEnv().COOKIE_SECURE;
  return override === undefined ? isProd() : override === "true";
};
