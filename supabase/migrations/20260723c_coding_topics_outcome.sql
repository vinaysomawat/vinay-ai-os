-- Coding Stage I: topic tagging on the question pool (needed for weak-area
-- and company-topic matching to mean anything) and a self-reported outcome
-- per attempt (accuracy proxy for open-ended, non-auto-graded problems,
-- captured the same way time_spent_minutes already is). revision_count
-- tracks how many times a question has actually been flagged for revision
-- (manually or automatically), not just whether it currently is.
alter table coding_questions add column if not exists topics text[];
alter table coding_daily_questions add column if not exists outcome text;
alter table coding_daily_questions add column if not exists revision_count integer not null default 0;
