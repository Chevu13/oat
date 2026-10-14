"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { MAX_QTY } from "./cart-context";

export function QtyStepper({
  value,
  onChange,
  label,
  max = MAX_QTY,
  min = 0,
  small = false,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  max?: number;
  min?: number;
  small?: boolean;
}) {
  const s = small ? "h-9 w-9" : "h-12 w-12";
  return (
    <div className="inline-flex items-center rounded-full border-[1.5px] border-line bg-white/60">
      <button type="button" className={`grid ${s} place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Smanji količinu: ${label}`}>
        <MinusIcon width={16} />
      </button>
      <span className={`min-w-8 text-center font-bold tabular-nums ${small ? "text-sm" : ""}`} aria-live="polite" aria-label={`Količina: ${value}`}>
        {value}
      </span>
      <button type="button" className={`grid ${s} place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Povećaj količinu: ${label}`}>
        <PlusIcon width={16} />
      </button>
    </div>
  );
}
