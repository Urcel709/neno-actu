"use client";

import { useEffect } from "react";

/** Compte une consultation par session et par article, sans cookie ni donnée personnelle. */
export function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    if (articleId.startsWith("demo-")) return;
    const key = `v:${articleId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* stockage indisponible : on compte quand même */
    }
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: articleId }),
      keepalive: true,
    }).catch(() => {});
  }, [articleId]);
  return null;
}
