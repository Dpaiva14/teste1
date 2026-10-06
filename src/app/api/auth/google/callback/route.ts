import { NextResponse, type NextRequest } from "next/server";
import { consumeTransaction, exchangeCodeForProfile, isGoogleConfigured } from "@/lib/auth/google";
import { setSessionCookie } from "@/lib/auth/session";
import { signInWithGoogle } from "@/features/auth/server/auth-service";
import { getEnv } from "@/lib/env";

export async function GET(req: NextRequest) {
  const base = getEnv().APP_URL;
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, base));
  try {
    if (!isGoogleConfigured()) return fail("google_not_configured");
    const params = req.nextUrl.searchParams;
    if (params.get("error")) return fail("google_denied");
    const tx = await consumeTransaction(params.get("state"));
    const code = params.get("code");
    if (!code) return fail("google_failed");
    const profile = await exchangeCodeForProfile(code, tx.verifier);
    const user = await signInWithGoogle(profile);
    await setSessionCookie(user.id, user.sessionVersion);
    return NextResponse.redirect(new URL(tx.next, base));
  } catch (e) {
    console.error("[auth/google] callback failed", e instanceof Error ? e.message : e);
    return fail("google_failed");
  }
}
