-- Date invitation system tables
-- Run this in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.date_invites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  honorific text not null default 'Hanım',
  male_name text not null default 'Ata Duman',
  slug text not null unique,
  custom_question text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  view_count integer not null default 0,
  last_viewed_at timestamptz
);

create table if not exists public.date_responses (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.date_invites (id) on delete cascade,
  answer text not null check (answer in ('yes')),
  selected_date date not null,
  responded_at timestamptz not null default now(),
  user_agent text,
  source text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists date_invites_slug_idx on public.date_invites (slug);
create index if not exists date_responses_invite_id_idx on public.date_responses (invite_id);
create unique index if not exists date_responses_invite_unique_idx on public.date_responses (invite_id);

create or replace function public.set_date_invites_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists date_invites_updated_at on public.date_invites;
create trigger date_invites_updated_at
before update on public.date_invites
for each row
execute function public.set_date_invites_updated_at();

alter table public.date_invites enable row level security;
alter table public.date_responses enable row level security;

-- No public policies: access only via service role from Next.js server
