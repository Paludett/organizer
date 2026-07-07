-- Streak: dias seguidos em 'done' pra tarefas recurring, contando só
-- ocorrências (dias em recurrence_days), não dias corridos de calendário.
-- Ocorrência de hoje ainda não concluída não quebra a streak (graça até
-- o dia acabar); ocorrência passada não concluída quebra.

create or replace function calc_streak(p_task_id uuid, p_date date)
returns int
language plpgsql
stable
as $$
declare
  v_task tasks%rowtype;
  v_check date := p_date;
  v_streak int := 0;
  v_status text;
  v_is_first boolean := true;
begin
  select * into v_task from tasks where id = p_task_id;
  if v_task.id is null or v_task.type <> 'recurring' then
    return 0;
  end if;

  loop
    exit when v_check < v_task.created_at::date;

    if not (extract(dow from v_check)::int = any(v_task.recurrence_days)) then
      v_check := v_check - 1;
      continue;
    end if;

    select status into v_status from task_statuses
      where task_id = p_task_id and status_date = v_check;

    if v_status = 'done' then
      v_streak := v_streak + 1;
      v_check := v_check - 1;
    elsif v_is_first and v_check = p_date and v_check = current_date then
      v_check := v_check - 1;
    else
      exit;
    end if;

    v_is_first := false;
  end loop;

  return v_streak;
end;
$$;

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
    and (
      (t.type = 'recurring' and extract(dow from p_date)::int = any(t.recurrence_days))
      or (t.type = 'scheduled' and t.due_date = p_date)
    );
$$;
