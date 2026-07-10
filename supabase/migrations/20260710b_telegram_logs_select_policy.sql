-- telegram_logs has RLS enabled (rows are written by the Telegram webhook via
-- the service-role client, which bypasses RLS) but was missing a SELECT
-- policy for the regular authenticated client — so the Dashboard's "Bot
-- Activity" card always read back zero rows even though logs existed.
-- Single-user app, table has no user_id column, so scope by role only.

create policy "authenticated can read telegram_logs" on telegram_logs
  for select using (auth.role() = 'authenticated');
