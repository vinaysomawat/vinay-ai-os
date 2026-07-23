-- Interactive Topic Quiz (Career Stage C) — replaces the Interview Q&A bank.
-- One row per completed quiz attempt; questions/answers are stored whole so
-- results (score, wrong-answer explanations) can be re-rendered without
-- re-calling the AI.
create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  topic text not null,
  difficulty text not null,
  questions jsonb not null,
  user_answers jsonb not null,
  score integer not null,
  total integer not null,
  weak_areas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on quiz_attempts (user_id);
create index if not exists quiz_attempts_user_topic_idx on quiz_attempts (user_id, topic);

alter table quiz_attempts enable row level security;
create policy "select own quiz_attempts" on quiz_attempts
  for select using (auth.uid() = user_id);
create policy "insert own quiz_attempts" on quiz_attempts
  for insert with check (auth.uid() = user_id);
create policy "update own quiz_attempts" on quiz_attempts
  for update using (auth.uid() = user_id);
create policy "delete own quiz_attempts" on quiz_attempts
  for delete using (auth.uid() = user_id);
