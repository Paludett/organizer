"use client";

import { format, addDays, subDays } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function DateNav({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`${pathname}?${params.toString()}`);
  }

  const current = new Date(`${date}T00:00:00`);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => goTo(format(subDays(current, 1), "yyyy-MM-dd"))}
        className="rounded border border-zinc-300 px-3 py-1 text-sm"
      >
        ← anterior
      </button>
      <button
        type="button"
        onClick={() => goTo(today)}
        className="rounded border border-zinc-300 px-3 py-1 text-sm"
      >
        hoje
      </button>
      <button
        type="button"
        onClick={() => goTo(format(addDays(current, 1), "yyyy-MM-dd"))}
        className="rounded border border-zinc-300 px-3 py-1 text-sm"
      >
        próximo →
      </button>
      <span className="text-sm text-zinc-500">{date}</span>
    </div>
  );
}
