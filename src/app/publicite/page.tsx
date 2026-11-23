import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Publicité",
  description: "Annoncer sur NENO ACTU : formats, audience et conditions.",
  alternates: { canonical: "/publicite" },
};

export default function AdvertisingPage() {
  return (
    <InfoPage title="Publicité" intro="Touchez un public congolais connecté, en RDC et dans la diaspora.">
      <p>
        NENO ACTU étudie des partenariats publicitaires et des contenus sponsorisés. Tout contenu sponsorisé est
        clairement identifié comme tel et séparé de la production éditoriale.
      </p>
      <h2>Nous contacter</h2>
      <p>
        Présentez votre projet à <a href={`mailto:${SITE.email}?subject=Publicit%C3%A9`}>{SITE.email}</a> ou via le{" "}
        <Link href="/contact">formulaire de contact</Link>. Nos conditions et tarifs vous seront communiqués sur demande.
      </p>
    </InfoPage>
  );
}
