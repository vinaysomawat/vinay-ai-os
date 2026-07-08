-- PRD-v2 Health goals list "Workout" and "Recovery" as distinct tracked items,
-- separate from Sleep/Calories/Protein/Water/Steps (already tracked) and from
-- the generic habit checkbox. This adds a structured workout log and a daily
-- self-rated recovery score.

alter table health_metrics add column if not exists recovery_score smallint check (recovery_score between 1 and 5);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  date date not null default current_date,
  type text not null,
  duration_minutes integer,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists workouts_user_date_idx on workouts (user_id, date);

alter table workouts enable row level security;
create policy "select own workouts" on workouts
  for select using (auth.uid() = user_id);
create policy "insert own workouts" on workouts
  for insert with check (auth.uid() = user_id);
create policy "update own workouts" on workouts
  for update using (auth.uid() = user_id);
create policy "delete own workouts" on workouts
  for delete using (auth.uid() = user_id);
