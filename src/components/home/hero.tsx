"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowIcon } from "@/components/ui/icons";

// Entrance animations are CSS (globals.css) so they start before hydration and never delay LCP.
const delay = (s: number) => ({ animationDelay: `${s}s` });

export function Hero({ flavorCount }: { flavorCount: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const cardR = useTransform(scrollYProgress, [0, 1], [0, 4]); // on top of the CSS -2.5deg resting tilt
  const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-6 md:pb-28 md:pt-10">
      {/* Giant brush wordmark behind the paper — straight from the brand's posters */}
      <motion.div style={{ x: bgX }} className="pointer-events-none absolute inset-x-0 top-[38%] -z-0 select-none md:top-[20%]" aria-hidden>
        <Image src="/brand/logo-line.png" alt="" width={954} height={218} className="w-[180vw] max-w-none -translate-x-[8%] opacity-[0.07] md:w-[130vw]" priority />
      </motion.div>

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-4 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
        <div className="relative z-10 min-w-0">
          <p className="anim-fade hand mb-3 text-2xl text-ink-soft md:text-3xl" style={delay(0.5)}>
            Zaboravi klasične opcije —
          </p>
          <h1 className="display text-[13.4vw] sm:text-[12vw] lg:text-[7.4vw] 2xl:text-[7rem]">
            {["Uživanje", "bez griže", "savesti."].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.04em]">
                <span className="anim-rise block" style={delay(0.1 + i * 0.09)}>
                  {i === 1 ? (
                    <>
                      bez <span className="relative inline-block">griže<Scribble /></span>
                    </>
                  ) : (
                    w
                  )}
                </span>
              </span>
            ))}
          </h1>
          <div className="anim-fade-up" style={delay(0.55)}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft md:text-xl">
              Proteinske ovsene kaše u {flavorCount} slojevitih ukusa. Od Choco Raspberry do Pistachio. Spoj ukusa i snage, spreman za poneti.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/prodavnica" className="btn btn-ink group">
                Poruči online
                <ArrowIcon className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </Link>
              <Link href="#ukusi" className="btn btn-line">
                Pogledaj ukuse
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              {["Proteinska ovsena baza", "Plaćanje pouzećem", "Mini kaše za događaje"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="anim-card relative mx-auto w-full max-w-[560px]" style={delay(0.15)}>
          <motion.div style={{ y: cardY, rotate: cardR }} className="relative">
            <span className="tape -left-4 top-6 -rotate-[28deg]" />
            <span className="tape -right-5 bottom-10 rotate-[-24deg]" />
            <div className="torn-b relative overflow-hidden bg-white p-3 pb-8 shadow-[0_30px_60px_-20px_rgb(18_17_16/0.35)] md:p-4 md:pb-10">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src="/images/lifestyle/lineup-five.jpg"
                  alt="Pet OAT BOMB proteinskih kaša na drvenom stolu: Cheesecake, Blueberry, Nutella, Choco Raspberry i Tiramisu"
                  fill
                  priority
                  sizes="(min-width:1024px) 560px, 92vw"
                  className="object-cover"
                />
              </div>
              <p className="hand mt-3 text-center text-2xl md:text-3xl">spoj ukusa i snage ✶</p>
            </div>
          </motion.div>

          <Sticker className="-right-2 -top-6 bg-paper [--r:10deg] md:-right-8" delay={0.9}>
            {flavorCount} ukusa
          </Sticker>
          <Sticker className="-bottom-4 -left-2 [--r:-8deg] bg-berry text-white ring-berry md:-left-10" delay={1.05}>
            Protein + ovas
          </Sticker>
        </div>
      </div>
    </section>
  );
}

function Sticker({ children, className = "", delay: d = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <span
      style={delay(d)}
      className={`anim-pop absolute z-10 rounded-full px-5 py-3 text-sm font-extrabold uppercase tracking-tight shadow-lg ring-2 ring-ink [font-stretch:120%] md:text-base ${className}`}
    >
      {children}
    </span>
  );
}

/** Hand-drawn strike under a word — draws itself in. */
function Scribble() {
  return (
    <svg viewBox="0 0 300 30" preserveAspectRatio="none" className="absolute -bottom-[0.06em] left-0 h-[0.18em] w-full text-berry" aria-hidden>
      <path d="M4 20 C 60 8, 110 26, 160 14 S 250 6, 296 16" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" pathLength={1} className="anim-draw" style={delay(0.9)} />
    </svg>
  );
}
