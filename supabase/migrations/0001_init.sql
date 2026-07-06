-- Schema inicial: tasks, task_statuses, RLS e RPC get_day_view

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  priority text not null check (priority in ('baixa','media','alta','urgente')) default 'media',
  type text not null check (type in ('recurring','scheduled')),
  recurrence_days int[],   -- 0=dom ... 6=sab, só p/ recurring
  due_date date,           -- só p/ scheduled
  tag text,
  archived boolean default false,
  created_at timestamptz default now()
);

create table task_statuses (
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users not null,
  status_date date not null,
  status text not null check (status in ('todo','doing','done')) default 'todo',
  updated_at timestamptz default now(),
  primary key (task_id, status_date)
);

alter table tasks enable row level security;
alter table task_statuses enable row level security;

create policy "tasks_select_own" on tasks
  for select using (user_id = auth.uid());
create policy "tasks_insert_own" on tasks
  for insert with check (user_id = auth.uid());
create policy "tasks_update_own" on tasks
  for update using (user_id = auth.uid());
create policy "tasks_delete_own" on tasks
  for delete using (user_id = auth.uid());

create policy "task_statuses_select_own" on task_statuses
  for select using (user_id = auth.uid());
create policy "task_statuses_insert_own" on task_statuses
  for insert with check (user_id = auth.uid());
create policy "task_statuses_update_own" on task_statuses
  for update using (user_id = auth.uid());
create policy "task_statuses_delete_own" on task_statuses
  for delete using (user_id = auth.uid());

-- RPC: retorna tarefas do dia (recurring que batem no dia da semana + scheduled com due_date = p_date),
-- com status vindo de task_statuses (default 'todo' se não houver linha pra aquele task_id + p_date).
create or replace function get_day_view(p_date date)
returns table (
  id uuid,
  user_id uuid,
  title text,
  priority text,
  type text,
  recurrence_days int[],
  due_date date,
  tag text,
  archived boolean,
  created_at timestamptz,
  status text
)
language sql
stable
as $$
  select
    t.id,
    t.user_id,
    t.title,
    t.priority,
    t.type,
    t.recurrence_days,
    t.due_date,
    t.tag,
    t.archived,
    t.created_at,
    coalesce(ts.status, 'todo') as status
  from tasks t
  left join task_statuses ts
    on ts.task_id = t.id
    and ts.status_date = p_date
  where t.user_id = auth.uid()
    and (
      (t.type = 'recurring' and extract(dow from p_date)::int = any(t.recurrence_days))
      or (t.type = 'scheduled' and t.due_date = p_date)
    );
$$;
