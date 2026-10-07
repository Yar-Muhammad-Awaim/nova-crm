-- 0003 — atomic save
-- A plpgsql function runs inside ONE implicit transaction. If task 11 of 12
-- fails, projects 1 and 2 roll back too. This is the challenge pack's
-- "database transaction or equivalent all-or-nothing save".
--
-- It re-verifies manager and agent roles in SQL: this is the last door before
-- the data is real, and it should not assume the caller was careful.

create or replace function save_ai_draft(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  proj        jsonb;
  tsk         jsonb;
  new_proj_id uuid;
  n_projects  int := 0;
  n_tasks     int := 0;
begin
  for proj in select * from jsonb_array_elements(payload -> 'projects') loop

    if not exists (select 1 from users where id = proj ->> 'managerId' and role = 'MANAGER') then
      raise exception 'Unknown or non-manager managerId: %', proj ->> 'managerId';
    end if;

    insert into projects (name, client_name, description, manager_id, deadline)
    values (proj ->> 'name', proj ->> 'clientName', proj ->> 'description',
            proj ->> 'managerId', (proj ->> 'deadline')::date)
    returning id into new_proj_id;

    n_projects := n_projects + 1;

    for tsk in select * from jsonb_array_elements(proj -> 'tasks') loop

      if not exists (select 1 from users where id = tsk ->> 'assigneeId' and role = 'AGENT') then
        raise exception 'Unknown or non-agent assigneeId: %', tsk ->> 'assigneeId';
      end if;

      insert into tasks (project_id, title, description, assignee_id, deadline, estimated_hours)
      values (new_proj_id, tsk ->> 'title', tsk ->> 'description', tsk ->> 'assigneeId',
              (tsk ->> 'deadline')::date, (tsk ->> 'estimatedHours')::numeric);

      n_tasks := n_tasks + 1;
    end loop;
  end loop;

  return jsonb_build_object('projects', n_projects, 'tasks', n_tasks);
end;
$$;

revoke all on function save_ai_draft(jsonb) from anon, authenticated;
