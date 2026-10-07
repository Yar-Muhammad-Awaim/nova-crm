-- Existing and newly generated tasks start in To do.
-- These defaults keep save_ai_draft() compatible without changing its signature.
begin;

alter table public.tasks
  add column if not exists status text not null default 'todo',
  add column if not exists board_position double precision not null default 0;

alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('todo', 'in_progress', 'done'));

create index if not exists tasks_project_board_idx
  on public.tasks (project_id, status, board_position);

-- Serialize moves within a project and save all order changes atomically.
-- Application server actions verify the caller's project permissions first.
create or replace function public.move_task_on_board(
  target_project uuid, target_task uuid, target_status text, before_task uuid default null
) returns void
language plpgsql
set search_path = public
as $$
declare
  next_position double precision;
begin
  if target_status not in ('todo', 'in_progress', 'done') or target_status is null then
    raise exception 'Invalid task status';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(target_project::text, 0));
  if not exists (select 1 from tasks where id = target_task and project_id = target_project) then
    raise exception 'Task not found in project';
  end if;
  if before_task = target_task then return; end if;
  if before_task is not null and not exists (
    select 1 from tasks where id = before_task and project_id = target_project and status = target_status
  ) then
    raise exception 'Destination task is no longer in this column';
  end if;

  with ordered as (
    select id, row_number() over (order by board_position, deadline, id) * 1024 as position
    from tasks where project_id = target_project and status = target_status and id <> target_task
  )
  update tasks set board_position = ordered.position from ordered where tasks.id = ordered.id;

  if before_task is null then
    select coalesce(max(board_position), 0) + 1024 into next_position
      from tasks where project_id = target_project and status = target_status and id <> target_task;
  else
    select board_position - 512 into next_position from tasks where id = before_task;
  end if;
  update tasks set status = target_status, board_position = next_position
    where id = target_task and project_id = target_project;
end;
$$;

revoke all on function public.move_task_on_board(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.move_task_on_board(uuid, uuid, text, uuid) to service_role;

notify pgrst, 'reload schema';
commit;
