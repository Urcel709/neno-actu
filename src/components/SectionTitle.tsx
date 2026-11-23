import Link from "next/link";

export function SectionTitle({ title, href, id }: { title: string; href?: string; id?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between border-b-2 border-ink pb-2">
      <h2 id={id} className="relative text-2xl">
        <span aria-hidden className="absolute -bottom-[10px] left-0 h-[3px] w-full bg-brand" />
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-sm font-bold hover:text-brand">
          Tout voir →
        </Link>
      )}
    </div>
  );
}
