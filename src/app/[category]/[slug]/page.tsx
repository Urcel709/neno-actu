import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Cover } from "@/components/Cover";
import { RichText } from "@/components/RichText";
import { SectionTitle } from "@/components/SectionTitle";
import { ShareButtons } from "@/components/ShareButtons";
import { SiteShell } from "@/components/SiteShell";
import { ViewTracker } from "@/components/ViewTracker";
import { SITE } from "@/lib/config";
import { getArticle, getRelated } from "@/lib/data";
import { formatDateTime, readingTime } from "@/lib/format";
import { parseVideo } from "@/lib/video";

export const revalidate = 60;

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const a = await getArticle(category, slug);
  if (!a) return {};
  const title = a.seo_title || a.title;
  const description = a.seo_description || a.excerpt;
  const url = `/${category}/${a.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    authors: a.author ? [{ name: a.author.name }] : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: a.published_at ?? undefined,
      modifiedTime: a.updated_at,
      authors: a.author ? [a.author.name] : undefined,
      section: a.category?.name,
      images: a.cover_url ? [{ url: a.cover_url, alt: a.cover_alt || a.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: a.cover_url ? [a.cover_url] : undefined },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const article = await getArticle(categorySlug, slug);
  if (!article) notFound();

  const related = await getRelated(article);
  const url = `${SITE.url}/${categorySlug}/${article.slug}`;
  const video = parseVideo(article.video_url);
  const updated =
    article.published_at && new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 3600_000;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    mainEntityOfPage: url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    image: article.cover_url ? [article.cover_url] : undefined,
    articleSection: article.category?.name,
    author: article.author ? { "@type": "Person", name: article.author.name } : { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  return (
    <SiteShell activeSlug={categorySlug}>
      <ViewTracker articleId={article.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <article className="container-page py-8">
        <div className="mx-auto max-w-3xl">
          <Breadcrumb
            items={[
              ...(article.category ? [{ name: article.category.name, href: `/${article.category.slug}` }] : []),
              { name: article.title },
            ]}
          />

          <header>
            <p className="mb-3 flex flex-wrap items-center gap-3">
              {article.category && (
                <Link href={`/${article.category.slug}`} className="tag-red">{article.category.name}</Link>
              )}
              {article.is_opinion && <span className="border border-ink px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider">Opinion</span>}
            </p>
            <h1 className="text-3xl leading-[1.12] sm:text-5xl">{article.title}</h1>
            {article.excerpt && <p className="mt-4 text-xl leading-8 text-gray-600">{article.excerpt}</p>}

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-gray-200 py-3 text-sm text-gray-600">
              {article.author && (
                <span>
                  Par{" "}
                  {article.author.slug ? (
                    <Link href={`/auteur/${article.author.slug}`} className="font-bold text-ink hover:text-brand">{article.author.name}</Link>
                  ) : (
                    <strong className="text-ink">{article.author.name}</strong>
                  )}
                </span>
              )}
              <span>
                Publié le <time dateTime={article.published_at ?? undefined}>{formatDateTime(article.published_at)}</time>
              </span>
              {updated && (
                <span>
                  Mis à jour le <time dateTime={article.updated_at}>{formatDateTime(article.updated_at)}</time>
                </span>
              )}
              <span>{readingTime(article.content)} min de lecture</span>
            </div>
          </header>

          {article.is_opinion && (
            <p className="mt-6 rounded-md border-l-4 border-ink bg-soft p-4 text-sm">
              <strong>Tribune.</strong> Ce texte exprime l'opinion de son auteur et n'engage pas la rédaction de NENO ACTU.
            </p>
          )}

          <div className="mt-6">
            {video ? (
              <div className="aspect-video overflow-hidden rounded-md bg-black">
                {video.kind === "embed" ? (
                  <iframe
                    src={video.src}
                    title={article.title}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full"
                  />
                ) : (
                  <video src={video.src} controls preload="metadata" className="h-full w-full" />
                )}
              </div>
            ) : article.cover_url ? (
              <figure>
                <Cover url={article.cover_url} alt={article.cover_alt} seed={article.slug} priority sizes="(min-width:768px) 768px, 100vw" />
                {article.cover_alt && <figcaption className="mt-2 text-xs text-gray-500">{article.cover_alt}</figcaption>}
              </figure>
            ) : null}
          </div>

          <div className="mt-6">
            <ShareButtons url={url} title={article.title} />
          </div>

          {article.content && <div className="mt-6"><RichText text={article.content} /></div>}

          {article.sources && (
            <aside className="mt-10 rounded-md bg-soft p-5" aria-label="Sources">
              <h2 className="mb-2 text-base uppercase tracking-wide">Sources</h2>
              <RichText text={article.sources} className="space-y-2 text-sm leading-6 text-gray-700 [&_a]:text-brand [&_a]:underline [&_p]:my-1" />
            </aside>
          )}

          {!!article.tags?.length && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Mots-clés">
              {article.tags.map((t) => (
                <li key={t.slug}>
                  <Link href={`/recherche?q=${encodeURIComponent(t.name)}`} className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:border-brand hover:text-brand">
                    #{t.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <ShareButtons url={url} title={article.title} />
          </div>

          {article.author && (
            <aside className="mt-8 flex gap-4 rounded-lg border border-gray-200 p-5" aria-label="À propos de l'auteur">
              <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink font-display text-xl font-extrabold text-white">
                {article.author.name.charAt(0)}
              </span>
              <div>
                <p className="font-display text-lg font-extrabold">{article.author.name}</p>
                {article.author.bio && <p className="mt-1 text-sm leading-6 text-gray-600">{article.author.bio}</p>}
                {article.author.slug && (
                  <Link href={`/auteur/${article.author.slug}`} className="mt-2 inline-block text-sm font-bold text-brand hover:underline">
                    Tous ses articles →
                  </Link>
                )}
              </div>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-16">
            <SectionTitle id="related" title="À lire aussi" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteShell>
  );
}
