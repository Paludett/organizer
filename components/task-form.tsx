"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTask } from "@/app/actions";
import { dayTasksKey } from "@/lib/queries";

const DAYS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const;

const inputClass =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function TaskForm({ today, date }: { today: string; date: string }) {
  const [type, setType] = useState<"scheduled" | "recurring">("scheduled");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (result) => {
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tarefa criada");
      formRef.current?.reset();
      setSelectedDays([]);
      queryClient.invalidateQueries({ queryKey: dayTasksKey(date) });
    },
    onError: () => {
      toast.error("Não foi possível criar a tarefa");
    },
  });

  const allSelected = selectedDays.length === DAYS.length;

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function toggleAllDays() {
    setSelectedDays(allSelected ? [] : DAYS.map((d) => d.value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createMutation.mutate(new FormData(e.currentTarget));
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted" htmlFor="title">
          Título
        </label>
        <input id="title" name="title" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted" htmlFor="priority">
          Prioridade
        </label>
        <select
          id="priority"
          name="priority"
          defaultValue="media"
          className={inputClass}
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Tipo</span>
        <div className="flex gap-3 py-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-foreground">
            <input
              type="radio"
              name="type"
              value="scheduled"
              checked={type === "scheduled"}
              onChange={() => setType("scheduled")}
              className="cursor-pointer accent-primary"
            />
            Data única
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-foreground">
            <input
              type="radio"
              name="type"
              value="recurring"
              checked={type === "recurring"}
              onChange={() => setType("recurring")}
              className="cursor-pointer accent-primary"
            />
            Recorrente
          </label>
        </div>
      </div>

      {type === "scheduled" ? (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted" htmlFor="due_date">
            Data
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            required
            defaultValue={today}
            className={inputClass}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">Dias da semana</span>
          <div className="flex flex-wrap items-center gap-3 py-2">
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
            <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAllDays}
                className="cursor-pointer accent-primary"
              />
              Todos os dias
            </label>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {createMutation.isPending ? "Criando..." : "Criar tarefa"}
      </button>
    </form>
  );
}
