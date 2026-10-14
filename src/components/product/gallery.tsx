"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function Gallery({ images, name, accent }: { images: string[]; name: string; accent: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const show = (i: number) => {
    setActive(i);
    track.current?.children[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative overflow-hidden rounded-[2rem]" style={{ background: accent }}>
        <div
          ref={track}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] w-full shrink-0 snap-start">
              <Image
                src={src}
                alt={i === 0 ? `${name} — OAT BOMB proteinska ovsena kaša` : `${name}, fotografija ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full bg-white transition-all ${i === active ? "w-6" : "w-1.5 opacity-60"}`} />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 hidden gap-3 lg:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => show(i)}
              aria-label={`Prikaži fotografiju ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square w-20 overflow-hidden rounded-xl ring-2 transition ${i === active ? "ring-ink" : "ring-transparent opacity-60 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
