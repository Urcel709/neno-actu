"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MobileNav({ items }: { items: { name: string; slug: string }[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="grid h-11 w-11 place-items-center rounded-md hover:bg-soft lg:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Fermer le menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <nav className="absolute inset-y-0 left-0 flex w-[84%] max-w-sm flex-col overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-extrabold">Rubriques</span>
              <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-md hover:bg-soft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <ul className="divide-y divide-gray-100">
              <li>
                <Link href="/" onClick={() => setOpen(false)} className="block py-3 font-bold">Accueil</Link>
              </li>
              {items.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} onClick={() => setOpen(false)} className="block py-3 font-semibold hover:text-brand">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-2 text-sm">
              <Link href="/a-propos" onClick={() => setOpen(false)} className="btn-ghost">À propos</Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="btn-ghost">Contact</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
