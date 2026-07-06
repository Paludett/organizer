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

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório"),
  priority: z.enum(["baixa", "media", "alta", "urgente"]),
  due_date: z.string().min(1, "Data obrigatória"),
});

export async function createTask(formData: FormData) {
  const parsed = createTaskSchema.parse({
    title: formData.get("title"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title: parsed.title,
    priority: parsed.priority,
    type: "scheduled",
    due_date: parsed.due_date,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
