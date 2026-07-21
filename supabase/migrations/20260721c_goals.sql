-- Phase 4 PRD: cross-module Goal Engine. Deliberately separate from
-- financial_goals (which already works, has its own UI, and isn't touched) —
-- covers Career/Learning/Coding only; Health goals were explicitly skipped
-- since manual weight-loss/target-weight tracking was removed once already.
-- target_value/current_value are used for numeric goals (auto-computed via
-- auto_metric, or manually updated); achieved_at is used instead for
-- qualitative goals with no real metric (e.g. "Become Staff Engineer").
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  module text not null check (module in ('career', 'learning', 'coding')),
  name text not null,
  target_value numeric,
  current_value numeric,
  auto_metric text check (auto_metric in ('coding_streak', 'books_completed')),
  target_date date,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists goals_user_module_idx on goals (user_id, module);

alter table goals enable row level security;
create policy "select own goals" on goals
  for select using (auth.uid() = user_id);
create policy "insert own goals" on goals
  for insert with check (auth.uid() = user_id);
create policy "update own goals" on goals
  for update using (auth.uid() = user_id);
create policy "delete own goals" on goals
  for delete using (auth.uid() = user_id);
