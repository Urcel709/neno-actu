"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit, getStaff, requireStaff } from "@/lib/auth";
import { fromLocalInput, slugify } from "@/lib/format";
import { serviceClient } from "@/lib/supabase/clients";
import { sessionClient } from "@/lib/supabase/server";
import { ROLE_LABELS, type Article, type Role } from "@/lib/types";
import { uploadImage } from "@/lib/upload";
import { allowedActions, canWrite, isAdmin, isManager, isStaff, targetStatus, type EditorialAction } from "@/lib/workflow";

export interface AdminState {
  ok: boolean;
  message: string;
}
const fail = (message: string): AdminState => ({ ok: false, message });
const done = (message: string): AdminState => ({ ok: true, message });
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* ───────────── Authentification ───────────── */

// Limiteur best-effort en mémoire (par instance). La protection principale reste celle de Supabase Auth.
const attempts = new Map<string, { n: number; until: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60_000;

export async function login(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return fail("Saisissez votre e-mail et votre mot de passe.");

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "?").split(",")[0].trim();
  const key = `${ip}|${email}`;
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && entry.until > now && entry.n >= MAX_ATTEMPTS) {
    return fail("Trop de tentatives. Réessayez dans quelques minutes.");
  }

  const sb = await sessionClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    const cur = entry && entry.until > now ? entry : { n: 0, until: now + WINDOW_MS };
    attempts.set(key, { n: cur.n + 1, until: cur.until });
    return fail("E-mail ou mot de passe incorrect.");
  }
  attempts.delete(key);

  const me = await getStaff();
  if (!me || !me.active || !isStaff(me.role)) {
    await sb.auth.signOut();
    return fail("Ce compte n'a pas accès à l'administration.");
  }
  await audit(me.id, "auth.login", me.email);
  redirect("/admin");
}

export async function logout() {
  const me = await getStaff();
  const sb = await sessionClient();
  await sb.auth.signOut();
  if (me) await audit(me.id, "auth.logout", me.email);
  redirect("/admin/login");
}

/* ───────────── Articles ───────────── */

function parseTags(raw: string): { name: string; slug: string }[] {
  const seen = new Set<string>();
  return raw
    .split(",")
    .map((t) => t.trim().slice(0, 40))
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }))
    .filter((t) => t.slug && !seen.has(t.slug) && seen.add(t.slug))
    .slice(0, 12);
}

