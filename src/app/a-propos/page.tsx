import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "À propos",
  description: "Mission, ligne éditoriale et présentation de NENO ACTU.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return (
    <InfoPage title="À propos" intro="NENO ACTU, l'information qui vous rapproche.">
      <p>
        NENO ACTU est un média numérique qui informe le public congolais et la diaspora sur l'actualité nationale,
        africaine et internationale, dans une expérience de lecture moderne, rapide et pensée pour le téléphone.
      </p>
      <h2>Notre mission</h2>
      <p>
        Rendre l'information accessible, compréhensible et utile, en privilégiant la vérification des faits, la
        diversité des sujets et la responsabilité éditoriale.
      </p>
      <h2>Notre ligne éditoriale</h2>
      <ul>
        <li>Séparer clairement les faits, les analyses, les opinions et les contenus sponsorisés.</li>
        <li>Vérifier les informations sensibles avant publication et citer nos sources lorsque c'est possible.</li>
        <li>Indiquer l'auteur, la date de publication et les corrections importantes.</li>
        <li>Respecter les droits d'auteur et obtenir les autorisations nécessaires pour les images et vidéos.</li>
        <li>Traiter les demandes de correction, de droit de réponse et les plaintes.</li>
      </ul>
      <h2>Ce que nous couvrons</h2>
      <p>
        Politique, société, économie, sécurité, éducation, technologie, sports et culture, avec des reportages, des
        interviews, des photographies et des vidéos.
      </p>
      <p>
        <Link href="/redaction">Découvrir la rédaction</Link> · <Link href="/contact">Nous contacter</Link>
      </p>
    </InfoPage>
  );
}
