-- Phase 2 Brain PRD: Pattern Detection. Patterns accumulate over time rather
-- than being recomputed fresh each run — unique(user_id, pattern) means
-- re-detecting the same pattern text is an upsert (times_confirmed++,
-- last_seen bumped) instead of a duplicate row.
create table if not exists brain_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  pattern text not null,
  first_seen date not null default current_date,
  last_seen date not null default current_date,
  times_confirmed int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, pattern)
);
create index if not exists brain_patterns_user_last_seen_idx on brain_patterns (user_id, last_seen);

alter table brain_patterns enable row level security;
create policy "select own brain_patterns" on brain_patterns
  for select using (auth.uid() = user_id);
create policy "insert own brain_patterns" on brain_patterns
  for insert with check (auth.uid() = user_id);
create policy "update own brain_patterns" on brain_patterns
  for update using (auth.uid() = user_id);
create policy "delete own brain_patterns" on brain_patterns
  for delete using (auth.uid() = user_id);
