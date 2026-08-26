-- Schema atual do projeto Supabase (já aplicado). Mantido aqui como
-- referência / para recriar em outro ambiente.
--
-- Nota: as colunas routine_items.category e routine_items.time (e os
-- equivalentes em recurrences) ficaram sem uso no app a partir da
-- introdução do sistema de tags — mantidas no banco por segurança/
-- reversibilidade, mas o app não lê nem escreve nelas.

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists recurrences (
  id uuid primary key default gen_random_uuid(),
  -- molde usado para gerar novas ocorrências
  title text not null,
  category text, -- não usado pelo app (ver nota acima)
  time time,     -- não usado pelo app (ver nota acima)
  priority text check (priority in ('low', 'medium', 'high')),
  -- regra de repetição
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly', 'custom', 'month_period')),
  unit text not null check (unit in ('day', 'week', 'month', 'year', 'month_period')),
  interval integer not null default 1 check (interval >= 1),
  by_weekday smallint[],
  by_monthday smallint check (by_monthday between 1 and 31), -- também usado como "dia de início" em month_period
  by_month smallint check (by_month between 1 and 12),
  period_end_day smallint check (period_end_day between 1 and 31), -- "dia de fim" em month_period
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
  time time,     -- não usado pelo app (ver nota acima)
  category text, -- não usado pelo app (ver nota acima)
  done boolean not null default false,
  created_at timestamptz not null default now(),
  priority text check (priority in ('low', 'medium', 'high')),
  due_date date,
  recurrence_id uuid references recurrences(id) on delete set null,
  project_id uuid references projects(id) on delete set null
);

create table if not exists routine_item_tags (
  routine_item_id uuid not null references routine_items(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (routine_item_id, tag_id)
);

alter table routine_items enable row level security;
alter table recurrences enable row level security;
alter table projects enable row level security;
alter table tags enable row level security;
alter table routine_item_tags enable row level security;

drop policy if exists "acesso publico" on routine_items;
create policy "acesso publico" on routine_items for all using (true) with check (true);

drop policy if exists "acesso publico" on recurrences;
create policy "acesso publico" on recurrences for all using (true) with check (true);

drop policy if exists "acesso publico" on projects;
create policy "acesso publico" on projects for all using (true) with check (true);

drop policy if exists "acesso publico" on tags;
create policy "acesso publico" on tags for all using (true) with check (true);

drop policy if exists "acesso publico" on routine_item_tags;
create policy "acesso publico" on routine_item_tags for all using (true) with check (true);

insert into tags (name) values ('Operacional'), ('Estratégico')
on conflict (name) do nothing;
