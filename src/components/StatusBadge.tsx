import { STATUS_LABELS, type ArticleStatus } from "@/lib/types";

const COLORS: Record<ArticleStatus, string> = {
  draft: "bg-gray-200 text-gray-800",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  published: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${COLORS[status]}`}>{STATUS_LABELS[status]}</span>;
}
