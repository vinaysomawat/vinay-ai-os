'use server'

import { aiText } from '@/lib/anthropic'

export interface Recommendation {
  module: string
  emoji: string
  action: string
  impact: string
}

interface RecContext {
  scores: { health: number; finance: number; career: number; learning: number; projects: number; life: number }
  stats: { habitsDoneToday: number; totalHabits: number; pendingTaskCount: number; monthSpend: number; monthBudget: number; activeApplications: number; learningInProgress: number; activeProjects: number }
  todayHealth: { weight_kg: number | null; calories: number | null; sleep_hours: number | null; steps: number | null; water_ml: number | null } | null
}

export async function getAIRecommendations(ctx: RecContext): Promise<Recommendation[]> {
  const prompt = `Life scores today — Health: ${ctx.scores.health}/100, Finance: ${ctx.scores.finance}/100, Career: ${ctx.scores.career}/100, Learning: ${ctx.scores.learning}/100, Projects: ${ctx.scores.projects}/100. Overall Life Score: ${ctx.scores.life}/100.

Today's data:
- Habits: ${ctx.stats.habitsDoneToday} of ${ctx.stats.totalHabits} done
- Pending tasks: ${ctx.stats.pendingTaskCount}
- Month spend: ₹${Math.round(ctx.stats.monthSpend).toLocaleString('en-IN')} of ₹${Math.round(ctx.stats.monthBudget || 0).toLocaleString('en-IN')} budget
- Active job applications: ${ctx.stats.activeApplications}
- Learning resources in progress: ${ctx.stats.learningInProgress}
- Active projects: ${ctx.stats.activeProjects}
${ctx.todayHealth
  ? `- Health today: weight=${ctx.todayHealth.weight_kg ?? 'not logged'}kg, sleep=${ctx.todayHealth.sleep_hours ?? 'not logged'}h, steps=${ctx.todayHealth.steps ?? 'not logged'}, water=${ctx.todayHealth.water_ml ?? 'not logged'}ml, calories=${ctx.todayHealth.calories ?? 'not logged'}`
  : '- No health metrics logged today'}

Generate exactly 5 specific, actionable recommendations for today. Focus on the weakest scoring modules first. Each action must be something Vinay can do TODAY.

Return ONLY a JSON array (no other text):
[
  {"module": "health", "emoji": "💪", "action": "Log your sleep and drink 500ml water now to start tracking", "impact": "+4 Health Score"},
  {"module": "learning", "emoji": "📚", "action": "Spend 30 minutes on your in-progress course", "impact": "+2 Learning Score"},
  ...
]

module must be one of: health, finance, career, learning, projects, planner`

  const raw = await aiText(prompt,
    'You are Vinay\'s AI life coach. Be specific, direct, and reference the actual data. Return only valid JSON array, no markdown, no extra text.')

  try {
    const match = raw.match(/\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) : []
  } catch {
    return []
  }
}
