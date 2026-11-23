import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { requireStaff } from "@/lib/auth";
import { articleHref, formatDateTime, toLocalInput } from "@/lib/format";
import type { ArticleStatus } from "@/lib/types";
import { allowedActions, isManager } from "@/lib/workflow";
import { deleteArticle } from "../../../actions";
import { ArticleForm } from "../ArticleForm";

export const metadata: Metadata = { title: "Modifier l'article" };

const OK_MESSAGES: Record<string, string> = {
  save: "Article enregistré.",
  submit: "Article soumis à la relecture.",
  approve: "Article validé.",
  reject: "Article renvoyé à l'auteur pour correction.",
  schedule: "Publication programmée.",
  publish: "Article publié.",
  unpublish: "Article repassé en brouillon.",
};

export default async function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const me = await requireStaff();
  const { id } = await params;
  const { ok } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: a } = await me.sb.from("articles").select("*, category:categories(slug)").eq("id", id).maybeSingle();
  if (!a) notFound();

  const [{ data: categories }, { data: tagRows }, { data: history }] = await Promise.all([
    me.sb.from("categories").select("id,name").order("sort_order"),
    me.sb.from("article_tags").select("tag:tags(name)").eq("article_id", id),
    isManager(me.role)
      ? me.sb.from("article_status_history").select("id,from_status,to_status,created_at,note").eq("article_id", id).order("created_at", { ascending: false }).limit(12)
      : Promise.resolve({ data: null }),
  ]);

  const tags = (tagRows ?? [])
    .map((r) => (Array.isArray(r.tag) ? r.tag[0] : r.tag)?.name)
    .filter(Boolean)
    .join(", ");
  const isOwner = a.author_id === me.id;
  const actions = allowedActions(me.role, isOwner, a.status, false);
  const cat = (Array.isArray(a.category) ? a.category[0] : a.category) as { slug: string } | null;
  const isLive = a.status === "published" || (a.status === "scheduled" && a.published_at && new Date(a.published_at) <= new Date());
  const canDelete = isManager(me.role) || (me.role === "journalist" && isOwner && a.status === "draft");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/articles" className="text-sm font-semibold text-gray-600 hover:text-brand">← Articles</Link>
          <h1 className="text-3xl">Modifier l'article</h1>
        </div>
        {isLive && cat && (
          <Link href={articleHref({ slug: a.slug, category: cat })} target="_blank" className="btn-ghost">Voir sur le site ↗</Link>
        )}
      </header>

      <ArticleForm
        values={{
          id: a.id,
          title: a.title,
          slug: a.slug,
          category_id: a.category_id ?? "",
          excerpt: a.excerpt,
          content: a.content,
          sources: a.sources,
          cover_url: a.cover_url,
          cover_alt: a.cover_alt,
          video_url: a.video_url ?? "",
          tags,
          is_featured: a.is_featured,
          is_flash: a.is_flash,
          is_opinion: a.is_opinion,
          seo_title: a.seo_title,
          seo_description: a.seo_description,
          review_note: a.review_note,
          publish_at: a.status === "scheduled" ? toLocalInput(a.published_at) : "",
          status: a.status as ArticleStatus,
        }}
        categories={categories ?? []}
        actions={actions}
        canFeature={isManager(me.role)}
        notice={ok ? OK_MESSAGES[ok] : undefined}
      />

      {history && history.length > 0 && (
        <section className="rounded-lg bg-white p-5 shadow-sm" aria-labelledby="history">
          <h2 id="history" className="mb-3 text-lg">Historique des statuts</h2>
          <ol className="space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-2">
                <time className="w-44 text-gray-500">{formatDateTime(h.created_at)}</time>
                {h.from_status && <><StatusBadge status={h.from_status as ArticleStatus} /><span aria-hidden>→</span></>}
                <StatusBadge status={h.to_status as ArticleStatus} />
                {h.note && <span className="text-gray-600">« {h.note} »</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {canDelete && (
        <form action={deleteArticle} className="rounded-lg border border-red-200 bg-white p-5">
          <input type="hidden" name="id" value={a.id} />
          <h2 className="text-lg text-brand">Zone sensible</h2>
          <p className="mb-3 text-sm text-gray-600">La suppression est définitive.</p>
          <button type="submit" className="btn-ghost !border-brand !text-brand">Supprimer cet article</button>
        </form>
      )}
    </div>
  );
}
