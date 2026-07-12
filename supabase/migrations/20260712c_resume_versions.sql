-- Resume tracking: multiple versions (tailored per role/company), one marked
-- primary, optionally linked to the application it was sent for.
create table if not exists resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null,
  content text,
  url text,
  notes text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resume_versions_user_idx on resume_versions (user_id);

alter table resume_versions enable row level security;
create policy "select own resume_versions" on resume_versions
  for select using (auth.uid() = user_id);
create policy "insert own resume_versions" on resume_versions
  for insert with check (auth.uid() = user_id);
create policy "update own resume_versions" on resume_versions
  for update using (auth.uid() = user_id);
create policy "delete own resume_versions" on resume_versions
  for delete using (auth.uid() = user_id);

alter table applications add column if not exists resume_version_id uuid references resume_versions(id) on delete set null;
