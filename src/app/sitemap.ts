import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { getAllPublicArticles, getCategories } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([getCategories(), getAllPublicArticles()]);
  const fixed = ["", "/a-propos", "/redaction", "/contact", "/publicite", "/videos", "/mentions-legales", "/confidentialite", "/conditions"];

  return [
    ...fixed.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: p === "" ? ("hourly" as const) : ("monthly" as const), priority: p === "" ? 1 : 0.4 })),
    ...categories.map((c) => ({ url: `${SITE.url}/${c.slug}`, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...articles.map((a) => ({
      url: `${SITE.url}/${a.category?.slug ?? "actualites"}/${a.slug}`,
      lastModified: a.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
