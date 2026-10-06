import { NextResponse } from "next/server";
import { HttpError, badRequest } from "@/lib/errors";
import { userRoute } from "@/lib/http";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { saveUpload } from "@/features/media/server/storage";
import { MAX_PDF_BYTES } from "@/features/media/file-type";
import { prisma } from "@/database/client";

/** multipart/form-data: file (required), lessonId (admins only, to attach to a lesson). */
export const POST = userRoute(async ({ req, user }) => {
  enforceRateLimit(RATE_LIMITS.upload, user.id);
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_PDF_BYTES + 1024 * 1024) throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Pedido demasiado grande.");
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw badRequest("Falta o ficheiro.");
  const lessonId = form?.get("lessonId");
  const isAdmin = user.role === "ADMIN";
  let attach: string | null = null;
  if (typeof lessonId === "string" && lessonId) {
    if (!isAdmin) throw new HttpError(403, "FORBIDDEN", "Apenas administradores anexam ficheiros a aulas.");
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
    if (!lesson) throw badRequest("Aula inexistente.");
    attach = lesson.id;
  }
  const asset = await saveUpload(user, file, { lessonId: attach, allowPdf: isAdmin });
  return NextResponse.json({ asset }, { status: 201 });
});
