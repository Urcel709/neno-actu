import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

// À COMPLÉTER ET À FAIRE VALIDER par un professionnel du droit en RDC avant le lancement
// (éditeur, numéro d'enregistrement, directeur de la publication, hébergeur).
export default function LegalNoticePage() {
  return (
    <InfoPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        {SITE.name} — portail numérique d'actualités et d'informations.
        <br />Adresse : Kinshasa, République démocratique du Congo.
        <br />Contact : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
      <h2>Directeur de la publication</h2>
      <p>À renseigner.</p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Données : Supabase.</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, photographies, vidéos et éléments graphiques publiés sur ce site sont protégés. Toute reproduction
        sans autorisation écrite préalable est interdite, hors courtes citations avec mention de la source.
      </p>
      <h2>Corrections et droit de réponse</h2>
      <p>
        Toute personne citée peut demander une correction ou exercer un droit de réponse en écrivant à{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, en indiquant le lien de l'article concerné.
      </p>
    </InfoPage>
  );
}
