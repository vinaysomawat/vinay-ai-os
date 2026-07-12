import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendMessage } from '@/lib/telegram/send'

const CHAT_ID   = process.env.TELEGRAM_ALLOWED_CHAT_ID!
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_PLANNER!

// Every other cron route logs a cron_runs row right after its CRON_SECRET
// check passes — proof it wasn't silently 401'd (this is exactly the class
// of bug that once meant every cron fired on schedule but never actually
// ran, for an unknown period, with no error anywhere in the app). This job
// checks that every expected job logged at least one run in the last 24h
// and alerts if any didn't — the alert itself doesn't depend on CRON_SECRET
// being correct elsewhere, since a broken secret here would just mean this
// job also silently 401s, which is a smaller, self-contained failure mode
// than the one it's meant to catch.
const EXPECTED_JOBS = [
  'daily-briefing', 'daily-coding', 'recurring-expenses', 'trending-reading',
  'evening-checkin', 'weekly-digest', 'monthly-digest',
]

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: runs } = await supabase.from('cron_runs').select('job').gte('created_at', since)
  const ranJobs = new Set((runs ?? []).map(r => r.job))
  const missing = EXPECTED_JOBS.filter(j => !ranJobs.has(j))

  if (missing.length === 0) {
    return NextResponse.json({ ok: true, healthy: true })
  }

  await sendMessage(BOT_TOKEN, Number(CHAT_ID),
    `🚨 *Cron Health Check Failed*\n\nThese jobs haven't logged a run in the last 24h — likely a silent auth failure (check \`CRON_SECRET\` is still set) or a crash before the log call:\n${missing.map(j => `• ${j}`).join('\n')}`)

  return NextResponse.json({ ok: true, healthy: false, missing })
}
