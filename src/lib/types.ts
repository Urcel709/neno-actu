export type Role =
  | "reader"
  | "super_admin"
  | "admin"
  | "chief_editor"
  | "journalist"
  | "editor"
  | "moderator";

export type ArticleStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export interface Author {
  id: string;
  name: string;
  slug: string | null;
  bio: string;
  avatar_url: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  sources?: string;
  cover_url: string | null;
  cover_alt: string;
  status: ArticleStatus;
  is_featured: boolean;
  is_flash: boolean;
  is_opinion: boolean;
  video_url: string | null;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  category: Category | null;
  author: Author | null;
  tags?: { name: string; slug: string }[];
}

export interface ListResult {
  items: Article[];
  total: number;
}

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Brouillon",
  pending_review: "En attente de relecture",
  approved: "Validé",
  scheduled: "Programmé",
  published: "Publié",
  rejected: "Refusé",
};

export const ROLE_LABELS: Record<Role, string> = {
  reader: "Aucun accès",
  super_admin: "Super administrateur",
  admin: "Administrateur",
  chief_editor: "Rédacteur en chef",
  journalist: "Journaliste",
  editor: "Éditeur",
  moderator: "Modérateur",
};
