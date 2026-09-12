-- Run this once in the Vercel Postgres "Query" tab (Storage -> your DB -> Data / Query)

create extension if not exists pgcrypto;

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  is_admin boolean not null default false,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  date date not null,
  form text not null check (form in ('V', 'VI')),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  unique (teacher_id, date, form)
);

-- Speeds up the public weekly view
create index if not exists schedule_date_idx on schedule (date);
