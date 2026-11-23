import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";
import { SiteShell } from "@/components/SiteShell";
import { PAGE_SIZE } from "@/lib/config";
import { searchArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Recherche", robots: { index: false, follow: true } };

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);
  const { items, total } = q ? await searchArticles(q, page) : { items: [], total: 0 };

  return (
    <SiteShell>
      <div className="container-page py-8">
        <Breadcrumb items={[{ name: "Recherche" }]} />
        <h1 className="text-4xl">Recherche</h1>

        <form action="/recherche" role="search" className="mt-5 flex max-w-2xl gap-2">
          <label htmlFor="search-q" className="sr-only">Mots-clés</label>
          <input id="search-q" name="q" type="search" defaultValue={q} placeholder="Rechercher un article, un sujet…" className="field" />
          <button type="submit" className="btn-brand">Rechercher</button>
        </form>

        {q && (
          <p className="mt-6 text-gray-600" role="status">
            {total} résultat{total > 1 ? "s" : ""} pour « <strong className="text-ink">{q}</strong> »
          </p>
        )}

        <div className="mt-6 max-w-4xl">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} variant="row" />
          ))}
          {q && !items.length && (
            <p className="rounded-md bg-soft p-8 text-center text-gray-600">
              Aucun résultat. Vérifiez l'orthographe ou essayez des mots plus généraux.
            </p>
          )}
        </div>
        <Pagination page={page} total={total} perPage={PAGE_SIZE} basePath="/recherche" query={{ q }} />
      </div>
    </SiteShell>
  );
}
