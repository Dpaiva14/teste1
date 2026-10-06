"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage, uploadFile } from "@/lib/api-client";

/** Private screenshot uploader (PNG/JPEG/WEBP ≤ 5 MB). Shows the stored image through the authenticated file route. */
export function ScreenshotField({ label, value, onChange }: { label: string; value: string | null; onChange: (id: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await uploadFile<{ asset: { id: string } }>("/api/uploads", file);
      onChange(res.asset.id);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {value ? (
        <div className="relative w-full overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element -- private, authenticated image route; next/image optimisation does not apply */}
          <img src={`/api/files/${value}`} alt={label} className="max-h-64 w-full object-contain bg-muted" />
          <Button type="button" size="icon-sm" variant="secondary" className="absolute right-2 top-2" aria-label={`Remover ${label}`} onClick={() => onChange(null)}>
            <X />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" className="h-24 border-dashed" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />} {busy ? "A carregar…" : "Carregar imagem"}
        </Button>
      )}
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={label} onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
