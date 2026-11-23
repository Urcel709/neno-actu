"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type FormState } from "@/app/actions";

const initial: FormState = { ok: false, message: "" };

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  return (
    <form action={action} className="space-y-3" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="nl-email" className="sr-only">Adresse e-mail</label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Votre adresse e-mail"
          className="field flex-1"
        />
        {/* Anti-spam : champ piège invisible pour les humains */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button type="submit" disabled={pending} className="btn-brand">
          {pending ? "Envoi…" : "S'abonner"}
        </button>
      </div>
      <label className={`flex items-start gap-2 text-xs ${dark ? "text-gray-300" : "text-gray-600"}`}>
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#E9272D]" />
        <span>
          J'accepte de recevoir la newsletter de NENO ACTU et j'ai pris connaissance de la{" "}
          <a href="/confidentialite" className="underline">politique de confidentialité</a>. Désinscription possible à tout moment.
        </span>
      </label>
      <p role="status" aria-live="polite" className={`text-sm font-semibold ${state.ok ? "text-green-600" : "text-brand"}`}>
        {state.message}
      </p>
    </form>
  );
}
