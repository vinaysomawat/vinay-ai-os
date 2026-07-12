-- Proof-of-execution log for cron jobs. Each cron route writes a row here
-- right after its CRON_SECRET auth check passes, before any other logic —
-- so a health-check job can tell "silently 401'd" apart from "ran and had
-- nothing to do". This is what would have caught the missing-CRON_SECRET
-- outage on its own instead of it going undiagnosed indefinitely.
-- Global/system table, not per-user (single-user app, service-role only).

create table if not exists cron_runs (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  ok boolean not null default true,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists cron_runs_job_created_at_idx on cron_runs (job, created_at desc);

alter table cron_runs enable row level security;

create policy "authenticated can read cron_runs"
  on cron_runs for select
  to authenticated
  using (true);
