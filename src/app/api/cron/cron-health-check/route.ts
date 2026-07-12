import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendMessage } from '@/lib/telegram/send'

const CHAT_ID   = process.env.TELEGRAM_ALLOWED_CHAT_ID!
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_PLANNER!

// Every other cron route logs a cron_runs row right after its CRON_SECRET
// check passes — proof it wasn't silently 401'd (this is exactly the class
// of bug that once meant every cron fired on schedule but never actually
// ran, for an unknown period, with no error anywhere in the app). This job
// checks that every expected job logged at least one run recently enough
// and alerts if any didn't — the alert itself doesn't depend on CRON_SECRET
// being correct elsewhere, since a broken secret here would just mean this
// job also silently 401s, which is a smaller, self-contained failure mode
// than the one it's meant to catch.
//
// Max staleness is per-job, not a flat 24h: every job below is invoked by
// Vercel daily EXCEPT weekly-digest, which Vercel only invokes on Sundays
// (`30 2 * * 0` in vercel.json) — unlike monthly-digest, which Vercel
// invokes daily and which self-gates internally, so it still logs a row
// every day even on days it doesn't send. A flat 24h window would flag
// weekly-digest as "missing" on 6 out of 7 days by design, not by failure.
const EXPECTED_JOBS: { job: string; maxAgeHours: number }[] = [
  { job: 'daily-briefing',       maxAgeHours: 26 },
  { job: 'daily-coding',         maxAgeHours: 26 },
  { job: 'recurring-expenses',   maxAgeHours: 26 },
  { job: 'trending-reading',     maxAgeHours: 26 },
  { job: 'evening-checkin',      maxAgeHours: 26 },
  { job: 'monthly-digest',       maxAgeHours: 26 },
  { job: 'weekly-digest',        maxAgeHours: 8 * 24 },
]

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Last-ever run per job, with no time bound — a job with zero history at
  // all (e.g. weekly-digest before its first Sunday since this table was
  // created) has no baseline to have gone stale *from*, so it's excluded
  // below rather than alerted on. Only a job that ran before and has since
  // gone quiet for longer than its own cadence allows is a real signal.
  const { data: runs } = await supabase.from('cron_runs').select('job, created_at').order('created_at', { ascending: false })
  const lastRunByJob = new Map<string, string>()
  for (const r of runs ?? []) {
    if (!lastRunByJob.has(r.job)) lastRunByJob.set(r.job, r.created_at)
  }

  const now = Date.now()
  const stale = EXPECTED_JOBS
    .filter(({ job }) => lastRunByJob.has(job))
    .filter(({ job, maxAgeHours }) => now - new Date(lastRunByJob.get(job)!).getTime() > maxAgeHours * 60 * 60 * 1000)
    .map(({ job }) => job)
  const neverSeen = EXPECTED_JOBS.map(j => j.job).filter(job => !lastRunByJob.has(job))

  if (stale.length === 0) {
    return NextResponse.json({ ok: true, healthy: true, neverSeen })
  }

  await sendMessage(BOT_TOKEN, Number(CHAT_ID),
    `🚨 *Cron Health Check Failed*\n\nThese jobs ran before but have gone quiet longer than expected — likely a silent auth failure (check \`CRON_SECRET\` is still set) or a crash before the log call:\n${stale.map(j => `• ${j}`).join('\n')}`)

  return NextResponse.json({ ok: true, healthy: false, stale, neverSeen })
}
