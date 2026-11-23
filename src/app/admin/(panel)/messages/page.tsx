import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { isAdmin } from "@/lib/workflow";
import { markMessageHandled } from "../../actions";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesAdmin() {
  const me = await requireStaff();
  if (!isAdmin(me.role)) redirect("/admin");
  const { data: messages } = await me.sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Messages de contact</h1>
      <ul className="space-y-3">
        {(messages ?? []).map((m) => (
          <li key={m.id} className={`rounded-lg bg-white p-5 shadow-sm ${m.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{m.subject || "(sans sujet)"}</p>
                <p className="text-sm text-gray-600">
                  {m.name} · <a href={`mailto:${m.email}`} className="text-brand hover:underline">{m.email}</a> · {formatDateTime(m.created_at)}
                </p>
              </div>
              <form action={markMessageHandled}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled ? "0" : "1"} />
                <button type="submit" className="btn-ghost !min-h-9 !px-3 text-xs">{m.handled ? "Rouvrir" : "Marquer comme traité"}</button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{m.message}</p>
          </li>
        ))}
        {!messages?.length && <li className="rounded-lg bg-white p-10 text-center text-gray-500">Aucun message.</li>}
      </ul>
    </div>
  );
}
