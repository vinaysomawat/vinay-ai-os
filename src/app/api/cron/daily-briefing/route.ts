import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/service'
import { generateDailyBriefing } from '@/features/ai/daily-briefing'
import { getReminderLines } from '@/lib/reminders'
import { sendMessage } from '@/lib/telegram/send'
import { logCronRun } from '@/lib/cron-log'
import { daysAgoIST } from '@/lib/date'
import { computeHealthPlan } from '@/features/health/calculations'
import type { HealthProfile, HealthMetric } from '@/features/health/types'

const CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID!
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_PLANNER!

// Automation Rules (Phase 3 PRD) — deterministic "if X then suggest Y"
// checks appended to the existing morning push rather than a new cron/
// surface. AI is never used to compute these, only the existing briefing
// prose above them.
async function computeAutomationRules(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const yesterday = daysAgoIST(1)
  const [{ data: profile }, { data: metrics }, { data: interviewApps }] = await Promise.all([
    supabase.from('health_profile').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('health_metrics').select('*').eq('user_id', userId).gte('date', daysAgoIST(14)).order('date', { ascending: false }),
    supabase.from('applications').select('id').eq('user_id', userId).eq('status', 'interview'),
  ])

  const lines: string[] = []

  // Rule: high calorie yesterday → adjust today's guidance. Reuses the same
  // computeHealthPlan the Health page and bot already use for daily targets —
  // no separate calorie-target calculation.
  const yesterdayMetric = (metrics ?? []).find((m): m is HealthMetric => m.date === yesterday)
  const plan = computeHealthPlan(profile as HealthProfile | null, (metrics ?? []) as HealthMetric[], [], yesterday)
  if (plan && yesterdayMetric?.calories) {
    const target = plan.dailyTargets.dailyCalorieTarget
    const overBy = yesterdayMetric.calories - target
    if (target > 0 && overBy / target >= 0.15) {
      lines.push(`🍽️ Yesterday you were ~${Math.round(overBy)} kcal over target (${yesterdayMetric.calories} vs ${target}) — lighter meals today will help stay on track this week.`)
    }
  }

  // Rule: active interview-stage application → suggest lighter workout + more revision.
  if ((interviewApps ?? []).length > 0) {
    lines.push(`🎯 You have an active interview-stage application — consider a lighter workout and extra revision time today.`)
  }

  return lines
}

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  await logCronRun(supabase, 'daily-briefing')

  // Fetch the first user (single-user app)
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.[0]
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })

  const [body, reminders, automationRules] = await Promise.all([
    generateDailyBriefing(supabase, user.id),
    getReminderLines(supabase, user.id, 'morning'),
    computeAutomationRules(supabase, user.id),
  ])

  const automationSection = automationRules.length > 0 ? `\n\n${automationRules.join('\n\n')}` : ''

  await sendMessage(BOT_TOKEN, Number(CHAT_ID), `🌅 *Good Morning, Vinay!*\n\n${body}${automationSection}${reminders}\n\n_Open your dashboard → vinay-ai-os.vercel.app_`)

  return NextResponse.json({ ok: true, automationRules: automationRules.length })
}
