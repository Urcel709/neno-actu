import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { allowedActions, canWrite, isManager } from "@/lib/workflow";
import { ArticleForm } from "../ArticleForm";

export const metadata: Metadata = { title: "Nouvel article" };

export default async function NewArticle() {
  const me = await requireStaff();
  if (!canWrite(me.role)) redirect("/admin");
  const { data: categories } = await me.sb.from("categories").select("id,name").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Nouvel article</h1>
      <ArticleForm
        values={{
          title: "", slug: "", category_id: "", excerpt: "", content: "", sources: "", cover_url: null, cover_alt: "",
          video_url: "", tags: "", is_featured: false, is_flash: false, is_opinion: false, seo_title: "", seo_description: "",
          review_note: "", publish_at: "", status: "draft",
        }}
        categories={categories ?? []}
        actions={allowedActions(me.role, true, "draft", true)}
        canFeature={isManager(me.role)}
      />
    </div>
  );
}
