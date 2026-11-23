import Image from "next/image";

const PALETTES = [
  "from-ink via-[#1f2937] to-[#3b0d10]",
  "from-[#1f2937] via-ink to-[#4a1216]",
  "from-[#3b0d10] via-ink to-[#1f2937]",
  "from-ink via-[#2a1215] to-[#E9272D]/60",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

interface Props {
  url: string | null;
  alt?: string;
  label?: string;
  seed?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/** Image d'article optimisée, ou visuel de substitution aux couleurs du média. */
export function Cover({ url, alt = "", label, seed = "", priority, sizes = "(min-width:1024px) 50vw, 100vw", className = "" }: Props) {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
  const optimizable = Boolean(url && supabaseHost && url.includes(supabaseHost));

  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-soft ${className}`}>
      {url ? (
        optimizable ? (
          <Image src={url} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" />
        )
      ) : (
        <div
          role="img"
          aria-label={alt || label || "Illustration"}
          className={`absolute inset-0 flex items-end bg-gradient-to-br p-4 ${PALETTES[hash(seed) % PALETTES.length]}`}
        >
          <span aria-hidden className="absolute -right-6 -top-10 font-display text-[9rem] font-extrabold leading-none text-white/[0.06]">
            N
          </span>
          {label && <span className="relative text-xs font-extrabold uppercase tracking-widest text-white/70">{label}</span>}
        </div>
      )}
    </div>
  );
}
