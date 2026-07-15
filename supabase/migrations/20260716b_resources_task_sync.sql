-- Two-way sync between Learning resources and Planner, mirroring the
-- existing pattern for coding_daily_questions/trending_readings/
-- daily_workouts: adding a resource creates a linked Planner task,
-- completing either side keeps the other in sync. Only applies to
-- resources added after this migration — existing resources are left
-- with task_id = null rather than backfilling tasks for them.
alter table resources add column if not exists task_id uuid references tasks(id) on delete set null;
