-- SIPs (Systematic Investment Plans) as a mode on the existing investments
-- table rather than a separate table — reuses all existing list/edit/delete
-- UI and the net-worth calc. sip_last_contribution_month is a watermark so
-- the monthly cron can apply exactly one contribution per calendar month,
-- even if it fires more than once on the due day (mirrors the dedup guard
-- already used by the recurring-expenses cron).

alter table investments add column if not exists is_sip boolean not null default false;
alter table investments add column if not exists sip_amount numeric;
alter table investments add column if not exists sip_day_of_month int check (sip_day_of_month between 1 and 28);
alter table investments add column if not exists sip_last_contribution_month text;
