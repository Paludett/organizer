"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type Task = {
  id: string;
  title: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "todo" | "doing" | "done";
  type: "recurring" | "scheduled";
  streak: number;
};

const priorityStyles: Record<Task["priority"], string> = {
  baixa: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  media: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  alta: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  urgente: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const priorityLabels: Record<Task["priority"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group touch-none cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <p className="font-medium text-foreground">{task.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
        {task.type === "recurring" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            🔥 {task.streak}
          </span>
        )}
      </div>
    </div>
  );
}
