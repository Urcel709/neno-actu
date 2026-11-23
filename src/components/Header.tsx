import Link from "next/link";
import { getCategories } from "@/lib/data";
import { formatToday } from "@/lib/format";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export async function Header({ activeSlug }: { activeSlug?: string }) {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="hidden bg-ink text-xs text-gray-300 lg:block">
        <div className="container-page flex h-8 items-center justify-between">
          <span className="capitalize">{formatToday()}</span>
          <div className="flex gap-5">
            <Link href="/a-propos" className="hover:text-white">À propos</Link>
            <Link href="/publicite" className="hover:text-white">Publicité</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3">
        <MobileNav items={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
        <Logo />
        <form action="/recherche" role="search" className="ml-auto flex w-full max-w-xs items-center">
          <label htmlFor="q" className="sr-only">Rechercher</label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Rechercher"
            className="field hidden !min-h-10 rounded-r-none border-r-0 sm:block"
          />
          <button
            type="submit"
            aria-label="Rechercher"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink text-white hover:bg-black sm:rounded-l-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </form>
      </div>

      <nav aria-label="Rubriques" className="hidden border-t border-gray-100 lg:block">
        <ul className="container-page no-scrollbar flex gap-1 overflow-x-auto">
          {categories.map((c) => {
            const active = c.slug === activeSlug;
            return (
              <li key={c.slug} className="shrink-0">
                <Link
                  href={`/${c.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`block border-b-[3px] px-3 py-3 text-sm font-bold transition-colors hover:text-brand ${
                    active ? "border-brand text-brand" : "border-transparent"
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
