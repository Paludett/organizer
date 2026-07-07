"use client";

import { useEffect, useRef, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { dayTasksKey, fetchDayTasks } from "@/lib/queries";
import "react-day-picker/style.css";

export function DateNav({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCalendarOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsCalendarOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCalendarOpen]);

  function goTo(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSelectDay(day: Date | undefined) {
    if (!day) return;
    goTo(format(day, "yyyy-MM-dd"));
    setIsCalendarOpen(false);
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
      <div className="relative ml-1" ref={calendarRef}>
        <button
          type="button"
          onClick={() => setIsCalendarOpen((open) => !open)}
          aria-haspopup="dialog"
          aria-expanded={isCalendarOpen}
          className="cursor-pointer rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {format(current, "dd/MM/yyyy")}
        </button>
        {isCalendarOpen && (
          <div className="date-nav-calendar absolute right-0 top-full z-10 mt-2 rounded-md border border-border bg-card p-2 text-foreground shadow-lg">
            <DayPicker
              mode="single"
              selected={current}
              onSelect={handleSelectDay}
              locale={ptBR}
              defaultMonth={current}
            />
          </div>
        )}
      </div>
    </div>
  );
}
