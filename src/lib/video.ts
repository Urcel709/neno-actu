export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string }
  | null;

/** Accepte YouTube, Vimeo ou un fichier vidéo direct (.mp4/.webm). Tout le reste est refusé. */
export function parseVideo(url: string | null | undefined): VideoSource {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    return /^[\w-]{6,20}$/.test(id) ? { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop() ?? "";
    return /^[\w-]{6,20}$/.test(id) ? { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0] ?? "";
    return /^\d+$/.test(id) ? { kind: "embed", src: `https://player.vimeo.com/video/${id}` } : null;
  }
  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
  return null;
}
