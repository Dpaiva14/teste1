import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, z, type ZodType } from "@/lib/zod";
import { Prisma } from "@/database/client";
import { getEnv } from "@/lib/env";
import { HttpError, badRequest, forbidden, unprocessable } from "@/lib/errors";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { requireAdmin, requireUser, type SessionUser } from "@/lib/auth/session";

const MAX_JSON_BYTES = 512 * 1024;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Best-effort client IP. Only trusts X-Forwarded-For when TRUST_PROXY=true (spoofable otherwise). */
export function clientIp(req: Request): string | null {
  if (getEnv().TRUST_PROXY !== "true") return null;
  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip");
}

/**
 * CSRF defence in depth (cookies are already SameSite=Lax): browsers always send Origin on cross-site
 * unsafe requests, so a mismatching Origin or Sec-Fetch-Site: cross-site is rejected.
 */
export function assertSameOrigin(req: Request): void {
  if (SAFE_METHODS.has(req.method)) return;
  if (req.headers.get("sec-fetch-site") === "cross-site") throw forbidden("Pedido de origem cruzada rejeitado.");
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser client (curl, server-to-server)
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw forbidden("Origem inválida.");
  }
  const env = getEnv();
  const allowed = new Set<string>([new URL(env.APP_URL).host]);
  const host = req.headers.get("host");
  if (host) allowed.add(host);
  const fwd = env.TRUST_PROXY === "true" ? req.headers.get("x-forwarded-host") : null;
  if (fwd) allowed.add(fwd);
  if (!allowed.has(originHost)) throw forbidden("Pedido de origem cruzada rejeitado.");
}

export async function parseJson<S extends ZodType>(req: Request, schema: S, maxBytes = MAX_JSON_BYTES): Promise<z.infer<S>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Pedido demasiado grande.");
  let raw: unknown;
  try {
    raw = text.length === 0 ? {} : JSON.parse(text);
  } catch {
    throw badRequest("JSON inválido.");
  }
  return schema.parse(raw);
}

export function parseQuery<S extends ZodType>(req: NextRequest, schema: S): z.infer<S> {
  const raw: Record<string, string | string[]> = {};
  for (const key of new Set(req.nextUrl.searchParams.keys())) {
    const all = req.nextUrl.searchParams.getAll(key);
    raw[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return schema.parse(raw);
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const flat = z.flattenError(err);
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", details: flat } },
      { status: 422 },
    );
  }
  if (err instanceof HttpError) {
    const res = NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status },
    );
    if (err.status === 429) {
      const retry = (err.details as { retryAfterSec?: number } | undefined)?.retryAfterSec;
      if (retry) res.headers.set("Retry-After", String(retry));
    }
    return res;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: { code: "CONFLICT", message: "Já existe um registo com estes dados." } }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Recurso não encontrado." } }, { status: 404 });
    }
  }
  console.error("[api] unhandled error", err);
  return NextResponse.json({ error: { code: "INTERNAL", message: "Erro interno. Tenta novamente." } }, { status: 500 });
}

type ParamsOf<P> = { params: Promise<P> };

export interface PublicCtx<P> {
  req: NextRequest;
  params: P;
  ip: string | null;
}
export interface AuthedCtx<P> extends PublicCtx<P> {
  user: SessionUser;
}

type Result = Response | object | string | number | boolean | null | undefined;

function toResponse(result: Result): Response {
  if (result instanceof Response) return result;
  return NextResponse.json(result ?? { ok: true });
}

/** Public endpoint (auth flows, public reference data). Rate-limited by IP when known. */
export function publicRoute<P = Record<string, never>>(handler: (ctx: PublicCtx<P>) => Promise<Result> | Result) {
  return async (req: NextRequest, ctx: ParamsOf<P>): Promise<Response> => {
    try {
      assertSameOrigin(req);
      const ip = clientIp(req);
      if (ip) enforceRateLimit(RATE_LIMITS.api, ip);
      const params = await ctx.params;
      return toResponse(await handler({ req, params, ip }));
    } catch (e) {
      return errorResponse(e);
    }
  };
}

/** Endpoint requiring a signed-in, enabled user. Rate-limited per user. */
export function userRoute<P = Record<string, never>>(handler: (ctx: AuthedCtx<P>) => Promise<Result> | Result) {
  return async (req: NextRequest, ctx: ParamsOf<P>): Promise<Response> => {
    try {
      assertSameOrigin(req);
      const user = await requireUser();
      enforceRateLimit(RATE_LIMITS.api, user.id);
      const params = await ctx.params;
      return toResponse(await handler({ req, params, ip: clientIp(req), user }));
    } catch (e) {
      return errorResponse(e);
    }
  };
}

/** Endpoint requiring an ADMIN user. */
export function adminRoute<P = Record<string, never>>(handler: (ctx: AuthedCtx<P>) => Promise<Result> | Result) {
  return async (req: NextRequest, ctx: ParamsOf<P>): Promise<Response> => {
    try {
      assertSameOrigin(req);
      const user = await requireAdmin();
      enforceRateLimit(RATE_LIMITS.api, user.id);
      const params = await ctx.params;
      return toResponse(await handler({ req, params, ip: clientIp(req), user }));
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export const created = (data: object) => NextResponse.json(data, { status: 201 });
export const noContent = () => new NextResponse(null, { status: 204 });

/** Validate a free-form id param (cuid) to fail fast with 422 instead of a DB round-trip. */
export { idSchema } from "@/lib/http-schemas";
export { unprocessable };
