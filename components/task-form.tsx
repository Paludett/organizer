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
        <span className="text-sm">Tipo</span>
        <div className="flex gap-3 py-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="type"
              value="scheduled"
              checked={type === "scheduled"}
              onChange={() => setType("scheduled")}
            />
            Data única
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="type"
              value="recurring"
              checked={type === "recurring"}
              onChange={() => setType("recurring")}
            />
            Recorrente
          </label>
        </div>
      </div>

      {type === "scheduled" ? (
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
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-sm">Dias da semana</span>
          <div className="flex flex-wrap items-center gap-2 py-2">
            {DAYS.map((day) => (
              <label key={day.value} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="recurrence_days"
                  value={day.value}
                  checked={selectedDays.includes(day.value)}
                  onChange={() => toggleDay(day.value)}
                />
                {day.label}
              </label>
            ))}
            <label className="flex items-center gap-1 text-sm font-medium">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAllDays}
              />
              Todos os dias
            </label>
          </div>
        </div>
      )}

      <button type="submit" className="rounded bg-black px-4 py-2 text-white">
        Criar tarefa
      </button>
    </form>
  );
}
