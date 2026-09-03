-- Optional cloud persistence for WorldForge.
-- Run this in Supabase SQL editor after creating a project.

create table if not exists public.maps (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maps enable row level security;

create policy "Users can read their maps"
on public.maps for select
using (auth.uid() = user_id);

create policy "Users can insert their maps"
on public.maps for insert
with check (auth.uid() = user_id);

create policy "Users can update their maps"
on public.maps for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their maps"
on public.maps for delete
using (auth.uid() = user_id);