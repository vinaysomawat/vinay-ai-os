import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCronJobHealth, logCronRun } from '@/lib/cron-log'
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
// This route used to be the one exception that never logged its own run —
// invisible to the very monitoring system it implements. It now logs itself
// too (and is in EXPECTED_CRON_JOBS), so a future run can notice if a past
// one silently stopped firing.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  await logCronRun(supabase, 'cron-health-check')
  const health = await getCronJobHealth(supabase)
  const stale = health.filter(h => h.status === 'stale').map(h => h.job)
  const neverSeen = health.filter(h => h.status === 'never-seen').map(h => h.job)

  if (stale.length === 0) {
    return NextResponse.json({ ok: true, healthy: true, neverSeen })
  }

  await sendMessage(BOT_TOKEN, Number(CHAT_ID),
    `🚨 *Cron Health Check Failed*\n\nThese jobs ran before but have gone quiet longer than expected — likely a silent auth failure (check \`CRON_SECRET\` is still set) or a crash before the log call:\n${stale.map(j => `• ${j}`).join('\n')}`)

  return NextResponse.json({ ok: true, healthy: false, stale, neverSeen })
}
