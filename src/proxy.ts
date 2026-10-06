import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Optimistic route protection (Next.js 16 "proxy", formerly middleware).
 *
 * It only checks that a validly signed, unexpired session JWT is present. It deliberately does NOT hit
 * the database: authoritative checks (disabled user, session version, role) happen in `getCurrentUser()`
 * / `requireUser()` on every page and API request. This is a UX redirect, not the security boundary.
 */
const SESSION_COOKIE = "academy_session";

const PROTECTED_PREFIXES = [
  "/dashboard", "/academy", "/labs", "/backtest", "/simulator", "/journal", "/tools",
  "/tutor", "/analyzer", "/assessment", "/profile", "/admin",
];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
      issuer: "us30-academy",
      audience: "us30-academy-web",
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  if (!(await hasValidSession(req))) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  // NOTE: signed-in users visiting /login are redirected by the page itself (it validates against the
  // database). Doing it here would loop for a still-signed JWT whose account was disabled or reset.
  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes (they authorise themselves) and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
