import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";
import { SiteShell } from "@/components/SiteShell";
import { PAGE_SIZE } from "@/lib/config";
import { getAuthor, getAuthorArticles } from "@/lib/data";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthor((await params).slug);
  return author ? { title: author.name, description: author.bio || undefined } : {};
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const author = await getAuthor((await params).slug);
  if (!author) notFound();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { items, total } = await getAuthorArticles(author, page);

  return (
    <SiteShell>
      <div className="container-page py-8">
        <Breadcrumb items={[{ name: author.name }]} />
        <header className="mb-8 flex items-center gap-5 border-b-4 border-ink pb-6">
          <span aria-hidden className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-ink font-display text-3xl font-extrabold text-white">
            {author.name.charAt(0)}
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl">{author.name}</h1>
            {author.bio && <p className="mt-1 max-w-2xl text-gray-600">{author.bio}</p>}
            <p className="mt-1 text-sm text-gray-500">{total} publication{total > 1 ? "s" : ""}</p>
          </div>
        </header>
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
        <Pagination page={page} total={total} perPage={PAGE_SIZE} basePath={`/auteur/${author.slug}`} />
      </div>
    </SiteShell>
  );
}
