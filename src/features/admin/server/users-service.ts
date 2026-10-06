import "server-only";
import { prisma, type Prisma } from "@/database/client";
import type { SessionUser } from "@/lib/auth/session";
import { conflict, forbidden, notFound } from "@/lib/errors";
import type { AdminUserRow } from "../types";

const PAGE = 20;

export async function listUsers(q: string | undefined, page: number): Promise<{ users: AdminUserRow[]; total: number; page: number; pages: number }> {
  const where: Prisma.UserWhereInput = q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {};
  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
  ]);
  return {
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE)),
    users: rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      disabled: u.disabledAt !== null,
      xp: u.xp,
      createdAt: u.createdAt.toISOString(),
      lastActiveOn: u.lastActiveOn?.toISOString().slice(0, 10) ?? null,
    })),
  };
}

/**
 * Changes a user's role and/or enabled state. Guards: admins cannot demote or disable themselves, and the platform
 * can never be left without an active admin (checked inside the transaction so two admins cannot race each other).
 */
export async function updateUser(actor: SessionUser, id: string, patch: { role?: "STUDENT" | "ADMIN"; disabled?: boolean }) {
  await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id } });
    if (!target) throw notFound("Utilizador não encontrado.");
    if (id === actor.id && (patch.role === "STUDENT" || patch.disabled === true)) throw forbidden("Não podes despromover nem desativar a tua própria conta.");

    const losesAdmin = target.role === "ADMIN" && target.disabledAt === null && (patch.role === "STUDENT" || patch.disabled === true);
    if (losesAdmin) {
      const others = await tx.user.count({ where: { role: "ADMIN", disabledAt: null, id: { not: id } } });
      if (others === 0) throw conflict("Tem de existir pelo menos um administrador ativo.");
    }

    await tx.user.update({
      where: { id },
      data: {
        ...(patch.role !== undefined ? { role: patch.role } : {}),
        ...(patch.disabled !== undefined ? { disabledAt: patch.disabled ? new Date() : null } : {}),
        // Disabling or demoting must end the user's existing sessions immediately.
        ...(patch.disabled === true || patch.role === "STUDENT" ? { sessionVersion: { increment: 1 } } : {}),
      },
    });
  });
}
