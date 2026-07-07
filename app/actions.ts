"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.enum(["todo", "doing", "done"]);

export async function moveStatus(
  taskId: string,
  date: string,
  novoStatus: string,
) {
  const status = statusSchema.parse(novoStatus);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("task_statuses").upsert(
    { task_id: taskId, user_id: user.id, status_date: date, status },
    { onConflict: "task_id,status_date" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

const createTaskSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("scheduled"),
    title: z.string().trim().min(1, "Título obrigatório"),
    priority: z.enum(["baixa", "media", "alta", "urgente"]),
    due_date: z.string().min(1, "Data obrigatória"),
  }),
  z.object({
    type: z.literal("recurring"),
    title: z.string().trim().min(1, "Título obrigatório"),
    priority: z.enum(["baixa", "media", "alta", "urgente"]),
    recurrence_days: z
      .array(z.coerce.number().int().min(0).max(6))
      .min(1, "Selecione ao menos um dia"),
  }),
]);

export async function createTask(formData: FormData) {
  const parsed = createTaskSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
    recurrence_days: formData.getAll("recurrence_days"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.from("tasks").insert(
    parsed.data.type === "scheduled"
      ? {
          user_id: user.id,
          title: parsed.data.title,
          priority: parsed.data.priority,
          type: "scheduled",
          due_date: parsed.data.due_date,
        }
      : {
          user_id: user.id,
          title: parsed.data.title,
          priority: parsed.data.priority,
          type: "recurring",
          recurrence_days: parsed.data.recurrence_days,
        },
  );
  if (error) return { error: error.message };

  revalidatePath("/");
  return { error: null };
}

const updateTaskSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("scheduled"),
    title: z.string().trim().min(1, "Título obrigatório"),
    priority: z.enum(["baixa", "media", "alta", "urgente"]),
    tag: z.string().trim().optional(),
    due_date: z.string().min(1, "Data obrigatória"),
  }),
  z.object({
    type: z.literal("recurring"),
    title: z.string().trim().min(1, "Título obrigatório"),
    priority: z.enum(["baixa", "media", "alta", "urgente"]),
    tag: z.string().trim().optional(),
    recurrence_days: z
      .array(z.coerce.number().int().min(0).max(6))
      .min(1, "Selecione ao menos um dia"),
  }),
]);

export async function updateTask(taskId: string, formData: FormData) {
  const parsed = updateTaskSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    priority: formData.get("priority"),
    tag: formData.get("tag"),
    due_date: formData.get("due_date"),
    recurrence_days: formData.getAll("recurrence_days"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const tag = parsed.data.tag || null;
  const { error } = await supabase
    .from("tasks")
    .update(
      parsed.data.type === "scheduled"
        ? {
            title: parsed.data.title,
            priority: parsed.data.priority,
            tag,
            due_date: parsed.data.due_date,
          }
        : {
            title: parsed.data.title,
            priority: parsed.data.priority,
            tag,
            recurrence_days: parsed.data.recurrence_days,
          },
    )
    .eq("id", taskId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/");
  return { error: null };
}

export async function archiveTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("tasks")
    .update({ archived: true })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
