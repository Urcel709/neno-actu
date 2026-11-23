import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { requireStaff } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { STATUS_LABELS, type ArticleStatus } from "@/lib/types";
import { canWrite, isAdmin, isManager } from "@/lib/workflow";

const STATUSES: ArticleStatus[] = ["draft", "pending_review", "approved", "scheduled", "published", "rejected"];

export default async function Dashboard() {
  const me = await requireStaff();
  const { sb } = me;

  const counts = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await sb.from("articles").select("id", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    }),
  );

  const { data: queue } = isManager(me.role)
    ? await sb.from("articles").select("id,title,updated_at,status").eq("status", "pending_review").order("updated_at").limit(8)
    : { data: null };

  const { data: history } = isManager(me.role)
    ? await sb
        .from("article_status_history")
        .select("id,to_status,created_at,article:articles(id,title)")
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: null };

  const subscribers = isAdmin(me.role)
    ? (await sb.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("active", true)).count
    : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Bonjour {me.name.split(" ")[0]}</h1>
          <p className="text-sm text-gray-600">Vue d'ensemble de la rédaction.</p>
        </div>
        {canWrite(me.role) && <Link href="/admin/articles/new" className="btn-brand">+ Nouvel article</Link>}
      </header>

      <section aria-label="Statistiques" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {counts.map(([s, n]) => (
          <Link key={s} href={`/admin/articles?status=${s}`} className="rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <p className="font-display text-3xl font-extrabold">{n}</p>
            <p className="mt-1 text-xs font-semibold text-gray-600">{STATUS_LABELS[s]}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {queue && (
          <section className="rounded-lg bg-white p-5 shadow-sm" aria-labelledby="queue">
            <h2 id="queue" className="mb-3 text-lg">À relire</h2>
            {queue.length ? (
              <ul className="divide-y divide-gray-100">
                {queue.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={`/admin/articles/${a.id}`} className="line-clamp-1 font-semibold hover:text-brand">{a.title}</Link>
                    <span className="shrink-0 text-xs text-gray-500">{formatDateTime(a.updated_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">Aucun article en attente de relecture.</p>
            )}
          </section>
        )}

        {history && (
          <section className="rounded-lg bg-white p-5 shadow-sm" aria-labelledby="activity">
            <h2 id="activity" className="mb-3 text-lg">Activité récente</h2>
            {history.length ? (
              <ul className="divide-y divide-gray-100">
                {history.map((h) => {
                  const art = (Array.isArray(h.article) ? h.article[0] : h.article) as { id: string; title: string } | null;
                  return (
                    <li key={h.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="line-clamp-1 text-sm">
                        {art ? <Link href={`/admin/articles/${art.id}`} className="font-semibold hover:text-brand">{art.title}</Link> : "Article supprimé"}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={h.to_status as ArticleStatus} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">Aucune activité pour le moment.</p>
            )}
          </section>
        )}

        {subscribers !== null && (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg">Newsletter</h2>
            <p className="font-display text-3xl font-extrabold">{subscribers ?? 0}</p>
            <p className="text-sm text-gray-600">abonné(s) actif(s)</p>
          </section>
        )}
      </div>
    </div>
  );
}
