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
    <div className="flex flex-1 flex-col gap-8 p-8">
      <Suspense fallback={null}>
        <DateNav date={selectedDate} />
      </Suspense>

      <TaskForm today={today} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col gap-3">
            <h2 className="font-semibold">{col.label}</h2>
            {(tasks as Task[])
              .filter((t) => t.status === col.status)
              .map((task) => (
                <TaskCard key={task.id} task={task} date={selectedDate} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
