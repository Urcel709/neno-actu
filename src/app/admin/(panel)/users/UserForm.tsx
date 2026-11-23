"use client";

import { useActionState } from "react";
import { createUser, type AdminState } from "../../actions";
import { ROLE_LABELS, type Role } from "@/lib/types";

const initial: AdminState = { ok: false, message: "" };
const ROLES = (Object.keys(ROLE_LABELS) as Role[]).filter((r) => r !== "reader");

export function UserForm() {
  const [state, action, pending] = useActionState(createUser, initial);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-12">
      <div className="sm:col-span-3">
        <label htmlFor="nu-name" className="label">Nom affiché</label>
        <input id="nu-name" name="name" required className="field" />
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="nu-email" className="label">E-mail</label>
        <input id="nu-email" name="email" type="email" required autoComplete="off" className="field" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="nu-role" className="label">Rôle</label>
        <select id="nu-role" name="role" defaultValue="journalist" className="field">
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="nu-pass" className="label">Mot de passe provisoire (12+ car.)</label>
        <input id="nu-pass" name="password" type="password" required minLength={12} autoComplete="new-password" className="field" />
      </div>
      <div className="flex items-end sm:col-span-1">
        <button type="submit" disabled={pending} className="btn-brand w-full">Créer</button>
      </div>
      {state.message && (
        <p role="status" className={`text-sm font-semibold sm:col-span-12 ${state.ok ? "text-green-700" : "text-brand"}`}>{state.message}</p>
      )}
    </form>
  );
}
