-- get_day_view não deve retornar tarefas arquivadas (soft delete).

drop function if exists get_day_view(date);

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
  status text,
  streak int
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
    coalesce(ts.status, 'todo') as status,
    calc_streak(t.id, p_date) as streak
  from tasks t
  left join task_statuses ts
    on ts.task_id = t.id
    and ts.status_date = p_date
  where t.user_id = auth.uid()
    and t.archived = false
    and (
      (t.type = 'recurring' and extract(dow from p_date)::int = any(t.recurrence_days))
      or (t.type = 'scheduled' and t.due_date = p_date)
    );
$$;
