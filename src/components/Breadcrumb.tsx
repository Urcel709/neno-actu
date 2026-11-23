import Link from "next/link";
import { SITE } from "@/lib/config";

export function Breadcrumb({ items }: { items: { name: string; href?: string }[] }) {
  const all = [{ name: "Accueil", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.href ? { item: `${SITE.url}${it.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Fil d'Ariane" className="mb-5 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {all.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {it.href && i < all.length - 1 ? (
              <Link href={it.href} className="hover:text-brand">{it.name}</Link>
            ) : (
              <span aria-current={i === all.length - 1 ? "page" : undefined} className="line-clamp-1 font-semibold text-ink">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </nav>
  );
}
