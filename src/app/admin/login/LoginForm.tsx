"use client";

import { useActionState } from "react";
import { login, type AdminState } from "../actions";

const initial: AdminState = { ok: false, message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Adresse e-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      <button type="submit" disabled={pending} className="btn-brand w-full">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <p role="alert" aria-live="polite" className="min-h-5 text-sm font-semibold text-brand">{state.message}</p>
    </form>
  );
}
