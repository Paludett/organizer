"use client";

import { useTransition } from "react";
import { moveStatus } from "@/app/actions";

type Task = {
  id: string;
  title: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "todo" | "doing" | "done";
};

const nextStatusMap: Record<Task["status"], Task["status"] | null> = {
  todo: "doing",
  doing: "done",
  done: null,
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

export function TaskCard({ task, date }: { task: Task; date: string }) {
  const [isPending, startTransition] = useTransition();
  const next = nextStatusMap[task.status];

  return (
    <div className="group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <p className="font-medium text-foreground">{task.title}</p>
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
      >
        {priorityLabels[task.priority]}
      </span>
      {next && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => moveStatus(task.id, date, next))}
          className="mt-3 block cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          avançar →
        </button>
      )}
    </div>
  );
}
