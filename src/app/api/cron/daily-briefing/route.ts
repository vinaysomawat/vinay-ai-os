import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { aiText } from '@/lib/anthropic'

const CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID!
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_PLANNER!

async function sendTelegram(text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
  })
}

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  // Fetch the first user (single-user app)
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.[0]
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })

  const [
    habitsRes, logsRes, metricsRes,
    expensesRes, budgetsRes, resourcesRes,
    appsRes, projectsRes, scoreRes,
  ] = await Promise.all([
    supabase.from('habits').select('id').eq('user_id', user.id),
    supabase.from('habit_logs').select('habit_id').eq('user_id', user.id).eq('date', today),
    supabase.from('health_metrics').select('*').eq('user_id', user.id).eq('date', today).single(),
    supabase.from('expenses').select('amount').eq('user_id', user.id).gte('date', monthStart),
    supabase.from('budgets').select('amount').eq('user_id', user.id).eq('month', today.slice(0, 7)),
    supabase.from('resources').select('status').eq('user_id', user.id),
    supabase.from('applications').select('status').eq('user_id', user.id),
    supabase.from('projects').select('status').eq('user_id', user.id),
    supabase.from('life_score_logs').select('life_score').eq('user_id', user.id).order('date', { ascending: false }).limit(2),
  ])

  const habits = habitsRes.data ?? []
  const todayLogs = logsRes.data ?? []
  const monthSpend = (expensesRes.data ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)
  const monthBudget = (budgetsRes.data ?? []).reduce((s, b) => s + (b.amount ?? 0), 0)
  const resources = resourcesRes.data ?? []
  const apps = appsRes.data ?? []
  const projects = projectsRes.data ?? []
  const scores = scoreRes.data ?? []

  const lifeScore = scores[0]?.life_score ?? 0
  const prevScore = scores[1]?.life_score ?? null
  const delta = prevScore !== null ? lifeScore - prevScore : null

  const activeApps = apps.filter(a => ['applied', 'screening', 'interview'].includes(a.status)).length
  const inProgress = resources.filter(r => r.status === 'in-progress').length

  const prompt = `Morning briefing for Vinay. Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.

Life Score: ${lifeScore}/100${delta !== null ? ` (${delta >= 0 ? '+' : ''}${delta} from yesterday)` : ''}
Habits done: ${todayLogs.length}/${habits.length}
Budget: ₹${Math.round(monthSpend).toLocaleString('en-IN')} of ₹${Math.round(monthBudget).toLocaleString('en-IN')} this month
Active applications: ${activeApps}
Learning in progress: ${inProgress} resources
Active projects: ${projects.filter(p => p.status === 'in-progress').length}

Write a short morning briefing (max 120 words):
1. One motivating sentence about the Life Score
2. The single most important action for today
3. One thing to be proud of or watch out for

Keep it direct, personal, and energetic. No bullet points — flowing text.`

  const message = await aiText(prompt, 'You are Vinay\'s personal AI coach. Write like a coach texting a friend. Warm but direct.')

  const trendEmoji = delta === null ? '' : delta > 0 ? '📈' : delta < 0 ? '📉' : '➡️'
  const scoreLine = `*Life Score: ${lifeScore}/100* ${trendEmoji}${delta !== null ? ` (${delta >= 0 ? '+' : ''}${delta})` : ''}`

  await sendTelegram(`🌅 *Good Morning, Vinay!*\n\n${scoreLine}\n\n${message}\n\n_Open your dashboard → vinay-ai-os.vercel.app_`)

  return NextResponse.json({ ok: true, score: lifeScore })
}
