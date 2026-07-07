import { Suspense } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { DateNav } from "@/components/DateNav";

type Task = {
  id: string;
  title: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "todo" | "doing" | "done";
};

const columns = [
  { status: "todo", label: "A fazer" },
  { status: "doing", label: "Em andamento" },
  { status: "done", label: "Concluído" },
] as const;

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

      <TaskForm today={today} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map((col) => {
          const colTasks = (tasks as Task[]).filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
                <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">
                  {colTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-2 min-h-24">
                {colTasks.length === 0 ? (
                  <p className="p-2 text-sm text-muted">Nada por aqui</p>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} date={selectedDate} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
