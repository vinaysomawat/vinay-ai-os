import type { createServiceClient } from '@/lib/supabase/service'

// Called right after a cron route's auth check passes, before any other
// logic — proves the route actually executed past CRON_SECRET, so a health
// check can tell "silently rejected" apart from "ran and had nothing to do".
export async function logCronRun(db: ReturnType<typeof createServiceClient>, job: string): Promise<void> {
  try {
    await db.from('cron_runs').insert({ job, ok: true })
  } catch {
    // Non-fatal: a logging failure shouldn't break the cron job itself
  }
}
