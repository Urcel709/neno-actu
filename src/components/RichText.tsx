import type { ReactNode } from "react";

/**
 * Rendu sûr d'un Markdown minimal (titres, citations, listes, gras, italique, liens).
 * Aucun HTML brut n'est interprété : tout est converti en éléments React.
 */

function safeHref(url: string): string | null {
  try {
    const u = new URL(url, "https://nenoactu.cd");
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? url : null;
  } catch {
    return null;
  }
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1]) {
      const href = safeHref(m[2]);
      out.push(
        href ? (
          <a key={key} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer nofollow">
            {m[1]}
          </a>
        ) : (
          m[1]
        ),
      );
    } else if (m[3]) out.push(<strong key={key}>{m[3]}</strong>);
    else if (m[4]) out.push(<em key={key}>{m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text, className = "prose-article" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        const lines = block.split("\n");
        if (block.startsWith("## ")) return <h2 key={key}>{inline(block.slice(3), key)}</h2>;
        if (block.startsWith("### ")) return <h3 key={key}>{inline(block.slice(4), key)}</h3>;
        if (lines.every((l) => l.startsWith("> "))) {
          return <blockquote key={key}>{inline(lines.map((l) => l.slice(2)).join(" "), key)}</blockquote>;
        }
        if (lines.every((l) => /^[-*] /.test(l))) {
          return (
            <ul key={key}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2), `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={key}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+\. /, ""), `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={key}>{inline(lines.join(" "), key)}</p>;
      })}
    </div>
  );
}
