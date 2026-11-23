import Link from "next/link";

export function Pagination({
  page,
  total,
  perPage,
  basePath,
  query = {},
}: {
  page: number;
  total: number;
  perPage: number;
  basePath: string;
  query?: Record<string, string>;
}) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const window = new Set([1, pages, page - 1, page, page + 1]);
  const list = [...window].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && <Link href={href(page - 1)} className="btn-ghost" rel="prev">← Précédent</Link>}
      {list.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - list[i - 1] > 1 && <span aria-hidden>…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`grid h-11 min-w-11 place-items-center rounded-md px-3 text-sm font-bold ${
              p === page ? "bg-ink text-white" : "border border-gray-300 hover:border-ink"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages && <Link href={href(page + 1)} className="btn-ghost" rel="next">Suivant →</Link>}
    </nav>
  );
}
