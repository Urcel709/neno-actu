import { PAGE_SIZE, supabaseConfigured } from "./config";
import { DEMO_ARTICLES, DEMO_AUTHORS, DEMO_CATEGORIES } from "./demo-data";
import { publicClient } from "./supabase/clients";
import type { Article, Author, Category, ListResult } from "./types";

/** Lecture du contenu public. Bascule sur le contenu de démonstration sans Supabase. */

const LIST_FIELDS =
  "id,title,slug,excerpt,cover_url,cover_alt,status,is_featured,is_flash,is_opinion,video_url,seo_title,seo_description,published_at,updated_at,created_at,author_id,category:categories(id,name,slug,description,sort_order)";
const DETAIL_FIELDS = LIST_FIELDS.replace("excerpt,", "excerpt,content,sources,");

type Row = Omit<Article, "author" | "category"> & { author_id: string; category: Category | Category[] | null };

const PUBLIC_STATUSES = ["published", "scheduled"];

function clean(q: string): string {
  return q.replace(/[,()%*"'\\:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

async function withAuthors(rows: Row[]): Promise<Article[]> {
  const ids = [...new Set(rows.map((r) => r.author_id))];
  const authors = new Map<string, Author>();
  if (ids.length) {
    const { data } = await publicClient().from("authors").select("id,name,slug,bio,avatar_url").in("id", ids);
    (data ?? []).forEach((a: Author) => authors.set(a.id, a));
  }
  return rows.map((r) => {
    const { author_id, category, ...rest } = r;
    return {
      ...rest,
      category: Array.isArray(category) ? (category[0] ?? null) : category,
      author: authors.get(author_id) ?? null,
    } as Article;
  });
}

interface ListOptions {
  categoryId?: string;
  authorId?: string;
  q?: string;
  flash?: boolean;
  featured?: boolean;
  videosOnly?: boolean;
  excludeId?: string;
  page?: number;
  perPage?: number;
}

async function listArticles(o: ListOptions = {}): Promise<ListResult> {
  const perPage = o.perPage ?? PAGE_SIZE;
  const from = ((o.page ?? 1) - 1) * perPage;

  if (!supabaseConfigured) {
    const q = o.q?.toLowerCase();
    let items = DEMO_ARTICLES.filter(
      (a) =>
        (!o.categoryId || a.category?.id === o.categoryId) &&
        (!o.authorId || a.author?.id === o.authorId) &&
        (!o.flash || a.is_flash) &&
        (!o.featured || a.is_featured) &&
        (!o.videosOnly || a.category?.slug === "videos" || a.video_url) &&
        a.id !== o.excludeId &&
        (!q || `${a.title} ${a.excerpt} ${a.content}`.toLowerCase().includes(q)),
    );
    const total = items.length;
    items = items.slice(from, from + perPage).map(({ content: _c, ...rest }) => rest as Article);
    return { items, total };
  }

  let query = publicClient()
    .from("articles")
    .select(LIST_FIELDS, { count: "exact" })
    .in("status", PUBLIC_STATUSES)
    .lte("published_at", new Date().toISOString());
  if (o.categoryId) query = query.eq("category_id", o.categoryId);
  if (o.authorId) query = query.eq("author_id", o.authorId);
  if (o.flash) query = query.eq("is_flash", true);
  if (o.featured) query = query.eq("is_featured", true);
  if (o.excludeId) query = query.neq("id", o.excludeId);
  if (o.q) {
    const q = clean(o.q);
    if (!q) return { items: [], total: 0 };
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`);
  }
  const { data, count, error } = await query
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);
  if (error) {
    console.error("[data] listArticles", error.message);
    return { items: [], total: 0 };
  }
  return { items: await withAuthors((data ?? []) as unknown as Row[]), total: count ?? 0 };
}

export async function getCategories(): Promise<Category[]> {
  if (!supabaseConfigured) return DEMO_CATEGORIES;
  const { data, error } = await publicClient()
    .from("categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order");
  if (error || !data?.length) return DEMO_CATEGORIES;
  return data as Category[];
}

export async function getCategory(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getCategoryArticles(category: Category, page: number): Promise<ListResult> {
  return listArticles({ categoryId: category.id, page });
}

export async function getVideos(page = 1, perPage = 12): Promise<ListResult> {
  if (!supabaseConfigured) return listArticles({ videosOnly: true, page, perPage });
  const cat = await getCategory("videos");
  return cat ? listArticles({ categoryId: cat.id, page, perPage }) : { items: [], total: 0 };
}

export async function searchArticles(q: string, page: number): Promise<ListResult> {
  return listArticles({ q, page });
}

export async function getAuthor(slug: string): Promise<Author | null> {
  if (!supabaseConfigured) return DEMO_AUTHORS.find((a) => a.slug === slug) ?? null;
  const { data } = await publicClient()
    .from("authors")
    .select("id,name,slug,bio,avatar_url")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Author | null) ?? null;
}

export async function getAuthorArticles(author: Author, page: number): Promise<ListResult> {
  return listArticles({ authorId: author.id, page });
}

export async function getArticle(categorySlug: string, slug: string): Promise<Article | null> {
  if (!supabaseConfigured) {
    return DEMO_ARTICLES.find((a) => a.slug === slug && a.category?.slug === categorySlug) ?? null;
  }
  const sb = publicClient();
  const cat = await getCategory(categorySlug);
  if (!cat) return null;
  const { data } = await sb
    .from("articles")
    .select(DETAIL_FIELDS)
    .eq("slug", slug)
    .eq("category_id", cat.id)
    .in("status", PUBLIC_STATUSES)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (!data) return null;
  const [article] = await withAuthors([data as unknown as Row]);
  const { data: tagRows } = await sb
    .from("article_tags")
    .select("tag:tags(name,slug)")
    .eq("article_id", article.id);
  article.tags = (tagRows ?? [])
    .map((r) => (Array.isArray(r.tag) ? r.tag[0] : r.tag))
    .filter(Boolean) as { name: string; slug: string }[];
  return article;
}

export async function getRelated(article: Article, limit = 4): Promise<Article[]> {
  if (!article.category) return [];
  const { items } = await listArticles({ categoryId: article.category.id, excludeId: article.id, perPage: limit });
  return items;
}

export async function getFlash(limit = 6): Promise<Article[]> {
  return (await listArticles({ flash: true, perPage: limit })).items;
}

export async function getPopular(limit = 5): Promise<Article[]> {
  if (!supabaseConfigured) {
    return DEMO_ARTICLES.filter((a) => !a.is_flash).slice(0, limit).map(({ content: _c, ...r }) => r as Article);
  }
  const sb = publicClient();
  const { data: ranked } = await sb.rpc("popular_article_ids", { p_days: 7, p_limit: limit });
  const ids = (ranked ?? []).map((r: { article_id: string }) => r.article_id);
  if (!ids.length) return (await listArticles({ perPage: limit })).items;
  const { data } = await sb.from("articles").select(LIST_FIELDS).in("id", ids);
  const articles = await withAuthors((data ?? []) as unknown as Row[]);
  return ids.map((id: string) => articles.find((a) => a.id === id)).filter(Boolean) as Article[];
}

export interface HomeData {
  featured: Article | null;
  secondary: Article[];
  latest: Article[];
  popular: Article[];
  flash: Article[];
  sections: { category: Category; articles: Article[] }[];
  videos: Article[];
}

export async function getHome(): Promise<HomeData> {
  const [categories, flash, popular, recent, featuredList, videos] = await Promise.all([
    getCategories(),
    getFlash(),
    getPopular(5),
    listArticles({ perPage: 30 }),
    listArticles({ featured: true, perPage: 1 }),
    getVideos(1, 4),
  ]);

  const regular = recent.items.filter((a) => !a.is_flash);
  const featured = featuredList.items[0] ?? regular[0] ?? null;
  const rest = regular.filter((a) => a.id !== featured?.id);
  const secondary = rest.slice(0, 4);
  const latest = rest.slice(4, 14);

  const wanted = ["rdc", "politique", "societe", "economie", "sports", "culture"];
  const sections: HomeData["sections"] = [];
  for (const slug of wanted) {
    const category = categories.find((c) => c.slug === slug);
    if (!category) continue;
    const articles = regular.filter((a) => a.category?.slug === slug).slice(0, 4);
    if (articles.length) sections.push({ category, articles });
  }
  return { featured, secondary, latest, popular, flash, sections, videos: videos.items };
}

/** Pour le sitemap : tous les articles publics (sans contenu). */
export async function getAllPublicArticles(): Promise<Pick<Article, "slug" | "category" | "updated_at" | "published_at">[]> {
  const { items } = await listArticles({ perPage: 1000 });
  return items;
}
