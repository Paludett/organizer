"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { priorityLabels, priorityStyles, type Task } from "@/components/task-card";

const DAYS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const;

const statusLabels: Record<Task["status"], string> = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluído",
};

const inputClass =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function TaskDetailDrawer({
  task,
  initialMode = "view",
  onClose,
  onSave,
  isSaving,
}: {
  task: Task | null;
  initialMode?: "view" | "edit";
  onClose: () => void;
  onSave: (taskId: string, formData: FormData) => void;
  isSaving: boolean;
}) {
  useEffect(() => {
    if (!task) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [task, onClose]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <DrawerContent
        key={task.id}
        task={task}
        initialMode={initialMode}
        onClose={onClose}
        onSave={onSave}
        isSaving={isSaving}
      />
    </div>
  );
}

function DrawerContent({
  task,
  initialMode,
  onClose,
  onSave,
  isSaving,
}: {
  task: Task;
  initialMode: "view" | "edit";
  onClose: () => void;
  onSave: (taskId: string, formData: FormData) => void;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState(initialMode === "edit");
  const [selectedDays, setSelectedDays] = useState<number[]>(task.recurrence_days ?? []);

  function toggleDay(day: number) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave(task.id, new FormData(e.currentTarget));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
      onClick={(e) => e.stopPropagation()}
      className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-border bg-card p-5 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id="task-detail-title" className="text-lg font-semibold text-foreground">
          {editing ? "Editar tarefa" : task.title}
        </h2>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="cursor-pointer rounded p-1 text-muted hover:bg-border"
        >
          ✕
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="type" value={task.type} />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted" htmlFor="title">
              Título
            </label>
            <input id="title" name="title" defaultValue={task.title} required className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted" htmlFor="priority">
              Prioridade
            </label>
            <select id="priority" name="priority" defaultValue={task.priority} className={inputClass}>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted" htmlFor="tag">
              Tag
            </label>
            <input id="tag" name="tag" defaultValue={task.tag ?? ""} className={inputClass} />
          </div>

          {task.type === "scheduled" ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted" htmlFor="due_date">
                Data
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                required
                defaultValue={task.due_date ?? ""}
                className={inputClass}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted">Dias da semana</span>
              <div className="flex flex-wrap items-center gap-3 py-1">
                {DAYS.map((day) => (
                  <label
                    key={day.value}
                    className="flex cursor-pointer items-center gap-1.5 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      name="recurrence_days"
                      value={day.value}
                      checked={selectedDays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                      className="cursor-pointer accent-primary"
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            <span className="inline-block rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">
              {statusLabels[task.status]}
            </span>
            {task.type === "recurring" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                🔥 {task.streak}
              </span>
            )}
          </div>

          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-muted">Tipo</dt>
              <dd className="text-foreground">
                {task.type === "recurring" ? "Recorrente" : "Data única"}
              </dd>
            </div>
            {task.type === "scheduled" ? (
              <div>
                <dt className="text-muted">Data</dt>
                <dd className="text-foreground">
                  {task.due_date ? format(parseISO(task.due_date), "dd 'de' MMMM", { locale: ptBR }) : "—"}
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-muted">Dias da semana</dt>
                <dd className="text-foreground">
                  {task.recurrence_days && task.recurrence_days.length > 0
                    ? DAYS.filter((d) => task.recurrence_days?.includes(d.value))
                        .map((d) => d.label)
                        .join(", ")
                    : "—"}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Tag</dt>
              <dd className="text-foreground">{task.tag || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Criada em</dt>
              <dd className="text-foreground">
                {format(parseISO(task.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="cursor-pointer self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
}
