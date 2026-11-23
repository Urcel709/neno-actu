import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { canWrite, isManager } from "@/lib/workflow";
import { deleteMedia } from "../../actions";
import { MediaUpload } from "./MediaUpload";

export const metadata: Metadata = { title: "Médiathèque" };

export default async function MediaAdmin() {
  const me = await requireStaff();
  if (!canWrite(me.role)) redirect("/admin");
  const { data: media } = await me.sb.from("media").select("*").order("created_at", { ascending: false }).limit(60);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Médiathèque</h1>
      <section className="rounded-lg bg-white p-5 shadow-sm" aria-labelledby="up">
        <h2 id="up" className="mb-3 text-lg">Téléverser une image</h2>
        <MediaUpload />
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(media ?? []).map((m) => (
          <li key={m.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt_text} loading="lazy" className="aspect-video w-full object-cover" />
            <div className="space-y-1 p-3 text-xs text-gray-600">
              <p className="line-clamp-2 font-semibold text-ink">{m.alt_text}</p>
              <p>{formatDate(m.created_at)} · {(m.size_bytes / 1024).toFixed(0)} Ko</p>
              <input readOnly value={m.url} aria-label="Adresse de l'image" className="field !min-h-8 !text-xs" onFocus={undefined} />
              {isManager(me.role) && (
                <form action={deleteMedia}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="font-bold text-brand hover:underline">Supprimer</button>
                </form>
              )}
            </div>
          </li>
        ))}
        {!media?.length && <li className="col-span-full rounded-lg bg-white p-10 text-center text-gray-500">Aucun média pour le moment.</li>}
      </ul>
    </div>
  );
}
