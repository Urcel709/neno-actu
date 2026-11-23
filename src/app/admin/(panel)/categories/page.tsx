import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { isManager } from "@/lib/workflow";
import { deleteCategory } from "../../actions";
import { CategoryForm } from "./CategoryForm";

export const metadata: Metadata = { title: "Rubriques" };

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const me = await requireStaff();
  if (!isManager(me.role)) redirect("/admin");
  const { e } = await searchParams;
  const { data: categories } = await me.sb.from("categories").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Rubriques</h1>
      {e === "used" && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-semibold text-brand">
          Cette rubrique contient des articles : déplacez-les avant de la supprimer.
        </p>
      )}

      <section className="rounded-lg bg-white p-5 shadow-sm" aria-labelledby="new-cat">
        <h2 id="new-cat" className="mb-3 text-lg">Nouvelle rubrique</h2>
        <CategoryForm />
      </section>

      <ul className="space-y-3">
        {(categories ?? []).map((c) => (
          <li key={c.id} className="rounded-lg bg-white p-5 shadow-sm">
            <CategoryForm category={c} />
            <form action={deleteCategory} className="mt-2">
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" className="text-sm font-bold text-brand hover:underline">Supprimer</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
