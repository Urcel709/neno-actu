import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Conditions d'utilisation", alternates: { canonical: "/conditions" } };

// À FAIRE VALIDER par un professionnel du droit en RDC avant le lancement.
export default function TermsPage() {
  return (
    <InfoPage title="Conditions d'utilisation">
      <h2>Usage du site</h2>
      <p>
        L'accès à NENO ACTU est libre et gratuit. En naviguant sur le site, vous acceptez les présentes conditions.
        Vous vous engagez à ne pas perturber son fonctionnement ni tenter d'accéder aux espaces réservés.
      </p>
      <h2>Contenus</h2>
      <p>
        Les informations publiées sont fournies de bonne foi et vérifiées autant que possible. Les tribunes et
        opinions engagent leurs auteurs. Le partage des articles par lien, WhatsApp et réseaux sociaux est encouragé.
      </p>
      <h2>Responsabilité</h2>
      <p>
        NENO ACTU ne peut être tenu responsable des contenus de sites tiers vers lesquels pointent des liens, ni des
        interruptions techniques indépendantes de sa volonté.
      </p>
      <h2>Contact</h2>
      <p>
        Pour toute question : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </InfoPage>
  );
}
