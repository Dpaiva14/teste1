/** Content sniffing by magic bytes. The client-supplied Content-Type / extension are NEVER trusted. */
export type DetectedFile = { kind: "IMAGE" | "PDF"; mime: string; ext: string };

const startsWith = (b: Uint8Array, sig: readonly number[], offset = 0) => sig.every((v, i) => b[offset + i] === v);

export function detectFileType(bytes: Uint8Array): DetectedFile | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { kind: "IMAGE", mime: "image/png", ext: "png" };
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { kind: "IMAGE", mime: "image/jpeg", ext: "jpg" };
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return { kind: "IMAGE", mime: "image/webp", ext: "webp" };
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { kind: "PDF", mime: "application/pdf", ext: "pdf" };
  return null; // includes SVG/HTML: they can carry scripts, so they are rejected outright
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 15 * 1024 * 1024;

/** Filename for display only (never used as a path). */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "ficheiro";
  const clean = base.replace(/[^\p{L}\p{N}._ -]/gu, "_").replace(/\s+/g, " ").trim().slice(0, 100);
  return clean || "ficheiro";
}
