import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/components/task-card";

export function dayTasksKey(date: string) {
  return ["tasks", date] as const;
}

export async function fetchDayTasks(date: string): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_day_view", { p_date: date });
  if (error) throw new Error(error.message);
  return data as Task[];
}
