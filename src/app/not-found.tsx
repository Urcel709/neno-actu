import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="container-page py-24 text-center">
        <p className="kicker">Erreur 404</p>
        <h1 className="mt-2 text-5xl">Page introuvable</h1>
        <p className="mx-auto mt-4 max-w-md text-gray-600">
          Cette page n'existe pas ou n'est plus disponible. Retrouvez l'actualité sur la page d'accueil.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-brand">Retour à l'accueil</Link>
          <Link href="/recherche" className="btn-ghost">Rechercher</Link>
        </div>
      </div>
    </SiteShell>
  );
}
