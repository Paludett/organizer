"use client";

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
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { archiveTask, moveStatus, updateTask } from "@/app/actions";
import { dayTasksKey, fetchDayTasks } from "@/lib/queries";
import { TaskCard, type Task } from "@/components/task-card";
import { TaskDetailDrawer } from "@/components/task-detail-drawer";

const columns = [
  { status: "todo", label: "A fazer" },
  { status: "doing", label: "Em andamento" },
  { status: "done", label: "Concluído" },
] as const;

function Column({
  status,
  label,
  tasks,
  onDelete,
  onOpen,
}: {
  status: Task["status"];
  label: string;
  tasks: Task[];
  onDelete: (taskId: string) => void;
  onOpen: (taskId: string, mode?: "view" | "edit") => void;
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
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDelete} onOpen={onOpen} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks: initialTasks, date }: { tasks: Task[]; date: string }) {
  const queryClient = useQueryClient();
  const queryKey = dayTasksKey(date);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<"view" | "edit">("view");

  const { data: tasks = [] } = useQuery({
    queryKey,
    queryFn: () => fetchDayTasks(date),
    initialData: initialTasks,
  });

  const moveMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: Task["status"] }) =>
      moveStatus(taskId, date, newStatus),
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        (old ?? []).map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      toast.error("Não foi possível mover a tarefa");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => archiveTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        (old ?? []).filter((t) => t.id !== taskId),
      );
      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      toast.error("Não foi possível excluir a tarefa");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, formData }: { taskId: string; formData: FormData }) =>
      updateTask(taskId, formData),
    onSuccess: (result) => {
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tarefa atualizada");
      setSelectedTaskId(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast.error("Não foi possível atualizar a tarefa");
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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

    moveMutation.mutate({ taskId: activeTask.id, newStatus: overStatus });
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

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
            onDelete={(taskId) => deleteMutation.mutate(taskId)}
            onOpen={(taskId, mode = "view") => {
              setSelectedTaskId(taskId);
              setDetailMode(mode);
            }}
          />
        ))}
      </div>
      <TaskDetailDrawer
        task={selectedTask}
        initialMode={detailMode}
        onClose={() => setSelectedTaskId(null)}
        onSave={(taskId, formData) => updateMutation.mutate({ taskId, formData })}
        isSaving={updateMutation.isPending}
      />
    </DndContext>
  );
}
