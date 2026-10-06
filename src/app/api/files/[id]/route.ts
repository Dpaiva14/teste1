import { NextResponse } from "next/server";
import { idParams } from "@/features/trading/schemas";
import { deleteAsset, readAsset } from "@/features/media/server/storage";
import { userRoute } from "@/lib/http";

export const GET = userRoute<{ id: string }>(async ({ params, user }) => {
  const { id } = idParams.parse(params);
  const { asset, data } = await readAsset(user, id);
  const encoded = encodeURIComponent(asset.filename);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(data.byteLength),
      "Content-Disposition": `inline; filename*=UTF-8''${encoded}`,
      "X-Content-Type-Options": "nosniff",
      // Served files must never be able to run script, even if a PDF/image parser is tricked.
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, max-age=3600",
    },
  });
});

export const DELETE = userRoute<{ id: string }>(async ({ params, user }) => {
  const { id } = idParams.parse(params);
  await deleteAsset(user, id);
  return { ok: true };
});
