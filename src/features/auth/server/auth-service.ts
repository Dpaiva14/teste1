import "server-only";
import { prisma } from "@/database/client";
import { getEnv } from "@/lib/env";
import { conflict, HttpError } from "@/lib/errors";
import { sendMail } from "@/lib/mailer";
import { getDummyHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import type { GoogleProfile } from "@/lib/auth/google";
import type { RegisterInput } from "../schemas";

const RESET_TTL_MS = 60 * 60 * 1000;
const INVALID_CREDENTIALS = new HttpError(401, "INVALID_CREDENTIALS", "E-mail ou password incorretos.");

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw conflict("Já existe uma conta com este e-mail.");
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: { email: input.email, name: input.name, passwordHash },
    select: { id: true, sessionVersion: true },
  });
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, disabledAt: true, sessionVersion: true },
  });
  // Always run one bcrypt comparison so response time does not reveal whether the e-mail exists.
  const ok = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !user.passwordHash || !ok || user.disabledAt) throw INVALID_CREDENTIALS;
  return { id: user.id, sessionVersion: user.sessionVersion };
}

/** Creates a single-use reset token. Always resolves — callers must not reveal whether the e-mail exists. */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, disabledAt: true } });
  if (!user || user.disabledAt) return;
  const token = generateToken();
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    }),
  ]);
  const link = `${getEnv().APP_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: "Recuperação de password — US30 Trading Academy",
    text:
      `Olá ${user.name},\n\nRecebemos um pedido para repor a tua password. ` +
      `Usa a ligação abaixo (válida durante 1 hora, uso único):\n\n${link}\n\n` +
      `Se não pediste esta alteração, ignora esta mensagem — a tua password mantém-se.\n`,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new HttpError(400, "INVALID_TOKEN", "A ligação de recuperação é inválida ou expirou.");
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Bumping sessionVersion signs the user out everywhere.
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
  ]);
}

export async function changePassword(userId: string, currentPassword: string | undefined, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
  if (user.passwordHash) {
    if (!currentPassword || !(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new HttpError(400, "INVALID_PASSWORD", "A password atual está incorreta.");
    }
  }
  const passwordHash = await hashPassword(newPassword);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash, sessionVersion: { increment: 1 } },
    select: { id: true, sessionVersion: true },
  });
}

/**
 * Sign-in with a verified Google identity.
 *  1. Known (provider, sub)             → that user.
 *  2. Unknown sub, e-mail matches user  → link, but only when Google says the e-mail is verified. Because
 *     this app does not verify e-mails at sign-up, an existing *unverified* local account might have been
 *     pre-registered by an attacker; we therefore wipe its password and sessions before linking
 *     ("pre-hijacking" mitigation).
 *  3. Otherwise                         → create a new user.
 */
export async function signInWithGoogle(profile: GoogleProfile) {
  if (!profile.emailVerified) throw new HttpError(400, "EMAIL_NOT_VERIFIED", "O e-mail da conta Google não está verificado.");

  const linked = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: profile.sub } },
    include: { user: { select: { id: true, disabledAt: true, sessionVersion: true } } },
  });
  if (linked) {
    if (linked.user.disabledAt) throw INVALID_CREDENTIALS;
    return { id: linked.user.id, sessionVersion: linked.user.sessionVersion };
  }

  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
    select: { id: true, disabledAt: true, emailVerified: true, sessionVersion: true },
  });
  if (existing) {
    if (existing.disabledAt) throw INVALID_CREDENTIALS;
    const wasUnverified = existing.emailVerified === null;
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        emailVerified: existing.emailVerified ?? new Date(),
        image: profile.picture ?? undefined,
        ...(wasUnverified ? { passwordHash: null, sessionVersion: { increment: 1 } } : {}),
        accounts: { create: { provider: "google", providerAccountId: profile.sub } },
      },
      select: { id: true, sessionVersion: true },
    });
    return updated;
  }

  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      image: profile.picture,
      emailVerified: new Date(),
      accounts: { create: { provider: "google", providerAccountId: profile.sub } },
    },
    select: { id: true, sessionVersion: true },
  });
}
