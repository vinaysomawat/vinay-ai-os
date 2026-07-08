-- AI Gateway foundation: response cache + usage/cost tracking.
-- Both tables are written exclusively by the service-role client inside the
-- gateway (src/lib/ai-gateway.ts), regardless of whether the call originated
-- from a browser session, the Telegram webhook, or a cron job.

-- Response cache. Key = sha256(model + system + prompt); a changed prompt
-- (i.e. changed underlying data) naturally produces a cache miss with no
-- separate invalidation logic needed.
create table if not exists ai_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  response text not null,
  model text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists ai_cache_expires_idx on ai_cache (expires_at);

alter table ai_cache enable row level security;
-- No policies: infrastructure table, only ever touched by the service-role
-- client (which bypasses RLS) — RLS-with-no-policies blocks anon/authenticated
-- access by default, which is what we want here.

-- Usage & estimated-cost log, one row per AI Gateway call (including cache
-- hits, logged with cache_hit=true and zero tokens/cost).
create table if not exists ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  task text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost_usd numeric(10,6) not null default 0,
  cache_hit boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_logs_user_date_idx on ai_usage_logs (user_id, created_at);

alter table ai_usage_logs enable row level security;
create policy "select own ai usage" on ai_usage_logs
  for select using (auth.uid() = user_id);
create policy "insert own ai usage" on ai_usage_logs
  for insert with check (auth.uid() = user_id);
