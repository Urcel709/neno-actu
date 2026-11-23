"use client";

import { useActionState, useState } from "react";
import { sendContact, type FormState } from "@/app/actions";

const initial: FormState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);
  const [openedAt] = useState(() => Date.now());

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="t" value={openedAt} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">Nom</label>
          <input id="c-name" name="name" required autoComplete="name" maxLength={120} className="field" />
        </div>
        <div>
          <label htmlFor="c-email" className="label">Adresse e-mail</label>
          <input id="c-email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="c-subject" className="label">Sujet</label>
        <input id="c-subject" name="subject" maxLength={150} className="field" />
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" required rows={7} maxLength={5000} className="field" />
      </div>
      <button type="submit" disabled={pending} className="btn-brand">
        {pending ? "Envoi…" : "Envoyer le message"}
      </button>
      <p role="status" aria-live="polite" className={`text-sm font-semibold ${state.ok ? "text-green-600" : "text-brand"}`}>
        {state.message}
      </p>
    </form>
  );
}
