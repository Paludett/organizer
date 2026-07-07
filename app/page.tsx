import { Suspense } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskForm } from "@/components/task-form";
import { DateNav } from "@/components/DateNav";
import type { Task } from "@/components/task-card";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const { date } = await searchParams;
  const selectedDate = date ?? today;

  const { data: tasks, error } = await supabase.rpc("get_day_view", {
    p_date: selectedDate,
  });

  if (error) {
    return <p className="p-8 text-red-600">Erro ao carregar tarefas: {error.message}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">Organizer</h1>
        <Suspense fallback={null}>
          <DateNav date={selectedDate} />
        </Suspense>
      </div>

      <TaskForm today={today} date={selectedDate} />

      <KanbanBoard tasks={tasks as Task[]} date={selectedDate} />
    </div>
  );
}
