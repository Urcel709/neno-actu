import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SiteShell } from "@/components/SiteShell";
import { supabaseConfigured } from "@/lib/config";
import { DEMO_AUTHORS } from "@/lib/demo-data";
import { publicClient } from "@/lib/supabase/clients";
import type { Author } from "@/lib/types";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Notre rédaction",
  description: "Les journalistes et éditeurs de NENO ACTU.",
  alternates: { canonical: "/redaction" },
};

async function getTeam(): Promise<Author[]> {
  if (!supabaseConfigured) return DEMO_AUTHORS;
  const { data } = await publicClient().from("authors").select("id,name,slug,bio,avatar_url").order("name");
  return (data ?? []) as Author[];
}

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <SiteShell>
      <div className="container-page py-8">
        <Breadcrumb items={[{ name: "Notre rédaction" }]} />
        <h1 className="text-4xl sm:text-5xl">Notre rédaction</h1>
        <p className="mt-3 max-w-2xl text-gray-600">Les journalistes et éditeurs qui font NENO ACTU.</p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((a) => (
            <li key={a.id} className="rounded-lg border border-gray-200 p-5">
              <span aria-hidden className="grid h-14 w-14 place-items-center rounded-full bg-ink font-display text-xl font-extrabold text-white">
                {a.name.charAt(0)}
              </span>
              <h2 className="mt-3 text-xl">{a.name}</h2>
              {a.bio && <p className="mt-1 text-sm leading-6 text-gray-600">{a.bio}</p>}
              {a.slug && (
                <Link href={`/auteur/${a.slug}`} className="mt-3 inline-block text-sm font-bold text-brand hover:underline">
                  Ses articles →
                </Link>
              )}
            </li>
          ))}
        </ul>
        {!team.length && <p className="mt-8 rounded-md bg-soft p-8 text-center text-gray-600">La présentation de la rédaction arrive bientôt.</p>}
      </div>
    </SiteShell>
  );
}
