-- Portfolio schema for Supabase PostgreSQL.
-- Run this in the Supabase SQL editor before starting the API or seed script.
-- The API uses the service role key and bypasses row level security.
-- Public and anon clients have no policies, so they cannot read or write tables.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null default 'Admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  full_name text not null default '',
  professional_title text not null default '',
  roles text[] not null default '{}',
  short_intro text not null default '',
  location text not null default '',
  email text not null default '',
  phone text,
  profile_image_url text,
  profile_image_path text,
  updated_at timestamptz not null default now()
);

create table if not exists about (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  summary text not null default '',
  personal_intro text not null default '',
  current_education text not null default '',
  highlights jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table about drop column if exists career_interests;
alter table about drop column if exists technologies;

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  display_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_order_idx on skills (display_order);
create index if not exists skills_category_idx on skills (category);

create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  employment_type text not null default 'full_time'
    check (employment_type in ('full_time', 'part_time', 'internship', 'contract', 'freelance')),
  start_date date,
  end_date date,
  location text,
  description text not null default '',
  technologies text[] not null default '{}',
  company_logo_url text,
  company_logo_path text,
  is_current boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experiences_order_idx on experiences (display_order);

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  specialization text,
  start_year integer,
  end_year integer,
  grade text,
  description text not null default '',
  logo_url text,
  logo_path text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists education_order_idx on education (display_order);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null default '',
  detailed_description text not null default '',
  features text[] not null default '{}',
  technologies text[] not null default '{}',
  github_url text,
  live_url text,
  category text not null default '',
  is_featured boolean not null default false,
  status text not null default 'completed'
    check (status in ('planned', 'in_progress', 'completed', 'archived')),
  is_published boolean not null default false,
  start_date date,
  end_date date,
  display_order integer not null default 0,
  cover_image_url text,
  cover_image_path text,
  development_details text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_order_idx on projects (display_order);
create index if not exists projects_published_idx on projects (is_published, is_featured);

create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  image_url text not null,
  image_path text not null,
  alt_text text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_idx on project_images (project_id, display_order);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null default '',
  achieved_on date,
  description text not null default '',
  certificate_url text,
  certificate_path text,
  verification_url text,
  type text not null default 'certification'
    check (type in ('certification', 'award', 'publication', 'competition', 'other')),
  display_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists achievements_order_idx on achievements (display_order);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null
    check (platform in ('github', 'linkedin', 'email', 'x', 'website', 'leetcode', 'medium', 'dribbble', 'behance', 'other')),
  label text not null default '',
  url text not null,
  display_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_links_order_idx on social_links (display_order);

create table if not exists resume (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  file_url text,
  file_path text,
  file_name text,
  uploaded_at timestamptz
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on contact_messages (created_at desc);
create index if not exists contact_messages_read_idx on contact_messages (is_read);

do $$
declare
  target text;
begin
  foreach target in array array[
    'admin_users', 'profile', 'about', 'skills', 'experiences', 'education',
    'projects', 'achievements', 'social_links'
  ]
  loop
    execute format('drop trigger if exists %I_set_updated_at on %I', target, target);
    execute format(
      'create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at()',
      target,
      target
    );
  end loop;
end $$;

alter table admin_users enable row level security;
alter table profile enable row level security;
alter table about enable row level security;
alter table skills enable row level security;
alter table experiences enable row level security;
alter table education enable row level security;
alter table projects enable row level security;
alter table project_images enable row level security;
alter table achievements enable row level security;
alter table social_links enable row level security;
alter table resume enable row level security;
alter table contact_messages enable row level security;

insert into storage.buckets (id, name, public)
values
  ('profile', 'profile', true),
  ('projects', 'projects', true),
  ('achievements', 'achievements', true),
  ('resume', 'resume', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read portfolio media" on storage.objects;
create policy "Public read portfolio media"
  on storage.objects
  for select
  to public
  using (bucket_id in ('profile', 'projects', 'achievements', 'resume'));
