import Link from "next/link";
import { articleHref, timeAgo } from "@/lib/format";
import type { Article } from "@/lib/types";
import { Cover } from "./Cover";

type Variant = "hero" | "card" | "row" | "compact";

function Meta({ a, light = false }: { a: Article; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-xs ${light ? "text-gray-300" : "text-gray-500"}`}>
      {a.category && <span className="font-extrabold uppercase tracking-wider text-brand">{a.category.name}</span>}
      {a.is_opinion && <span className="font-bold uppercase text-ink">· Opinion</span>}
      <time dateTime={a.published_at ?? undefined}>{timeAgo(a.published_at)}</time>
    </p>
  );
}

export function ArticleCard({ article: a, variant = "card", priority = false }: { article: Article; variant?: Variant; priority?: boolean }) {
  const href = articleHref(a);

  if (variant === "hero") {
    return (
      <article className="group relative">
        <Link href={href} className="block">
          <Cover url={a.cover_url} alt={a.cover_alt} label={a.category?.name} seed={a.slug} priority={priority} className="aspect-[16/10] sm:aspect-[16/9]" />
          <div className="mt-4 space-y-3">
            <Meta a={a} />
            <h2 className="text-3xl leading-[1.1] group-hover:text-brand sm:text-4xl lg:text-[2.6rem]">{a.title}</h2>
            {a.excerpt && <p className="max-w-3xl text-lg leading-7 text-gray-600">{a.excerpt}</p>}
            {a.author && <p className="text-sm font-semibold text-gray-700">Par {a.author.name}</p>}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="group border-b border-gray-200 py-4 first:pt-0 last:border-0">
        <Link href={href} className="flex gap-4">
          <div className="w-28 shrink-0 sm:w-44">
            <Cover url={a.cover_url} alt={a.cover_alt} label={a.category?.name} seed={a.slug} sizes="176px" className="aspect-[4/3]" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <Meta a={a} />
            <h3 className="text-base leading-snug group-hover:text-brand sm:text-xl">{a.title}</h3>
            {a.excerpt && <p className="hidden text-sm leading-6 text-gray-600 sm:line-clamp-2">{a.excerpt}</p>}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <Link href={href} className="block space-y-1">
          <Meta a={a} />
          <h3 className="text-base leading-snug group-hover:text-brand">{a.title}</h3>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link href={href} className="block">
        <Cover url={a.cover_url} alt={a.cover_alt} label={a.category?.name} seed={a.slug} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" />
        <div className="mt-3 space-y-1.5">
          <Meta a={a} />
          <h3 className="text-lg leading-snug group-hover:text-brand">{a.title}</h3>
        </div>
      </Link>
    </article>
  );
}
