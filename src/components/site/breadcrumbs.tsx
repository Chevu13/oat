import Link from "next/link";
import { JsonLd } from "./json-ld";
import { site } from "@/lib/config";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const all = [{ name: "Početna", href: "/" }, ...items];
  return (
    <nav aria-label="Putanja" className="text-sm text-ink-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {i === all.length - 1 ? (
              <span aria-current="page" className="font-semibold text-ink">
                {c.name}
              </span>
            ) : (
              <Link href={c.href} className="hover:text-ink">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${site.url}${c.href}` })),
        }}
      />
    </nav>
  );
}
