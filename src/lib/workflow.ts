import type { ArticleStatus, Role } from "./types";

/** Droits et circuit éditorial. Doublés côté base par les politiques RLS (schema.sql). */

export const MANAGER_ROLES: Role[] = ["super_admin", "admin", "chief_editor"];
export const ADMIN_ROLES: Role[] = ["super_admin", "admin"];
export const STAFF_ROLES: Role[] = ["super_admin", "admin", "chief_editor", "journalist", "editor", "moderator"];
export const WRITER_ROLES: Role[] = ["super_admin", "admin", "chief_editor", "journalist", "editor"];

export const isManager = (r: Role) => MANAGER_ROLES.includes(r);
export const isAdmin = (r: Role) => ADMIN_ROLES.includes(r);
export const isStaff = (r: Role) => STAFF_ROLES.includes(r);
export const canWrite = (r: Role) => WRITER_ROLES.includes(r);

export type EditorialAction = "save" | "submit" | "approve" | "reject" | "schedule" | "publish" | "unpublish";

export const ACTION_LABELS: Record<EditorialAction, string> = {
  save: "Enregistrer",
  submit: "Soumettre à la relecture",
  approve: "Valider",
  reject: "Renvoyer pour correction",
  schedule: "Programmer",
  publish: "Publier maintenant",
  unpublish: "Dépublier (brouillon)",
};

export function allowedActions(role: Role, isOwner: boolean, status: ArticleStatus, isNew: boolean): EditorialAction[] {
  if (isManager(role)) {
    switch (status) {
      case "draft":
      case "rejected":
        return ["save", "submit", "schedule", "publish"];
      case "pending_review":
        return ["save", "approve", "reject", "schedule", "publish"];
      case "approved":
        return ["save", "reject", "schedule", "publish"];
      case "scheduled":
        return ["save", "schedule", "publish", "unpublish"];
      case "published":
        return ["save", "unpublish"];
    }
  }
  if (role === "journalist") {
    if (isNew) return ["save", "submit"];
    if (!isOwner) return [];
    if (status === "draft" || status === "rejected") return ["save", "submit"];
    if (status === "pending_review") return ["save"];
    return [];
  }
  if (role === "editor") {
    if (status === "draft" || status === "rejected") return ["save", "submit"];
    if (status === "pending_review") return ["save"];
    return [];
  }
  return [];
}

export function targetStatus(action: EditorialAction, current: ArticleStatus): ArticleStatus {
  switch (action) {
    case "save":
      return current;
    case "submit":
      return "pending_review";
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "schedule":
      return "scheduled";
    case "publish":
      return "published";
    case "unpublish":
      return "draft";
  }
}
