"use client";

import { useState } from "react";
import { createTask } from "@/app/actions";

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

export function TaskForm({ today }: { today: string }) {
  const [type, setType] = useState<"scheduled" | "recurring">("scheduled");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const allSelected = selectedDays.length === DAYS.length;

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function toggleAllDays() {
    setSelectedDays(allSelected ? [] : DAYS.map((d) => d.value));
  }

  return (
    <form
      action={createTask}
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
        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Criar tarefa
      </button>
    </form>
  );
}
