"use client";

import { useActionState } from "react";
import { saveCategory, type AdminState } from "../../actions";
import type { Category } from "@/lib/types";

const initial: AdminState = { ok: false, message: "" };

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategory, initial);
  const k = category?.id ?? "new";
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-12">
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <div className="sm:col-span-3">
        <label htmlFor={`n-${k}`} className="label">Nom</label>
        <input id={`n-${k}`} name="name" required defaultValue={category?.name} className="field" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`s-${k}`} className="label">Lien (slug)</label>
        <input id={`s-${k}`} name="slug" defaultValue={category?.slug} className="field" />
      </div>
      <div className="sm:col-span-4">
        <label htmlFor={`d-${k}`} className="label">Description</label>
        <input id={`d-${k}`} name="description" defaultValue={category?.description} className="field" />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor={`o-${k}`} className="label">Ordre</label>
        <input id={`o-${k}`} name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} className="field" />
      </div>
      <div className="flex items-end sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-dark w-full">{category ? "Enregistrer" : "Créer"}</button>
      </div>
      {state.message && (
        <p role="status" className={`text-sm font-semibold sm:col-span-12 ${state.ok ? "text-green-700" : "text-brand"}`}>{state.message}</p>
      )}
    </form>
  );
}
