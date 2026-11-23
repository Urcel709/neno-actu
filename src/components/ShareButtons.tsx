"use client";

import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} — NENO ACTU`);
  const link = encodeURIComponent(url);

  const items = [
    { name: "WhatsApp", href: `https://wa.me/?text=${text}%20${link}`, cls: "bg-[#25D366] text-white" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${link}`, cls: "bg-[#1877F2] text-white" },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${link}`, cls: "bg-ink text-white" },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Partager cet article">
      <span className="mr-1 text-sm font-bold">Partager</span>
      {items.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm font-bold hover:opacity-90 ${s.cls}`}
        >
          {s.name}
        </a>
      ))}
      <button type="button" onClick={copy} className="btn-ghost !min-h-11 !px-4">
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
