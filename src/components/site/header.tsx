"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./logo";
import { useCart } from "@/components/cart/cart-context";
import { BagIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";
import { site } from "@/lib/config";

export const NAV = [
  { href: "/prodavnica", label: "Prodavnica" },
  { href: "/o-nama", label: "O nama" },
  { href: "/kontakt#saradnja", label: "Saradnja" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const { count, ready, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Badge "pop" when the count changes.
  const [lastCount, setLastCount] = useState(count);
  if (count !== lastCount) {
    setLastCount(count);
    if (ready && count > lastCount) setBump((b) => b + 1);
  }

  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled || menu ? "bg-paper/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-20 md:px-8">
          <nav aria-label="Glavna navigacija" className="hidden flex-1 items-center gap-7 lg:flex">
            {/* Route-aware bits read the URL, so they stream in behind Suspense (Cache Components). */}
            <Suspense fallback={<NavLinks pathname="" />}>
              <ActiveNavLinks />
            </Suspense>
          </nav>
          <Suspense fallback={null}>
            <OnNavigate run={() => setMenu(false)} />
          </Suspense>

          <Link href="/" aria-label="OAT BOMB — početna" className="shrink-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <Logo className="h-6 w-auto md:h-8" priority />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Link href="/prodavnica" className="btn btn-line hidden !min-h-11 !px-5 text-sm md:inline-flex">
              Poruči online
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative inline-flex h-11 items-center gap-2 rounded-full bg-ink pl-4 pr-3 text-sm font-bold text-paper transition-transform active:scale-95"
              aria-label={`Otvori korpu, ${count} ${count === 1 ? "proizvod" : "proizvoda"}`}
            >
              <BagIcon />
              <span className="hidden sm:inline">Korpa</span>
              <motion.span
                key={bump}
                initial={{ scale: bump ? 1.6 : 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="grid h-6 min-w-6 place-items-center rounded-full bg-paper px-1.5 text-xs text-ink tabular-nums"
              >
                {ready ? count : 0}
              </motion.span>
            </button>
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              className="grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-ink lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Zatvori meni" : "Otvori meni"}
            >
              {menu ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 flex flex-col justify-between overflow-y-auto bg-ink px-5 pb-8 pt-32 text-paper lg:hidden"
          >
            <nav aria-label="Mobilna navigacija">
              <ul className="space-y-1">
                {[{ href: "/", label: "Početna" }, ...NAV].map((n, i) => (
                  <motion.li
                    key={n.href}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link href={n.href} onClick={() => setMenu(false)} className="display block py-2 text-[10.5vw] sm:text-[9vw]">
                      {n.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="mt-10 space-y-3 text-paper/80">
              <p className="hand text-3xl text-paper">Spoj ukusa i snage.</p>
              <a href={site.phoneHref} className="flex items-center gap-3 py-1">
                <PhoneIcon /> {site.phone}
              </a>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-1">
                <InstagramIcon /> {site.instagramHandle}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string }) {
  return NAV.map((n) => (
    <Link
      key={n.href}
      href={n.href}
      className={`group relative text-sm font-semibold [font-stretch:110%] ${pathname === n.href ? "" : "text-ink/75 hover:text-ink"}`}
    >
      {n.label}
      <span
        className={`absolute -bottom-1 left-0 h-[2px] bg-ink transition-all duration-500 ease-[var(--ease-out-expo)] ${
          pathname === n.href ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  ));
}

/** Calls `run` whenever the route changes (closes the mobile menu). */
function OnNavigate({ run }: { run: () => void }) {
  const pathname = usePathname();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to route changes
  useEffect(run, [pathname]);
  return null;
}
