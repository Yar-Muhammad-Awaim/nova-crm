create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  description text,
  manager_id text not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create unique index teams_name_unique_idx on public.teams (lower(name));
create index teams_manager_id_idx on public.teams (manager_id);

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  primary key (team_id, user_id)
);
create index team_members_user_id_idx on public.team_members (user_id);

-- Match the application's server-only database access model.
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
revoke all on public.teams, public.team_members from anon, authenticated;
grant all on public.teams, public.team_members to service_role;

alter table public.projects add column team_id uuid references public.teams(id) on delete set null;
create index projects_team_id_idx on public.projects (team_id);

-- Team details and its membership must either all save or all roll back.
create function public.save_team(
  team_id uuid, team_name text, team_description text, team_manager text, members text[]
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if not exists (select 1 from public.users where id = team_manager and role = 'MANAGER') then
    raise exception 'Select a valid project manager';
  end if;
  if exists (
    select 1 from unnest(coalesce(members, '{}'::text[])) as requested(user_id)
    left join public.users u on u.id = requested.user_id
    where u.id is null or u.role <> 'AGENT'
  ) then
    raise exception 'Select valid team members';
  end if;

  if team_id is null then
    insert into public.teams (name, description, manager_id)
      values (trim(team_name), nullif(trim(team_description), ''), team_manager)
      returning id into saved_id;
  else
    -- A team retains its manager when its name or membership is edited.
    update public.teams set name = trim(team_name), description = nullif(trim(team_description), '')
      where id = team_id and manager_id = team_manager returning id into saved_id;
    if saved_id is null then raise exception 'Team not found or manager changed'; end if;
  end if;

  delete from public.team_members tm where tm.team_id = saved_id
    and not (tm.user_id = any(coalesce(members, '{}'::text[])));
  insert into public.team_members (team_id, user_id)
    select saved_id, user_id from unnest(coalesce(members, '{}'::text[])) as requested(user_id)
    on conflict do nothing;
  return saved_id;
end;
$$;

revoke all on function public.save_team(uuid, text, text, text, text[]) from public, anon, authenticated;
grant execute on function public.save_team(uuid, text, text, text, text[]) to service_role;
notify pgrst, 'reload schema';
