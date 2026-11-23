import type { ReactNode } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { SiteShell } from "./SiteShell";

export function InfoPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <SiteShell>
      <div className="container-page py-8">
        <div className="mx-auto max-w-3xl">
          <Breadcrumb items={[{ name: title }]} />
          <h1 className="text-4xl sm:text-5xl">{title}</h1>
          {intro && <p className="mt-4 text-xl leading-8 text-gray-600">{intro}</p>}
          <div className="prose-article mt-6">{children}</div>
        </div>
      </div>
    </SiteShell>
  );
}
