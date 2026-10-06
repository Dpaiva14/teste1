import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma, type Role } from "@/database/client";
import { getEnv, isProd } from "@/lib/env";
import { forbidden, unauthorized } from "@/lib/errors";

export const SESSION_COOKIE = "academy_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  /** user id */
  sub: string;
  /** session version — must match User.sessionVersion */
  sv: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  timezone: string;
  xp: number;
  streakCount: number;
  image: string | null;
  hasPassword: boolean;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ sv: payload.sv })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("us30-academy")
    .setAudience("us30-academy-web")
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: "us30-academy",
      audience: "us30-academy-web",
    });
    if (typeof payload.sub !== "string" || typeof payload.sv !== "number") return null;
    return { sub: payload.sub, sv: payload.sv };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, sessionVersion: number): Promise<void> {
  const token = await signSession({ sub: userId, sv: sessionVersion });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, secure: isProd(), sameSite: "lax", path: "/", maxAge: 0 });
}

/**
 * Resolve the current user from the session cookie. Memoised per request with React `cache`.
 * Unlike the proxy (which only checks the JWT), this hits the database, so disabled accounts,
 * role changes and password resets take effect immediately.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true, email: true, name: true, role: true, timezone: true, xp: true, streakCount: true,
      image: true, passwordHash: true, disabledAt: true, sessionVersion: true,
    },
  });
  if (!user || user.disabledAt || user.sessionVersion !== session.sv) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    timezone: user.timezone,
    xp: user.xp,
    streakCount: user.streakCount,
    image: user.image,
    hasPassword: user.passwordHash !== null,
  };
});

/** For API route handlers: throws 401/403 HttpErrors. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw forbidden();
  return user;
}

/** For Server Components / pages: redirects instead of throwing. */
export async function requireUserPage(nextPath?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  return user;
}

export async function requireAdminPage(): Promise<SessionUser> {
  const user = await requireUserPage("/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
