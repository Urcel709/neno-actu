"use client";

import { useActionState } from "react";
import { uploadMedia, type AdminState } from "../../actions";

const initial: AdminState = { ok: false, message: "" };

export function MediaUpload() {
  const [state, action, pending] = useActionState(uploadMedia, initial);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-12">
      <div className="sm:col-span-4">
        <label htmlFor="m-file" className="label">Image (5 Mo max.)</label>
        <input id="m-file" name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-2 file:font-bold file:text-white" />
      </div>
      <div className="sm:col-span-4">
        <label htmlFor="m-alt" className="label">Texte alternatif</label>
        <input id="m-alt" name="alt" required className="field" placeholder="Décrivez l'image" />
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="m-cap" className="label">Légende / crédit</label>
        <input id="m-cap" name="caption" className="field" />
      </div>
      <div className="flex items-end sm:col-span-1">
        <button type="submit" disabled={pending} className="btn-brand w-full">{pending ? "…" : "Envoyer"}</button>
      </div>
      {state.message && (
        <p role="status" className={`text-sm font-semibold sm:col-span-12 ${state.ok ? "text-green-700" : "text-brand"}`}>{state.message}</p>
      )}
    </form>
  );
}
