import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { supabaseConfigured } from "@/lib/config";
import { requireStaff } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import { canWrite, isAdmin, isManager } from "@/lib/workflow";
import { logout } from "../actions";
import { SetupNotice } from "../SetupNotice";

export const metadata: Metadata = { title: { default: "Administration", template: "%s — Administration" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!supabaseConfigured) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <SetupNotice />
      </div>
    );
  }
  const me = await requireStaff();

  const links = [
    { href: "/admin", label: "Tableau de bord", show: true },
    { href: "/admin/articles", label: "Articles", show: true },
    { href: "/admin/categories", label: "Rubriques", show: isManager(me.role) },
    { href: "/admin/media", label: "Médiathèque", show: canWrite(me.role) },
    { href: "/admin/users", label: "Utilisateurs", show: isAdmin(me.role) },
    { href: "/admin/messages", label: "Messages", show: isAdmin(me.role) },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen bg-soft lg:flex">
      <aside className="bg-ink text-gray-300 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
        <div className="flex items-center justify-between gap-3 p-4 lg:block">
          <Logo light />
          <p className="hidden pt-4 text-xs lg:block">Espace rédaction</p>
        </div>
        <nav aria-label="Administration" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="shrink-0 rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-white/10 hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="shrink-0 rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-white/10 hover:text-white">
            Voir le site ↗
          </Link>
        </nav>
        <div className="hidden border-t border-white/10 p-4 text-sm lg:absolute lg:bottom-0 lg:block lg:w-60">
          <p className="truncate font-bold text-white">{me.name}</p>
          <p className="text-xs">{ROLE_LABELS[me.role]}</p>
          <form action={logout} className="mt-3">
            <button type="submit" className="text-xs font-bold underline hover:text-white">Se déconnecter</button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 text-sm lg:hidden">
          <span className="truncate font-semibold">{me.name} · {ROLE_LABELS[me.role]}</span>
          <form action={logout}><button type="submit" className="font-bold text-brand">Quitter</button></form>
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
