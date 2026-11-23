"use client";

import { useActionState, useState } from "react";
import { saveArticle, type AdminState } from "../../actions";
import { StatusBadge } from "@/components/StatusBadge";
import { ACTION_LABELS, type EditorialAction } from "@/lib/workflow";
import type { ArticleStatus } from "@/lib/types";

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  category_id: string;
  excerpt: string;
  content: string;
  sources: string;
  cover_url: string | null;
  cover_alt: string;
  video_url: string;
  tags: string;
  is_featured: boolean;
  is_flash: boolean;
  is_opinion: boolean;
  seo_title: string;
  seo_description: string;
  review_note: string;
  publish_at: string;
  status: ArticleStatus;
}

const initial: AdminState = { ok: false, message: "" };
const BTN: Record<EditorialAction, string> = {
  save: "btn-dark",
  submit: "btn-brand",
  approve: "btn-brand",
  reject: "btn-ghost !border-brand !text-brand",
  schedule: "btn-ghost",
  publish: "btn-brand",
  unpublish: "btn-ghost",
};

export function ArticleForm({
  values,
  categories,
  actions,
  canFeature,
  notice,
}: {
  values: ArticleFormValues;
  categories: { id: string; name: string }[];
  actions: EditorialAction[];
  canFeature: boolean;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(saveArticle, initial);
  const [content, setContent] = useState(values.content);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      <input type="hidden" name="id" value={values.id ?? ""} />
      <input type="hidden" name="cover_url" value={values.cover_url ?? ""} />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={values.status} />
        {values.review_note && values.status === "rejected" && (
          <p className="rounded-md bg-red-50 px-3 py-1.5 text-sm text-brand">
            <strong>Motif du renvoi :</strong> {values.review_note}
          </p>
        )}
      </div>

      {notice && <p role="status" className="rounded-md bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
      {state.message && (
        <p role="alert" className={`rounded-md p-3 text-sm font-semibold ${state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-brand"}`}>
          {state.message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label htmlFor="title" className="label">Titre</label>
            <input id="title" name="title" required maxLength={200} defaultValue={values.title} className="field !text-lg font-bold" />
          </div>
          <div>
            <label htmlFor="excerpt" className="label">Chapô (résumé affiché sous le titre)</label>
            <textarea id="excerpt" name="excerpt" rows={3} maxLength={400} defaultValue={values.excerpt} className="field" />
          </div>
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="content" className="label">Contenu</label>
              <span className="mb-1 text-xs text-gray-500">{content.trim() ? content.trim().split(/\s+/).length : 0} mots</span>
            </div>
            <textarea
              id="content"
              name="content"
              rows={18}
              defaultValue={values.content}
              onChange={(e) => setContent(e.target.value)}
              className="field font-mono !text-sm leading-6"
            />
            <p className="mt-1 text-xs text-gray-500">
              Séparez les paragraphes par une ligne vide. <code>## Titre</code>, <code>### Sous-titre</code>, <code>&gt; citation</code>,{" "}
              <code>- liste</code>, <code>**gras**</code>, <code>*italique*</code>, <code>[texte](https://lien)</code>.
            </p>
          </div>
          <div>
            <label htmlFor="sources" className="label">Sources</label>
            <textarea id="sources" name="sources" rows={3} defaultValue={values.sources} className="field" placeholder="Documents, témoins, communiqués officiels… (un par ligne)" />
          </div>
        </div>

        <div className="space-y-5">
          <fieldset className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
            <legend className="px-1 text-sm font-extrabold">Publication</legend>
            <div>
              <label htmlFor="category_id" className="label">Rubrique</label>
              <select id="category_id" name="category_id" defaultValue={values.category_id} className="field">
                <option value="">— Choisir —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="label">Mots-clés</label>
              <input id="tags" name="tags" defaultValue={values.tags} placeholder="séparés par des virgules" className="field" />
            </div>
            <div>
              <label htmlFor="publish_at" className="label">Date de programmation (heure de Kinshasa)</label>
              <input id="publish_at" name="publish_at" type="datetime-local" defaultValue={values.publish_at} className="field" />
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="is_opinion" defaultChecked={values.is_opinion} className="h-4 w-4 accent-[#E9272D]" /> Tribune / opinion</label>
              {canFeature && (
                <>
                  <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={values.is_featured} className="h-4 w-4 accent-[#E9272D]" /> À la une</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="is_flash" defaultChecked={values.is_flash} className="h-4 w-4 accent-[#E9272D]" /> Flash info</label>
                </>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
            <legend className="px-1 text-sm font-extrabold">Image et vidéo</legend>
            {values.cover_url && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={values.cover_url} alt="" className="aspect-video w-full rounded-md object-cover" />
                <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="remove_cover" className="h-4 w-4" /> Retirer l'image</label>
              </div>
            )}
            <div>
              <label htmlFor="cover_file" className="label">{values.cover_url ? "Remplacer l'image" : "Image de couverture"}</label>
              <input id="cover_file" name="cover_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-2 file:font-bold file:text-white" />
              <p className="mt-1 text-xs text-gray-500">JPEG, PNG, WebP ou AVIF, 5 Mo maximum. Vous avez les droits sur cette image.</p>
            </div>
            <div>
              <label htmlFor="cover_alt" className="label">Texte alternatif / légende</label>
              <input id="cover_alt" name="cover_alt" defaultValue={values.cover_alt} className="field" />
            </div>
            <div>
              <label htmlFor="video_url" className="label">Lien vidéo (YouTube, Vimeo, MP4)</label>
              <input id="video_url" name="video_url" type="url" defaultValue={values.video_url} placeholder="https://" className="field" />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
            <legend className="px-1 text-sm font-extrabold">Référencement (SEO)</legend>
            <div>
              <label htmlFor="slug" className="label">Lien (slug)</label>
              <input id="slug" name="slug" defaultValue={values.slug} placeholder="généré depuis le titre" className="field" />
            </div>
            <div>
              <label htmlFor="seo_title" className="label">Titre SEO</label>
              <input id="seo_title" name="seo_title" maxLength={120} defaultValue={values.seo_title} className="field" />
            </div>
            <div>
              <label htmlFor="seo_description" className="label">Méta-description</label>
              <textarea id="seo_description" name="seo_description" rows={3} maxLength={200} defaultValue={values.seo_description} className="field" />
            </div>
          </fieldset>

          {actions.includes("reject") && (
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <label htmlFor="review_note" className="label">Note de relecture (obligatoire pour renvoyer)</label>
              <textarea id="review_note" name="review_note" rows={3} defaultValue="" className="field" />
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        {actions.map((a) => (
          <button
            key={a}
            type="submit"
            name="action"
            value={a}
            disabled={pending}
            formNoValidate
            className={BTN[a]}
          >
            {ACTION_LABELS[a]}
          </button>
        ))}
        {!actions.length && <p className="text-sm text-gray-600">Cet article est en lecture seule pour votre rôle.</p>}
      </div>
    </form>
  );
}
