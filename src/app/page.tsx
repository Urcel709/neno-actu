import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { Cover } from "@/components/Cover";
import { FlashBar } from "@/components/FlashBar";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SectionTitle } from "@/components/SectionTitle";
import { SiteShell } from "@/components/SiteShell";
import { getHome } from "@/lib/data";
import { articleHref } from "@/lib/format";

export const revalidate = 60;

export default async function HomePage() {
  const { featured, secondary, latest, popular, flash, sections, videos } = await getHome();

  return (
    <SiteShell before={<FlashBar items={flash} />}>
      <div className="container-page pt-8">
        {/* À la une */}
        <section aria-label="À la une" className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {featured ? (
              <ArticleCard article={featured} variant="hero" priority />
            ) : (
              <p className="rounded-md bg-soft p-8 text-center text-gray-600">Aucun article publié pour le moment.</p>
            )}
          </div>
          <aside className="lg:col-span-4" aria-label="À lire aussi">
            <h2 className="mb-4 border-b-2 border-ink pb-2 text-lg uppercase tracking-wide">À lire aussi</h2>
            <div className="space-y-5 divide-y divide-gray-200">
              {secondary.map((a, i) => (
                <div key={a.id} className={i ? "pt-5" : ""}>
                  <ArticleCard article={a} variant="compact" />
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* Dernières actualités + populaires */}
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <section aria-labelledby="latest" className="lg:col-span-8">
            <SectionTitle id="latest" title="Dernières actualités" />
            {latest.map((a) => (
              <ArticleCard key={a.id} article={a} variant="row" />
            ))}
            {!latest.length && <p className="text-gray-600">Les prochaines publications apparaîtront ici.</p>}
          </section>

          <aside className="space-y-10 lg:col-span-4">
            <section aria-labelledby="popular">
              <SectionTitle id="popular" title="Les plus lus" />
              <ol className="space-y-4">
                {popular.map((a, i) => (
                  <li key={a.id} className="flex gap-4">
                    <span aria-hidden className="font-display text-4xl font-extrabold leading-none text-brand">
                      {i + 1}
                    </span>
                    <Link href={articleHref(a)} className="font-display text-base font-bold leading-snug hover:text-brand">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="newsletter" className="rounded-lg bg-soft p-6">
              <h2 id="newsletter" className="text-xl">La newsletter NENO ACTU</h2>
              <p className="mb-4 mt-1 text-sm text-gray-600">L'essentiel de l'actualité directement dans votre boîte e-mail.</p>
              <NewsletterForm />
            </section>
          </aside>
        </div>

        {/* Rubriques */}
        {sections.map(({ category, articles }) => (
          <section key={category.slug} aria-labelledby={`s-${category.slug}`} className="mt-14">
            <SectionTitle id={`s-${category.slug}`} title={category.name} href={`/${category.slug}`} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Vidéos */}
      {videos.length > 0 && (
        <section aria-labelledby="videos" className="mt-16 bg-ink py-12 text-white">
          <div className="container-page">
            <div className="mb-6 flex items-end justify-between border-b border-white/20 pb-3">
              <h2 id="videos" className="text-2xl">Vidéos et reportages</h2>
              <Link href="/videos" className="text-sm font-bold text-white hover:text-brand">Toutes les vidéos →</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {videos.map((a) => (
                <Link key={a.id} href={articleHref(a)} className="group block">
                  <div className="relative">
                    <Cover url={a.cover_url} alt={a.cover_alt} label="Vidéo" seed={a.slug} sizes="(min-width:1024px) 25vw, 100vw" />
                    <span aria-hidden className="absolute inset-0 grid place-items-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-lg transition-transform group-hover:scale-110">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg leading-snug group-hover:text-brand">{a.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
