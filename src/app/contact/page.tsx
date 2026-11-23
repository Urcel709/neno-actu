import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SiteShell } from "@/components/SiteShell";
import { SITE } from "@/lib/config";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez la rédaction de NENO ACTU : informations, droit de réponse, publicité.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SiteShell>
      <div className="container-page py-8">
        <Breadcrumb items={[{ name: "Contact" }]} />
        <h1 className="text-4xl sm:text-5xl">Contact</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <aside className="space-y-6 text-sm leading-6 text-gray-700">
            <div>
              <h2 className="mb-1 text-base">E-mail</h2>
              <a href={`mailto:${SITE.email}`} className="font-semibold text-brand hover:underline">{SITE.email}</a>
            </div>
            <div>
              <h2 className="mb-1 text-base">Une information à nous signaler ?</h2>
              <p>Précisez le lieu, la date et, si possible, des éléments vérifiables. Nous protégeons nos sources.</p>
            </div>
            <div>
              <h2 className="mb-1 text-base">Correction ou droit de réponse</h2>
              <p>Indiquez le lien de l'article concerné et l'élément à corriger. Chaque demande est examinée par la rédaction.</p>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
