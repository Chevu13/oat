"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { toast } from "./ui";

export function StatusForm({ id, status }: { id: string; status: OrderStatus }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {ORDER_STATUSES.map((s) => (
          <label key={s} className="cursor-pointer">
            <input type="radio" name="status" value={s} checked={value === s} onChange={() => setValue(s)} className="peer sr-only" />
            <span className="block rounded-xl px-3 py-2.5 text-center text-sm font-semibold ring-1 ring-line transition peer-checked:bg-ink peer-checked:text-paper peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-ink">
              {STATUS_LABEL[s]}
            </span>
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={pending || value === status}
        onClick={() =>
          start(async () => {
            const r = await setOrderStatus(id, value);
            if (r.ok) {
              toast(r.message);
              router.refresh();
            } else toast(r.error, "error");
          })
        }
        className="btn btn-ink mt-4 w-full !min-h-11 text-sm"
      >
        {pending ? "Čuvanje…" : "Sačuvaj status"}
      </button>
    </div>
  );
}
