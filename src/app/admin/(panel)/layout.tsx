import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { BottomNav, SideNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/site/logo";

// Admin pages always wait for the session check; they are never prerendered or prefetched.
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-ink-soft">Učitavanje…</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="md:grid md:min-h-dvh md:grid-cols-[240px_1fr]">
      <aside className="hidden flex-col border-r border-line bg-white p-5 md:sticky md:top-0 md:flex md:h-dvh">
        <Link href="/admin" className="mb-1 block">
          <Logo className="h-6 w-auto" />
        </Link>
        <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-ink-soft">Admin panel</p>
        <SideNav />
        <div className="mt-auto space-y-3 border-t border-line pt-4 text-sm">
          <Link href="/" target="_blank" className="block font-semibold text-ink/70 hover:text-ink">
            ↗ Otvori prodavnicu
          </Link>
          {admin.email !== "demo" && (
            <>
              <p className="truncate text-xs text-ink-soft">{admin.email}</p>
              <form action={logout}>
                <button className="font-semibold text-berry hover:underline">Odjavi se</button>
              </form>
            </>
          )}
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
        <Logo className="h-5 w-auto" />
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/" target="_blank">
            Prodavnica ↗
          </Link>
          {admin.email !== "demo" && (
            <form action={logout}>
              <button className="text-berry">Odjava</button>
            </form>
          )}
        </div>
      </header>

      <div className="min-w-0">
        <p className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900 md:px-8">
          Demo režim: podaci se čuvaju lokalno (JSON fajl), bez baze. Supabase se povezuje nakon odobrenja sajta.
        </p>
        <main className="mx-auto max-w-[1200px] px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
