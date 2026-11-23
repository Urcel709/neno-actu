import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Cover } from "@/components/Cover";
import { Pagination } from "@/components/Pagination";
import { SiteShell } from "@/components/SiteShell";
import { getVideos } from "@/lib/data";
import { articleHref, timeAgo } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Vidéos",
  description: "Reportages, interviews et formats vidéo de NENO ACTU.",
  alternates: { canonical: "/videos" },
};

const PER_PAGE = 12;

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { items, total } = await getVideos(page, PER_PAGE);

  return (
    <SiteShell activeSlug="videos">
      <div className="container-page py-8">
        <Breadcrumb items={[{ name: "Vidéos" }]} />
        <header className="mb-8 border-b-4 border-ink pb-4">
          <h1 className="text-4xl sm:text-5xl">Vidéos</h1>
          <p className="mt-2 max-w-2xl text-gray-600">Reportages, interviews et formats vidéo.</p>
        </header>

        {items.length ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <article key={a.id} className="group">
                <Link href={articleHref(a)} className="block">
                  <div className="relative">
                    <Cover url={a.cover_url} alt={a.cover_alt} label="Vidéo" seed={a.slug} />
                    <span aria-hidden className="absolute inset-0 grid place-items-center">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg transition-transform group-hover:scale-110">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl leading-snug group-hover:text-brand">{a.title}</h2>
                  <p className="mt-1 text-xs text-gray-500">{timeAgo(a.published_at)}</p>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-soft p-8 text-center text-gray-600">Aucune vidéo publiée pour le moment.</p>
        )}
        <Pagination page={page} total={total} perPage={PER_PAGE} basePath="/videos" />
      </div>
    </SiteShell>
  );
}
