"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setInquiryDone } from "@/app/admin/actions";
import { toast } from "./ui";

export function InquiryDoneButton({ id, done }: { id: string; done: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await setInquiryDone(id, !done);
          toast(r.ok ? r.message : r.error, r.ok ? "ok" : "error");
          router.refresh();
        })
      }
      className={`rounded-lg px-3 py-2 text-sm font-semibold ring-1 ${done ? "ring-line hover:ring-ink" : "bg-ink text-paper ring-ink"}`}
    >
      {pending ? "…" : done ? "Vrati u nove" : "Označi kao rešeno"}
    </button>
  );
}
