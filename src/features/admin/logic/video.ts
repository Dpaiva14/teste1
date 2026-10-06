/**
 * Lesson videos are embedded in an <iframe>, and the CSP only allows youtube-nocookie.com and player.vimeo.com in
 * `frame-src`. Anything an admin pastes is therefore normalised to one of those two canonical embed URLs; every other
 * host (or any non-https URL) is rejected rather than stored.
 */
export class VideoUrlError extends Error {}

const YT_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d{5,12}$/;

export function normalizeVideoUrl(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (raw === "") return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new VideoUrlError("URL de vídeo inválido.");
  }
  if (url.protocol !== "https:") throw new VideoUrlError("O vídeo tem de usar https.");
  if (url.username || url.password) throw new VideoUrlError("URL de vídeo inválido.");
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname.split("/").filter(Boolean);

  let yt: string | undefined;
  if (host === "youtu.be") yt = path[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    if (path[0] === "watch") yt = url.searchParams.get("v") ?? undefined;
    else if (path[0] === "embed" || path[0] === "shorts" || path[0] === "live") yt = path[1];
  }
  if (yt !== undefined) {
    if (!YT_ID.test(yt)) throw new VideoUrlError("Não foi possível identificar o vídeo do YouTube.");
    return `https://www.youtube-nocookie.com/embed/${yt}`;
  }

  let vimeo: string | undefined;
  if (host === "vimeo.com") vimeo = path[0];
  else if (host === "player.vimeo.com" && path[0] === "video") vimeo = path[1];
  if (vimeo !== undefined) {
    if (!VIMEO_ID.test(vimeo)) throw new VideoUrlError("Não foi possível identificar o vídeo do Vimeo.");
    return `https://player.vimeo.com/video/${vimeo}`;
  }
  throw new VideoUrlError("Só são aceites vídeos do YouTube ou do Vimeo.");
}
