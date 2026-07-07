-- Performance: índices em FKs sem cobertura e RLS evitando reavaliação
-- de auth.uid() por linha (apontado pelo Supabase advisor).

create index if not exists tasks_user_id_idx on tasks (user_id);
create index if not exists task_statuses_user_id_idx on task_statuses (user_id);

drop policy "tasks_select_own" on tasks;
create policy "tasks_select_own" on tasks
  for select using ((select auth.uid()) = user_id);

drop policy "tasks_insert_own" on tasks;
create policy "tasks_insert_own" on tasks
  for insert with check ((select auth.uid()) = user_id);

drop policy "tasks_update_own" on tasks;
create policy "tasks_update_own" on tasks
  for update using ((select auth.uid()) = user_id);

drop policy "tasks_delete_own" on tasks;
create policy "tasks_delete_own" on tasks
  for delete using ((select auth.uid()) = user_id);

drop policy "task_statuses_select_own" on task_statuses;
create policy "task_statuses_select_own" on task_statuses
  for select using ((select auth.uid()) = user_id);

drop policy "task_statuses_insert_own" on task_statuses;
create policy "task_statuses_insert_own" on task_statuses
  for insert with check ((select auth.uid()) = user_id);

drop policy "task_statuses_update_own" on task_statuses;
create policy "task_statuses_update_own" on task_statuses
  for update using ((select auth.uid()) = user_id);

drop policy "task_statuses_delete_own" on task_statuses;
create policy "task_statuses_delete_own" on task_statuses
  for delete using ((select auth.uid()) = user_id);
