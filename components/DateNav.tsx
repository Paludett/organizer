"use client";

import { format, addDays, subDays } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { dayTasksKey, fetchDayTasks } from "@/lib/queries";

export function DateNav({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  function goTo(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`${pathname}?${params.toString()}`);
  }

  function prefetch(newDate: string) {
    queryClient.prefetchQuery({
      queryKey: dayTasksKey(newDate),
      queryFn: () => fetchDayTasks(newDate),
    });
  }

  const current = new Date(`${date}T00:00:00`);
  const today = format(new Date(), "yyyy-MM-dd");
  const isToday = date === today;
  const previousDate = format(subDays(current, 1), "yyyy-MM-dd");
  const nextDate = format(addDays(current, 1), "yyyy-MM-dd");

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => goTo(previousDate)}
        onMouseEnter={() => prefetch(previousDate)}
        aria-label="Dia anterior"
        className="cursor-pointer rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => goTo(today)}
        onMouseEnter={() => prefetch(today)}
        className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isToday
            ? "border-primary bg-primary text-white"
            : "border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary"
        }`}
      >
        Hoje
      </button>
      <button
        type="button"
        onClick={() => goTo(nextDate)}
        onMouseEnter={() => prefetch(nextDate)}
        aria-label="Próximo dia"
        className="cursor-pointer rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        →
      </button>
      <span className="ml-1 text-sm text-muted">
        {format(current, "dd/MM/yyyy")}
      </span>
    </div>
  );
}
