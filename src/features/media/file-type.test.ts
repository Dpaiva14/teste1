import { describe, expect, it } from "vitest";
import { detectFileType, sanitizeFilename } from "./file-type";

const bytes = (...n: number[]) => new Uint8Array([...n, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

describe("detectFileType", () => {
  it("recognises PNG, JPEG, WEBP and PDF by signature", () => {
    expect(detectFileType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toMatchObject({ kind: "IMAGE", mime: "image/png" });
    expect(detectFileType(bytes(0xff, 0xd8, 0xff, 0xe0))).toMatchObject({ mime: "image/jpeg" });
    expect(detectFileType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0]))).toMatchObject({ mime: "image/webp" });
    expect(detectFileType(new TextEncoder().encode("%PDF-1.7\n"))).toMatchObject({ kind: "PDF", mime: "application/pdf" });
  });
  it("rejects SVG, HTML, scripts, executables and empty files even if they claim to be images", () => {
    for (const text of ["<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>", "<!doctype html><script>1</script>", "MZ\u0090\u0000", "GIF89a"]) {
      expect(detectFileType(new TextEncoder().encode(text))).toBeNull();
    }
    expect(detectFileType(new Uint8Array())).toBeNull();
  });
  it("a RIFF file that is not WEBP (e.g. WAV) is rejected", () => {
    expect(detectFileType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45]))).toBeNull();
  });
});

describe("sanitizeFilename", () => {
  it("strips paths and unsafe characters, keeps accents", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\Users\\x\\screenshot (1).png")).toBe("screenshot _1_.png");
    expect(sanitizeFilename("gráfico de saída.png")).toBe("gráfico de saída.png");
    expect(sanitizeFilename("")).toBe("ficheiro");
    expect(sanitizeFilename("a".repeat(300)).length).toBe(100);
  });
});