export async function saveArticle(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const me = await requireStaff();
  if (!canWrite(me.role)) return fail("Votre rôle ne permet pas de rédiger des articles.");
  const { sb } = me;

  const id = str(fd, "id");
  const action = str(fd, "action") as EditorialAction;

  let existing: { id: string; status: Article["status"]; author_id: string; cover_url: string | null; published_at: string | null } | null = null;
  if (id) {
    const { data } = await sb.from("articles").select("id,status,author_id,cover_url,published_at").eq("id", id).maybeSingle();
    if (!data) return fail("Article introuvable ou accès refusé.");
    existing = data;
  }

  const status = existing?.status ?? "draft";
  const isOwner = !existing || existing.author_id === me.id;
  if (!allowedActions(me.role, isOwner, status, !existing).includes(action)) {
    return fail("Cette action n'est pas autorisée pour votre rôle ou l'état actuel de l'article.");
  }

  const title = str(fd, "title");
  const categoryId = str(fd, "category_id");
  const excerpt = str(fd, "excerpt");
  const content = String(fd.get("content") ?? "").trim();
  const reviewNote = str(fd, "review_note");

  // Un simple enregistrement tolère un brouillon incomplet ; tout le reste exige un article complet.
  if (!title) return fail("Le titre est obligatoire.");
  if (title.length > 200) return fail("Le titre est trop long (200 caractères maximum).");
  if (action !== "save" || (existing && existing.status !== "draft")) {
    if (!categoryId) return fail("Choisissez une rubrique.");
    if (!excerpt) return fail("Le chapô (résumé) est obligatoire.");
    if (content.length < 20) return fail("Le contenu est trop court.");
  }
  if (action === "reject" && !reviewNote) return fail("Indiquez le motif du renvoi pour que l'auteur puisse corriger.");

  const nextStatus = targetStatus(action, status);
  const publishAt = fromLocalInput(str(fd, "publish_at"));
  let publishedAt = existing?.published_at ?? null;
  if (action === "schedule") {
    if (!publishAt || new Date(publishAt).getTime() <= Date.now() + 60_000) {
      return fail("Choisissez une date et une heure de publication dans le futur.");
    }
    publishedAt = publishAt;
  } else if (action === "publish") {
    publishedAt = new Date().toISOString();
  } else if (action === "unpublish") {
    publishedAt = null;
  }

  // Image de couverture
  let coverUrl = str(fd, "cover_url") || existing?.cover_url || null;
  const file = fd.get("cover_file");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(sb, file, me.id, { alt: str(fd, "cover_alt") });
    if (!up.ok) return fail(up.message);
    coverUrl = up.url ?? coverUrl;
  }
  if (fd.get("remove_cover") === "on") coverUrl = null;

  const video = str(fd, "video_url");
  if (video && !/^https:\/\//i.test(video)) return fail("Le lien vidéo doit commencer par https://");

  const payload = {
    title,
    slug: slugify(str(fd, "slug") || title) || `article-${Date.now()}`,
    excerpt,
    content,
    sources: String(fd.get("sources") ?? "").trim(),
    cover_url: coverUrl,
    cover_alt: str(fd, "cover_alt"),
    category_id: categoryId || null,
    status: nextStatus,
    published_at: publishedAt,
    is_featured: fd.get("is_featured") === "on" && isManager(me.role),
    is_flash: fd.get("is_flash") === "on" && isManager(me.role),
    is_opinion: fd.get("is_opinion") === "on",
    video_url: video || null,
    seo_title: str(fd, "seo_title").slice(0, 120),
    seo_description: str(fd, "seo_description").slice(0, 200),
    review_note: action === "reject" ? reviewNote : action === "save" ? (existing ? undefined : "") : "",
  };

  let articleId = existing?.id ?? "";
  if (existing) {
    const { error } = await sb.from("articles").update(payload).eq("id", existing.id);
    if (error) return fail(error.code === "23505" ? "Ce lien (slug) est déjà utilisé par un autre article." : `Enregistrement impossible : ${error.message}`);
  } else {
    const { data, error } = await sb.from("articles").insert({ ...payload, author_id: me.id }).select("id").single();
    if (error || !data) return fail(error?.code === "23505" ? "Ce lien (slug) est déjà utilisé par un autre article." : `Création impossible : ${error?.message}`);
    articleId = data.id;
  }

  // Mots-clés
  const tags = parseTags(str(fd, "tags"));
  await sb.from("article_tags").delete().eq("article_id", articleId);
  if (tags.length) {
    const { data: rows } = await sb.from("tags").upsert(tags, { onConflict: "slug" }).select("id");
    if (rows?.length) await sb.from("article_tags").insert(rows.map((t) => ({ article_id: articleId, tag_id: t.id })));
  }

  if (action === "publish" || action === "unpublish" || action === "schedule") {
    await audit(me.id, `article.${action}`, articleId, { title });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${articleId}?ok=${action}`);
}

export async function deleteArticle(fd: FormData) {
  const me = await requireStaff();
  const id = str(fd, "id");
  const { data: a } = await me.sb.from("articles").select("id,title,author_id,status").eq("id", id).maybeSingle();
  if (!a) redirect("/admin/articles");
  const allowed = isManager(me.role) || (me.role === "journalist" && a.author_id === me.id && a.status === "draft");
  if (!allowed) redirect(`/admin/articles/${id}`);
  await me.sb.from("articles").delete().eq("id", id);
  await audit(me.id, "article.delete", id, { title: a.title });
  revalidatePath("/", "layout");
  redirect("/admin/articles?deleted=1");
}

/* ───────────── Rubriques ───────────── */

export async function saveCategory(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const me = await requireStaff();
  if (!isManager(me.role)) return fail("Réservé aux responsables de la rédaction.");
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return fail("Le nom est obligatoire.");
  const row = {
    name,
    slug: slugify(str(fd, "slug") || name),
    description: str(fd, "description"),
    sort_order: Number(fd.get("sort_order")) || 0,
  };
  if (!row.slug) return fail("Nom invalide.");
  const { error } = id ? await me.sb.from("categories").update(row).eq("id", id) : await me.sb.from("categories").insert(row);
  if (error) return fail(error.code === "23505" ? "Ce lien (slug) existe déjà." : error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  return done(id ? "Rubrique mise à jour." : "Rubrique créée.");
}

export async function deleteCategory(fd: FormData) {
  const me = await requireStaff();
  if (!isManager(me.role)) return;
  const id = str(fd, "id");
  const { count } = await me.sb.from("articles").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (count) redirect("/admin/categories?e=used");
  await me.sb.from("categories").delete().eq("id", id);
  await audit(me.id, "category.delete", id);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

/* ───────────── Utilisateurs ───────────── */

const ASSIGNABLE: Role[] = ["super_admin", "admin", "chief_editor", "journalist", "editor", "moderator", "reader"];

export async function createUser(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const me = await requireStaff();
  if (!isAdmin(me.role)) return fail("Réservé aux administrateurs.");
  const svc = serviceClient();
  if (!svc) return fail("SUPABASE_SERVICE_ROLE_KEY n'est pas configurée sur le serveur.");

  const email = str(fd, "email").toLowerCase();
  const name = str(fd, "name");
  const role = str(fd, "role") as Role;
  const password = String(fd.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Adresse e-mail invalide.");
  if (!name) return fail("Indiquez le nom affiché.");
  if (!ASSIGNABLE.includes(role)) return fail("Rôle invalide.");
  if (role === "super_admin" && me.role !== "super_admin") return fail("Seul un super administrateur peut créer un super administrateur.");
  if (password.length < 12) return fail("Le mot de passe provisoire doit contenir au moins 12 caractères.");

  const { data, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
  });
  if (error || !data.user) return fail(error?.message ?? "Création impossible.");

  const slug = slugify(name);
  const { error: pErr } = await svc
    .from("profiles")
    .update({ role, display_name: name, slug: slug ? `${slug}-${data.user.id.slice(0, 4)}` : null })
    .eq("id", data.user.id);
  if (pErr) return fail(`Compte créé mais rôle non attribué : ${pErr.message}`);

  await audit(me.id, "user.create", data.user.id, { email, role });
  revalidatePath("/admin/users");
  return done(`Compte créé pour ${email} (${ROLE_LABELS[role]}). Transmettez le mot de passe provisoire de façon sécurisée.`);
}

export async function updateUser(fd: FormData) {
  const me = await requireStaff();
  if (!isAdmin(me.role)) return;
  const id = str(fd, "id");
  const role = str(fd, "role") as Role;
  if (!ASSIGNABLE.includes(role)) return;
  if (id === me.id) redirect("/admin/users?e=self");
  // La base (trigger guard_profile_update) refuse aussi toute élévation non autorisée.
  const { error } = await me.sb
    .from("profiles")
    .update({ role, active: fd.get("active") === "on", display_name: str(fd, "name") })
    .eq("id", id);
  if (error) redirect("/admin/users?e=denied");
  await audit(me.id, "user.update", id, { role, active: fd.get("active") === "on" });
  revalidatePath("/admin/users");
  redirect("/admin/users?ok=1");
}

/* ───────────── Médiathèque ───────────── */

export async function uploadMedia(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const me = await requireStaff();
  if (!canWrite(me.role)) return fail("Votre rôle ne permet pas de téléverser des médias.");
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choisissez une image.");
  const alt = str(fd, "alt");
  if (!alt) return fail("Le texte alternatif est obligatoire (accessibilité).");
  const res = await uploadImage(me.sb, file, me.id, { alt, caption: str(fd, "caption") });
  if (res.ok) revalidatePath("/admin/media");
  return res.ok ? done("Image téléversée.") : fail(res.message);
}

export async function deleteMedia(fd: FormData) {
  const me = await requireStaff();
  if (!isManager(me.role)) return;
  const id = str(fd, "id");
  const { data } = await me.sb.from("media").select("path").eq("id", id).maybeSingle();
  if (data) {
    await me.sb.storage.from("media").remove([data.path]);
    await me.sb.from("media").delete().eq("id", id);
    await audit(me.id, "media.delete", id);
  }
  revalidatePath("/admin/media");
  redirect("/admin/media");
}

/* ───────────── Messages ───────────── */

export async function markMessageHandled(fd: FormData) {
  const me = await requireStaff();
  if (!isAdmin(me.role)) return;
  await me.sb.from("contact_messages").update({ handled: fd.get("handled") === "1" }).eq("id", str(fd, "id"));
  revalidatePath("/admin/messages");
}
