-- Schema atual do projeto Supabase (já aplicado). Mantido aqui como
-- referência / para recriar em outro ambiente.

create table if not exists recurrences (
  id uuid primary key default gen_random_uuid(),
  -- molde usado para gerar novas ocorrências
  title text not null,
  category text,
  time time,
  priority text check (priority in ('low', 'medium', 'high')),
  -- regra de repetição
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  unit text not null check (unit in ('day', 'week', 'month', 'year')),
  interval integer not null default 1 check (interval >= 1),
  by_weekday smallint[],
  by_monthday smallint check (by_monthday between 1 and 31),
  by_month smallint check (by_month between 1 and 12),
  starts_on date not null,
  ends_on date,
  max_occurrences integer check (max_occurrences >= 1),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  target_date date,
  priority text check (priority in ('low', 'medium', 'high')),
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  progress_override smallint check (progress_override between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists routine_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  time time,
  category text,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  priority text check (priority in ('low', 'medium', 'high')),
  due_date date,
  recurrence_id uuid references recurrences(id) on delete set null,
  project_id uuid references projects(id) on delete set null
);

alter table routine_items enable row level security;
alter table recurrences enable row level security;
alter table projects enable row level security;

drop policy if exists "acesso publico" on routine_items;
create policy "acesso publico" on routine_items for all using (true) with check (true);

drop policy if exists "acesso publico" on recurrences;
create policy "acesso publico" on recurrences for all using (true) with check (true);

drop policy if exists "acesso publico" on projects;
create policy "acesso publico" on projects for all using (true) with check (true);
