"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Pregled", icon: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z" },
  { href: "/admin/porudzbine", label: "Porudžbine", icon: "M6 4h12l1 16H5L6 4Zm3 4h6m-6 4h6" },
  { href: "/admin/proizvodi", label: "Proizvodi", icon: "M7 7h10l-1 13H8L7 7Zm2 0V5a3 3 0 0 1 6 0v2" },
  { href: "/admin/kategorije", label: "Kategorije", icon: "M4 6h16M4 12h16M4 18h10" },
];

const active = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

const Icon = ({ d }: { d: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

export function SideNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin navigacija" className="space-y-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          aria-current={active(path, n.href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active(path, n.href) ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5 hover:text-ink"}`}
        >
          <Icon d={n.icon} /> {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin navigacija" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={active(path, n.href) ? "page" : undefined} className={`flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-semibold ${active(path, n.href) ? "text-ink" : "text-ink/50"}`}>
          <Icon d={n.icon} /> {n.label}
        </Link>
      ))}
    </nav>
  );
}
