import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/database/client";
import { getEnv } from "@/lib/env";
import { badRequest, forbidden, HttpError, notFound } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";
import { detectFileType, MAX_IMAGE_BYTES, MAX_PDF_BYTES, sanitizeFilename } from "../file-type";

function storageRoot(): string {
  return path.resolve(getEnv().STORAGE_DIR);
}

/** Resolves a storage key and guarantees the result stays inside the storage root (defence against traversal). */
function resolveKey(key: string): string {
  const root = storageRoot();
  const full = path.resolve(root, key);
  if (!full.startsWith(root + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export async function saveUpload(user: SessionUser, file: File, opts: { lessonId?: string | null; allowPdf: boolean }) {
  if (file.size === 0) throw badRequest("Ficheiro vazio.");
  if (file.size > Math.max(MAX_IMAGE_BYTES, MAX_PDF_BYTES)) throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Ficheiro demasiado grande.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectFileType(bytes);
  if (!type) throw badRequest("Formato não suportado. Usa PNG, JPEG ou WEBP" + (opts.allowPdf ? " (ou PDF)." : "."));
  if (type.kind === "PDF" && !opts.allowPdf) throw forbidden("Apenas administradores podem carregar PDFs.");
  const max = type.kind === "PDF" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (bytes.byteLength > max) throw new HttpError(413, "PAYLOAD_TOO_LARGE", `Ficheiro demasiado grande (máx. ${Math.round(max / 1024 / 1024)} MB).`);

  const now = new Date();
  const storageKey = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${type.ext}`;
  const full = resolveKey(storageKey);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes, { mode: 0o640 });
  try {
    return await prisma.mediaAsset.create({
      data: { ownerId: user.id, lessonId: opts.lessonId ?? null, kind: type.kind, mimeType: type.mime, filename: sanitizeFilename(file.name), sizeBytes: bytes.byteLength, storageKey },
      select: { id: true, kind: true, filename: true, sizeBytes: true },
    });
  } catch (e) {
    await unlink(full).catch(() => {});
    throw e;
  }
}

/** Journal screenshots are private to their owner; lesson assets are visible to signed-in users when the lesson is published. */
export async function readAsset(user: SessionUser, id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id }, include: { lesson: { select: { published: true } } } });
  if (!asset) throw notFound("Ficheiro não encontrado.");
  const isOwner = asset.ownerId === user.id;
  const isAdmin = user.role === "ADMIN";
  const isPublishedLessonAsset = asset.lessonId !== null && asset.lesson?.published === true;
  if (!isOwner && !isAdmin && !isPublishedLessonAsset) throw notFound("Ficheiro não encontrado."); // 404, not 403: do not reveal existence
  const data = await readFile(resolveKey(asset.storageKey)).catch(() => null);
  if (!data) throw notFound("Ficheiro não encontrado.");
  return { asset, data };
}

export async function deleteAsset(user: SessionUser, id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset || (asset.ownerId !== user.id && user.role !== "ADMIN")) throw notFound("Ficheiro não encontrado.");
  await prisma.mediaAsset.delete({ where: { id } });
  await unlink(resolveKey(asset.storageKey)).catch(() => {});
}
