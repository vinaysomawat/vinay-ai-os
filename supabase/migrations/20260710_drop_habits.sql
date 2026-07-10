-- The generic habit checkbox tracker is retired — structured Workouts (see
-- 20260708d_workouts_recovery.sql) and daily health_metrics already cover
-- what habits fed into the Health Score, so the consistency component and
-- the standalone habits UI are removed. This drops the now-unused tables.

drop table if exists habit_logs;
drop table if exists habits;
