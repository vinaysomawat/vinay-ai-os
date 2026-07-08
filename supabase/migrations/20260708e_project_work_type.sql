-- PRD-v2 Coding goal explicitly separates "office engineering work" from
-- personal projects and open-source. The projects table previously had no
-- way to distinguish them.
alter table projects add column if not exists work_type text not null default 'personal'
  check (work_type in ('personal', 'office', 'oss'));
