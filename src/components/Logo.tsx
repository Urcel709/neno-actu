import Link from "next/link";

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="NENO ACTU — accueil" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-md bg-brand font-display text-xl font-extrabold text-white"
      >
        N
      </span>
      <span className={`whitespace-nowrap font-display text-[1.3rem] font-extrabold leading-none tracking-tight sm:text-[1.65rem] ${light ? "text-white" : "text-ink"}`}>
        NENO<span className="text-brand"> ACTU</span>
      </span>
    </Link>
  );
}
