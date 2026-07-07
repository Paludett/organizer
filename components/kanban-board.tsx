"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { moveStatus } from "@/app/actions";
import { TaskCard, type Task } from "@/components/task-card";

const columns = [
  { status: "todo", label: "A fazer" },
  { status: "doing", label: "Em andamento" },
  { status: "done", label: "Concluído" },
] as const;

function Column({
  status,
  label,
  tasks,
}: {
  status: Task["status"];
  label: string;
  tasks: Task[];
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-24 flex-col gap-3 rounded-lg border border-dashed border-border p-2"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="p-2 text-sm text-muted">Nada por aqui</p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks: initialTasks, date }: { tasks: Task[]; date: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overStatus = columns.some((c) => c.status === over.id)
      ? (over.id as Task["status"])
      : tasks.find((t) => t.id === over.id)?.status;

    if (!overStatus || overStatus === activeTask.status) return;

    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTask.id ? { ...t, status: overStatus } : t)),
    );

    moveStatus(activeTask.id, date, overStatus).catch(() => {
      setTasks(previousTasks);
      toast.error("Não foi possível mover a tarefa");
    });
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-12 text-center">
        <p className="font-medium text-foreground">Nenhuma tarefa para este dia</p>
        <p className="text-sm text-muted">Crie uma tarefa acima pra começar.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={tasks.filter((t) => t.status === col.status)}
          />
        ))}
      </div>
    </DndContext>
  );
}
