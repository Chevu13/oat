import { Breadcrumbs } from "./breadcrumbs";
import { FitTitle } from "./fit-title";

export function PageShell({ title, eyebrow, intro, href, children, wide = false }: { title: string; eyebrow?: string; intro?: React.ReactNode; href: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto px-4 pb-10 pt-6 md:px-8 md:pt-10 ${wide ? "max-w-[1440px]" : "max-w-[1100px]"}`}>
      <Breadcrumbs items={[{ name: title, href }]} />
      <header className="mb-12 mt-6 md:mb-16">
        {eyebrow && <p className="eyebrow text-ink-soft">{eyebrow}</p>}
        <FitTitle text={title} max="6rem" maxWidth={wide ? 1440 : 1100} className="mt-3" />
        {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</div>}
      </header>
      {children}
    </div>
  );
}

/** Marks business/legal content the client still has to supply or approve before launch. */
export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-200/70 px-1.5 py-0.5 text-ink" title="Čeka potvrdu klijenta pre objavljivanja">
      ⚠ {children}
    </mark>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-5 leading-relaxed text-ink/85 [&_h2]:display [&_h2]:pt-6 [&_h2]:text-3xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
      {children}
    </div>
  );
}
