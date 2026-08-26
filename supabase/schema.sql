-- Schema atual da tabela routine_items (já aplicado no projeto Supabase).
-- Mantido aqui como referência / para recriar em outro ambiente.

create table if not exists routine_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  time time,
  category text,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  priority text check (priority in ('low', 'medium', 'high')),
  due_date date
);

alter table routine_items enable row level security;

drop policy if exists "acesso publico" on routine_items;
create policy "acesso publico" on routine_items
  for all
  using (true)
  with check (true);
