import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { TaskCard } from "@/components/task-card";
import { createTask } from "@/app/actions";

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

export default async function Home() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: tasks, error } = await supabase.rpc("get_day_view", {
    p_date: today,
  });

  if (error) {
    return <p className="p-8 text-red-600">Erro ao carregar tarefas: {error.message}</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <form action={createTask} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            name="title"
            required
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="priority">
            Prioridade
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="media"
            className="rounded border border-zinc-300 px-3 py-2"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm" htmlFor="due_date">
            Data
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            required
            defaultValue={today}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Criar tarefa
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col gap-3">
            <h2 className="font-semibold">{col.label}</h2>
            {(tasks as Task[])
              .filter((t) => t.status === col.status)
              .map((task) => (
                <TaskCard key={task.id} task={task} date={today} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
