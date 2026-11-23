import Link from "next/link";
import { articleHref } from "@/lib/format";
import type { Article } from "@/lib/types";

export function FlashBar({ items }: { items: Article[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <section aria-label="Flash info" className="bg-brand text-white">
      <div className="container-page flex items-center gap-4">
        <span className="shrink-0 bg-ink px-3 py-2.5 text-xs font-extrabold uppercase tracking-widest">Flash info</span>
        <div className="ticker relative flex-1 overflow-hidden" tabIndex={0} aria-label="Dernières informations urgentes">
          <ul className="ticker-track flex w-max gap-10 py-2.5 text-sm font-semibold">
            {loop.map((a, i) => (
              <li key={`${a.id}-${i}`} aria-hidden={i >= items.length}>
                <Link href={articleHref(a)} tabIndex={i >= items.length ? -1 : 0} className="whitespace-nowrap hover:underline">
                  {a.title.replace(/^Flash\s*:\s*/i, "")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
