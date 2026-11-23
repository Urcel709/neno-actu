import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { serviceClient } from "@/lib/supabase/clients";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { isAdmin } from "@/lib/workflow";
import { updateUser } from "../../actions";
import { UserForm } from "./UserForm";

export const metadata: Metadata = { title: "Utilisateurs" };

const ROLES = Object.keys(ROLE_LABELS) as Role[];

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  const me = await requireStaff();
  if (!isAdmin(me.role)) redirect("/admin");
  const sp = await searchParams;

  const { data: profiles } = await me.sb.from("profiles").select("id,display_name,role,active,created_at").order("created_at");
  const svc = serviceClient();
  const emails = new Map<string, string>();
  if (svc) {
    const { data } = await svc.auth.admin.listUsers({ perPage: 200 });
    data?.users.forEach((u) => emails.set(u.id, u.email ?? ""));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Utilisateurs</h1>
      {sp.ok && <p role="status" className="rounded-md bg-green-50 p-3 text-sm font-semibold text-green-800">Modification enregistrée.</p>}
      {sp.e === "self" && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-semibold text-brand">Vous ne pouvez pas modifier votre propre compte ici.</p>}
      {sp.e === "denied" && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-semibold text-brand">Modification refusée (droits insuffisants).</p>}

      <section className="rounded-lg bg-white p-5 shadow-sm" aria-labelledby="new-user">
        <h2 id="new-user" className="mb-1 text-lg">Créer un compte</h2>
        <p className="mb-4 text-sm text-gray-600">Les inscriptions publiques sont désactivées : seuls les administrateurs créent les comptes de la rédaction.</p>
        {svc ? <UserForm /> : <p className="text-sm text-amber-800">Définissez <code>SUPABASE_SERVICE_ROLE_KEY</code> côté serveur pour créer des comptes depuis cette page.</p>}
      </section>

      <ul className="space-y-3">
        {(profiles ?? []).map((p) => (
          <li key={p.id} className="rounded-lg bg-white p-4 shadow-sm">
            <form action={updateUser} className="grid items-end gap-3 sm:grid-cols-12">
              <input type="hidden" name="id" value={p.id} />
              <div className="sm:col-span-4">
                <label htmlFor={`un-${p.id}`} className="label">Nom affiché</label>
                <input id={`un-${p.id}`} name="name" defaultValue={p.display_name} className="field" />
                <p className="mt-1 truncate text-xs text-gray-500">{emails.get(p.id) ?? ""}</p>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor={`ur-${p.id}`} className="label">Rôle</label>
                <select id={`ur-${p.id}`} name="role" defaultValue={p.role} className="field">
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4 accent-[#E9272D]" /> Actif
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-dark w-full" disabled={p.id === me.id}>
                  {p.id === me.id ? "Vous" : "Enregistrer"}
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
