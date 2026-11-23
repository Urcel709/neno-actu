import Link from "next/link";
import { SITE } from "@/lib/config";
import { getCategories } from "@/lib/data";
import { Logo } from "./Logo";

export async function Footer() {
  const categories = await getCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-ink text-gray-300">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm leading-6">
            {SITE.tagline} Le média numérique de l'actualité congolaise, pour la RDC et la diaspora.
          </p>
          <ul className="mt-5 flex gap-2" aria-label="Réseaux sociaux">
            {(
              [
                ["Facebook", SITE.social.Facebook, "M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8z"],
                ["X", SITE.social.X, "M4 4l16 16M20 4L4 20"],
                ["YouTube", SITE.social.YouTube, "M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8zm7 1.5v5l4.5-2.5L10 9.5z"],
              ] as [string, string | undefined, string][]
            )
              .filter(([, href]) => Boolean(href))
              .map(([name, href, path]) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="grid h-10 w-10 place-items-center rounded-md bg-white/10 hover:bg-brand"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm uppercase tracking-wider text-white">Rubriques</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm uppercase tracking-wider text-white">NENO ACTU</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
            <li><Link href="/redaction" className="hover:text-white">Notre rédaction</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/publicite" className="hover:text-white">Publicité</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm uppercase tracking-wider text-white">Contact</h2>
          <p className="text-sm">
            <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
          </p>
          <p className="mt-3 text-sm">Kinshasa, République démocratique du Congo</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NENO ACTU. Tous droits réservés.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li><Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
            <li><Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link></li>
            <li><Link href="/conditions" className="hover:text-white">Conditions d'utilisation</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
