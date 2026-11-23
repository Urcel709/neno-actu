import { redirect } from "next/navigation";
import { serviceClient } from "./supabase/clients";
import { sessionClient } from "./supabase/server";
import type { Role } from "./types";
import { isStaff } from "./workflow";

export interface Staff {
  sb: Awaited<ReturnType<typeof sessionClient>>;
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
}

/** Utilisateur connecté + rôle lu en base (jamais depuis le navigateur). */
export async function getStaff(): Promise<Staff | null> {
  const sb = await sessionClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await sb
    .from("profiles")
    .select("display_name,role,active")
    .eq("id", data.user.id)
    .maybeSingle();
  return {
    sb,
    id: data.user.id,
    email: data.user.email ?? "",
    name: p?.display_name || data.user.email || "",
    role: (p?.role as Role) ?? "reader",
    active: p?.active ?? false,
  };
}

/** Pour les pages et actions d'administration : redirige ou lève une erreur si non autorisé. */
export async function requireStaff(): Promise<Staff> {
  const me = await getStaff();
  if (!me) redirect("/admin/login");
  if (!me.active || !isStaff(me.role)) redirect("/admin/login?e=acces");
  return me;
}

/** Journalise une action sensible (nécessite SUPABASE_SERVICE_ROLE_KEY ; sinon ignoré). */
export async function audit(userId: string | null, action: string, object = "", detail: Record<string, unknown> = {}) {
  const svc = serviceClient();
  if (!svc) return;
  const { error } = await svc.from("audit_logs").insert({ user_id: userId, action, object, detail });
  if (error) console.error("[audit]", error.message);
}
