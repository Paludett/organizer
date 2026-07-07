"use client";

import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConfirmDialog } from "@/components/confirm-dialog";

export type Task = {
  id: string;
  title: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "todo" | "doing" | "done";
  type: "recurring" | "scheduled";
  streak: number;
  tag: string | null;
  due_date: string | null;
  recurrence_days: number[] | null;
  created_at: string;
};

export const priorityStyles: Record<Task["priority"], string> = {
  baixa: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  media: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  alta: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  urgente: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const priorityLabels: Record<Task["priority"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export function TaskCard({
  task,
  onDelete,
  onOpen,
}: {
  task: Task;
  onDelete: (taskId: string) => void;
  onOpen: (taskId: string, mode?: "view" | "edit") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleDelete() {
    setMenuOpen(false);
    setConfirmOpen(true);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task.id)}
      className={`group relative touch-none cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-foreground">{task.title}</p>
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Mais opções"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="cursor-pointer rounded p-1 text-muted opacity-0 transition-opacity hover:bg-border group-hover:opacity-100 focus:opacity-100"
          >
            ⋮
          </button>
          {menuOpen && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-0 top-full z-10 mt-1 w-32 overflow-hidden rounded-lg border border-border bg-card shadow-md"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onOpen(task.id, "edit");
                }}
                className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-border"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-red-600 hover:bg-border dark:text-red-400"
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
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
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir tarefa"
        message={`Excluir "${task.title}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(task.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
