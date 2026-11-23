import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { requireStaff } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { STATUS_LABELS, type ArticleStatus } from "@/lib/types";
import { canWrite } from "@/lib/workflow";

export const metadata: Metadata = { title: "Articles" };

const STATUSES = Object.keys(STATUS_LABELS) as ArticleStatus[];

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; deleted?: string }> }) {
  const me = await requireStaff();
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as ArticleStatus) ? (sp.status as ArticleStatus) : null;
  const q = (sp.q ?? "").replace(/[,()%*"'\\]/g, " ").trim().slice(0, 80);

  let query = me.sb
    .from("articles")
    .select("id,title,status,updated_at,published_at,category:categories(name),author_id")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data, error } = await query;

  const authorIds = [...new Set((data ?? []).map((a) => a.author_id))];
  const { data: people } = authorIds.length ? await me.sb.from("profiles").select("id,display_name").in("id", authorIds) : { data: [] };
  const names = new Map((people ?? []).map((p) => [p.id, p.display_name]));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Articles</h1>
        {canWrite(me.role) && <Link href="/admin/articles/new" className="btn-brand">+ Nouvel article</Link>}
      </header>

      {sp.deleted && <p role="status" className="rounded-md bg-green-50 p-3 text-sm font-semibold text-green-800">Article supprimé.</p>}

      <form className="flex flex-wrap gap-2" role="search">
        <label htmlFor="q" className="sr-only">Titre</label>
        <input id="q" name="q" defaultValue={q} placeholder="Rechercher un titre" className="field max-w-xs" />
        <label htmlFor="status" className="sr-only">Statut</label>
        <select id="status" name="status" defaultValue={status ?? ""} className="field max-w-[14rem]">
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button type="submit" className="btn-dark">Filtrer</button>
      </form>

      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-brand">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Rubrique</th>
              <th className="px-4 py-3">Auteur</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Modifié</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data ?? []).map((a) => {
              const cat = (Array.isArray(a.category) ? a.category[0] : a.category) as { name: string } | null;
              return (
                <tr key={a.id} className="hover:bg-soft/60">
                  <td className="max-w-md px-4 py-3">
                    <Link href={`/admin/articles/${a.id}`} className="line-clamp-2 font-semibold hover:text-brand">{a.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cat?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{names.get(a.author_id) ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDateTime(a.updated_at)}</td>
                </tr>
              );
            })}
            {!data?.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Aucun article.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
