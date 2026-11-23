import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "Politique de confidentialité", alternates: { canonical: "/confidentialite" } };

// À FAIRE VALIDER par un professionnel du droit en RDC avant le lancement.
export default function PrivacyPage() {
  return (
    <InfoPage title="Politique de confidentialité" intro="Nous collectons le strict minimum de données personnelles.">
      <h2>Données collectées</h2>
      <ul>
        <li><strong>Newsletter</strong> : votre adresse e-mail et la date de votre consentement.</li>
        <li><strong>Formulaire de contact</strong> : nom, adresse e-mail et contenu de votre message.</li>
        <li><strong>Audience</strong> : un compteur de consultations par article et par jour. Aucun profil individuel, aucune adresse IP ni cookie publicitaire n'est enregistré.</li>
        <li><strong>Comptes de la rédaction</strong> : identifiants de connexion des journalistes et administrateurs.</li>
      </ul>
      <h2>Finalités</h2>
      <p>
        Envoyer la newsletter, répondre à vos messages, mesurer la fréquentation de manière agrégée et gérer l'accès à
        l'espace d'administration.
      </p>
      <h2>Conservation et sécurité</h2>
      <p>
        Les données sont stockées chez notre prestataire de base de données (Supabase), protégées par des règles
        d'accès strictes. Elles sont conservées tant que nécessaire à la finalité, puis supprimées.
      </p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l'accès, la rectification ou la suppression de vos données, et vous désinscrire de la
        newsletter à tout moment, en écrivant à <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </InfoPage>
  );
}
