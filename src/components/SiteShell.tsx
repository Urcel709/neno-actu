import type { ReactNode } from "react";
import { DemoNotice } from "./DemoNotice";
import { Footer } from "./Footer";
import { Header } from "./Header";

/** Coque commune des pages publiques. */
export function SiteShell({ children, activeSlug, before }: { children: ReactNode; activeSlug?: string; before?: ReactNode }) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-50 bg-white px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Aller au contenu
      </a>
      <DemoNotice />
      <Header activeSlug={activeSlug} />
      {before}
      <main id="contenu">{children}</main>
      <Footer />
    </>
  );
}
