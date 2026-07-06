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

export function TaskCard({ task, date }: { task: Task; date: string }) {
  const [isPending, startTransition] = useTransition();
  const next = nextStatusMap[task.status];

  return (
    <div className="rounded border border-zinc-200 p-3">
      <p className="font-medium">{task.title}</p>
      <p className="text-xs text-zinc-500">{task.priority}</p>
      {next && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => moveStatus(task.id, date, next))}
          className="mt-2 text-sm text-blue-600 disabled:opacity-50"
        >
          avançar →
        </button>
      )}
    </div>
  );
}
