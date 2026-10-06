import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { getEnv, isProd } from "@/lib/env";
import { badRequest, notConfigured } from "@/lib/errors";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
const TX_COOKIE = "academy_oauth_tx";
const TX_MAX_AGE_SEC = 10 * 60;

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export function isGoogleConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(): string {
  return `${getEnv().APP_URL.replace(/\/$/, "")}/api/auth/google/callback`;
}

const b64url = (buf: Buffer) => buf.toString("base64url");

export interface OAuthTransaction {
  state: string;
  verifier: string;
  next: string;
}

/** Only same-site relative paths are allowed as post-login redirect targets (prevents open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/dashboard";
  return next;
}

function secret() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

/** Starts the flow: stores state + PKCE verifier in a short-lived signed cookie, returns the Google URL. */
export async function beginGoogleAuth(next: string | null): Promise<string> {
  if (!isGoogleConfigured()) throw notConfigured("O login com Google não está configurado neste ambiente.");
  const env = getEnv();
  const state = b64url(randomBytes(24));
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());

  const tx = await new SignJWT({ state, verifier, next: safeNextPath(next) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TX_MAX_AGE_SEC}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(TX_COOKIE, tx, { httpOnly: true, secure: isProd(), sameSite: "lax", path: "/api/auth/google", maxAge: TX_MAX_AGE_SEC });

  const url = new URL(AUTH_ENDPOINT);
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

export async function consumeTransaction(stateFromQuery: string | null): Promise<OAuthTransaction> {
  const jar = await cookies();
  const raw = jar.get(TX_COOKIE)?.value;
  jar.set(TX_COOKIE, "", { httpOnly: true, secure: isProd(), sameSite: "lax", path: "/api/auth/google", maxAge: 0 });
  if (!raw || !stateFromQuery) throw badRequest("Sessão OAuth em falta ou expirada.");
  let payload: Record<string, unknown>;
  try {
    ({ payload } = await jwtVerify(raw, secret(), { algorithms: ["HS256"] }));
  } catch {
    throw badRequest("Sessão OAuth inválida ou expirada.");
  }
  const { state, verifier, next } = payload as Partial<OAuthTransaction>;
  if (typeof state !== "string" || typeof verifier !== "string" || state !== stateFromQuery) {
    throw badRequest("O parâmetro state não corresponde (possível CSRF).");
  }
  return { state, verifier, next: safeNextPath(typeof next === "string" ? next : null) };
}

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
}

export async function exchangeCodeForProfile(code: string, verifier: string): Promise<GoogleProfile> {
  const env = getEnv();
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw badRequest("Não foi possível validar o código com o Google.");
  const body = (await res.json()) as { id_token?: string };
  if (!body.id_token) throw badRequest("Resposta do Google sem id_token.");

  jwks ??= createRemoteJWKSet(new URL(JWKS_URI));
  const { payload } = await jwtVerify(body.id_token, jwks, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: env.GOOGLE_CLIENT_ID!,
  });
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  if (!payload.sub || !email) throw badRequest("O Google não devolveu um e-mail.");
  return {
    sub: payload.sub,
    email,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" && payload.name ? payload.name : email.split("@")[0]!,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}
