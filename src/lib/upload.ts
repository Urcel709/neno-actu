import type { SupabaseClient } from "@supabase/supabase-js";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Vérifie la signature réelle du fichier, pas seulement le type annoncé par le navigateur. */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const tag = (o: number, s: string) => s.split("").every((c, i) => b[o + i] === c.charCodeAt(0));
  if (tag(0, "RIFF") && tag(8, "WEBP")) return "image/webp";
  if (tag(4, "ftyp") && (tag(8, "avif") || tag(8, "avis"))) return "image/avif";
  return null;
}

export interface UploadResult {
  ok: boolean;
  message: string;
  url?: string;
}

export async function uploadImage(
  sb: SupabaseClient,
  file: File,
  userId: string,
  meta: { alt?: string; caption?: string } = {},
): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, message: "Fichier vide." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: "Image trop lourde (5 Mo maximum)." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniff(bytes);
  if (!mime || !TYPES[mime]) return { ok: false, message: "Format non accepté (JPEG, PNG, WebP ou AVIF)." };

  const now = new Date();
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${TYPES[mime]}`;
  const { error } = await sb.storage.from("media").upload(path, bytes, { contentType: mime, upsert: false });
  if (error) return { ok: false, message: `Téléversement impossible : ${error.message}` };

  const url = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  const { error: dbError } = await sb.from("media").insert({
    path,
    url,
    caption: meta.caption ?? "",
    alt_text: meta.alt ?? "",
    mime_type: mime,
    size_bytes: file.size,
    uploaded_by: userId,
  });
  if (dbError) return { ok: false, message: `Enregistrement du média impossible : ${dbError.message}` };
  return { ok: true, message: "Image téléversée.", url };
}
