import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";
import { SiteShell } from "@/components/SiteShell";
import { PAGE_SIZE } from "@/lib/config";
import { getCategory, getCategoryArticles } from "@/lib/data";

export const revalidate = 60;

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { items, total } = await getCategoryArticles(category, page);
  const [lead, ...rest] = items;

  return (
    <SiteShell activeSlug={category.slug}>
      <div className="container-page py-8">
        <Breadcrumb items={[{ name: category.name }]} />
        <header className="mb-8 border-b-4 border-ink pb-4">
          <h1 className="text-4xl sm:text-5xl">{category.name}</h1>
          <p className="mt-2 max-w-2xl text-gray-600">{category.description}</p>
        </header>

        {lead ? (
          <>
            {page === 1 && (
              <div className="mb-10">
                <ArticleCard article={lead} variant="hero" priority />
              </div>
            )}
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {(page === 1 ? rest : items).map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
            <Pagination page={page} total={total} perPage={PAGE_SIZE} basePath={`/${category.slug}`} />
          </>
        ) : (
          <p className="rounded-md bg-soft p-8 text-center text-gray-600">Aucun article dans cette rubrique pour le moment.</p>
        )}
      </div>
    </SiteShell>
  );
}
