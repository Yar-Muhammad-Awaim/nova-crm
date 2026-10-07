-- 0001 — schema
-- Three tables: users, projects, tasks. Run this first.

create type user_role as enum ('ADMIN','MANAGER','AGENT');

create table users (
  id             text primary key,          -- 'ADMIN', 'PM01', 'DEV03' — stable ids the AI can point at
  name           text not null,
  email          text not null unique,
  password_hash  text not null,             -- bcrypt; never sent to the AI
  role           user_role not null,
  specialization text,
  skills         text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client_name text not null,
  description text,
  manager_id  text not null references users(id) on delete restrict,
  deadline    date not null,
  created_at  timestamptz not null default now()
);

create table tasks (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  title           text not null,
  description     text,
  assignee_id     text not null references users(id) on delete restrict,
  deadline        date not null,
  estimated_hours numeric(6,2) not null check (estimated_hours > 0),
  created_at      timestamptz not null default now()
);

create index on projects (manager_id);
create index on tasks (project_id);
create index on tasks (assignee_id);

-- RLS on with NO policies: the public/anon key can read nothing at all.
-- Every read and write goes through server code that applies the role rules.
alter table users    enable row level security;
alter table projects enable row level security;
alter table tasks    enable row level security;
